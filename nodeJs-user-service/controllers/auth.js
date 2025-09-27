import isEmpty from 'is-empty'
import { v4 as uuid } from 'uuid'
import bcryptjs from 'bcryptjs'
import { Security, Token, User } from '@/models'
import * as enums from '@/constants/enum'
import * as constants from '@/constants/values'
import generateSecurityToken from '@/utils/generateSecurityToken'
import { encryptString } from '@/security/crypto'
import { generateJWTToken, logAuthEvent } from '@/security/security'
import { decodeJWT } from '@/security/passport'
import config from '@/config'
import { sendEmailViaTemplate } from '@/services/mail'
import { HealthSafetyValidator } from '@/utils/healthSafety'

export const signup = async (req, res) => {
    try {
        const { body } = req
        body.email = body.email.toLowerCase()

        // Check for existing user
        const isEmailExists = await User.findOne({ 
            email: body.email, 
            status: { $in: [enums.USER_STATES.ACTIVE, enums.USER_STATES.BLOCKED] } 
        })
        
        if (!isEmpty(isEmailExists)) {
            logAuthEvent('signup_email_exists', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { email: body.email }
            })
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists', 
                errors: { email: 'Email already exists' } 
            })
        }

        // Create new user with health-specific defaults
        const user = new User({
            firstName: body.firstName,
            middleName: body.middleName,
            lastName: body.lastName,
            email: body.email,
            healthStatus: enums.HEALTH_STATUS.PROFILE_INCOMPLETE,
            requiresProfessionalConsultation: true, 
            riskLevel: enums.RISK_LEVELS.LOW,
            healthDisclaimerAccepted: false
        })

        // Generate secure activation token
        const token = generateSecurityToken(true) 
        const encryptedToken = encryptString(token)
        const formattedVerificationLink = `${config.FRONTEND_HOST}/email-verify/${encryptedToken}`

        // Create security record for email verification
        const security = new Security({
            userId: user._id,
            type: enums.SECURITY_TYPES.ACTIVATION_MAIL,
            mode: enums.SECURITY_MODES.EMAIL,
            value: encryptedToken,
            secret: token,
            expiresAt: new Date(Date.now() + constants.ACTIVATION_DURATION),
            healthDataAccess: false,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        })

        // Send activation email with health service context
        const mailContext = {
            identifier: enums.EMAIL_CATEGORIES.VERIFICATION_MAIL,
            to: user.email,
            content: {
                activationLink: formattedVerificationLink,
                name: user.firstName,
                serviceName: 'Wellness Coach',
                healthDisclaimer: 'This service provides general wellness information only and cannot replace professional medical advice.'
            },
        }
        
        const emailSentStatus = await sendEmailViaTemplate(mailContext)
        if (!emailSentStatus) {
            console.error('[WELLNESS-AUTH] Failed to send activation email')
            return res.status(500).json({ 
                success: false, 
                message: 'Unable to send activation email. Please try again or contact support.' 
            })
        }

       
        await user.save()
        await security.save()

        logAuthEvent('signup_success', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { email: user.email }
        })

        return res.status(201).json({ 
            success: true, 
            message: 'Account created successfully. Please check your email to activate your account.',
            next_steps: [
                'Check your email for activation link',
                'Complete email verification',
                'Set up your secure password',
                'Accept health disclaimers',
                'Complete health profile for personalized recommendations'
            ],
            important_notice: 'This wellness service provides general health information only. Always consult healthcare professionals for medical advice.'
        })
        
    } catch (error) {
        console.error('[WELLNESS-AUTH] Signup error:', error)
        logAuthEvent('signup_error', null, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { error: error.message }
        })
        return res.status(500).json({ 
            success: false, 
            message: 'Unable to create account. Please try again.' 
        })
    }
}

export const verifySignup = async (req, res) => {
    try {
        const { params } = req

        const security = await Security.findOne({
            value: params.verificationToken,
            type: enums.SECURITY_TYPES.ACTIVATION_MAIL,
        })

        if (isEmpty(security)) {
            logAuthEvent('email_verification_invalid_token', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            })
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid verification token' 
            })
        }

        if (security.isCompleted) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already verified. Please proceed to sign in.' 
            })
        }

        if (security.expiresAt < new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Verification token expired. Please request a new activation email.',
                action_required: 'request_new_activation'
            })
        }

        // Mark verification as completed
        security.isCompleted = true
        security.ipAddress = req.ip
        security.userAgent = req.get('User-Agent')

        // Update user status
        const userUpdation = await User.updateOne(
            { _id: security.userId, status: enums.USER_STATES.NEW },
            { 
                $set: { 
                    status: enums.USER_STATES.PENDING,
                    isEmailVerified: true,
                    healthStatus: enums.HEALTH_STATUS.PROFILE_INCOMPLETE
                } 
            },
        )

        await security.save()
        
        if (userUpdation.modifiedCount == 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email verification already completed.' 
            })
        }

        
        const payload = {
            sessionId: uuid(),
            userId: security.userId,
            mode: enums.USER_STATES.PENDING,
            healthAccess: false
        }

        const accessToken = generateJWTToken(payload, false, false)
        const refreshToken = generateJWTToken(payload, true, false)

        // Create session record
        const session = new Token({
            userId: security.userId,
            sessionId: payload.sessionId,
            expiresAt: new Date(Date.now() + constants.REFRESH_EXPIRY_DURATION),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionType: 'standard',
            healthDataAccess: false
        })

        await session.save()

        const cookieConfig = {
            maxAge: constants.REFRESH_EXPIRY_DURATION,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            partitioned: true,
        }

        res.header('Access-Control-Allow-Origin', config.FRONTEND_HOST)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        res.cookie('refreshToken', refreshToken, cookieConfig)

        logAuthEvent('email_verification_success', security.userId, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        })

        return res.status(200).json({ 
            success: true, 
            message: 'Email verified successfully. Please create your password to continue.',
            tokens: { accessToken },
            next_steps: [
                'Create a secure password',
                'Accept health disclaimers',
                'Complete your health profile',
                'Set up emergency contacts'
            ],
            health_notice: 'Professional medical consultation is recommended before starting any fitness or nutrition program.'
        })
        
    } catch (error) {
        console.error('[WELLNESS-AUTH] Email verification error:', error)
        return res.status(500).json({ 
            success: false, 
            message: 'Email verification failed. Please try again.' 
        })
    }
}

export const createPassword = async (req, res) => {
    try {
        const { user, body } = req

        if (user.isPasswordUpdated) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password already created. Please sign in.',
                action: 'REDIRECT_TO_SIGNIN' 
            })
        }

        
        const hashedPassword = await bcryptjs.hash(body.password, bcryptjs.genSaltSync(config.DEFAULT_SALT_ROUNDS + 2))

        // Update user with password and health-specific defaults
        const userUpdation = await User.updateOne(
            { _id: user._id },
            { 
                $set: { 
                    password: hashedPassword, 
                    isPasswordUpdated: true, 
                    passwordUpdatedOn: new Date(), 
                    status: enums.USER_STATES.ACTIVE,
                    healthStatus: enums.HEALTH_STATUS.PROFILE_INCOMPLETE,
                    requiresProfessionalConsultation: true
                } 
            },
        ).lean()

        if (userUpdation.modifiedCount == 0) {
            console.error('[WELLNESS-AUTH] Password creation failed for user:', user._id)
            return res.status(500).json({ 
                success: false, 
                message: 'Password creation failed. Please try again.' 
            })
        }

        // Generate new session with active status
        const payload = {
            sessionId: user.sessionId,
            userId: user._id,
            mode: enums.USER_STATES.ACTIVE,
            healthAccess: false
        }

        const accessToken = generateJWTToken(payload, false, false)
        const refreshToken = generateJWTToken(payload, true, false)

        // Update session expiration
        await Token.updateOne(
            { sessionId: payload.sessionId },
            { 
                $set: { 
                    expiresAt: new Date(Date.now() + constants.REFRESH_EXPIRY_DURATION),
                    sessionType: 'standard'
                } 
            },
        ).lean()

        const cookieConfig = {
            maxAge: constants.REFRESH_EXPIRY_DURATION,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            partitioned: true,
        }

        const responseData = {
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            isPasswordUpdated: true,
            healthStatus: enums.HEALTH_STATUS.PROFILE_INCOMPLETE,
            requiresHealthProfile: true,
            requiresHealthDisclaimer: true
        }

        res.header('Access-Control-Allow-Origin', config.FRONTEND_HOST)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        res.cookie('refreshToken', refreshToken, cookieConfig)

        logAuthEvent('password_creation_success', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        })

        return res.status(201).json({ 
            success: true, 
            message: 'Password created successfully. Welcome to your wellness journey!',
            tokens: { accessToken }, 
            data: responseData,
            next_steps: [
                'Accept health service disclaimers',
                'Complete your comprehensive health profile',
                'Add emergency contact information',
                'Consider scheduling a consultation with your healthcare provider'
            ],
            important_reminders: [
                'This service provides general wellness information only',
                'Professional medical consultation is recommended',
                'Report any concerning symptoms to healthcare providers immediately'
            ]
        })
        
    } catch (error) {
        console.error('[WELLNESS-AUTH] Password creation error:', error)
        logAuthEvent('password_creation_error', req.user?._id, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { error: error.message }
        })
        return res.status(500).json({ 
            success: false, 
            message: 'Password creation failed. Please try again.' 
        })
    }
}

export const signin = async (req, res) => {
    try {
        const { body } = req
        body.email = body.email.toLowerCase()

        const user = await User.findOne({ email: body.email }).select('+password').lean()

        if (isEmpty(user)) {
            logAuthEvent('signin_user_not_found', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { email: body.email }
            })
            return res.status(400).json({ 
                success: false, 
                message: 'Email not found. Please check your email or sign up.',
                errors: { email: 'Email not found' } 
            })
        }

       
        if (user.status !== enums.USER_STATES.ACTIVE) {
            logAuthEvent('signin_invalid_status', user._id, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { userStatus: user.status }
            })
            return res.status(403).json({ 
                success: false, 
                message: `Your account is currently ${user.status}. Please contact support for assistance.`
            })
        }

        
        const isPasswordValid = await bcryptjs.compare(body.password, user.password)
        if (!isPasswordValid) {
            logAuthEvent('signin_invalid_password', user._id, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            })
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid password. Please try again.' 
            })
        }

        
        await User.updateOne({ _id: user._id }, { $set: { lastLoginOn: new Date() } })

        
        const requiresConsultation = user.riskLevel === enums.RISK_LEVELS.VERY_HIGH || 
                                    user.riskLevel === enums.RISK_LEVELS.HIGH ||
                                    user.requiresProfessionalConsultation

        
        const payload = {
            sessionId: uuid(),
            userId: user._id,
            mode: enums.USER_STATES.ACTIVE,
            healthAccess: false 
        }

        const accessToken = generateJWTToken(payload, false, false)
        const refreshToken = generateJWTToken(payload, true, false)

        
        const session = new Token({
            userId: user._id,
            sessionId: payload.sessionId,
            expiresAt: new Date(Date.now() + constants.REFRESH_EXPIRY_DURATION),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionType: 'standard',
            healthDataAccess: false
        })
        
        await session.save()

        const cookieConfig = {
            maxAge: constants.REFRESH_EXPIRY_DURATION,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            partitioned: true,
        }

        const responseData = {
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            isPasswordUpdated: user.isPasswordUpdated,
            healthStatus: user.healthStatus,
            healthDisclaimerAccepted: user.healthDisclaimerAccepted,
            riskLevel: user.riskLevel,
            requiresProfessionalConsultation: requiresConsultation,
            lastLoginOn: new Date()
        }

        res.header('Access-Control-Allow-Origin', config.FRONTEND_HOST)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        res.cookie('refreshToken', refreshToken, cookieConfig)

        
        res.set({
            'X-Health-Status': user.healthStatus,
            'X-Risk-Level': user.riskLevel,
            'X-Professional-Consultation-Required': requiresConsultation.toString()
        })

        logAuthEvent('signin_success', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { 
                healthStatus: user.healthStatus,
                riskLevel: user.riskLevel 
            }
        })

        return res.status(200).json({ 
            success: true, 
            message: 'Signed in successfully. Welcome back!',
            tokens: { accessToken }, 
            data: responseData,
            health_reminders: requiresConsultation ? [
                'Professional consultation recommended before starting new health programs',
                'Report any concerning symptoms to your healthcare provider',
                'This service provides general wellness information only'
            ] : [
                'This service provides general wellness information only',
                'Consult healthcare professionals for medical concerns'
            ]
        })
        
    } catch (error) {
        console.error('[WELLNESS-AUTH] Signin error:', error)
        logAuthEvent('signin_error', null, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { error: error.message }
        })
        return res.status(500).json({ 
            success: false, 
            message: 'Sign in failed. Please try again.' 
        })
    }
}

export const refreshToken = async (req, res) => {
    try {
        const { user } = req

        const mode = user.isPasswordUpdated ? enums.USER_STATES.ACTIVE : enums.USER_STATES.PENDING

        const session = await Token.findOne({ 
            userId: user._id, 
            sessionId: user.sessionId 
        })

        if (session.isSessionEnded) {
            logAuthEvent('refresh_token_session_ended', user._id, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                sessionId: user.sessionId
            })
            return res.status(401).json({ 
                success: false, 
                message: 'Session has ended. Please sign in again.' 
            })
        }

       
        const payload = {
            sessionId: user.sessionId,
            userId: user._id,
            mode,
            healthAccess: session.healthDataAccess || false
        }

        const accessToken = generateJWTToken(payload, false, session.healthDataAccess)
        const refreshToken = generateJWTToken(payload, true, session.healthDataAccess)

        
        await Token.updateOne(
            { sessionId: payload.sessionId },
            { 
                $set: { 
                    expiresAt: new Date(Date.now() + constants.REFRESH_EXPIRY_DURATION),
                    updatedAt: new Date()
                } 
            },
        ).lean()

        const cookieConfig = {
            maxAge: constants.REFRESH_EXPIRY_DURATION,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            partitioned: true,
        }

        res.header('Access-Control-Allow-Origin', config.FRONTEND_HOST)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        res.cookie('refreshToken', refreshToken, cookieConfig)

        logAuthEvent('refresh_token_success', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionId: user.sessionId
        })

        return res.status(200).json({ 
            success: true, 
            message: 'Token refreshed successfully',
            tokens: { accessToken } 
        })
        
    } catch (error) {
        console.error('[WELLNESS-AUTH] Refresh token error:', error)
        logAuthEvent('refresh_token_error', req.user?._id, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { error: error.message }
        })
        return res.status(500).json({ 
            success: false, 
            message: 'Token refresh failed. Please sign in again.' 
        })
    }
}

export const signout = async (req, res) => {
    try {
        const { headers } = req

        if (headers['authorization']) {
            const token = headers['authorization'].replace('Bearer ', '')
            const decodedToken = decodeJWT(token)

            if (decodedToken && decodedToken.sessionId) {
                await Token.updateOne(
                    { sessionId: decodedToken.sessionId },
                    { 
                        $set: { 
                            isSessionEnded: true,
                            updatedAt: new Date()
                        } 
                    }
                )

                logAuthEvent('signout_success', decodedToken.userId, true, {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    sessionId: decodedToken.sessionId
                })
            }
        }

        const cookieConfig = {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            partitioned: true,
        }

        res.header('Access-Control-Allow-Origin', config.FRONTEND_HOST)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        res.cookie('refreshToken', '', cookieConfig)

        return res.status(200).json({ 
            success: true, 
            message: 'Signed out successfully. Thank you for using our wellness service.',
            reminder: 'For ongoing health concerns, please consult with healthcare professionals.'
        })
        
    } catch (error) {
        console.error('[WELLNESS-AUTH] Signout error:', error)
        return res.status(500).json({ 
            success: false, 
            message: 'Signout completed, but an error occurred during cleanup.' 
        })
    }
}