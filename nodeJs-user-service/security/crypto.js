import crypto from 'crypto'
import config from '@/config'


export const encryptHealthData = (text) => {
    const iv = crypto.randomBytes(16)
    const key = crypto.createHash('sha256').update(config.HEALTH_DATA_ENCRYPTION_KEY).digest('base64').substr(0, 32)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    const stringData = typeof text === 'string' ? text : JSON.stringify(text)

    let encrypted = cipher.update(stringData, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return `${iv.toString('hex')}:${encrypted}`
}

export const decryptHealthData = (encryptedText) => {
    try {
        const [iv, encrypted] = encryptedText.split(':')
        
        if (!iv || !encrypted) {
            throw new Error('Invalid encrypted data format')
        }

        const key = crypto.createHash('sha256').update(config.HEALTH_DATA_ENCRYPTION_KEY).digest('base64').substr(0, 32)
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv, 'hex'))
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        
        return decrypted
    } catch (error) {
        console.error('[WELLNESS-CRYPTO] Health data decryption failed:', error.message)
        throw new Error('Failed to decrypt health data')
    }
}


export const encryptString = (text) => {
    const iv = crypto.randomBytes(16)
    const key = crypto.createHash('sha256').update(config.CRYPTO_SECRET).digest('base64').substr(0, 32)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    const stringData = typeof text === 'string' ? text : text.toString()

    let encrypted = cipher.update(stringData, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return `${iv.toString('hex')}:${encrypted}`
}

export const decryptString = (encryptedText) => {
    try {
        const [iv, encrypted] = encryptedText.split(':')

        const key = crypto.createHash('sha256').update(config.CRYPTO_SECRET).digest('base64').substr(0, 32)
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv, 'hex'))
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (error) {
        console.error('[WELLNESS-CRYPTO] String decryption failed:', error.message)
        throw new Error('Failed to decrypt data')
    }
}


export const generateHealthSecureToken = (length = 64) => {
    return crypto.randomBytes(length).toString('hex')
}


export const hashHealthIdentifier = (identifier) => {
    return crypto.createHash('sha256').update(identifier + config.HEALTH_DATA_ENCRYPTION_KEY).digest('hex')
}


export const createHealthDataHash = (data) => {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)
    const timestamp = Date.now().toString()
    return crypto.createHash('sha256').update(dataString + timestamp + config.HEALTH_DATA_ENCRYPTION_KEY).digest('hex')
}


export const verifyHealthDataIntegrity = (data, hash, timestamp) => {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)
    const expectedHash = crypto.createHash('sha256').update(dataString + timestamp + config.HEALTH_DATA_ENCRYPTION_KEY).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'))
}