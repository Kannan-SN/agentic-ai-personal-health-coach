const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('@/config')
const ms = require('ms')
const crypto = require('crypto')

// Global signing configuration - determined once at startup
let SIGNING_CONFIG = null

// Initialize signing configuration once
const initializeSigningConfig = () => {
    if (SIGNING_CONFIG) return SIGNING_CONFIG
    
    // Try to use RSA keys first
    if (config.AUTH_SIGNER_KEY && config.AUTH_PUBLIC_KEY) {
        try {
            // Test if the keys work with RS256
            const testPayload = { test: true, exp: Math.floor(Date.now() / 1000) + 60 }
            const testToken = jwt.sign(testPayload, config.AUTH_SIGNER_KEY, { algorithm: 'RS256' })
            jwt.verify(testToken, config.AUTH_PUBLIC_KEY, { algorithms: ['RS256'] })
            
            console.log('[WELLNESS-AUTH] Using RS256 JWT signing with RSA keys')
            SIGNING_CONFIG = {
                algorithm: 'RS256',
                privateKey: config.AUTH_SIGNER_KEY,
                publicKey: config.AUTH_PUBLIC_KEY
            }
            return SIGNING_CONFIG
        } catch (error) {
            console.warn('[WELLNESS-AUTH] RS256 key validation failed:', error.message)
        }
    }
    
    // Fallback to HS256 with shared secret
    console.log('[WELLNESS-AUTH] Using HS256 JWT signing with shared secret')
    SIGNING_CONFIG = {
        algorithm: 'HS256',
        secret: config.JWT_FALLBACK_SECRET
    }
    return SIGNING_CONFIG
}

const generatePassword = async (password) => {
    const salt = await bcrypt.genSalt(config.DEFAULT_SALT_ROUNDS + 2) 
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}

const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}

const generateJWTToken = (payload, isRefreshToken = false, isHealthSession = false) => {
    const signingConfig = initializeSigningConfig()
    
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

    const tokenOptions = {
        algorithm: signingConfig.algorithm,
        expiresIn: ms(expirationTime) / 1000,
        issuer: 'wellness-user-service',
        audience: isHealthSession ? 'health-data-access' : 'general-access'
    }

    try {
        let token
        if (signingConfig.algorithm === 'RS256') {
            token = jwt.sign(enhancedPayload, signingConfig.privateKey, tokenOptions)
        } else {
            token = jwt.sign(enhancedPayload, signingConfig.secret, tokenOptions)
        }
        
        return token
    } catch (error) {
        console.error('[WELLNESS-AUTH] Token generation failed:', error.message)
        throw new Error('Failed to generate JWT token')
    }
}

const verifyJWTToken = (token, requireHealthAccess = false) => {
    const signingConfig = initializeSigningConfig()
    
    try {
        let decoded
        const verifyOptions = {
            algorithms: [signingConfig.algorithm],
            issuer: 'wellness-user-service'
        }
        
        if (signingConfig.algorithm === 'RS256') {
            decoded = jwt.verify(token, signingConfig.publicKey, verifyOptions)
        } else {
            decoded = jwt.verify(token, signingConfig.secret, verifyOptions)
        }

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

const generateSecureSessionId = (userId, isHealthSession = false) => {
    const timestamp = Date.now().toString()
    const randomBytes = crypto.randomBytes(32).toString('hex')
    const userIdHash = crypto.createHash('sha256').update(userId.toString()).digest('hex')
    
    const sessionData = `${userIdHash}:${timestamp}:${randomBytes}:${isHealthSession ? 'health' : 'standard'}`
    return crypto.createHash('sha256').update(sessionData).digest('hex')
}

const hashString = async (string) => {
    const salt = await bcrypt.genSalt(config.DEFAULT_SALT_ROUNDS)
    const hashedString = await bcrypt.hash(string, salt)
    return hashedString
}

const compareString = async (string, hashedString) => {
    const isMatch = await bcrypt.compare(string, hashedString)
    return isMatch
}

const createHMACSignature = (data, timestamp, keyType = 'user') => {
    const key = keyType === 'agent' ? config.HMAC_AGENT_KEY : config.HMAC_USER_KEY
    const message = JSON.stringify(data) + timestamp.toString()
    
    return crypto
        .createHmac('sha256', key)
        .update(message)
        .digest('hex')
}

const verifyHMACSignature = (data, timestamp, signature, keyType = 'user') => {
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

const generateHealthOTP = () => {
    return crypto.randomInt(100000, 999999).toString()
}

const calculateAuthRisk = (authContext) => {
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

const validatePasswordStrength = (password) => {
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

const logAuthEvent = (eventType, userId, success, metadata = {}) => {
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

module.exports = {
    generatePassword,
    comparePassword,
    generateJWTToken,
    verifyJWTToken,
    generateSecureSessionId,
    hashString,
    compareString,
    createHMACSignature,
    verifyHMACSignature,
    generateHealthOTP,
    calculateAuthRisk,
    validatePasswordStrength,
    logAuthEvent
}