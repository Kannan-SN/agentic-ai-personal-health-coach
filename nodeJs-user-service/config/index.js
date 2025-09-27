import fs from 'fs'
import path from 'path'

const config = {
    
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,

 
    USER_HOST: process.env.USER_HOST,
    AGENT_HOST: process.env.AGENT_HOST,
    FRONTEND_HOST: process.env.FRONTEND_HOST,

    SMTP_MAIL: process.env.MAIL,
    SMTP_HOST: process.env.HOST,
    SMTP_PORT: process.env.MAILPORT,
    SMTP_SECURE: process.env.SECURE,
    SMTP_USER: process.env.USER_NAME,
    SMTP_PASS: process.env.PASSWORD,

    
    REQUEST_TIMEOUT: 10000, 

   
    AUTH_PUBLIC_KEY: fs.readFileSync(path.resolve(path.join(__dirname, '../private/auth_public_key.pem')), 'utf8'),
    AUTH_SIGNER_KEY: Buffer.from(process.env.AUTH_PRIVATE_SIGNER, 'base64').toString('utf8'),

    
    CRYPTO_SECRET: process.env.CRYPTO_SECRET,
    HEALTH_DATA_ENCRYPTION_KEY: process.env.HEALTH_DATA_ENCRYPTION_KEY,

  
    ACCESS_TOKEN_EXPIRATION: '2h', 
    REFRESH_TOKEN_EXPIRATION: '7d', 
    HEALTH_SESSION_EXPIRATION: '1h',
    OTP_EXPIRATION: '5m',
    DEFAULT_SALT_ROUNDS: 12,

   
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_PUBLIC: process.env.AWS_S3_PUBLIC,
    AWS_S3_ACCESS: process.env.AWS_S3_ACCESS,
    AWS_S3_SECRET: process.env.AWS_S3_SECRET,
    ASSET_URL: process.env.ASSET_URL,

    
    HEALTH_DOCUMENTS: 'health-documents',
    PROGRESS_PHOTOS: 'progress-photos',
    MEDICAL_REPORTS: 'medical-reports',

 
    MAX_HEALTH_DOCUMENT_SIZE: 5 * 1024 * 1024, 
    MAX_PROGRESS_PHOTO_SIZE: 2 * 1024 * 1024, 
    MAX_MEDICAL_REPORT_SIZE: 10 * 1024 * 1024, 


    HMAC_AGENT_KEY: process.env.HMAC_AGENT_KEY,
    HMAC_USER_KEY: process.env.HMAC_USER_KEY,


    EMERGENCY_NOTIFICATION_EMAIL: process.env.EMERGENCY_NOTIFICATION_EMAIL,
    HEALTH_DISCLAIMER_VERSION: '1.0',
    
  
    
   
    MAX_DAILY_HEALTH_REQUESTS: 50,
    SAFETY_ESCALATION_THRESHOLD: 3, 
    
    
    HEALTH_DATA_RETENTION_DAYS: 2555, 
    AUDIT_LOG_RETENTION_DAYS: 2555, 
    
   
    EMERGENCY_CONTACTS: {
        US_EMERGENCY: '911',
        US_POISON_CONTROL: '1-800-222-1222',
        US_CRISIS_TEXT: '741741',
        US_SUICIDE_PREVENTION: '988'
    }
}

export default config