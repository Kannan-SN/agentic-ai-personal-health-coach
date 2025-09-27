import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '@/config'
import ms from 'ms'
import crypto from 'crypto'


export const generatePassword = async (password) => {
    const salt = await bcrypt.genSalt(config.DEFAULT_SALT_ROUNDS + 2) 
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}

export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}


export const generateJWTToken = (payload, isRefreshToken = false, isHealthSession = false) => {
    
    const enhancedPayload = {
        ...payload,
        healthAccess: isHealthSession,
        sessionType: isHealthSession ? 'health_access' : 'standard',
        issuedAt: Date.now(),
        nonce: isHealthSession ? crypto.randomBytes(16).toString('hex') : undefined
    }

    let expirationTime
    if (isHealthSession) {
        expirationTime = config.HEALTH_SESSION_EXPIRATION
    } else if (isRefreshToken) {
        expirationTime = config.REFRESH_TOKEN_EXPIRATION
    } else {
        expirationTime = config.ACCESS_TOKEN_EXPIRATION
    }

    const token = jwt.sign(enhancedPayload, config.AUTH_SIGNER_KEY, {
        algorithm: 'RS256',
        expiresIn: ms(expirationTime) / 1000,
        issuer: 'wellness-user-service',
        audience: isHealthSession ? 'health-data-access' : 'general-access'
    })

    return token
}

export const verifyJWTToken = (token, requireHealthAccess = false) => {
    try {
        const decoded = jwt.verify(token, config.AUTH_PUBLIC_KEY, {
            algorithms: ['RS256'],
            issuer: 'wellness-user-service'
        })

        if (requireHealthAccess && !decoded.healthAccess) {
            throw new Error('Health access required but not granted in token')
        }

        
        if (decoded.healthAccess) {
            const tokenAge = Date.now() - decoded.issuedAt
            const maxHealthSessionAge = ms(config.HEALTH_SESSION_EXPIRATION)
            
            if (tokenAge > maxHealthSessionAge) {
                throw new Error('Health session token expired')
            }
        }

        return decoded
    } catch (error) {
        console.error('[WELLNESS-AUTH] Token verification failed:', error.message)
        throw error
    }
}


export const generateSecureSessionId = (userId, isHealthSession = false) => {
    const timestamp = Date.now().toString()
    const randomBytes = crypto.randomBytes(32).toString('hex')
    const userIdHash = crypto.createHash('sha256').update(userId.toString()).digest('hex')
    
    const sessionData = `${userIdHash}:${timestamp}:${randomBytes}:${isHealthSession ? 'health' : 'standard'}`
    return crypto.createHash('sha256').update(sessionData).digest('hex')
}


export const hashString = async (string) => {
    const salt = await bcrypt.genSalt(config.DEFAULT_SALT_ROUNDS)
    const hashedString = await bcrypt.hash(string, salt)
    return hashedString
}

export const compareString = async (string, hashedString) => {
    const isMatch = await bcrypt.compare(string, hashedString)
    return isMatch
}


export const createHMACSignature = (data, timestamp, keyType = 'user') => {
    const key = keyType === 'agent' ? config.HMAC_AGENT_KEY : config.HMAC_USER_KEY
    const message = JSON.stringify(data) + timestamp.toString()
    
    return crypto
        .createHmac('sha256', key)
        .update(message)
        .digest('hex')
}


export const verifyHMACSignature = (data, timestamp, signature, keyType = 'user') => {
    try {
        const key = keyType === 'agent' ? config.HMAC_AGENT_KEY : config.HMAC_USER_KEY
        const message = JSON.stringify(data) + timestamp.toString()
        
        const expectedSignature = crypto
            .createHmac('sha256', key)
            .update(message)
            .digest('hex')
        
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        )
    } catch (error) {
        console.error('[WELLNESS-AUTH] HMAC verification failed:', error.message)
        return false
    }
}


export const generateHealthOTP = () => {
    return crypto.randomInt(100000, 999999).toString()
}


export const calculateAuthRisk = (authContext) => {
    let riskScore = 0
    

    if (authContext.newIP) riskScore += 2
    if (authContext.foreignIP) riskScore += 3
    

    if (authContext.newDevice) riskScore += 2
    if (authContext.newUserAgent) riskScore += 1
    

    if (authContext.unusualTime) riskScore += 1
    

    if (authContext.requestingHealthAccess) riskScore += 2

    if (authContext.recentFailedAttempts > 0) {
        riskScore += Math.min(authContext.recentFailedAttempts * 2, 10)
    }
    

    if (riskScore >= 8) return 'high'
    if (riskScore >= 5) return 'medium'
    return 'low'
}


export const validatePasswordStrength = (password) => {
    const requirements = {
        minLength: password.length >= 8,
        maxLength: password.length <= 128,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        noCommonPatterns: !/(123|abc|password|admin|health)/i.test(password)
    }
    
    const score = Object.values(requirements).filter(Boolean).length
    const isValid = score >= 6 
    return {
        isValid,
        score,
        requirements,
        strength: score >= 6 ? 'strong' : score >= 4 ? 'medium' : 'weak'
    }
}

export const logAuthEvent = (eventType, userId, success, metadata = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        userId: userId ? userId.toString() : 'anonymous',
        success,
        ipAddress: metadata.ipAddress || 'unknown',
        userAgent: metadata.userAgent || 'unknown',
        sessionId: metadata.sessionId || null,
        riskScore: metadata.riskScore || 'unknown',
        additionalData: metadata.additionalData || {}
    }
    
    console.log(`[WELLNESS-AUTH-AUDIT] ${JSON.stringify(logEntry)}`)
    
    return logEntry
}