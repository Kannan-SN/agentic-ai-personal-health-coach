const fs = require('fs')
const path = require('path')

// Helper function to safely read file
const safeReadFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8')
        }
        console.warn(`[CONFIG] File not found: ${filePath}`)
        return null
    } catch (error) {
        console.error(`[CONFIG] Error reading file ${filePath}:`, error.message)
        return null
    }
}

// Helper function to decode and format private key
const decodePrivateKey = (encodedKey) => {
    if (!encodedKey) return null
    
    try {
        // Decode from base64
        const decoded = Buffer.from(encodedKey, 'base64').toString('utf-8')
        
        // Check if it's already in PEM format
        if (decoded.includes('-----BEGIN') && decoded.includes('-----END')) {
            return decoded
        }
        
        // Try to format as PEM (handle different key types)
        let pemKey
        if (decoded.includes('PRIVATE KEY')) {
            // Already has some PEM structure
            pemKey = decoded
        } else {
            // Raw key content, wrap in PEM format
            const keyLines = decoded.match(/.{1,64}/g) || [decoded]
            pemKey = `-----BEGIN PRIVATE KEY-----\n${keyLines.join('\n')}\n-----END PRIVATE KEY-----`
        }
        
        return pemKey
    } catch (error) {
        console.error('[CONFIG] Failed to decode private key:', error.message)
        return null
    }
}

// Helper function to get public key
const getPublicKey = () => {
    // Try to read from file first
    const publicKeyPath = path.resolve(path.join(__dirname, '../private/auth_public_key.pem'))
    const fileKey = safeReadFile(publicKeyPath)
    
    if (fileKey) {
        return fileKey
    }
    
    // If no file, try to extract from environment (some setups store both keys)
    if (process.env.AUTH_PUBLIC_KEY) {
        try {
            return Buffer.from(process.env.AUTH_PUBLIC_KEY, 'base64').toString('utf-8')
        } catch (error) {
            console.warn('[CONFIG] Failed to decode AUTH_PUBLIC_KEY from env')
        }
    }
    
    console.warn('[CONFIG] No public key found, will use fallback signing method')
    return null
}

const config = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,

    // Service Hosts
    USER_HOST: process.env.USER_HOST,
    AGENT_HOST: process.env.AGENT_HOST,
    FRONTEND_HOST: process.env.FRONTEND_HOST,

    // Email Configuration
    MAIL: process.env.MAIL,
    HOST: process.env.HOST,
    MAILPORT: parseInt(process.env.MAILPORT) || 587,
    SECURE: process.env.SECURE === 'true',
    USER_NAME: process.env.USER_NAME,
    PASSWORD: process.env.PASSWORD,

    // Request Configuration
    REQUEST_TIMEOUT: 90000,

    // JWT Configuration with robust key handling
    AUTH_SIGNER_KEY: decodePrivateKey(process.env.AUTH_PRIVATE_SIGNER),
    AUTH_PUBLIC_KEY: getPublicKey(),
    
    // Fallback JWT secret for HS256 if RSA keys fail
    JWT_FALLBACK_SECRET: process.env.CRYPTO_SECRET || 'emergency-fallback-secret-key-2024',

    // Encryption Configuration
    CRYPTO_SECRET: process.env.CRYPTO_SECRET,
    HEALTH_DATA_ENCRYPTION_KEY: process.env.HEALTH_DATA_ENCRYPTION_KEY,

    // Token Expiration Settings
    ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION || '2h',
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    HEALTH_SESSION_EXPIRATION: process.env.HEALTH_SESSION_EXPIRATION || '1h',
    OTP_EXPIRATION: process.env.OTP_EXPIRATION || '5m',
    DEFAULT_SALT_ROUNDS: parseInt(process.env.DEFAULT_SALT_ROUNDS) || 12,

    // AWS S3 Configuration
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_PUBLIC: process.env.AWS_S3_PUBLIC,
    AWS_S3_ACCESS: process.env.AWS_S3_ACCESS,
    AWS_S3_SECRET: process.env.AWS_S3_SECRET,
    ASSET_URL: process.env.ASSET_URL,

    // S3 Bucket Names
    HEALTH_DOCUMENTS: 'health-documents',
    PROGRESS_PHOTOS: 'progress-photos',
    MEDICAL_REPORTS: 'medical-reports',

    // File Size Limits
    MAX_HEALTH_DOCUMENT_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_PROGRESS_PHOTO_SIZE: 2 * 1024 * 1024,  // 2MB
    MAX_MEDICAL_REPORT_SIZE: 10 * 1024 * 1024, // 10MB

    // HMAC Keys
    HMAC_AGENT_KEY: process.env.HMAC_AGENT_KEY,
    HMAC_USER_KEY: process.env.HMAC_USER_KEY,

    // Health Service Configuration
    EMERGENCY_NOTIFICATION_EMAIL: process.env.EMERGENCY_NOTIFICATION_EMAIL,
    HEALTH_DISCLAIMER_VERSION: process.env.HEALTH_DISCLAIMER_VERSION || '1.0',

    // Rate Limiting
    MAX_DAILY_HEALTH_REQUESTS: parseInt(process.env.MAX_DAILY_HEALTH_REQUESTS) || 50,
    SAFETY_ESCALATION_THRESHOLD: parseInt(process.env.SAFETY_ESCALATION_THRESHOLD) || 3,

    // Data Retention
    HEALTH_DATA_RETENTION_DAYS: parseInt(process.env.HEALTH_DATA_RETENTION_DAYS) || 2555,
    AUDIT_LOG_RETENTION_DAYS: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 2555,

    // Emergency Contacts
    EMERGENCY_CONTACTS: {
        US_EMERGENCY: '911',
        US_POISON_CONTROL: '1-800-222-1222',
        US_CRISIS_TEXT: '741741',
        US_SUICIDE_PREVENTION: '988'
    },

    // Health Service Constants
    ACTIVATION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    REFRESH_EXPIRY_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    
    // Security Configuration
    BCRYPT_ROUNDS: parseInt(process.env.DEFAULT_SALT_ROUNDS) || 12,
    
    // Environment Detection
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development'
}

// Validate critical configuration on startup
const validateConfig = () => {
    const requiredKeys = [
        'MONGO_URI',
        'CRYPTO_SECRET',
        'HEALTH_DATA_ENCRYPTION_KEY'
    ]
    
    const missingKeys = requiredKeys.filter(key => !config[key])
    
    if (missingKeys.length > 0) {
        console.error('[CONFIG] Missing required environment variables:', missingKeys)
        if (config.IS_PRODUCTION) {
            throw new Error(`Missing required configuration: ${missingKeys.join(', ')}`)
        }
    }
    
    // Warn about JWT configuration
    if (!config.AUTH_SIGNER_KEY && !config.JWT_FALLBACK_SECRET) {
        console.warn('[CONFIG] No JWT signing key configured, tokens may not work properly')
    } else if (!config.AUTH_SIGNER_KEY) {
        console.warn('[CONFIG] Using fallback HS256 JWT signing (less secure than RS256)')
    }
    
    console.log('[CONFIG] Configuration validated successfully')
}

// Run validation
validateConfig()

module.exports = config