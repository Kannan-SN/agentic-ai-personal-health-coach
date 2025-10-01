from enum import Enum

class HealthPlanStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# ALIGNED: These match what Node.js will send after mapping
class ActivityLevel(Enum):
    SEDENTARY = "sedentary" 
    LIGHTLY_ACTIVE = "lightly_active"          # Maps from Node.js "light"
    MODERATELY_ACTIVE = "moderately_active"    # Maps from Node.js "moderate"  
    VERY_ACTIVE = "very_active"                # Maps from Node.js "active"
    EXTREMELY_ACTIVE = "extremely_active"      # Maps from Node.js "very_active"

# ALIGNED: These match what Node.js will send after mapping
class Goal(Enum):
    WEIGHT_MAINTENANCE = "weight_maintenance"
    GENTLE_WEIGHT_LOSS = "gentle_weight_loss"  # Maps from Node.js "weight_loss"
    MUSCLE_GAIN = "muscle_gain"                # Maps from Node.js "weight_gain", "muscle_gain", "strength"
    IMPROVED_FITNESS = "improved_fitness"      # Maps from Node.js "general_fitness", "endurance"
    GENERAL_WELLNESS = "general_wellness"      # Maps from Node.js "flexibility", "injury_recovery", "chronic_condition_management"
    STRESS_REDUCTION = "stress_reduction"      # Maps from Node.js "stress_reduction"

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
    # Add more from your Node.js enums if needed
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
    # Add more from your Node.js enums
    BALANCE = "balance"
    RUNNING = "running"
    CYCLING = "cycling"
    WEIGHTLIFTING = "weightlifting"
    CROSSFIT = "crossfit"
    DANCE = "dance"
    MARTIAL_ARTS = "martial_arts"
    SPORTS = "sports"

class IntensityLevel(Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"  # Added to match Node.js

class MealType(Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    PRE_WORKOUT = "pre_workout"      # Added to match Node.js
    POST_WORKOUT = "post_workout"    # Added to match Node.js

class AgentType(Enum):
    WORKOUT_GENERATOR = "workout_generator"
    MEAL_GENERATOR = "meal_generator"
    HEALTH_ANALYZER = "health_analyzer"

# Safety constants aligned with Node.js
MIN_CALORIES_ADULT = 1200  
MAX_CALORIES_ADULT = 4000   # Increased to match Node.js MAX_CALORIES: 4000
MIN_WORKOUT_MINUTES = 5     # Decreased to match Node.js MIN_WORKOUT_MINUTES: 5
MAX_WORKOUT_MINUTES = 180   # Increased to match Node.js MAX_WORKOUT_MINUTES: 180
RECOMMENDED_WATER_GLASSES = 8  

# Age limits aligned with Node.js
MIN_AGE = 13               # Match Node.js SAFETY_LIMITS.MIN_AGE
MAX_AGE = 100              # Match Node.js SAFETY_LIMITS.MAX_AGE

# Height and weight validation aligned with Node.js
HEIGHT_INCHES_MIN = 24     # Match Node.js SAFETY_LIMITS.HEIGHT_INCHES_MIN
HEIGHT_INCHES_MAX = 120    # Match Node.js SAFETY_LIMITS.HEIGHT_INCHES_MAX
HEIGHT_CM_MIN = 61         # Match Node.js SAFETY_LIMITS.HEIGHT_CM_MIN
HEIGHT_CM_MAX = 366        # Match Node.js SAFETY_LIMITS.HEIGHT_CM_MAX

WEIGHT_LBS_MIN = 50        # Match Node.js SAFETY_LIMITS.WEIGHT_LBS_MIN
WEIGHT_LBS_MAX = 1000      # Match Node.js SAFETY_LIMITS.WEIGHT_LBS_MAX
WEIGHT_KG_MIN = 23         # Match Node.js SAFETY_LIMITS.WEIGHT_KG_MIN
WEIGHT_KG_MAX = 454        # Match Node.js SAFETY_LIMITS.WEIGHT_KG_MAX

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