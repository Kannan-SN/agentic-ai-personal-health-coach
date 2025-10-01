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

def normalize_meal_plan_data(meal_plan: List[Dict]) -> List[Dict]:
    """
    Normalize LLM-generated meal plan data to match Node.js Mongoose schema
    Removes invalid dietary tags and fixes calorie limits
    """
    # Dietary tag mappings - remove "_option" suffix and invalid tags
    dietary_tag_map = {
        'gluten_free_option': 'gluten_free',
        'dairy_free_option': 'dairy_free',
        'vegan_option': 'vegan',
        'vegetarian_option': 'vegetarian',
        'check_label_for_specifics': None,  # Remove entirely
        'oats_if_granola': None,
        'dairy_if_whey': None,
        'nuts_if_almond_milk': None,
        'eggs_if_mayo': None,
        'soy_if_burger': None
    }
    
    # Valid dietary restrictions from Node.js enum
    valid_dietary_tags = [
        'none', 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
        'low_sodium', 'diabetic_friendly', 'heart_healthy', 'soy_free', 'egg_free',
        'shellfish_free', 'low_sugar', 'keto', 'low_carb', 'high_protein',
        'mediterranean', 'paleo', 'whole30'
    ]
    
    for day in meal_plan:
        for meal in day.get('meals', []):
            # Normalize dietary tags
            if 'dietary_tags' in meal:
                cleaned_tags = []
                for tag in meal['dietary_tags']:
                    tag_lower = str(tag).lower().strip()
                    
                    # Map known invalid tags
                    if tag_lower in dietary_tag_map:
                        mapped_tag = dietary_tag_map[tag_lower]
                        if mapped_tag and mapped_tag not in cleaned_tags:
                            cleaned_tags.append(mapped_tag)
                    elif tag_lower in valid_dietary_tags and tag_lower not in cleaned_tags:
                        cleaned_tags.append(tag_lower)
                    else:
                        logger.warning(f"Removing invalid dietary tag: {tag}")
                
                meal['dietary_tags'] = cleaned_tags
            
            # Fix calorie limits for individual meals
            # Node.js now allows 50-1500 calories per meal
            if 'estimated_calories' in meal:
                calories = meal['estimated_calories']
                if calories > 1500:
                    logger.warning(f"Meal '{meal.get('name')}' calories ({calories}) exceed max 1500, capping")
                    meal['estimated_calories'] = 1500
                elif calories < 50:
                    logger.warning(f"Meal '{meal.get('name')}' calories ({calories}) below minimum 50, adjusting")
                    meal['estimated_calories'] = 50
            
            # Normalize allergen warnings - remove conditional ones
            if 'allergen_warnings' in meal:
                cleaned_allergens = []
                for allergen in meal['allergen_warnings']:
                    allergen_str = str(allergen).lower().strip()
                    # Remove conditional allergens like "dairy_if_whey", "nuts_if_almond_milk"
                    if not any(cond in allergen_str for cond in ['_if_', 'if ']):
                        cleaned_allergens.append(allergen_str)
                    else:
                        logger.info(f"Removing conditional allergen: {allergen}")
                meal['allergen_warnings'] = cleaned_allergens
        
        # Validate daily calorie totals
        if 'total_estimated_calories' in day:
            daily_cal = day['total_estimated_calories']
            if daily_cal < MIN_CALORIES_ADULT:
                logger.warning(f"Day {day.get('day')} calories ({daily_cal}) below minimum {MIN_CALORIES_ADULT}")
                day['total_estimated_calories'] = MIN_CALORIES_ADULT
            elif daily_cal > MAX_CALORIES_ADULT:
                logger.warning(f"Day {day.get('day')} calories ({daily_cal}) above maximum {MAX_CALORIES_ADULT}")
                day['total_estimated_calories'] = MAX_CALORIES_ADULT
    
    return meal_plan

def calculate_safe_calorie_target(profile: dict) -> int:
    """
    Calculate a safe, conservative calorie target based on user profile
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

CRITICAL: Use ONLY these EXACT dietary tags (all lowercase, snake_case, NO "_option" suffix):
- none
- vegetarian
- vegan
- gluten_free
- dairy_free
- nut_free
- low_sodium
- diabetic_friendly
- heart_healthy
- soy_free
- egg_free
- shellfish_free
- low_sugar
- keto
- low_carb
- high_protein
- mediterranean
- paleo
- whole30

CRITICAL: Use ONLY these EXACT meal types:
- breakfast
- lunch
- dinner
- snack
- pre_workout
- post_workout

MEAL CALORIE LIMITS (IMPORTANT):
- Individual meals: 50-1500 calories (dinners can be up to 1500)
- Daily total: {MIN_CALORIES_ADULT}-{MAX_CALORIES_ADULT} calories

DO NOT USE (WILL CAUSE ERRORS):
- Tags ending in "_option" (e.g., "vegan_option", "gluten_free_option", "dairy_free_option")
- Tags like "check_label_for_specifics"
- Conditional allergen warnings (e.g., "dairy_if_whey", "nuts_if_almond_milk", "eggs_if_mayo")

For allergen warnings, use simple names:
- Good: ["dairy", "nuts", "eggs", "wheat", "soy", "fish"]
- Bad: ["dairy_if_whey", "nuts_if_almond_milk", "check_label"]

Create a 7-day meal plan with these MANDATORY safety features:
1. Meet minimum nutritional requirements
2. Include all major food groups (unless medically restricted)
3. Provide realistic portion sizes and preparation methods
4. Include food safety notes where relevant
5. Offer simple, accessible ingredients
6. Balance calories across meals (don't skip major meals)
7. Include adequate hydration recommendations
8. Keep individual meal calories: 50-1500 range

Return ONLY a valid JSON array (NO markdown, NO code blocks, NO extra text) with this EXACT structure:
[
  {{
    "day": 1,
    "meals": [
      {{
        "name": "Balanced Breakfast Bowl",
        "meal_type": "breakfast",
        "ingredients": ["1 cup oatmeal", "1/2 cup blueberries", "1 tbsp honey"],
        "instructions": "Cook oatmeal according to package directions. Top with berries and honey.",
        "prep_time_minutes": 10,
        "servings": 1,
        "estimated_calories": 350,
        "macronutrients": {{"protein": 12, "carbs": 58, "fats": 10}},
        "dietary_tags": ["vegetarian", "gluten_free"],
        "allergen_warnings": ["oats"],
        "nutrition_notes": "High in fiber and provides sustained energy"
      }},
      {{
        "name": "Grilled Chicken Dinner",
        "meal_type": "dinner",
        "ingredients": ["6 oz chicken breast", "2 cups vegetables", "1 cup rice"],
        "instructions": "Grill chicken, steam vegetables, cook rice.",
        "prep_time_minutes": 30,
        "servings": 1,
        "estimated_calories": 750,
        "macronutrients": {{"protein": 45, "carbs": 80, "fats": 15}},
        "dietary_tags": ["gluten_free"],
        "allergen_warnings": [],
        "nutrition_notes": "Balanced meal with lean protein and complex carbs"
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

IMPORTANT REMINDERS:
- Use ONLY the dietary tags listed above (NO "_option" variants)
- Individual meal calories: 50-1500 (larger dinners are OK)
- Daily calories: {MIN_CALORIES_ADULT}-{MAX_CALORIES_ADULT}
- Include 3 main meals and 1-2 snacks per day
- Use simple allergen names (no conditional warnings)
- Return ONLY JSON, no markdown formatting
"""

    try:
        response = health_llm.invoke(prompt)
        meal_plan = json.loads(
            response.content.strip().replace("```json\n", "").replace("```", "").replace("```json", "")
        )
        
        # CRITICAL: Normalize the data before validation
        meal_plan = normalize_meal_plan_data(meal_plan)
        
        # Validate daily calorie totals
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
        
        # Fallback plan
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
                        "allergen_warnings": ["nuts", "wheat"],
                        "nutrition_notes": "Provides energy and protein for morning"
                    },
                    {
                        "name": "Basic Lunch Salad",
                        "meal_type": "lunch", 
                        "ingredients": ["2 cups mixed greens", "1 can tuna", "1 tbsp olive oil"],
                        "instructions": "Combine greens and tuna, dress with oil",
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