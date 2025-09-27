
export const USER_STATES = { 
    NEW: 'new', 
    PENDING: 'pending', 
    ACTIVE: 'active', 
    INACTIVE: 'inactive', 
    BLOCKED: 'blocked', 
    DELETED: 'deleted' 
}


export const HEALTH_STATUS = {
    PROFILE_INCOMPLETE: 'profile_incomplete',
    MEDICAL_CLEARANCE_PENDING: 'medical_clearance_pending',
    CLEARED_FOR_ACTIVITY: 'cleared_for_activity',
    REQUIRES_SUPERVISION: 'requires_supervision',
    HIGH_RISK: 'high_risk'
}


export const SECURITY_TYPES = {
    ACTIVATION_MAIL: 'activation_mail',
    VERIFICATION_MAIL: 'verification_mail',
    VERIFICATION_PHONE: 'verification_phone',
    AUTH_PHONE_VERIFICATION: 'auth_phone_verification',
    UPDATE_MAIL_VERIFICATION: 'update_mail_verification',
    UPDATE_PHONE_VERIFICATION: 'update_phone_verification',
    ACCOUNT_DELETION: 'account_deletion',
    HEALTH_DATA_ACCESS: 'health_data_access',
    EMERGENCY_CONTACT_VERIFICATION: 'emergency_contact_verification'
}

export const SECURITY_MODES = { EMAIL: 'email', SMS: 'sms' }


export const ACTIVITY_LEVELS = {
    SEDENTARY: 'sedentary',
    LIGHTLY_ACTIVE: 'lightly_active', 
    MODERATELY_ACTIVE: 'moderately_active',
    VERY_ACTIVE: 'very_active',
    EXTREMELY_ACTIVE: 'extremely_active'
}


export const HEALTH_GOALS = {
    GENERAL_WELLNESS: 'general_wellness',
    WEIGHT_LOSS: 'weight_loss',
    MUSCLE_GAIN: 'muscle_gain',
    ENDURANCE: 'endurance',
    STRENGTH: 'strength',
    FLEXIBILITY: 'flexibility',
    STRESS_REDUCTION: 'stress_reduction',
    INJURY_RECOVERY: 'injury_recovery',
    CHRONIC_CONDITION_MANAGEMENT: 'chronic_condition_management'
}


export const DIETARY_RESTRICTIONS = {
    NONE: 'none',
    VEGETARIAN: 'vegetarian',
    VEGAN: 'vegan',
    GLUTEN_FREE: 'gluten_free',
    DAIRY_FREE: 'dairy_free',
    NUT_FREE: 'nut_free',
    LOW_SODIUM: 'low_sodium',
    DIABETIC_FRIENDLY: 'diabetic_friendly',
    HEART_HEALTHY: 'heart_healthy',
    KETO: 'keto',
    LOW_CARB: 'low_carb',
    MEDITERRANEAN: 'mediterranean'
}


export const WORKOUT_TYPES = {
    CARDIO: 'cardio',
    STRENGTH: 'strength',
    FLEXIBILITY: 'flexibility',
    BALANCE: 'balance',
    HIIT: 'hiit',
    YOGA: 'yoga',
    PILATES: 'pilates',
    WALKING: 'walking',
    SWIMMING: 'swimming',
    CYCLING: 'cycling',
    BODYWEIGHT: 'bodyweight'
}


export const INTENSITY_LEVELS = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
    VERY_HIGH: 'very_high'
}


export const WELLNESS_PLAN_STATES = { 
    DRAFT: 'draft',
    ACTIVE: 'active', 
    PAUSED: 'paused',
    COMPLETED: 'completed', 
    CANCELLED: 'cancelled',
    REQUIRES_REVIEW: 'requires_review'
}


export const RISK_LEVELS = {
    LOW: 'low',
    MODERATE: 'moderate', 
    HIGH: 'high',
    VERY_HIGH: 'very_high'
}


export const CONSULTATION_TYPES = {
    PRIMARY_CARE: 'primary_care_physician',
    CARDIOLOGIST: 'cardiologist',
    ENDOCRINOLOGIST: 'endocrinologist',
    ORTHOPEDIC: 'orthopedic_specialist',
    PHYSICAL_THERAPIST: 'physical_therapist',
    REGISTERED_DIETITIAN: 'registered_dietitian',
    MENTAL_HEALTH: 'mental_health_professional',
    FITNESS_PROFESSIONAL: 'certified_fitness_professional'
}


export const EMERGENCY_ALERT_TYPES = {
    CHEST_PAIN: 'chest_pain',
    BREATHING_DIFFICULTY: 'breathing_difficulty',
    SEVERE_DIZZINESS: 'severe_dizziness',
    FAINTING: 'fainting',
    SEVERE_NAUSEA: 'severe_nausea',
    INJURY: 'injury',
    MENTAL_HEALTH_CRISIS: 'mental_health_crisis',
    MEDICATION_REACTION: 'medication_reaction'
}


export const HEALTH_FILE_TYPES = { 
    MEDICAL_REPORT: 'medical_report',
    PROGRESS_PHOTO: 'progress_photo',
    HEALTH_DOCUMENT: 'health_document',
    EXERCISE_VIDEO: 'exercise_video',
    MEAL_PHOTO: 'meal_photo'
}

export const EMAIL_CATEGORIES = { 
    VERIFICATION_MAIL: 'verification_mail',
    HEALTH_PLAN_CREATED: 'health_plan_created',
    PROGRESS_MILESTONE: 'progress_milestone',
    SAFETY_CONCERN: 'safety_concern',
    PROFESSIONAL_CONSULTATION: 'professional_consultation',
    EMERGENCY_ALERT: 'emergency_alert',
    PLAN_REMINDER: 'plan_reminder'
}

export const EMAIL_TEMPLATE_STATUS = { ACTIVE: 'active', INACTIVE: 'inactive' }


export const HEALTH_DATA_CATEGORIES = {
    BASIC_PROFILE: 'basic_profile',
    MEDICAL_HISTORY: 'medical_history',
    FITNESS_DATA: 'fitness_data',
    NUTRITION_DATA: 'nutrition_data',
    PROGRESS_DATA: 'progress_data',
    EMERGENCY_CONTACTS: 'emergency_contacts',
    PROFESSIONAL_CONSULTATIONS: 'professional_consultations'
}


export const SAFETY_LIMITS = {
    MIN_AGE: 13,
    MAX_AGE: 100,
    MIN_CALORIES: 1200,
    MAX_CALORIES: 3000,
    MIN_WORKOUT_MINUTES: 10,
    MAX_WORKOUT_MINUTES: 120,
    MAX_WEEKLY_WORKOUT_HOURS: 8
}


export const HEALTH_DISCLAIMER = `
This service provides general wellness information only and cannot replace professional medical advice. 
Always consult with qualified healthcare professionals for medical concerns, diagnosis, or treatment. 
Individual health needs vary significantly, and AI recommendations have important limitations.
`

export const EXERCISE_DISCLAIMER = `
Exercise recommendations are general guidance only. Consult healthcare providers before starting any 
exercise program, especially if you have health conditions, injuries, or take medications. 
Stop immediately if you experience pain, dizziness, or concerning symptoms.
`

export const NUTRITION_DISCLAIMER = `
Nutrition information is for educational purposes only and not personalized medical nutrition therapy. 
Consult registered dietitians or healthcare providers for specific dietary needs, medical conditions, 
allergies, or if you take medications that affect nutrition.
`