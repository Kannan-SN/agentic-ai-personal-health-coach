// Fix the import - use require instead of import for nodemailer
const nodemailer = require('nodemailer')
import config from '@/config'
import * as enums from '@/constants/enum'
import isEmpty from 'is-empty'
import { User } from '@/models'

const createEmailTransport = () => {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: config.HOST || 'smtp.gmail.com',
            port: parseInt(config.MAILPORT) || 587,
            secure: config.MAILPORT === '465', // true for 465, false for other ports
            auth: {
                user: config.USER_NAME,
                pass: config.PASSWORD // Gmail App Password (not your Gmail password)
            },
            tls: {
                rejectUnauthorized: false // For development only
            },
            timeout: 30000,
            maxConnections: 5,
            maxMessages: 100
        })

        console.log('[WELLNESS-MAIL] Gmail transport created successfully')

        // Verify connection
        transport.verify((error, success) => {
            if (error) {
                console.error('[WELLNESS-MAIL] Gmail connection verification failed:', error)
            } else {
                console.log('[WELLNESS-MAIL] Gmail server is ready to take our messages')
            }
        })

        return transport
    } catch (error) {
        console.error('[WELLNESS-MAIL] Failed to create Gmail transport:', error)
        throw new Error('Gmail service configuration failed')
    }
}

const sendEmail = async (toEmail, content, options = {}) => {
    try {
        const { subject, template, priority = 'normal', isHealthRelated = false } = content
        const { bcc = null, attachments = [] } = options
        
        const transport = createEmailTransport()
        const headers = {
            'X-Priority': priority === 'high' ? '1' : priority === 'low' ? '5' : '3',
            'X-Health-Service': 'wellness-user-service',
            'X-Content-Classification': isHealthRelated ? 'health-information' : 'general'
        }
        
        if (isHealthRelated) {
            headers['X-Health-Disclaimer'] = 'This email contains general wellness information only and cannot replace professional medical advice'
        }

        const mailOptions = {
            from: {
                name: 'Wellness Coach',
                address: config.USER_NAME // Use your Gmail address
            },
            to: toEmail,
            bcc: bcc,
            subject: subject,
            html: template,
            attachments: attachments,
            headers: headers,
            priority: priority
        }

        const mailSentInformation = await transport.sendMail(mailOptions)
        
        console.log(`[WELLNESS-MAIL] Email sent successfully via Gmail:`, {
            messageId: mailSentInformation.messageId,
            accepted: mailSentInformation.accepted?.length || 0,
            rejected: mailSentInformation.rejected?.length || 0,
            to: toEmail,
            isHealthRelated
        })
        
        return {
            success: true,
            messageId: mailSentInformation.messageId,
            accepted: mailSentInformation.accepted,
            rejected: mailSentInformation.rejected
        }
        
    } catch (error) {
        console.error('[WELLNESS-MAIL] Error sending email via Gmail:', {
            error: error.message,
            to: toEmail,
            code: error.code || 'UNKNOWN'
        })
        return {
            success: false,
            error: error.message,
            code: error.code || 'EMAIL_SEND_FAILED'
        }
    }
}

export const sendEmailViaTemplate = async ({ identifier, to, content, bcc, options = {} }) => {
    try {
        const templates = {
            [enums.EMAIL_CATEGORIES.VERIFICATION_MAIL]: {
                subject: 'Welcome to Wellness Coach - Please Verify Your Email',
                template: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h1 style="color: #2c5aa0; text-align: center; margin-bottom: 30px;">
                                Welcome to Your Wellness Journey!
                            </h1>
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Hello ##NAME##,
                            </p>
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Thank you for joining our wellness community! To complete your account setup and begin your personalized health journey, please verify your email address.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="##ACTIVATION_LINK##" 
                                   style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                    Verify Email Address
                                </a>
                            </div>
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                                <h4 style="margin: 0 0 10px 0; color: #856404;">Important Health Notice</h4>
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    This service provides general wellness information only and cannot replace professional medical advice. 
                                    Always consult with qualified healthcare professionals for medical concerns, diagnosis, or treatment.
                                </p>
                            </div>
                            <p style="font-size: 14px; color: #666; margin-top: 30px;">
                                If you didn't create this account, please ignore this email. The link will expire in 14 days.
                            </p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <div style="text-align: center;">
                                <p style="font-size: 12px; color: #999; margin: 0;">
                                    Wellness Coach | General wellness information only | Not medical advice
                                </p>
                                <p style="font-size: 12px; color: #999; margin: 5px 0 0 0;">
                                    Emergency: 911 (US) | Crisis Text: HOME to 741741
                                </p>
                            </div>
                        </div>
                    </div>
                `,
                isHealthRelated: true
            },
            
            [enums.EMAIL_CATEGORIES.HEALTH_PLAN_CREATED]: {
                subject: 'Your Personalized Wellness Plan is Ready!',
                template: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h1 style="color: #28a745; text-align: center; margin-bottom: 30px;">
                                Your Wellness Plan is Ready!
                            </h1>
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Hello ##NAME##,
                            </p>
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Congratulations! Your personalized wellness plan has been created with comprehensive safety measures and professional recommendations.
                            </p>
                            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #28a745;">Plan Overview</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #333;">
                                    <li>Plan Name: ##PLAN_NAME##</li>
                                    <li>Duration: ##DURATION_WEEKS## weeks</li>
                                    <li>Primary Goal: ##PRIMARY_GOAL##</li>
                                    <li>Safety Level: ##SAFETY_LEVEL##</li>
                                </ul>
                            </div>
                            <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
                                <h4 style="margin: 0 0 10px 0; color: #721c24;">Critical Safety Reminders</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #721c24; font-size: 14px;">
                                    <li>Stop any activity that causes pain or discomfort</li>
                                    <li>Monitor your energy levels and recovery</li>
                                    <li>Report concerning symptoms to healthcare providers immediately</li>
                                    <li>This plan provides general guidance only - not medical advice</li>
                                </ul>
                            </div>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="##PLAN_LINK##" 
                                   style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                    View Your Plan
                                </a>
                            </div>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <div style="text-align: center;">
                                <p style="font-size: 12px; color: #999; margin: 0;">
                                    Emergency Services: 911 (US) | Healthcare Provider Consultation Recommended
                                </p>
                            </div>
                        </div>
                    </div>
                `,
                isHealthRelated: true
            },
            
            [enums.EMAIL_CATEGORIES.SAFETY_CONCERN]: {
                subject: 'URGENT: Health Safety Concern Detected - Immediate Attention Required',
                template: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-top: 5px solid #dc3545;">
                            <h1 style="color: #dc3545; text-align: center; margin-bottom: 30px;">
                                Health Safety Alert
                            </h1>
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Hello ##NAME##,
                            </p>
                            <div style="background-color: #f8d7da; border: 2px solid #dc3545; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #721c24;">IMMEDIATE ATTENTION REQUIRED</h3>
                                <p style="margin: 0; color: #721c24; font-weight: bold;">
                                    Our system has detected concerning symptoms or safety issues in your wellness plan. 
                                    Please take the following actions immediately:
                                </p>
                            </div>
                            <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #856404;">Immediate Actions Required:</h4>
                                <ol style="margin: 0; padding-left: 20px; color: #856404;">
                                    <li>Stop all current fitness activities immediately</li>
                                    <li>Contact your healthcare provider or call 911 if experiencing severe symptoms</li>
                                    <li>Do not resume activities until cleared by a medical professional</li>
                                    <li>Review the safety concerns in your wellness dashboard</li>
                                </ol>
                            </div>
                            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #0c5460;">Emergency Resources:</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
                                    <li><strong>Emergency Services:</strong> 911 (US)</li>
                                    <li><strong>Poison Control:</strong> 1-800-222-1222 (US)</li>
                                    <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                                </ul>
                            </div>
                            <p style="font-size: 14px; color: #666; font-style: italic;">
                                This alert was generated to protect your health and safety. When in doubt, always consult with qualified healthcare professionals.
                            </p>
                        </div>
                    </div>
                `,
                isHealthRelated: true,
                priority: 'high'
            }
        }

        const template = templates[identifier]
        if (!template) {
            console.error(`[WELLNESS-MAIL] Template not found: ${identifier}`)
            return false
        }

        // Process template with replacements
        let processedTemplate = template.template
        let processedSubject = template.subject

        const replacements = {
            '##NAME##': content.name || 'User',
            '##ACTIVATION_LINK##': content.activationLink || '#',
            '##PLAN_NAME##': content.planName || 'Wellness Plan',
            '##DURATION_WEEKS##': content.durationWeeks || '4',
            '##PRIMARY_GOAL##': content.primaryGoal || 'General Wellness',
            '##SAFETY_LEVEL##': content.safetyLevel || 'Standard',
            '##PLAN_LINK##': content.planLink || `${config.FRONTEND_HOST}/wellness-plan`,
            '##SERVICE_NAME##': content.serviceName || 'Wellness Coach',
            '##HEALTH_DISCLAIMER##': content.healthDisclaimer || enums.HEALTH_DISCLAIMER
        }

        Object.entries(replacements).forEach(([placeholder, value]) => {
            processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value)
            processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value)
        })

        const emailResult = await sendEmail(
            to,
            {
                subject: processedSubject,
                template: processedTemplate,
                priority: template.priority || 'normal',
                isHealthRelated: template.isHealthRelated || false
            },
            { bcc, ...options }
        )

        if (emailResult.success) {
            console.log(`[WELLNESS-MAIL] Template email sent successfully via Gmail: ${identifier}`)
            return true
        } else {
            console.error(`[WELLNESS-MAIL] Template email failed: ${identifier}`, emailResult.error)
            return false
        }

    } catch (error) {
        console.error('[WELLNESS-MAIL] Template processing error:', error)
        return false
    }
}

export const sendEmergencyAlert = async (userEmail, userName, alertData) => {
    try {
        const emergencyContent = {
            name: userName,
            alertType: alertData.alertType || 'Health Concern',
            severity: alertData.severity || 'high',
            description: alertData.description || 'Safety concern detected',
            timestamp: new Date().toLocaleString()
        }

        return await sendEmailViaTemplate({
            identifier: enums.EMAIL_CATEGORIES.SAFETY_CONCERN,
            to: userEmail,
            content: emergencyContent,
            options: { priority: 'high' }
        })
    } catch (error) {
        console.error('[WELLNESS-MAIL] Emergency alert email failed:', error)
        return false
    }
}

export const sendWellnessPlanNotification = async (userEmail, userName, planData) => {
    try {
        const planContent = {
            name: userName,
            planName: planData.planName,
            durationWeeks: planData.durationWeeks,
            primaryGoal: planData.primaryGoal,
            safetyLevel: planData.safetyLevel || 'Standard',
            planLink: `${config.FRONTEND_HOST}/wellness-plan/${planData.planId}`
        }

        return await sendEmailViaTemplate({
            identifier: enums.EMAIL_CATEGORIES.HEALTH_PLAN_CREATED,
            to: userEmail,
            content: planContent
        })
    } catch (error) {
        console.error('[WELLNESS-MAIL] Wellness plan notification failed:', error)
        return false
    }
}

// Test function to verify Gmail setup
export const testGmailConnection = async () => {
    try {
        const transport = createEmailTransport()
        await transport.verify()
        console.log('[WELLNESS-MAIL] Gmail connection test successful')
        return true
    } catch (error) {
        console.error('[WELLNESS-MAIL] Gmail connection test failed:', error)
        return false
    }
}