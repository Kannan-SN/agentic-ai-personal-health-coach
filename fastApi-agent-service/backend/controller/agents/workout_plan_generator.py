from typing import TypedDict, List, Dict
from langchain_core.runnables import Runnable
from backend.utils.llm import health_llm  
from backend.utils.health_safety import HealthSafetyValidator
from backend.constants.enums import (
    ActivityLevel, Goal, WorkoutType, IntensityLevel, 
    EXERCISE_DISCLAIMER, HEALTH_DISCLAIMER
)
import json
import logging

logger = logging.getLogger(__name__)

class WellnessOrchestratorState(TypedDict):
    user_profile: dict
    health_conditions: list
    medical_clearance: bool
    workout_plan: list
    meal_plan: list
    safety_notes: list
    disclaimers: list

def generate_safe_workout_plan(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """
    Generate a safe, balanced workout plan based on user profile and health considerations
    """
    profile = state["user_profile"]
    health_conditions = state.get("health_conditions", [])
    
    
    safety_check = HealthSafetyValidator.validate_workout_plan(
        profile.get("time_availability_minutes", 30),
        profile.get("current_activity_level", ActivityLevel.MODERATELY_ACTIVE),
        profile.get("age")
    )
    
    if not safety_check["is_valid"]:
        logger.warning(f"Workout plan safety concerns: {safety_check['warnings']}")
    
    # Build safe prompt with health considerations
    prompt = f"""
You are a certified fitness professional creating a safe, balanced workout plan. 
Always prioritize safety, gradual progression, and sustainable habits.

CRITICAL SAFETY REQUIREMENTS:
- Never recommend extreme or dangerous exercises
- Always include proper warm-up and cool-down
- Ensure at least 1-2 rest days per week
- Recommend professional consultation for high-risk individuals
- Focus on gradual progression and injury prevention

User Profile:
- Age: {profile.get('age', 'Not specified')}
- Current Activity Level: {profile.get('current_activity_level', 'Not specified')}
- Primary Goal: {profile.get('primary_goal', 'general_wellness')}
- Available Time: {safety_check['adjusted_minutes']} minutes per day
- Preferred Workout Types: {profile.get('preferred_workout_types', [])}
- Available Equipment: {profile.get('available_equipment', ['bodyweight'])}
- Health Conditions: {health_conditions if health_conditions else 'None reported'}

SAFETY WARNINGS FROM VALIDATION:
{'; '.join(safety_check.get('warnings', []))}

RECOMMENDATIONS:
{'; '.join(safety_check.get('recommendations', []))}

Create a 7-day workout plan with the following MANDATORY safety features:
1. Start with lower intensity if user is sedentary or has health conditions
2. Include at least 1-2 complete rest days
3. Provide exercise modifications for different fitness levels
4. Include detailed safety instructions for each exercise
5. Keep individual workout duration under {min(safety_check['adjusted_minutes'], 60)} minutes
6. Focus on functional, low-risk movements

Return ONLY a JSON array with this exact structure:
[
  {{
    "day": 1,
    "workout_name": "Safe Beginner-Friendly Workout",
    "total_duration_minutes": 30,
    "warm_up": "5 minutes light movement and dynamic stretching",
    "exercises": [
      {{
        "name": "Bodyweight Squats",
        "type": "strength",
        "duration_minutes": 5,
        "intensity": "low",
        "instructions": "Stand with feet shoulder-width apart, lower down as if sitting in a chair, keep knees behind toes",
        "target_muscles": ["quadriceps", "glutes"],
        "equipment_needed": ["none"],
        "modifications": "Hold onto a chair for support if needed",
        "safety_notes": "Stop if you feel knee or back pain"
      }}
    ],
    "cool_down": "5 minutes gentle stretching focusing on major muscle groups",
    "intensity_level": "low",
    "estimated_calories_burned": 150,
    "rest_day": false,
    "notes": "Focus on proper form over speed or repetitions"
  }}
]

IMPORTANT: Include appropriate rest days and conservative calorie estimates.
Never recommend exercises that could be dangerous for the general population.
If user has health conditions, make the plan extra conservative and recommend professional consultation.
"""

    try:
        response = health_llm.invoke(prompt)
        workout_plan = json.loads(
            response.content.strip().replace("```json\n", "").replace("```", "")
        )
        
        
        total_weekly_minutes = sum(
            day.get("total_duration_minutes", 0) 
            for day in workout_plan 
            if not day.get("rest_day", False)
        )
        
        if total_weekly_minutes > 480:  
            logger.warning("Generated workout plan exceeds recommended weekly duration")
           
            scale_factor = 480 / total_weekly_minutes
            for day in workout_plan:
                if not day.get("rest_day", False):
                    day["total_duration_minutes"] = int(day["total_duration_minutes"] * scale_factor)
        
        
        rest_days = sum(1 for day in workout_plan if day.get("rest_day", False))
        if rest_days < 1:
            logger.warning("Generated plan lacks adequate rest days")
            
            if len(workout_plan) >= 7:
                workout_plan[6]["rest_day"] = True
                workout_plan[6]["workout_name"] = "Active Recovery Day"
                workout_plan[6]["total_duration_minutes"] = 0
                workout_plan[6]["exercises"] = []
                workout_plan[6]["notes"] = "Light stretching or gentle walk if desired"
        
        state["workout_plan"] = workout_plan
        state["safety_notes"].extend(safety_check.get("warnings", []))
        state["safety_notes"].extend(safety_check.get("recommendations", []))
        
        
        state["disclaimers"].append(EXERCISE_DISCLAIMER)
        state["disclaimers"].append(HEALTH_DISCLAIMER)
        
        logger.info(f"Generated safe workout plan with {len(workout_plan)} days")
        
        return state
        
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Error generating workout plan: {e}")
        
        
        fallback_plan = [
            {
                "day": 1,
                "workout_name": "Gentle Introduction Workout",
                "total_duration_minutes": 20,
                "warm_up": "5 minutes walking in place",
                "exercises": [
                    {
                        "name": "Walking",
                        "type": "cardio",
                        "duration_minutes": 10,
                        "intensity": "low",
                        "instructions": "Walk at a comfortable pace",
                        "target_muscles": ["legs", "cardiovascular"],
                        "equipment_needed": ["none"],
                        "modifications": "Walk indoors if weather is poor",
                        "safety_notes": "Stop if you feel dizzy or short of breath"
                    }
                ],
                "cool_down": "5 minutes gentle stretching",
                "intensity_level": "low",
                "estimated_calories_burned": 80,
                "rest_day": False,
                "notes": "Very gentle introduction to exercise - please consult healthcare provider"
            },
            {
                "day": 2,
                "workout_name": "Rest Day",
                "total_duration_minutes": 0,
                "rest_day": True,
                "notes": "Complete rest or gentle stretching only"
            }
        ]
        
        state["workout_plan"] = fallback_plan
        state["safety_notes"].append("AI generation failed - using ultra-safe fallback plan")
        state["disclaimers"].append("This is a basic fallback plan. Professional consultation strongly recommended.")
        
        return state

def validate_workout_safety_post_generation(workout_plan: List[Dict]) -> Dict[str, any]:
    """
    Post-generation validation to ensure workout plan meets all safety criteria
    """
    validation_result = {
        "is_safe": True,
        "warnings": [],
        "modifications_needed": []
    }
    
    
    total_minutes = sum(day.get("total_duration_minutes", 0) for day in workout_plan if not day.get("rest_day", False))
    if total_minutes > 480:
        validation_result["is_safe"] = False
        validation_result["warnings"].append("Weekly exercise volume exceeds safe recommendations")
        validation_result["modifications_needed"].append("Reduce workout durations")
    
   
    rest_days = sum(1 for day in workout_plan if day.get("rest_day", False))
    if rest_days < 1:
        validation_result["is_safe"] = False
        validation_result["warnings"].append("Insufficient rest days for recovery")
        validation_result["modifications_needed"].append("Add at least one complete rest day")
    
    
    for day in workout_plan:
        if not day.get("rest_day", False) and day.get("total_duration_minutes", 0) > 90:
            validation_result["warnings"].append(f"Day {day.get('day')} workout duration may be excessive")
    
    
    dangerous_keywords = [
        "maximum", "extreme", "until failure", "heavy weight", "plyometric jumps",
        "advanced", "competitive", "maximum heart rate"
    ]
    
    for day in workout_plan:
        for exercise in day.get("exercises", []):
            exercise_text = (exercise.get("instructions", "") + " " + exercise.get("name", "")).lower()
            for keyword in dangerous_keywords:
                if keyword in exercise_text:
                    validation_result["warnings"].append(f"Potentially risky exercise detected: {exercise.get('name')}")
    
    return validation_result