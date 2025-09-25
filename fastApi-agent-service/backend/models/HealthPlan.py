from beanie import Document, PydanticObjectId
from datetime import datetime, timezone
from pydantic import Field, validator
from typing import Optional, List, Dict, Any
from backend.constants.enums import (
    HealthPlanStatus, ActivityLevel, Goal, DietaryRestriction, 
    WorkoutType, IntensityLevel, MealType
)

class Exercise(Document):
    """Individual exercise within a workout"""
    name: str
    type: WorkoutType
    duration_minutes: int = Field(ge=1, le=60) 
    intensity: IntensityLevel
    instructions: str
    target_muscles: List[str] = []
    equipment_needed: List[str] = []
    modifications: str = "" 
    safety_notes: str = ""
    
class Workout(Document):
    """Daily workout plan"""
    day: int = Field(ge=1, le=7) 
    workout_name: str
    total_duration_minutes: int = Field(ge=10, le=120) 
    warm_up: str
    exercises: List[Exercise] = []
    cool_down: str
    intensity_level: IntensityLevel
    estimated_calories_burned: int = Field(ge=0, le=1000)
    rest_day: bool = False
    notes: str = ""

class Meal(Document):
    """Individual meal or snack"""
    name: str
    meal_type: MealType
    ingredients: List[str] = []
    instructions: str
    prep_time_minutes: int = Field(ge=0, le=120)
    servings: int = Field(ge=1, le=8)
    estimated_calories: int = Field(ge=50, le=800)  
    macronutrients: Dict[str, Any] = {}  
    dietary_tags: List[DietaryRestriction] = []
    allergen_warnings: List[str] = []
    nutrition_notes: str = ""

class DailyMealPlan(Document):
    """Daily meal planning"""
    day: int = Field(ge=1, le=7)  
    meals: List[Meal] = []
    total_estimated_calories: int = Field(ge=1200, le=3000)  
    daily_water_goal_glasses: int = Field(ge=6, le=15)
    nutrition_summary: Dict[str, Any] = {}
    special_notes: str = ""

class HealthPlan(Document):
    """Main health plan document"""
    user_id: PydanticObjectId  
    plan_name: str
    status: HealthPlanStatus = HealthPlanStatus.ACTIVE
    
    age: Optional[int] = Field(None, ge=13, le=100)  
    current_activity_level: ActivityLevel
    primary_goal: Goal
    dietary_restrictions: List[DietaryRestriction] = []
    health_conditions: List[str] = []  
    preferred_workout_types: List[WorkoutType] = []
    available_equipment: List[str] = []
    time_availability_minutes: int = Field(ge=10, le=120)  
    
    # Generated Plans
    workout_plan: List[Workout] = []
    meal_plan: List[DailyMealPlan] = []
    
    # Tracking Data
    plan_duration_weeks: int = Field(ge=1, le=12)  
    current_week: int = Field(ge=1, le=12)
    progress_notes: List[str] = []
    
    # Safety and Compliance
    health_disclaimer_acknowledged: bool = False
    medical_clearance: bool = False  
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed_at: Optional[datetime] = None

    @validator('current_activity_level', 'primary_goal')
    def validate_health_safety(cls, v):
        """Ensure safe health parameters"""
        if not v:
            raise ValueError("Required health parameter missing")
        return v
    
    @validator('workout_plan')
    def validate_workout_safety(cls, v):
        """Ensure workout plans are safe and balanced"""
        if not v:
            return v
            
        total_weekly_minutes = sum(workout.total_duration_minutes for workout in v if not workout.rest_day)
        if total_weekly_minutes > 600:  
            raise ValueError("Weekly workout duration exceeds safe limits")
            
       
        rest_days = sum(1 for workout in v if workout.rest_day)
        if rest_days < 1:
            raise ValueError("At least one rest day per week is required")
            
        return v
    
    @validator('meal_plan')
    def validate_meal_safety(cls, v):
        """Ensure meal plans meet nutritional minimums"""
        if not v:
            return v
            
        for daily_plan in v:
            if daily_plan.total_estimated_calories < 1200:
                raise ValueError("Daily calories below safe minimum (1200)")
            if daily_plan.total_estimated_calories > 3000:
                raise ValueError("Daily calories exceed recommended maximum (3000)")
                
        return v

    class Settings:
        name = "health_plans"
        indexes = [
            "user_id",
            "status",
            "created_at",
            "primary_goal"
        ]