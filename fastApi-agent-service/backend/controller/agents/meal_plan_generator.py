from typing import TypedDict, List, Dict
from backend.utils.llm import health_llm  
from backend.utils.health_safety import HealthSafetyValidator
from backend.constants.enums import (
    Goal, DietaryRestriction, MealType, ActivityLevel,
    MIN_CALORIES_ADULT, MAX_CALORIES_ADULT, NUTRITION_DISCLAIMER, HEALTH_DISCLAIMER
)
import json
import logging

logger = logging.getLogger(__name__)

class WellnessOrchestratorState(TypedDict):
    user_profile: dict
    health_conditions: list
    dietary_restrictions: list
    meal_plan: list
    workout_plan: list
    safety_notes: list
    disclaimers: list

def calculate_safe_calorie_target(profile: dict) -> int:
    """
    Calculate a safe, conservative calorie target based on user profile
    Always err on the side of caution and recommend professional consultation
    """
    age = profile.get("age", 30)
    activity_level = profile.get("current_activity_level", ActivityLevel.MODERATELY_ACTIVE)
    goal = profile.get("primary_goal", Goal.GENERAL_WELLNESS)
    
    
    base_calories = 1800  
    
    
    activity_multipliers = {
        ActivityLevel.SEDENTARY: 1.1,
        ActivityLevel.LIGHTLY_ACTIVE: 1.2,
        ActivityLevel.MODERATELY_ACTIVE: 1.3,
        ActivityLevel.VERY_ACTIVE: 1.4,
        ActivityLevel.EXTREMELY_ACTIVE: 1.5
    }
    
    estimated_calories = base_calories * activity_multipliers.get(activity_level, 1.2)
    
    
    if goal == Goal.GENTLE_WEIGHT_LOSS:
        estimated_calories = max(estimated_calories - 300, MIN_CALORIES_ADULT)  
    elif goal == Goal.MUSCLE_GAIN:
        estimated_calories = min(estimated_calories + 200, MAX_CALORIES_ADULT)  
    
   
    estimated_calories = max(MIN_CALORIES_ADULT, min(estimated_calories, MAX_CALORIES_ADULT))
    
    return int(estimated_calories)

def generate_safe_meal_plan(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """
    Generate a safe, balanced meal plan with proper nutritional considerations
    """
    profile = state["user_profile"]
    dietary_restrictions = state.get("dietary_restrictions", [])
    health_conditions = state.get("health_conditions", [])
    
    
    target_calories = calculate_safe_calorie_target(profile)
    
    
    calorie_check = HealthSafetyValidator.validate_calorie_target(
        target_calories, 
        profile.get("age"), 
        profile.get("primary_goal", Goal.GENERAL_WELLNESS)
    )
    
    dietary_check = HealthSafetyValidator.validate_dietary_restrictions(
        dietary_restrictions, 
        profile.get("primary_goal", Goal.GENERAL_WELLNESS)
    )
    
  
    if not calorie_check["is_valid"]:
        logger.warning(f"Calorie target safety concerns: {calorie_check['warnings']}")
    
    
    prompt = f"""
You are a registered dietitian creating a safe, balanced meal plan. 
Always prioritize nutritional adequacy, food safety, and sustainable eating habits.

CRITICAL SAFETY REQUIREMENTS:
- Never recommend extremely low-calorie diets (below 1200 calories)
- Ensure balanced macronutrients and micronutrients
- Include variety and food safety considerations
- Recommend professional consultation for medical conditions
- Avoid promoting restrictive or elimination diets without medical need
- Focus on whole foods and balanced nutrition

User Profile:
- Age: {profile.get('age', 'Not specified')}
- Activity Level: {profile.get('current_activity_level', 'Not specified')}
- Primary Goal: {profile.get('primary_goal', 'general_wellness')}
- Target Calories: {calorie_check['adjusted_calories']} per day
- Dietary Restrictions: {dietary_restrictions if dietary_restrictions else 'None'}
- Health Conditions: {health_conditions if health_conditions else 'None reported'}

SAFETY WARNINGS:
{'; '.join(calorie_check.get('warnings', []))}
{'; '.join(dietary_check.get('warnings', []))}

RECOMMENDATIONS:
{'; '.join(calorie_check.get('recommendations', []))}
{'; '.join(dietary_check.get('recommendations', []))}

Create a 7-day meal plan with these MANDATORY safety features:
1. Meet minimum nutritional requirements
2. Include all major food groups (unless medically restricted)
3. Provide realistic portion sizes and preparation methods
4. Include food safety notes where relevant
5. Offer simple, accessible ingredients
6. Balance calories across meals (don't skip major meals)
7. Include adequate hydration recommendations

Return ONLY a JSON array with this exact structure:
[
  {{
    "day": 1,
    "meals": [
      {{
        "name": "Balanced Breakfast Bowl",
        "meal_type": "breakfast",
        "ingredients": ["1 cup oatmeal", "1/2 cup blueberries", "1 tbsp almond butter", "1 tsp honey"],
        "instructions": "Cook oatmeal according to package directions. Top with berries, almond butter, and honey.",
        "prep_time_minutes": 10,
        "servings": 1,
        "estimated_calories": 350,
        "macronutrients": {{"protein": 12, "carbs": 58, "fats": 10}},
        "dietary_tags": ["vegetarian", "gluten_free_option"],
        "allergen_warnings": ["nuts"],
        "nutrition_notes": "High in fiber and provides sustained energy"
      }}
    ],
    "total_estimated_calories": {calorie_check['adjusted_calories']},
    "daily_water_goal_glasses": 8,
    "nutrition_summary": {{
      "protein_grams": 100,
      "carbs_grams": 250,
      "fats_grams": 70,
      "fiber_grams": 30
    }},
    "special_notes": "Balanced nutrition with emphasis on whole foods"
  }}
]

IMPORTANT: 
- Ensure daily calories are between {MIN_CALORIES_ADULT}-{MAX_CALORIES_ADULT}
- Include 3 main meals and 1-2 healthy snacks per day
- Provide realistic, safe meal preparation instructions
- Consider food allergies and safety
- Never recommend extreme restrictions or "cleanse" diets
- If user has health conditions, make recommendations extra conservative
"""

    try:
        response = health_llm.invoke(prompt)
        meal_plan = json.loads(
            response.content.strip().replace("```json\n", "").replace("```", "")
        )
        
       
        for day in meal_plan:
            daily_calories = day.get("total_estimated_calories", 0)
            
            
            if daily_calories < MIN_CALORIES_ADULT:
                logger.warning(f"Day {day.get('day')} calories below minimum ({daily_calories})")
                day["total_estimated_calories"] = MIN_CALORIES_ADULT
                day["special_notes"] = day.get("special_notes", "") + " Calories adjusted to meet minimum requirements."
            
            elif daily_calories > MAX_CALORIES_ADULT:
                logger.warning(f"Day {day.get('day')} calories above maximum ({daily_calories})")
                day["total_estimated_calories"] = MAX_CALORIES_ADULT
                day["special_notes"] = day.get("special_notes", "") + " Portions adjusted to meet calorie targets."
            
           
            meals = day.get("meals", [])
            if len(meals) < 3:
                logger.warning(f"Day {day.get('day')} has fewer than 3 main meals")
                day["special_notes"] = day.get("special_notes", "") + " Consider adding healthy snacks if needed."
            
           
            meal_calories = sum(meal.get("estimated_calories", 0) for meal in meals)
            if abs(meal_calories - daily_calories) > 200:
                logger.info(f"Day {day.get('day')} meal calories don't match daily total - adjusting")
                day["total_estimated_calories"] = meal_calories
        
        state["meal_plan"] = meal_plan
        state["safety_notes"].extend(calorie_check.get("warnings", []))
        state["safety_notes"].extend(calorie_check.get("recommendations", []))
        state["safety_notes"].extend(dietary_check.get("warnings", []))
        state["safety_notes"].extend(dietary_check.get("recommendations", []))
        
        
        state["disclaimers"].append(NUTRITION_DISCLAIMER)
        state["disclaimers"].append(HEALTH_DISCLAIMER)
        
        logger.info(f"Generated safe meal plan with average {target_calories} calories per day")
        
        return state
        
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Error generating meal plan: {e}")
        
        
        fallback_plan = [
            {
                "day": 1,
                "meals": [
                    {
                        "name": "Simple Balanced Breakfast",
                        "meal_type": "breakfast",
                        "ingredients": ["2 slices whole grain toast", "1 banana", "1 tbsp peanut butter"],
                        "instructions": "Toast bread, spread peanut butter, serve with banana",
                        "prep_time_minutes": 5,
                        "servings": 1,
                        "estimated_calories": 300,
                        "macronutrients": {"protein": 10, "carbs": 45, "fats": 12},
                        "dietary_tags": ["vegetarian"],
                        "allergen_warnings": ["nuts", "gluten"],
                        "nutrition_notes": "Provides energy and protein for morning"
                    },
                    {
                        "name": "Basic Lunch Salad",
                        "meal_type": "lunch", 
                        "ingredients": ["2 cups mixed greens", "1 can tuna in water", "1 tbsp olive oil", "1 tbsp lemon juice"],
                        "instructions": "Combine greens and tuna, dress with oil and lemon",
                        "prep_time_minutes": 10,
                        "servings": 1,
                        "estimated_calories": 250,
                        "macronutrients": {"protein": 25, "carbs": 8, "fats": 14},
                        "dietary_tags": ["gluten_free"],
                        "allergen_warnings": ["fish"],
                        "nutrition_notes": "High in protein and healthy fats"
                    }
                ],
                "total_estimated_calories": 1500,
                "daily_water_goal_glasses": 8,
                "nutrition_summary": {"protein": 80, "carbs": 180, "fats": 50, "fiber": 25},
                "special_notes": "Basic fallback plan - professional nutrition consultation recommended"
            }
        ]
        
        state["meal_plan"] = fallback_plan
        state["safety_notes"].append("AI generation failed - using basic fallback plan")
        state["disclaimers"].append("This is a basic fallback plan. Registered dietitian consultation strongly recommended.")
        
        return state

def validate_meal_plan_nutrition(meal_plan: List[Dict]) -> Dict[str, any]:
    """
    Post-generation validation to ensure meal plan meets nutritional safety standards
    """
    validation_result = {
        "is_nutritionally_safe": True,
        "warnings": [],
        "recommendations": []
    }
    
    for day in meal_plan:
        daily_calories = day.get("total_estimated_calories", 0)
        meals = day.get("meals", [])
        
        
        if daily_calories < MIN_CALORIES_ADULT:
            validation_result["is_nutritionally_safe"] = False
            validation_result["warnings"].append(f"Day {day.get('day')} calories below safe minimum")
        
       
        if len(meals) < 2:
            validation_result["warnings"].append(f"Day {day.get('day')} may have insufficient meals")
        
        
        breakfast_present = any(meal.get("meal_type") == "breakfast" for meal in meals)
        if not breakfast_present:
            validation_result["recommendations"].append("Consider including breakfast for optimal nutrition")
        
        
        nutrition = day.get("nutrition_summary", {})
        protein = nutrition.get("protein_grams", 0)
        
        if protein < 50:  
            validation_result["warnings"].append(f"Day {day.get('day')} may be low in protein")
        
        
        ingredient_count = len(set([
            ingredient 
            for meal in meals 
            for ingredient in meal.get("ingredients", [])
        ]))
        
        if ingredient_count < 8:  
            validation_result["recommendations"].append("Consider adding more variety to improve nutrition")
    
    return validation_result

def check_dietary_restriction_compliance(meal_plan: List[Dict], restrictions: List[str]) -> Dict[str, any]:
    """
    Verify that meal plan complies with stated dietary restrictions
    """
    compliance_result = {
        "is_compliant": True,
        "violations": [],
        "warnings": []
    }
    
    
    violation_keywords = {
        "vegetarian": ["beef", "pork", "chicken", "turkey", "fish", "seafood", "meat"],
        "vegan": ["beef", "pork", "chicken", "turkey", "fish", "seafood", "meat", "dairy", "milk", "cheese", "eggs", "honey"],
        "gluten_free": ["wheat", "barley", "rye", "bread", "pasta", "flour"],
        "dairy_free": ["milk", "cheese", "yogurt", "butter", "cream"],
        "nut_free": ["peanut", "almond", "walnut", "cashew", "pistachio", "hazelnut"]
    }
    
    for restriction in restrictions:
        if restriction in violation_keywords:
            keywords = violation_keywords[restriction]
            
            for day in meal_plan:
                for meal in day.get("meals", []):
                    ingredients_text = " ".join(meal.get("ingredients", [])).lower()
                    
                    for keyword in keywords:
                        if keyword in ingredients_text:
                            compliance_result["is_compliant"] = False
                            compliance_result["violations"].append(
                                f"Day {day.get('day')}, {meal.get('name')}: Contains {keyword} (violates {restriction})"
                            )
    
    return compliance_result