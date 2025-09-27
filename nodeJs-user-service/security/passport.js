import { verifyJWTToken, logAuthEvent } from '@/security/security'
import { Token, User } from '@/models'
import * as enums from '@/constants/enum'

export const userAuthenticate = async (req, res, next) => {
    try {
        const isRefreshing = req.path.endsWith('/refresh-token')
        const isHealthEndpoint = req.path.includes('/health') || req.path.includes('/wellness')
        
        let token
        if (isRefreshing) {
            token = req.cookies.refreshToken
            if (!token) {
                logAuthEvent('refresh_token_missing', null, false, {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                })
                return res.status(401).json({ 
                    success: false, 
                    message: 'Refresh token not provided',
                    error_type: 'authentication_required'
                })
            }
        } else {
            const authHeader = req.headers.authorization
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                logAuthEvent('access_token_missing', null, false, {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                })
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authorization token required',
                    error_type: 'authentication_required'
                })
            }
            token = authHeader.split(' ')[1]
        }
        let decoded
        try {
            decoded = verifyJWTToken(token, isHealthEndpoint)
        } catch (error) {
            logAuthEvent('token_verification_failed', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { error: error.message, isHealthEndpoint }
            })
            
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired token',
                error_type: 'token_invalid',
                health_access_required: isHealthEndpoint
            })
        }

        
        const tokenRecord = await Token.findOne({ 
            sessionId: decoded.sessionId,
            isSessionEnded: false
        }).lean()

        if (!tokenRecord) {
            logAuthEvent('session_not_found', decoded.userId, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                sessionId: decoded.sessionId
            })
            return res.status(401).json({ 
                success: false, 
                message: 'Session not found or expired',
                error_type: 'session_invalid'
            })
        }

       
        if (tokenRecord.expiresAt < new Date()) {
            logAuthEvent('session_expired', decoded.userId, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                sessionId: decoded.sessionId
            })
            return res.status(401).json({ 
                success: false, 
                message: 'Session has expired',
                error_type: 'session_expired'
            })
        }


        const user = await User.findById(decoded.userId).lean()
        if (!user) {
            logAuthEvent('user_not_found', decoded.userId, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                sessionId: decoded.sessionId
            })
            return res.status(401).json({ 
                success: false, 
                message: 'User account not found',
                error_type: 'user_invalid'
            })
        }

        if (user.status !== enums.USER_STATES.ACTIVE && user.status !== enums.USER_STATES.PENDING) {
            logAuthEvent('user_status_invalid', decoded.userId, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                sessionId: decoded.sessionId,
                additionalData: { userStatus: user.status }
            })
            return res.status(401).json({ 
                success: false, 
                message: `Account is currently ${user.status}`,
                error_type: 'account_status_invalid'
            })
        }

        if (isHealthEndpoint) {
            if (!user.healthDisclaimerAccepted) {
                logAuthEvent('health_disclaimer_not_accepted', decoded.userId, false, {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                })
                return res.status(403).json({
                    success: false,
                    message: 'Health disclaimer must be accepted to access health features',
                    error_type: 'health_disclaimer_required',
                    requires_disclaimer_acceptance: true
                })
            }

          
            if (user.requiresImmediateConsultation && user.requiresImmediateConsultation()) {
                logAuthEvent('high_risk_user_health_access', decoded.userId, false, {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    additionalData: { riskLevel: user.riskLevel }
                })
                return res.status(403).json({
                    success: false,
                    message: 'Professional consultation required before accessing health features',
                    error_type: 'professional_consultation_required',
                    risk_level: user.riskLevel,
                    safety_concerns: user.safetyFlags.filter(flag => !flag.resolved).map(flag => flag.flag)
                })
            }

            if (tokenRecord.healthDataAccess) {
                await Token.updateOne(
                    { _id: tokenRecord._id },
                    { 
                        $set: { lastHealthAccess: new Date() },
                        $inc: { healthAccessCount: 1 }
                    }
                )
            }

        
            user.logHealthDataAccess()
            await User.updateOne(
                { _id: user._id },
                { $set: { 'healthDataAccess.lastAccessed': new Date() } }
            )
        }

        req.user = user
        req.user.sessionId = tokenRecord.sessionId
        req.sessionInfo = {
            sessionId: tokenRecord.sessionId,
            sessionType: tokenRecord.sessionType || 'standard',
            healthDataAccess: tokenRecord.healthDataAccess || false,
            permissions: tokenRecord.permissions || []
        }


        await Token.updateOne(
            { _id: tokenRecord._id },
            { $set: { updatedAt: new Date() } }
        )


        logAuthEvent('authentication_success', decoded.userId, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionId: decoded.sessionId,
            isHealthEndpoint,
            additionalData: { 
                userStatus: user.status,
                healthStatus: user.healthStatus,
                riskLevel: user.riskLevel
            }
        })

        return next()

    } catch (error) {
        console.error('[WELLNESS-AUTH] Authentication error:', error)
        
        logAuthEvent('authentication_error', null, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { error: error.message }
        })
        
        return res.status(500).json({ 
            success: false, 
            message: 'Authentication service error. For immediate health concerns, please consult healthcare professionals.',
            error_type: 'authentication_service_error'
        })
    }
}


export const requireHealthAccess = async (req, res, next) => {
    if (!req.sessionInfo?.healthDataAccess) {
        logAuthEvent('health_access_denied', req.user?._id, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionId: req.sessionInfo?.sessionId
        })
        
        return res.status(403).json({
            success: false,
            message: 'Health data access requires elevated permissions',
            error_type: 'health_access_required',
            action_required: 'request_health_session'
        })
    }
    
    next()
}


export const allowEmergencyAccess = async (req, res, next) => {
    const emergencyOverride = req.headers['x-emergency-override']
    const emergencyToken = req.headers['x-emergency-token']
    
    if (emergencyOverride && emergencyToken) {
       
        logAuthEvent('emergency_access_attempt', req.user?._id || 'anonymous', true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { emergencyOverride, emergencyTokenProvided: !!emergencyToken }
        })
        
        console.warn('[WELLNESS-AUTH] Emergency access override used:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        })
    }
    
    next()
}


export const decodeJWT = (token) => {
    try {
        return verifyJWTToken(token)
    } catch (error) {
        console.error('[WELLNESS-AUTH] JWT decode failed:', error.message)
        return null
    }
}