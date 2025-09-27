import crypto from 'crypto'
import config from '@/config'
import isEmpty from 'is-empty'
import { logAuthEvent } from '@/security/security'


export const verifySignature = async (req, res, next) => {
    try {
        const { headers, body, query } = req
        
        const signature = headers['wellness-signature']
        const origin = headers['wellness-origin']
        const validate = headers['wellness-validate']
        const timestamp = headers['wellness-timestamp']
        const isHealthData = headers['wellness-health-data'] === 'true'

        if (isEmpty(signature) || isEmpty(origin) || isEmpty(validate) || isEmpty(timestamp)) {
            logAuthEvent('hmac_missing_headers', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { 
                    missingHeaders: {
                        signature: isEmpty(signature),
                        origin: isEmpty(origin),
                        validate: isEmpty(validate),
                        timestamp: isEmpty(timestamp)
                    }
                }
            })

            return res.status(403).json({ 
                success: false, 
                message: 'Invalid signature headers - service authentication failed',
                error_type: 'signature_invalid',
                required_headers: ['wellness-signature', 'wellness-origin', 'wellness-validate', 'wellness-timestamp']
            })
        }

     
        const currentTime = Date.now()
        const requestTime = parseInt(timestamp)
        const timeDifference = Math.abs(currentTime - requestTime)
        const maxAllowedDifference = 5 * 60 * 1000 

        if (timeDifference > maxAllowedDifference) {
            logAuthEvent('hmac_timestamp_invalid', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { 
                    timeDifference: timeDifference / 1000,
                    requestTime: new Date(requestTime).toISOString(),
                    currentTime: new Date(currentTime).toISOString()
                }
            })

            return res.status(403).json({ 
                success: false, 
                message: 'Request timestamp invalid - possible replay attack',
                error_type: 'timestamp_invalid'
            })
        }

        let validator = JSON.stringify(body) + timestamp

        if (validate === 'query') {
            validator = JSON.stringify(query) + timestamp
        } else if (validate === 'both') {
            validator = JSON.stringify(query) + JSON.stringify(body) + timestamp
        }

     
        let key = ''
        if (origin === 'agent') {
            key = config.HMAC_AGENT_KEY
        } else if (origin === 'user') {
            key = config.HMAC_USER_KEY
        } else {
            logAuthEvent('hmac_invalid_origin', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { invalidOrigin: origin }
            })

            return res.status(403).json({ 
                success: false, 
                message: 'Invalid service origin',
                error_type: 'invalid_origin',
                allowed_origins: ['agent', 'user']
            })
        }

        if (!key) {
            console.error('[WELLNESS-HMAC] Missing HMAC key for origin:', origin)
            return res.status(500).json({ 
                success: false, 
                message: 'Service configuration error',
                error_type: 'configuration_error'
            })
        }

        const generatedSignature = crypto.createHmac('SHA256', Buffer.from(key, 'utf-8'))
        generatedSignature.update(validator)
        const latestSignature = generatedSignature.digest('hex')

        let isValid = false
        try {
            isValid = crypto.timingSafeEqual(
                Buffer.from(latestSignature, 'hex'), 
                Buffer.from(signature, 'hex')
            )
        } catch (error) {
            logAuthEvent('hmac_signature_format_error', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { error: error.message }
            })

            return res.status(403).json({ 
                success: false, 
                message: 'Signature format invalid',
                error_type: 'signature_format_error'
            })
        }

        if (!isValid) {
            logAuthEvent('hmac_signature_mismatch', null, false, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                additionalData: { 
                    origin,
                    validate,
                    isHealthData,
                    bodySize: JSON.stringify(body).length,
                    queryParams: Object.keys(query).length
                }
            })

            return res.status(403).json({ 
                success: false, 
                message: 'Signature verification failed - service authentication invalid',
                error_type: 'signature_mismatch'
            })
        }

     
        if (isHealthData) {
            console.log(`[WELLNESS-HMAC] Health data request authenticated from ${origin} service`)
        }

        req.signatureVerified = {
            origin,
            timestamp: requestTime,
            isHealthData,
            verifiedAt: new Date()
        }

       
        logAuthEvent('hmac_verification_success', null, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { 
                origin,
                validate,
                isHealthData,
                endpoint: req.path
            }
        })

        return next()

    } catch (error) {
        console.error('[WELLNESS-HMAC] Signature verification error:', error)
        
        logAuthEvent('hmac_verification_error', null, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { error: error.message }
        })
        
        return res.status(500).json({ 
            success: false, 
            message: 'Signature verification service error. For immediate health concerns, please consult healthcare professionals.',
            error_type: 'signature_service_error'
        })
    }
}


export const validateHealthPlanRequest = (requestData) => {
    const validation = {
        is_valid: true,
        errors: [],
        warnings: []
    }


    if (requestData.age && (requestData.age < 13 || requestData.age > 100)) {
        validation.is_valid = false
        validation.errors.push('Age must be between 13 and 100 years')
    }

    const highRiskConditions = [
        'heart disease', 'diabetes', 'high blood pressure', 'eating disorder',
        'pregnancy', 'recent surgery', 'joint problems', 'back injury',
        'chest pain', 'shortness of breath'
    ]

    if (requestData.health_conditions) {
        const hasHighRiskCondition = requestData.health_conditions.some(condition =>
            highRiskConditions.some(risk => 
                condition.toLowerCase().includes(risk.toLowerCase())
            )
        )

        if (hasHighRiskCondition) {
            validation.warnings.push('High-risk health conditions detected - professional consultation strongly recommended')
        }
    }

    if (requestData.primary_goal === 'extreme_weight_loss' || 
        requestData.time_availability_minutes > 180) {
        validation.warnings.push('Extreme fitness goals detected - medical supervision recommended')
    }

    if (requestData.age > 65 || requestData.health_conditions?.length > 0) {
        if (!requestData.medical_clearance) {
            validation.warnings.push('Medical clearance recommended before starting program')
        }
    }

    return validation
}


export const healthEndpointRateLimit = async (req, res, next) => {
    const clientIP = req.ip
    const userId = req.user?._id?.toString()
    const endpoint = req.path
    
  
    const rateLimitKey = `health_rate_limit:${clientIP}:${userId}:${endpoint}`

    console.log(`[WELLNESS-RATE-LIMIT] Health endpoint access: ${endpoint} from ${clientIP}`)
  
    next()
}