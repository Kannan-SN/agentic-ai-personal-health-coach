from enum import Enum

class HealthPlanStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# ALIGNED: These match what Node.js will send after mapping
class ActivityLevel(Enum):
    SEDENTARY = "sedentary" 
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTREMELY_ACTIVE = "extremely_active"

# ALIGNED: These match what Node.js will send after mapping
class Goal(Enum):
    WEIGHT_MAINTENANCE = "weight_maintenance"
    GENTLE_WEIGHT_LOSS = "gentle_weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    IMPROVED_FITNESS = "improved_fitness"
    GENERAL_WELLNESS = "general_wellness"
    STRESS_REDUCTION = "stress_reduction"

class DietaryRestriction(Enum):
    NONE = "none"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    DAIRY_FREE = "dairy_free"
    NUT_FREE = "nut_free"
    LOW_SODIUM = "low_sodium"
    DIABETIC_FRIENDLY = "diabetic_friendly"
    HEART_HEALTHY = "heart_healthy"
    SOY_FREE = "soy_free"
    EGG_FREE = "egg_free"
    SHELLFISH_FREE = "shellfish_free"
    LOW_SUGAR = "low_sugar"
    KETO = "keto"
    LOW_CARB = "low_carb"
    HIGH_PROTEIN = "high_protein"
    MEDITERRANEAN = "mediterranean"
    PALEO = "paleo"
    WHOLE30 = "whole30"

# FIXED: Match Node.js exactly - these are what Mongoose expects
class WorkoutType(Enum):
    CARDIO = "cardio"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    YOGA = "yoga"
    PILATES = "pilates"
    HIIT = "hiit"
    WALKING = "walking"
    SWIMMING = "swimming"
    BODYWEIGHT = "bodyweight"
    BALANCE = "balance"
    RUNNING = "running"
    CYCLING = "cycling"
    WEIGHTLIFTING = "weightlifting"
    CROSSFIT = "crossfit"
    DANCE = "dance"
    MARTIAL_ARTS = "martial_arts"
    SPORTS = "sports"

# FIXED: Match Node.js exactly
class IntensityLevel(Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

class MealType(Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    PRE_WORKOUT = "pre_workout"
    POST_WORKOUT = "post_workout"

class AgentType(Enum):
    WORKOUT_GENERATOR = "workout_generator"
    MEAL_GENERATOR = "meal_generator"
    HEALTH_ANALYZER = "health_analyzer"

# Safety constants aligned with Node.js
MIN_CALORIES_ADULT = 1200
MAX_CALORIES_ADULT = 4000
MIN_WORKOUT_MINUTES = 5
MAX_WORKOUT_MINUTES = 180
RECOMMENDED_WATER_GLASSES = 8

# Age limits aligned with Node.js
MIN_AGE = 13
MAX_AGE = 100

# Height and weight validation aligned with Node.js
HEIGHT_INCHES_MIN = 24
HEIGHT_INCHES_MAX = 120
HEIGHT_CM_MIN = 61
HEIGHT_CM_MAX = 366

WEIGHT_LBS_MIN = 50
WEIGHT_LBS_MAX = 1000
WEIGHT_KG_MIN = 23
WEIGHT_KG_MAX = 454

HEALTH_DISCLAIMER = """
IMPORTANT DISCLAIMER: This AI-generated health and wellness plan is for informational purposes only 
and should not replace professional medical advice. Always consult with a qualified healthcare 
provider, registered dietitian, or certified fitness professional before starting any new diet 
or exercise program, especially if you have pre-existing health conditions, are pregnant, 
or are taking medications. Individual results may vary, and what works for one person may not 
be suitable for another.
"""

EXERCISE_DISCLAIMER = """
Please consult with a healthcare provider before beginning any exercise program. Start slowly 
and gradually increase intensity. Stop exercising if you experience pain, dizziness, 
shortness of breath, or any unusual symptoms.
"""

NUTRITION_DISCLAIMER = """
These meal suggestions are general recommendations and may not be suitable for individuals 
with specific medical conditions, allergies, or dietary needs. Please consult with a 
registered dietitian for personalized nutrition advice.
"""