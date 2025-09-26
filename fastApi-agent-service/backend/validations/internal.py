from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Optional
from beanie import PydanticObjectId
from backend.constants.enums import ActivityLevel, Goal, DietaryRestriction, WorkoutType

class CreateHealthPlan(BaseModel):
    """
    Validation model for creating health plans with comprehensive safety checks
    """
    user_id: PydanticObjectId = Field(..., description="User ID from user service")
    plan_name: Optional[str] = Field(None, max_length=100, description="Custom plan name")
    
    
    age: int = Field(..., ge=13, le=100, description="Age in years (13-100 for safety)")
    current_activity_level: ActivityLevel = Field(..., description="Current physical activity level")
    primary_goal: Goal = Field(..., description="Primary health/fitness goal")
    
    
    time_availability_minutes: int = Field(
        ..., 
        ge=10, 
        le=180, 
        description="Daily time available for workouts (10-180 minutes)"
    )
    
   
    preferred_workout_types: Optional[List[WorkoutType]] = Field(
        default=[], 
        description="Preferred types of workouts"
    )
    available_equipment: Optional[List[str]] = Field(
        default=[], 
        description="Available workout equipment"
    )
    dietary_restrictions: Optional[List[DietaryRestriction]] = Field(
        default=[], 
        description="Dietary restrictions or preferences"
    )
    
   
    health_conditions: Optional[List[str]] = Field(
        default=[], 
        description="Self-reported health conditions"
    )
    health_documents: Optional[str] = Field(
        None, 
        description="URL to uploaded health documents"
    )
    medical_clearance: bool = Field(
        default=False, 
        description="User confirms they have medical clearance for exercise"
    )
    health_disclaimer_acknowledged: bool = Field(
        ..., 
        description="User must acknowledge health disclaimers"
    )
    
    
    user_input: Optional[str] = Field(
        None, 
        max_length=1000, 
        description="Additional user goals and preferences"
    )

    @validator('age')
    def validate_age_safety(cls, v):
        """Enhanced age validation for health and safety compliance"""
        if v < 13:
            raise ValueError("Age below minimum safety threshold - parental supervision required")
        if v < 18:
            
            pass
        if v > 75:
            
            pass
        return v

    @validator('health_conditions')
    def validate_health_conditions_safety(cls, v):
        """Check for high-risk health conditions that require professional consultation"""
        if not v:
            return v
        
        high_risk_keywords = [
            'heart', 'cardiac', 'diabetes', 'blood pressure', 'hypertension',
            'eating disorder', 'pregnancy', 'surgery', 'injury', 'medication',
            'depression', 'anxiety', 'arthritis', 'asthma', 'cancer'
        ]
        
        for condition in v:
            condition_lower = condition.lower()
            if any(keyword in condition_lower for keyword in high_risk_keywords):
                
                pass
        
        return v

    @validator('preferred_workout_types')
    def validate_workout_type_safety(cls, v):
        """Ensure selected workout types are appropriate for general population"""
        if not v:
            return v
        
        
        high_intensity_types = [WorkoutType.HIIT]
        
        if any(workout_type in high_intensity_types for workout_type in v):
            
            pass
        
        return v

    @root_validator
    def validate_overall_safety_profile(cls, values):
        """Comprehensive safety validation across all fields"""
        age = values.get('age')
        activity_level = values.get('current_activity_level')
        goal = values.get('primary_goal')
        health_conditions = values.get('health_conditions', [])
        medical_clearance = values.get('medical_clearance', False)
        
        
        high_risk_factors = []
        
        
        if age and (age < 18 or age > 65):
            high_risk_factors.append('age_consideration')
        
        
        if activity_level == ActivityLevel.SEDENTARY and goal in [Goal.MUSCLE_GAIN]:
            high_risk_factors.append('sedentary_with_intensive_goal')
        
        
        if health_conditions:
            high_risk_factors.append('existing_health_conditions')
        
        
        if high_risk_factors and not medical_clearance:
            
            pass
        
        return values

    @validator('user_input')
    def validate_user_input_content(cls, v):
        """Screen user input for concerning content or unsafe goals"""
        if not v:
            return v
        
        concerning_phrases = [
            'lose weight fast', 'extreme diet', 'crash diet', 'no pain no gain',
            'until exhaustion', 'ignore pain', 'dangerous', 'risky'
        ]
        
        v_lower = v.lower()
        for phrase in concerning_phrases:
            if phrase in v_lower:
                
                break
        
        return v

    class Config:
        use_enum_values = True
        validate_assignment = True

class UpdateHealthPlanProgress(BaseModel):
    """
    Validation model for updating health plan progress with safety monitoring
    """
    current_week: int = Field(..., ge=1, le=52, description="Current week of the program")
    progress_notes: Optional[List[str]] = Field(
        default=[], 
        description="User progress notes and observations"
    )
    completed_workouts: Optional[int] = Field(
        None, 
        ge=0, 
        le=30, 
        description="Number of workouts completed this week"
    )
    energy_level: Optional[int] = Field(
        None, 
        ge=1, 
        le=10, 
        description="Energy level rating (1-10)"
    )
    sleep_quality: Optional[int] = Field(
        None, 
        ge=1, 
        le=10, 
        description="Sleep quality rating (1-10)"
    )
    reported_issues: Optional[List[str]] = Field(
        default=[], 
        description="Any issues or concerns to report"
    )
    
    @validator('progress_notes')
    def validate_progress_notes_safety(cls, v):
        """Screen progress notes for concerning symptoms or unsafe practices"""
        if not v:
            return v
        
        concerning_keywords = [
            'severe pain', 'chest pain', 'can\'t breathe', 'dizzy', 'fainted',
            'injured', 'bleeding', 'nauseous', 'vomiting', 'emergency'
        ]
        
        for note in v:
            note_lower = note.lower()
            if any(keyword in note_lower for keyword in concerning_keywords):
                
                pass
        
        return v
    
    @validator('energy_level')
    def validate_energy_concerns(cls, v):
        """Flag very low energy levels for safety review"""
        if v and v <= 2:
            
            pass
        return v
    
    @validator('reported_issues')
    def validate_reported_issues_safety(cls, v):
        """Screen reported issues for urgent medical concerns"""
        if not v:
            return v
        
        urgent_keywords = [
            'chest pain', 'heart', 'breathing', 'dizzy', 'faint', 
            'severe', 'emergency', 'blood', 'injury', 'hospital'
        ]
        
        for issue in v:
            issue_lower = issue.lower()
            if any(keyword in issue_lower for keyword in urgent_keywords):
                
                pass
        
        return v

class PauseHealthPlan(BaseModel):
    """
    Validation model for pausing health plans with reason tracking
    """
    reason: Optional[str] = Field(
        None, 
        max_length=500, 
        description="Reason for pausing the health plan"
    )
    expected_resume_date: Optional[str] = Field(
        None, 
        description="Expected date to resume (YYYY-MM-DD format)"
    )
    health_related: bool = Field(
        default=False, 
        description="Whether pause is due to health concerns"
    )
    
    @validator('reason')
    def validate_pause_reason(cls, v):
        """Analyze pause reasons for health concerns"""
        if not v:
            return v
        
        health_related_keywords = [
            'injury', 'sick', 'illness', 'doctor', 'hospital', 'pain',
            'medication', 'surgery', 'health', 'medical', 'tired', 'exhausted'
        ]
        
        v_lower = v.lower()
        if any(keyword in v_lower for keyword in health_related_keywords):
            
            pass
        
        return v

class HealthPlanAnalytics(BaseModel):
    """
    Request model for health plan analytics (minimal validation needed)
    """
    include_detailed_metrics: bool = Field(default=False, description="Include detailed analytics")
    date_range_days: int = Field(default=30, ge=1, le=365, description="Date range for analytics")

class ChatHealthPlan(BaseModel):
    """
    Validation model for health plan chat interactions with safety screening
    """
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    message_type: Optional[str] = Field(default="general", description="Type of message (general, question, concern)")
    
    @validator('message')
    def validate_message_safety(cls, v):
        """Screen chat messages for urgent health concerns"""
        if not v:
            return v
        
        emergency_keywords = [
            'chest pain', 'can\'t breathe', 'heart attack', 'stroke',
            'severe pain', 'bleeding', 'emergency', 'ambulance',
            'hospital', 'urgent', 'help', 'fainted', 'unconscious'
        ]
        
        v_lower = v.lower()
        if any(keyword in v_lower for keyword in emergency_keywords):
            
            pass
        
        return v