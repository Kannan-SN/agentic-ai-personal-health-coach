
from typing import Dict, List, Any, Optional
from backend.constants.enums import (
    ActivityLevel, Goal, MIN_CALORIES_ADULT, MAX_CALORIES_ADULT,
    MIN_WORKOUT_MINUTES, MAX_WORKOUT_MINUTES
)
import logging

logger = logging.getLogger(__name__)

class HealthSafetyValidator:
    """Validates health recommendations for safety"""
    
    @staticmethod
    def validate_calorie_target(calories: int, age: Optional[int] = None, goal: Goal = Goal.GENERAL_WELLNESS) -> Dict[str, Any]:
        """
        Validates calorie targets are within safe ranges
        Returns validation result and adjusted calories if needed
        """
        result = {
            "is_valid": True,
            "adjusted_calories": calories,
            "warnings": [],
            "recommendations": []
        }
        
        
        if calories < MIN_CALORIES_ADULT:
            result["is_valid"] = False
            result["adjusted_calories"] = MIN_CALORIES_ADULT
            result["warnings"].append(f"Calorie target too low. Adjusted to safe minimum: {MIN_CALORIES_ADULT}")
            
    
        if calories > MAX_CALORIES_ADULT:
            result["is_valid"] = False
            result["adjusted_calories"] = MAX_CALORIES_ADULT  
            result["warnings"].append(f"Calorie target too high. Adjusted to conservative maximum: {MAX_CALORIES_ADULT}")
            
     
        if goal == Goal.GENTLE_WEIGHT_LOSS and calories < 1500:
            result["warnings"].append("Very low calorie diets should only be undertaken with medical supervision")
            result["recommendations"].append("Consider consulting with a registered dietitian for personalized guidance")
            
        return result
    
    @staticmethod
    def validate_workout_plan(workout_minutes_per_day: int, activity_level: ActivityLevel, age: Optional[int] = None) -> Dict[str, Any]:
        """
        Validates workout duration and intensity for safety
        """
        result = {
            "is_valid": True,
            "adjusted_minutes": workout_minutes_per_day,
            "warnings": [],
            "recommendations": []
        }
        
     
        if workout_minutes_per_day < MIN_WORKOUT_MINUTES:
            result["adjusted_minutes"] = MIN_WORKOUT_MINUTES
            result["recommendations"].append("Even short workouts can be beneficial - aim for at least 10 minutes")
            
        if workout_minutes_per_day > MAX_WORKOUT_MINUTES:
            result["is_valid"] = False
            result["adjusted_minutes"] = MAX_WORKOUT_MINUTES
            result["warnings"].append("Workout duration exceeds recommended limits for general population")
            
        
        if activity_level == ActivityLevel.SEDENTARY and workout_minutes_per_day > 45:
            result["warnings"].append("Gradual increase in activity is recommended for sedentary individuals")
            result["recommendations"].append("Start with shorter workouts and build up gradually")
            
       
        if age and age > 65 and workout_minutes_per_day > 60:
            result["recommendations"].append("Adults over 65 should consult healthcare providers for exercise guidance")
            
        if age and age < 18:
            result["recommendations"].append("Youth fitness programs should be age-appropriate and supervised")
            
        return result
    
    @staticmethod
    def validate_dietary_restrictions(restrictions: List[str], goal: Goal) -> Dict[str, Any]:
        """
        Ensures dietary restrictions are compatible with health goals
        """
        result = {
            "is_valid": True,
            "warnings": [],
            "recommendations": []
        }
        
        
        if len(restrictions) > 3:
            result["warnings"].append("Multiple dietary restrictions may require professional nutrition guidance")
            result["recommendations"].append("Consider consulting with a registered dietitian")
            
        
        if "vegan" in restrictions and goal == Goal.MUSCLE_GAIN:
            result["recommendations"].append("Vegan muscle gain requires careful protein planning - consider plant-based protein sources")
            
        if "diabetic_friendly" in restrictions:
            result["recommendations"].append("Diabetic meal plans should be reviewed with healthcare provider")
            result["warnings"].append("Monitor blood sugar levels when following new meal plans")
            
        return result
    
    @staticmethod
    def get_safe_recommendation_disclaimer() -> str:
        """Returns standard disclaimer for all health recommendations"""
        return """
IMPORTANT: This is a general wellness suggestion and not medical advice. 
Please consult with qualified healthcare professionals before making significant 
changes to your diet or exercise routine, especially if you have health conditions, 
take medications, or are pregnant. Individual needs vary significantly, and 
personalized professional guidance is recommended for optimal health outcomes.
"""
    
    @staticmethod
    def validate_user_profile_safety(profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates user profile data for safety red flags
        """
        result = {
            "is_safe": True,
            "concerns": [],
            "recommendations": []
        }
        
        age = profile_data.get("age")
        goal = profile_data.get("primary_goal")
        health_conditions = profile_data.get("health_conditions", [])
        
        
        if age and (age < 16 or age > 75):
            result["concerns"].append("Age requires special consideration for health planning")
            result["recommendations"].append("Professional supervision recommended")
            
       
        high_risk_conditions = [
            "heart disease", "diabetes", "high blood pressure", "eating disorder",
            "pregnancy", "recent surgery", "joint problems", "back injury"
        ]
        
        for condition in health_conditions:
            if any(risk in condition.lower() for risk in high_risk_conditions):
                result["concerns"].append(f"Health condition '{condition}' requires professional guidance")
                result["recommendations"].append("Medical clearance strongly recommended before starting program")
                
       
        if goal == Goal.GENTLE_WEIGHT_LOSS:
            result["recommendations"].append("Sustainable weight loss is typically 0.5-2 pounds per week")
            
        return result

def log_health_recommendation(user_id: str, recommendation_type: str, safety_check: Dict[str, Any]):
    """Log health recommendations for safety tracking"""
    logger.info(f"Health recommendation generated for user {user_id}")
    logger.info(f"Type: {recommendation_type}")
    logger.info(f"Safety validation: {safety_check}")
    
    if not safety_check.get("is_valid", True) or safety_check.get("warnings"):
        logger.warning(f"Safety concerns for user {user_id}: {safety_check}")