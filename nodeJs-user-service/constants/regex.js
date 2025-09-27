
export const EMAIL = 
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x21\x23-\x5b\x5d-\x7e]|\\[\x21-\x7e])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x21-\x5a\x53-\x7e]|\\[\x21-\x7e])+)\])/

export const EMAIL_CHARS = /^[+\-_.@a-zA-Z0-9]+$/i


export const PASSWORD = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*|\\/<>()+=\-_])[A-Za-z\d~!@#$%^&*|\\/<>()+=\-_]{8,32}$/

// Health-specific validation patterns
export const PHONE_NUMBER = /^[+]?([1-9][\d]{0,15})$/ 
export const HEIGHT_INCHES = /^[4-9][0-9]$|^1[0-2][0-9]$/ 
export const HEIGHT_CM = /^[1-2][0-9][0-9]$/ 
export const WEIGHT_LBS = /^[5-9][0-9]$|^[1-9][0-9][0-9]$/ 
export const WEIGHT_KG = /^[2-9][0-9]$|^[1-4][0-9][0-9]$/ 

// Medical and health identifiers
export const MEDICAL_RECORD_NUMBER = /^[A-Z0-9]{6,12}$/ 
export const INSURANCE_ID = /^[A-Z0-9-]{8,20}$/ 
export const EMERGENCY_CONTACT_RELATIONSHIP = /^[a-zA-Z\s]{2,30}$/ 

// Safety validation patterns
export const EMERGENCY_KEYWORD_PATTERN = /\b(chest pain|heart attack|can'?t breathe|difficulty breathing|severe pain|unconscious|fainting|allergic reaction|blood|suicide|self.?harm)\b/i
export const MEDICATION_NAME_PATTERN = /^[a-zA-Z\s\-()0-9]{2,50}$/ 
export const HEALTH_CONDITION_PATTERN = /^[a-zA-Z\s\-,().]{2,100}$/ 

// File validation patterns  
export const HEALTH_DOCUMENT_FILENAME = /^[a-zA-Z0-9\-_.\s]{1,100}\.(pdf|doc|docx|jpg|jpeg|png)$/i
export const PROGRESS_PHOTO_FILENAME = /^[a-zA-Z0-9\-_.\s]{1,100}\.(jpg|jpeg|png)$/i

// Professional credentials validation
export const MEDICAL_LICENSE_NUMBER = /^[A-Z]{1,3}[0-9]{4,8}$/ 
export const NPI_NUMBER = /^[0-9]{10}$/ 

// General validation patterns
export const ISALNUMHYPCASE = /^[a-zA-Z0-9_?\s]+$/
export const OBJECT_ID = /^[a-fA-F0-9]{24}$/

// Session and security patterns
export const SESSION_ID_PATTERN = /^[a-f0-9]{64}$/ 
export const HEALTH_ACCESS_TOKEN_PATTERN = /^[a-f0-9]{128}$/

// Geographic and location patterns 
export const ZIP_CODE_US = /^[0-9]{5}(?:-[0-9]{4})?$/
export const POSTAL_CODE_INTERNATIONAL = /^[A-Z0-9\s-]{3,10}$/i 

// Time and date validation
export const TIME_24H = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ 
export const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/ 

// Health measurement validation
export const BLOOD_PRESSURE = /^([1-2][0-9][0-9])\/([5-9][0-9]|1[0-5][0-9])$/ 
export const HEART_RATE = /^[4-9][0-9]$|^1[0-9][0-9]$|^2[0-2][0-9]$/ 
export const BODY_FAT_PERCENTAGE = /^[1-9]$|^[1-4][0-9]$|^50$/ 

// Emergency and safety patterns
export const EMERGENCY_SEVERITY = /^(low|moderate|high|critical)$/i
export const SAFETY_FLAG_PATTERN = /^[a-zA-Z0-9\s\-_]{3,50}$/
export const CONSULTATION_PRIORITY = /^(low|moderate|high|urgent)$/i

// Audit and compliance patterns
export const AUDIT_ACTION_PATTERN = /^[a-zA-Z0-9\s\-_]{3,100}$/ 
export const COMPLIANCE_VERSION = /^[0-9]+\.[0-9]+(\.[0-9]+)?$/ 