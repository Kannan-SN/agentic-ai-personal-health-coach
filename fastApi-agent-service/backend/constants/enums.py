from enum import Enum

class HealthPlanStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ActivityLevel(Enum):
    SEDENTARY = "sedentary" 
    LIGHTLY_ACTIVE = "lightly_active" 
    MODERATELY_ACTIVE = "moderately_active"  
    VERY_ACTIVE = "very_active" 
    EXTREMELY_ACTIVE = "extremely_active"  

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

class IntensityLevel(Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

class MealType(Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"

class AgentType(Enum):
    WORKOUT_GENERATOR = "workout_generator"
    MEAL_GENERATOR = "meal_generator"
    HEALTH_ANALYZER = "health_analyzer"

MIN_CALORIES_ADULT = 1200  
MAX_CALORIES_ADULT = 3000 
MIN_WORKOUT_MINUTES = 10
MAX_WORKOUT_MINUTES = 120  
RECOMMENDED_WATER_GLASSES = 8  


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