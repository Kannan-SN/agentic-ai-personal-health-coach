// /constants/enums.js - Complete Frontend Enums (Aligned with Backend)

// Physical Activity Levels - EXACTLY MATCHES BACKEND
export const ACTIVITY_LEVELS = {
  SEDENTARY: 'sedentary',
  LIGHT: 'light',
  MODERATE: 'moderate', 
  ACTIVE: 'active',
  VERY_ACTIVE: 'very_active'
}

// Health and Fitness Goals - EXACTLY MATCHES BACKEND  
export const HEALTH_GOALS = {
  WEIGHT_LOSS: 'weight_loss',
  WEIGHT_GAIN: 'weight_gain',
  MUSCLE_GAIN: 'muscle_gain',
  GENERAL_FITNESS: 'general_fitness',
  ENDURANCE: 'endurance',
  STRENGTH: 'strength',
  FLEXIBILITY: 'flexibility',
  STRESS_REDUCTION: 'stress_reduction',
  INJURY_RECOVERY: 'injury_recovery',
  CHRONIC_CONDITION_MANAGEMENT: 'chronic_condition_management'
}

// Risk Assessment Levels
export const RISK_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
}

// Health Status Tracking
export const HEALTH_STATUS = {
  PROFILE_INCOMPLETE: 'profile_incomplete',
  MEDICAL_CLEARANCE_PENDING: 'medical_clearance_pending',
  CLEARED_FOR_ACTIVITY: 'cleared_for_activity',
  REQUIRES_SUPERVISION: 'requires_supervision',
  HIGH_RISK: 'high_risk'
}

// Wellness Plan States
export const PLAN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REQUIRES_REVIEW: 'requires_review'
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

// Professional Consultation Types
export const CONSULTATION_TYPES = {
  PRIMARY_CARE: 'primary_care',
  CARDIOLOGIST: 'cardiologist',
  ENDOCRINOLOGIST: 'endocrinologist',
  ORTHOPEDIC: 'orthopedic',
  PHYSICAL_THERAPIST: 'physical_therapist',
  REGISTERED_DIETITIAN: 'registered_dietitian',
  MENTAL_HEALTH: 'mental_health',
  FITNESS_PROFESSIONAL: 'fitness_professional'
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
  EARLY_MORNING: 'early_morning',
  MORNING: 'morning',
  MIDDAY: 'midday',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night'
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

// Safety Limits and Constraints - ALIGNED WITH BACKEND
export const SAFETY_LIMITS = {
  MIN_AGE: 13,
  MAX_AGE: 100,
  MIN_CALORIES: 1200,
  MAX_CALORIES: 4000,
  MIN_WORKOUT_MINUTES: 5,
  MAX_WORKOUT_MINUTES: 180,
  MAX_WEEKLY_WORKOUT_HOURS: 12,
  
  // Height validation limits (FIXED)
  HEIGHT_INCHES_MIN: 24,
  HEIGHT_INCHES_MAX: 120,
  HEIGHT_CM_MIN: 61,
  HEIGHT_CM_MAX: 366,
  
  // Weight limits
  WEIGHT_LBS_MIN: 50,
  WEIGHT_LBS_MAX: 1000,
  WEIGHT_KG_MIN: 23,
  WEIGHT_KG_MAX: 454,
  
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
  MEAL_PREP_TIME_MAX: 180,
  SLEEP_HOURS_MAX: 16,
  WATER_GLASSES_MAX: 20
}

// Emergency Contact Keywords for Detection
export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  'can\'t breathe',
  'severe shortness of breath',
  'dizzy',
  'faint',
  'fainting',
  'severe pain',
  'emergency',
  'hospital',
  'ambulance',
  'bleeding heavily',
  'unconscious',
  'choking',
  'severe allergic reaction',
  'anaphylaxis',
  'stroke symptoms',
  'seizure',
  'overdose',
  'poisoning'
]

// Health Disclaimers
export const HEALTH_DISCLAIMERS = {
  GENERAL: 'This service provides general wellness information only and cannot replace professional medical advice.',
  EXERCISE: 'Exercise recommendations are general guidance only. Consult healthcare providers before starting any exercise program.',
  NUTRITION: 'Nutrition information is for educational purposes only and not personalized medical nutrition therapy.',
  AI_LIMITATIONS: 'AI-generated health recommendations are based on general wellness principles and cannot account for individual medical complexities.',
  EMERGENCY: 'If you experience chest pain, severe shortness of breath, dizziness, fainting, or other emergency symptoms, seek immediate medical attention.'
}

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

// Professional Resources
export const PROFESSIONAL_RESOURCES = {
  FIND_DOCTOR: 'https://www.ama-assn.org/go/freida',
  FIND_DIETITIAN: 'https://www.eatright.org/find-a-nutrition-expert',
  FIND_FITNESS_PROFESSIONAL: 'https://www.acsm.org/get-stay-certified/find-a-certified-professional',
  MENTAL_HEALTH_RESOURCES: 'https://www.samhsa.gov/find-help/national-helpline',
  CRISIS_SUPPORT: 'https://suicidepreventionlifeline.org'
}

// App Routes
export const APP_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  WELLNESS_PLAN: '/wellness-plan',
  PROGRESS: '/progress',
  HEALTH_PROFILE: '/health-profile',
  CHAT: '/chat',
  HEALTH_DISCLAIMER: '/health-disclaimer',
  EMERGENCY_CONTACTS: '/emergency-contacts',
  SETTINGS: '/settings',
  PROFILE: '/profile'
}

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  HEALTH_DISCLAIMER_ACCEPTED: 'healthDisclaimerAccepted',
  THEME_PREFERENCE: 'themePreference'
}

// Form Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s\-']{2,50}$/,
  MEDICATION_NAME: /^[a-zA-Z0-9\s\-\.]{2,100}$/,
  EMERGENCY_CONTACT_RELATIONSHIP: /^[a-zA-Z\s\-']{2,30}$/
}

// Form Field Limits
export const FIELD_LIMITS = {
  NAME_MAX: 50,
  NAME_MIN: 2,
  EMAIL_MAX: 254,
  PHONE_MAX: 20,
  ADDRESS_MAX: 200,
  NOTES_MAX: 1000,
  DESCRIPTION_MAX: 500,
  SYMPTOM_MAX: 100,
  CONCERN_MAX: 500,
  PLAN_NAME_MAX: 100,
  MEDICATION_NAME_MAX: 100,
  HEALTH_CONDITION_MAX: 100,
  ALLERGY_MAX: 50,
  INJURY_MAX: 100
}

// UI Constants
export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 500,
  AUTO_SAVE_INTERVAL: 30000 // 30 seconds
}

// Chart and Progress Colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B', 
  DANGER: '#EF4444',
  INFO: '#6366F1',
  SECONDARY: '#6B7280',
  PROGRESS_GRADIENT: ['#3B82F6', '#10B981'],
  RISK_COLORS: {
    LOW: '#10B981',
    MODERATE: '#F59E0B',
    HIGH: '#F97316',
    VERY_HIGH: '#EF4444'
  }
}

// Export helper functions for validation
export const isValidActivityLevel = (level) => Object.values(ACTIVITY_LEVELS).includes(level)
export const isValidHealthGoal = (goal) => Object.values(HEALTH_GOALS).includes(goal)
export const isValidRiskLevel = (risk) => Object.values(RISK_LEVELS).includes(risk)
export const isValidPlanStatus = (status) => Object.values(PLAN_STATUS).includes(status)

// Helper function to get display labels
export const getDisplayLabel = (enumObject, value) => {
  const key = Object.keys(enumObject).find(k => enumObject[k] === value)
  return key ? key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : value
}

// Helper function for height validation
export const validateHeight = (value, unit) => {
  if (unit === 'inches') {
    return value >= SAFETY_LIMITS.HEIGHT_INCHES_MIN && value <= SAFETY_LIMITS.HEIGHT_INCHES_MAX
  } else if (unit === 'cm') {
    return value >= SAFETY_LIMITS.HEIGHT_CM_MIN && value <= SAFETY_LIMITS.HEIGHT_CM_MAX
  }
  return false
}

// Helper function for weight validation
export const validateWeight = (value, unit) => {
  if (unit === 'lbs') {
    return value >= SAFETY_LIMITS.WEIGHT_LBS_MIN && value <= SAFETY_LIMITS.WEIGHT_LBS_MAX
  } else if (unit === 'kg') {
    return value >= SAFETY_LIMITS.WEIGHT_KG_MIN && value <= SAFETY_LIMITS.WEIGHT_KG_MAX
  }
  return false
}