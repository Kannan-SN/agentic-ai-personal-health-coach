from typing import TypedDict, List, Dict
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

def normalize_workout_data(workout_plan: List[Dict]) -> List[Dict]:
    """
    Normalize LLM-generated workout data to match Node.js Mongoose schema enums
    This prevents validation errors when saving to MongoDB
    """
    # Workout type mappings - map non-standard types to valid ones
    workout_type_map = {
        'core': 'strength',
        'mobility': 'flexibility',
        'strength_cardio': 'hiit',
        'cardio_strength': 'hiit',
        'cardio_core': 'hiit',
        'core_back': 'strength',
        'dynamic_stretch': 'flexibility',
        'static_stretch': 'flexibility'
    }
    
    # Intensity level mappings - normalize variations
    intensity_map = {
        'moderate-high': 'high',
        'very-high': 'very_high',
        'none': 'low',
        'very high': 'very_high'
    }
    
    # Valid types from Node.js enum
    valid_types = [
        'cardio', 'strength', 'flexibility', 'yoga', 'pilates', 'hiit',
        'walking', 'swimming', 'bodyweight', 'balance', 'running', 
        'cycling', 'weightlifting', 'crossfit', 'dance', 'martial_arts', 'sports'
    ]
    
    for day in workout_plan:
        # Normalize intensity_level
        if 'intensity_level' in day and day['intensity_level']:
            original = str(day['intensity_level']).lower()
            day['intensity_level'] = intensity_map.get(original, original)
        
        # Handle rest days - remove intensity or set to None
        if day.get('rest_day', False):
            # Rest days shouldn't have intensity_level in Node.js schema
            if 'intensity_level' in day:
                del day['intensity_level']
        
        # Normalize exercise types
        for exercise in day.get('exercises', []):
            if 'type' in exercise:
                original = str(exercise['type']).lower()
                # First try to map it
                mapped_type = workout_type_map.get(original, original)
                
                # Validate it's now a valid type
                if mapped_type not in valid_types:
                    logger.warning(f"Invalid exercise type '{original}' -> '{mapped_type}', defaulting to 'strength'")
                    exercise['type'] = 'strength'
                else:
                    exercise['type'] = mapped_type
    
    return workout_plan

def generate_safe_workout_plan(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """
    Generate a safe, balanced workout plan based on user profile and health considerations
    """
    profile = state["user_profile"]
    health_conditions = state.get("health_conditions", [])
    
    # Safety validation
    safety_check = HealthSafetyValidator.validate_workout_plan(
        profile.get("time_availability_minutes", 30),
        profile.get("current_activity_level", ActivityLevel.MODERATELY_ACTIVE),
        profile.get("age")
    )
    
    if not safety_check["is_valid"]:
        logger.warning(f"Workout plan safety concerns: {safety_check['warnings']}")
    
    # Build safe prompt with EXPLICIT enum constraints
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

CRITICAL: Use ONLY these EXACT workout types (all lowercase):
- cardio
- strength
- flexibility
- yoga
- pilates
- hiit
- walking
- running
- swimming
- cycling
- bodyweight
- balance
- weightlifting
- crossfit
- dance
- martial_arts
- sports

CRITICAL: Use ONLY these EXACT intensity levels (all lowercase):
- low
- moderate
- high
- very_high

For REST DAYS (IMPORTANT):
- Set "rest_day": true
- Set "total_duration_minutes": 0
- Set "exercises": []
- Set "warm_up": "None"
- Set "cool_down": "None"
- DO NOT include "intensity_level" field for rest days
- Set "estimated_calories_burned": 0

Create a 7-day workout plan with the following MANDATORY safety features:
1. Start with lower intensity if user is sedentary or has health conditions
2. Include at least 1-2 complete rest days
3. Provide exercise modifications for different fitness levels
4. Include detailed safety instructions for each exercise
5. Keep individual workout duration under {min(safety_check['adjusted_minutes'], 60)} minutes
6. Focus on functional, low-risk movements

Return ONLY a valid JSON array (NO markdown, NO code blocks, NO extra text) with this EXACT structure:
[
  {{
    "day": 1,
    "workout_name": "Full Body Strength",
    "total_duration_minutes": 30,
    "warm_up": "5 minutes light cardio and dynamic stretching",
    "exercises": [
      {{
        "name": "Bodyweight Squats",
        "type": "strength",
        "duration_minutes": 5,
        "intensity": "moderate",
        "instructions": "Stand with feet shoulder-width apart...",
        "target_muscles": ["quadriceps", "glutes"],
        "equipment_needed": ["none"],
        "modifications": "Hold onto chair for support",
        "safety_notes": "Stop if you feel knee pain"
      }}
    ],
    "cool_down": "5 minutes gentle stretching",
    "intensity_level": "moderate",
    "estimated_calories_burned": 150,
    "rest_day": false,
    "notes": "Focus on proper form"
  }},
  {{
    "day": 7,
    "workout_name": "Rest Day",
    "total_duration_minutes": 0,
    "warm_up": "None",
    "exercises": [],
    "cool_down": "None",
    "estimated_calories_burned": 0,
    "rest_day": true,
    "notes": "Full recovery day"
  }}
]

IMPORTANT REMINDERS:
- Use ONLY the workout types listed above
- Use ONLY the intensity levels listed above
- Rest days must NOT have intensity_level field
- All JSON must be valid (proper quotes, commas, brackets)
- Return ONLY JSON, no markdown formatting
"""

    try:
        response = health_llm.invoke(prompt)
        workout_plan = json.loads(
            response.content.strip().replace("```json\n", "").replace("```", "").replace("```json", "")
        )
        
        # CRITICAL: Normalize the data before validation
        workout_plan = normalize_workout_data(workout_plan)
        
        # Validate total weekly duration
        total_weekly_minutes = sum(
            day.get("total_duration_minutes", 0) 
            for day in workout_plan 
            if not day.get("rest_day", False)
        )
        
        if total_weekly_minutes > 480:  # 8 hours max per week
            logger.warning("Generated workout plan exceeds recommended weekly duration")
            scale_factor = 480 / total_weekly_minutes
            for day in workout_plan:
                if not day.get("rest_day", False):
                    day["total_duration_minutes"] = int(day["total_duration_minutes"] * scale_factor)
        
        # Ensure adequate rest days
        rest_days = sum(1 for day in workout_plan if day.get("rest_day", False))
        if rest_days < 1:
            logger.warning("Generated plan lacks adequate rest days")
            if len(workout_plan) >= 7:
                workout_plan[6]["rest_day"] = True
                workout_plan[6]["workout_name"] = "Rest Day"
                workout_plan[6]["total_duration_minutes"] = 0
                workout_plan[6]["exercises"] = []
                workout_plan[6]["notes"] = "Complete rest for recovery"
                # Remove intensity_level if present
                if "intensity_level" in workout_plan[6]:
                    del workout_plan[6]["intensity_level"]
        
        state["workout_plan"] = workout_plan
        state["safety_notes"].extend(safety_check.get("warnings", []))
        state["safety_notes"].extend(safety_check.get("recommendations", []))
        
        # Add disclaimers
        state["disclaimers"].append(EXERCISE_DISCLAIMER)
        state["disclaimers"].append(HEALTH_DISCLAIMER)
        
        logger.info(f"Generated safe workout plan with {len(workout_plan)} days")
        
        return state
        
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Error generating workout plan: {e}")
        
        # Ultra-safe fallback plan
        fallback_plan = [
            {
                "day": 1,
                "workout_name": "Gentle Introduction Workout",
                "total_duration_minutes": 20,
                "warm_up": "5 minutes walking in place",
                "exercises": [
                    {
                        "name": "Walking",
                        "type": "walking",
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
                "notes": "Very gentle introduction - consult healthcare provider"
            },
            {
                "day": 2,
                "workout_name": "Rest Day",
                "total_duration_minutes": 0,
                "warm_up": "None",
                "exercises": [],
                "cool_down": "None",
                "estimated_calories_burned": 0,
                "rest_day": True,
                "notes": "Complete rest"
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
    
    # Check total weekly volume
    total_minutes = sum(day.get("total_duration_minutes", 0) for day in workout_plan if not day.get("rest_day", False))
    if total_minutes > 480:
        validation_result["is_safe"] = False
        validation_result["warnings"].append("Weekly exercise volume exceeds safe recommendations")
        validation_result["modifications_needed"].append("Reduce workout durations")
    
    # Check rest days
    rest_days = sum(1 for day in workout_plan if day.get("rest_day", False))
    if rest_days < 1:
        validation_result["is_safe"] = False
        validation_result["warnings"].append("Insufficient rest days for recovery")
        validation_result["modifications_needed"].append("Add at least one complete rest day")
    
    # Check individual workout durations
    for day in workout_plan:
        if not day.get("rest_day", False) and day.get("total_duration_minutes", 0) > 90:
            validation_result["warnings"].append(f"Day {day.get('day')} workout duration may be excessive")
    
    # Check for dangerous keywords
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