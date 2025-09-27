import config from '@/config'
import ms from 'ms'

// Authentication and session durations
export const ACTIVATION_DURATION = ms('14d')
export const REFRESH_EXPIRY_DURATION = ms(config.REFRESH_TOKEN_EXPIRATION)
export const HEALTH_SESSION_DURATION = ms(config.HEALTH_SESSION_EXPIRATION)
export const OTP_EXPIRY_DURATION = ms(config.OTP_EXPIRATION)

// Health-specific timeouts and limits
export const HEALTH_DATA_SESSION_TIMEOUT = ms('1h') 
export const EMERGENCY_RESPONSE_TIMEOUT = ms('5m') 
export const PROFESSIONAL_CONSULTATION_REMINDER = ms('30d') 
export const RISK_ASSESSMENT_INTERVAL = ms('90d') 

// Safety monitoring intervals
export const PROGRESS_TRACKING_REMINDER = ms('7d') 
export const HEALTH_PLAN_REVIEW_INTERVAL = ms('14d') 
export const EMERGENCY_CONTACT_VERIFICATION = ms('180d') 

// File upload limits (enhanced for health documents)
export const MAX_HEALTH_DOCUMENT_UPLOAD_SIZE = 10 * 1024 * 1024 
export const MAX_PROGRESS_PHOTO_SIZE = 5 * 1024 * 1024 
export const MAX_MEDICAL_REPORT_SIZE = 15 * 1024 * 1024 

// Rate limiting values
export const MAX_HEALTH_REQUESTS_PER_HOUR = 50
export const MAX_EMERGENCY_ALERTS_PER_DAY = 5
export const MAX_PLAN_MODIFICATIONS_PER_WEEK = 10

// Audit and compliance retention
export const HEALTH_AUDIT_LOG_RETENTION = ms('7y') 
export const GENERAL_AUDIT_LOG_RETENTION = ms('3y') 
export const SESSION_LOG_RETENTION = ms('1y') 

// Safety thresholds
export const HIGH_RISK_SYMPTOM_THRESHOLD = 3 
export const EMERGENCY_RESPONSE_ESCALATION_TIME = ms('15m') 
export const PROFESSIONAL_CONSULTATION_OVERDUE = ms('60d') 

