// /constants/enum.js - Complete Backend Enums (Fixed)

// User Management States
export const USER_STATES = { 
    NEW: 'new', 
    PENDING: 'pending', 
    ACTIVE: 'active', 
    INACTIVE: 'inactive', 
    BLOCKED: 'blocked', 
    DELETED: 'deleted' 
}

// Health Status Tracking
export const HEALTH_STATUS = {
    PROFILE_INCOMPLETE: 'profile_incomplete',
    MEDICAL_CLEARANCE_PENDING: 'medical_clearance_pending',
    CLEARED_FOR_ACTIVITY: 'cleared_for_activity',
    REQUIRES_SUPERVISION: 'requires_supervision',
    HIGH_RISK: 'high_risk'
}

// Security Operations
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

export const SECURITY_MODES = { 
    EMAIL: 'email', 
    SMS: 'sms' 
}

// Physical Activity Levels - ALIGNED WITH FRONTEND
export const ACTIVITY_LEVELS = {
    SEDENTARY: 'sedentary',
    LIGHT: 'light',                    // Fixed: was 'lightly_active'
    MODERATE: 'moderate',              // Fixed: was 'moderately_active'  
    ACTIVE: 'active',                  // Fixed: was 'very_active'
    VERY_ACTIVE: 'very_active'         // Fixed: was 'extremely_active'
}

// Health and Fitness Goals - ALIGNED WITH FRONTEND
export const HEALTH_GOALS = {
    WEIGHT_LOSS: 'weight_loss',
    WEIGHT_GAIN: 'weight_gain',
    MUSCLE_GAIN: 'muscle_gain',
    GENERAL_FITNESS: 'general_fitness',     // Fixed: was 'general_wellness'
    ENDURANCE: 'endurance',
    STRENGTH: 'strength',
    FLEXIBILITY: 'flexibility',
    STRESS_REDUCTION: 'stress_reduction',
    INJURY_RECOVERY: 'injury_recovery',
    CHRONIC_CONDITION_MANAGEMENT: 'chronic_condition_management'
}

// Dietary Restrictions and Preferences
export const DIETARY_RESTRICTIONS = {
    NONE: 'none',
    VEGETARIAN: 'vegetarian',
    VEGAN: 'vegan',
    GLUTEN_FREE: 'gluten_free',
    DAIRY_FREE: 'dairy_free',
    NUT_FREE: 'nut_free',
    SOY_FREE: 'soy_free',
    EGG_FREE: 'egg_free',
    SHELLFISH_FREE: 'shellfish_free',
    LOW_SODIUM: 'low_sodium',
    LOW_SUGAR: 'low_sugar',
    DIABETIC_FRIENDLY: 'diabetic_friendly',
    HEART_HEALTHY: 'heart_healthy',
    KETO: 'keto',
    LOW_CARB: 'low_carb',
    HIGH_PROTEIN: 'high_protein',
    MEDITERRANEAN: 'mediterranean',
    PALEO: 'paleo',
    WHOLE30: 'whole30'
}

// Exercise and Workout Types
export const WORKOUT_TYPES = {
    CARDIO: 'cardio',
    STRENGTH: 'strength',
    FLEXIBILITY: 'flexibility',
    BALANCE: 'balance',
    HIIT: 'hiit',
    YOGA: 'yoga',
    PILATES: 'pilates',
    WALKING: 'walking',
    RUNNING: 'running',
    SWIMMING: 'swimming',
    CYCLING: 'cycling',
    BODYWEIGHT: 'bodyweight',
    WEIGHTLIFTING: 'weightlifting',
    CROSSFIT: 'crossfit',
    DANCE: 'dance',
    MARTIAL_ARTS: 'martial_arts',
    SPORTS: 'sports'
}

// Exercise Intensity Levels
export const INTENSITY_LEVELS = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
    VERY_HIGH: 'very_high'
}

// Wellness Plan States
export const WELLNESS_PLAN_STATES = { 
    DRAFT: 'draft',
    ACTIVE: 'active', 
    PAUSED: 'paused',
    COMPLETED: 'completed', 
    CANCELLED: 'cancelled',
    REQUIRES_REVIEW: 'requires_review'
}

// Risk Assessment Levels
export const RISK_LEVELS = {
    LOW: 'low',
    MODERATE: 'moderate', 
    HIGH: 'high',
    VERY_HIGH: 'very_high'
}

// Professional Consultation Types
export const CONSULTATION_TYPES = {
    PRIMARY_CARE: 'primary_care',                    // Fixed: was 'primary_care_physician'
    CARDIOLOGIST: 'cardiologist',
    ENDOCRINOLOGIST: 'endocrinologist',
    ORTHOPEDIC: 'orthopedic',                        // Fixed: was 'orthopedic_specialist'
    PHYSICAL_THERAPIST: 'physical_therapist',
    REGISTERED_DIETITIAN: 'registered_dietitian',
    MENTAL_HEALTH: 'mental_health',                  // Fixed: was 'mental_health_professional'
    FITNESS_PROFESSIONAL: 'fitness_professional'     // Fixed: was 'certified_fitness_professional'
}

// Emergency Alert Types
export const EMERGENCY_ALERT_TYPES = {
    CHEST_PAIN: 'chest_pain',
    BREATHING_DIFFICULTY: 'breathing_difficulty',
    SEVERE_DIZZINESS: 'severe_dizziness',
    FAINTING: 'fainting',
    SEVERE_PAIN: 'severe_pain',
    SEVERE_NAUSEA: 'severe_nausea',
    INJURY: 'injury',
    MENTAL_HEALTH_CRISIS: 'mental_health_crisis',
    MEDICATION_REACTION: 'medication_reaction',
    ALLERGIC_REACTION: 'allergic_reaction',
    GENERAL_HEALTH_CONCERN: 'general_health_concern'
}

// Health File and Document Types
export const HEALTH_FILE_TYPES = { 
    MEDICAL_REPORT: 'medical_report',
    PROGRESS_PHOTO: 'progress_photo',
    HEALTH_DOCUMENT: 'health_document',
    EXERCISE_VIDEO: 'exercise_video',
    MEAL_PHOTO: 'meal_photo',
    LAB_RESULTS: 'lab_results',
    PRESCRIPTION: 'prescription'
}

// Email Communication Categories
export const EMAIL_CATEGORIES = { 
    VERIFICATION_MAIL: 'verification_mail',
    HEALTH_PLAN_CREATED: 'health_plan_created',
    PROGRESS_MILESTONE: 'progress_milestone',
    SAFETY_CONCERN: 'safety_concern',
    PROFESSIONAL_CONSULTATION: 'professional_consultation',
    EMERGENCY_ALERT: 'emergency_alert',
    PLAN_REMINDER: 'plan_reminder',
    WELLNESS_UPDATE: 'wellness_update',
    APPOINTMENT_REMINDER: 'appointment_reminder'
}

export const EMAIL_TEMPLATE_STATUS = { 
    ACTIVE: 'active', 
    INACTIVE: 'inactive' 
}

// Health Data Security Categories
export const HEALTH_DATA_CATEGORIES = {
    BASIC_PROFILE: 'basic_profile',
    MEDICAL_HISTORY: 'medical_history',
    FITNESS_DATA: 'fitness_data',
    NUTRITION_DATA: 'nutrition_data',
    PROGRESS_DATA: 'progress_data',
    EMERGENCY_CONTACTS: 'emergency_contacts',
    PROFESSIONAL_CONSULTATIONS: 'professional_consultations',
    BIOMETRIC_DATA: 'biometric_data',
    WELLNESS_PLANS: 'wellness_plans'
}

// Safety Limits and Constraints - FIXED HEIGHT LIMITS
export const SAFETY_LIMITS = {
    MIN_AGE: 13,
    MAX_AGE: 100,
    MIN_CALORIES: 1200,
    MAX_CALORIES: 4000,                    // Increased for very active users
    MIN_WORKOUT_MINUTES: 0,                // Reduced minimum
    MAX_WORKOUT_MINUTES: 180,              // Increased maximum
    MAX_WEEKLY_WORKOUT_HOURS: 12,          // Increased for advanced users
    
    // FIXED HEIGHT VALIDATION LIMITS
    HEIGHT_INCHES_MIN: 24,                 // 2 feet minimum
    HEIGHT_INCHES_MAX: 120,                // 10 feet maximum
    HEIGHT_CM_MIN: 61,                     // ~2 feet in cm
    HEIGHT_CM_MAX: 366,                    // ~12 feet in cm (generous upper bound)
    
    // Weight limits
    WEIGHT_LBS_MIN: 50,                    // ~23 kg
    WEIGHT_LBS_MAX: 1000,                  // ~454 kg
    WEIGHT_KG_MIN: 23,                     // ~50 lbs
    WEIGHT_KG_MAX: 454,                    // ~1000 lbs
    
    // BMI safety ranges
    BMI_UNDERWEIGHT: 18.5,
    BMI_NORMAL_MAX: 24.9,
    BMI_OVERWEIGHT_MAX: 29.9,
    BMI_OBESE: 30,
    
    // Progress tracking limits
    MAX_SYMPTOMS_REPORTED: 10,
    MAX_MEDICATIONS: 25,
    MAX_HEALTH_CONDITIONS: 20,
    MAX_ALLERGIES: 15,
    MAX_INJURIES: 10,
    MAX_EMERGENCY_CONTACTS: 5,
    
    // Time constraints
    MEAL_PREP_TIME_MAX: 180,               // 3 hours max
    SLEEP_HOURS_MAX: 16,
    WATER_GLASSES_MAX: 20
}

// Measurement Units
export const MEASUREMENT_UNITS = {
    HEIGHT: {
        INCHES: 'inches',
        CM: 'cm',
        FEET_INCHES: 'feet_inches'
    },
    WEIGHT: {
        LBS: 'lbs', 
        KG: 'kg',
        STONE: 'stone'
    },
    DISTANCE: {
        MILES: 'miles',
        KM: 'km',
        METERS: 'meters',
        FEET: 'feet'
    },
    TEMPERATURE: {
        FAHRENHEIT: 'fahrenheit',
        CELSIUS: 'celsius'
    }
}

// Progress Tracking Severity Levels
export const SEVERITY_LEVELS = {
    MILD: 'mild',
    MODERATE: 'moderate', 
    SEVERE: 'severe',
    CRITICAL: 'critical'
}

// Meal Types and Timing
export const MEAL_TYPES = {
    BREAKFAST: 'breakfast',
    LUNCH: 'lunch', 
    DINNER: 'dinner',
    SNACK: 'snack',
    PRE_WORKOUT: 'pre_workout',
    POST_WORKOUT: 'post_workout'
}

// Equipment Availability
export const AVAILABLE_EQUIPMENT = {
    BODYWEIGHT: 'bodyweight',
    DUMBBELLS: 'dumbbells',
    BARBELLS: 'barbells',
    RESISTANCE_BANDS: 'resistance_bands',
    KETTLEBELLS: 'kettlebells',
    MEDICINE_BALL: 'medicine_ball',
    YOGA_MAT: 'yoga_mat',
    PULL_UP_BAR: 'pull_up_bar',
    BENCH: 'bench',
    CARDIO_MACHINE: 'cardio_machine',
    FULL_GYM: 'full_gym',
    HOME_GYM: 'home_gym'
}

// Fitness Experience Levels
export const FITNESS_EXPERIENCE = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate', 
    ADVANCED: 'advanced',
    EXPERT: 'expert'
}

// Gender Options
export const GENDER_OPTIONS = {
    MALE: 'male',
    FEMALE: 'female',
    NON_BINARY: 'non_binary',
    OTHER: 'other',
    PREFER_NOT_TO_SAY: 'prefer_not_to_say'
}

// Time Preferences for Workouts
export const TIME_PREFERENCES = {
    EARLY_MORNING: 'early_morning',    // 5-7 AM
    MORNING: 'morning',                // 7-10 AM
    MIDDAY: 'midday',                 // 10 AM-2 PM
    AFTERNOON: 'afternoon',           // 2-6 PM
    EVENING: 'evening',               // 6-9 PM
    NIGHT: 'night'                    // 9-11 PM
}

// Days of the Week
export const DAYS_OF_WEEK = {
    MONDAY: 'monday',
    TUESDAY: 'tuesday', 
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday',
    SATURDAY: 'saturday',
    SUNDAY: 'sunday'
}

// Standard Health Disclaimers
export const HEALTH_DISCLAIMER = `This service provides general wellness information only and cannot replace professional medical advice. Always consult with qualified healthcare professionals for medical concerns, diagnosis, or treatment. Individual health needs vary significantly, and AI recommendations have important limitations.`

export const EXERCISE_DISCLAIMER = `Exercise recommendations are general guidance only. Consult healthcare providers before starting any exercise program, especially if you have health conditions, injuries, or take medications. Stop immediately if you experience pain, dizziness, or concerning symptoms.`

export const NUTRITION_DISCLAIMER = `Nutrition information is for educational purposes only and not personalized medical nutrition therapy. Consult registered dietitians or healthcare providers for specific dietary needs, medical conditions, allergies, or if you take medications that affect nutrition.`

export const AI_DISCLAIMER = `AI-generated recommendations are based on general wellness principles and cannot account for individual medical complexities. Professional consultation is recommended for personalized health guidance.`

// Emergency Contact Information
export const EMERGENCY_CONTACTS = {
    US_EMERGENCY: '911',
    US_POISON_CONTROL: '1-800-222-1222', 
    US_CRISIS_TEXT: '741741',
    US_SUICIDE_PREVENTION: '988',
    CANADA_EMERGENCY: '911',
    UK_EMERGENCY: '999',
    EU_EMERGENCY: '112'
}