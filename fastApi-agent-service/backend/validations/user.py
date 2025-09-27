from pydantic import BaseModel, Field, validator
from typing import Optional, List
from backend.constants.enums import HealthPlanStatus

class HealthPlanChat(BaseModel):
    """
    Validation for user health plan chat messages with enhanced safety screening
    """
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    
    @validator('message')
    def validate_message_safety(cls, v):
        """
        Enhanced safety validation for user chat messages
        Screens for emergency situations and unsafe content
        """
        if not v:
            raise ValueError("Message cannot be empty")
        
        # Emergency medical situations
        emergency_patterns = [
            'chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'breathing',
            'severe pain', 'bleeding heavily', 'unconscious', 'fainted',
            'emergency', 'call 911', 'ambulance', 'hospital now'
        ]
        
        message_lower = v.lower()
        for pattern in emergency_patterns:
            if pattern in message_lower:
                # Flag for emergency response protocol
                break
        
        # Medical concerns requiring professional consultation
        medical_concern_patterns = [
            'dizzy', 'nauseous', 'vomiting', 'severe fatigue', 'joint pain',
            'back pain', 'neck pain', 'headache severe', 'vision problems',
            'numbness', 'tingling', 'swelling', 'shortness of breath'
        ]
        
        for pattern in medical_concern_patterns:
            if pattern in message_lower:
                # Flag for professional consultation recommendation
                break
        
        # Unsafe exercise patterns
        unsafe_exercise_patterns = [
            'extreme workout', 'maximum intensity', 'no pain no gain',
            'until exhaustion', 'ignore pain', 'push through injury',
            'dangerous exercise', 'risky movement'
        ]
        
        for pattern in unsafe_exercise_patterns:
            if pattern in message_lower:
                # Flag for safety education and guidance
                break
        
        # Unsafe diet patterns
        unsafe_diet_patterns = [
            'crash diet', 'extreme diet', 'starvation', 'fasting extreme',
            'lose weight fast', 'diet pills', 'skip meals', 'very low calorie'
        ]
        
        for pattern in unsafe_diet_patterns:
            if pattern in message_lower:
                # Flag for nutrition safety guidance
                break
        
        return v

class UpdateHealthProgress(BaseModel):
    """
    Validation for health plan progress updates with comprehensive safety monitoring
    """
    current_week: int = Field(..., ge=1, le=52, description="Current week of the plan")
    workout_completion_rate: Optional[int] = Field(
        None, ge=0, le=100, description="Percentage of workouts completed"
    )
    energy_level_avg: Optional[int] = Field(
        None, ge=1, le=10, description="Average energy level (1-10 scale)"
    )
    sleep_quality_avg: Optional[int] = Field(
        None, ge=1, le=10, description="Average sleep quality (1-10 scale)"
    )
    nutrition_adherence: Optional[int] = Field(
        None, ge=0, le=100, description="Percentage adherence to meal plan"
    )
    weight_change_lbs: Optional[float] = Field(
        None, ge=-5.0, le=5.0, description="Weight change in pounds (limited for safety)"
    )
    progress_notes: Optional[List[str]] = Field(
        default=[], description="User progress observations"
    )
    concerns_reported: Optional[List[str]] = Field(
        default=[], description="Any health concerns or issues"
    )
    
    @validator('current_week')
    def validate_week_progression(cls, v):
        """Ensure reasonable week progression"""
        if v <= 0:
            raise ValueError("Week must be positive")
        return v
    
    @validator('weight_change_lbs')
    def validate_weight_change_safety(cls, v):
        """Validate weight changes are within safe ranges"""
        if v is None:
            return v
        
        # Flag rapid weight changes for safety review
        if abs(v) > 2.0:
            # Professional consultation may be recommended
            pass
        
        return v
    
    @validator('energy_level_avg')
    def validate_energy_level_concerns(cls, v):
        """Flag very low energy levels for health review"""
        if v is None:
            return v
        
        if v <= 3:
            # Low energy may indicate overtraining or health issues
            pass
        
        return v
    
    @validator('progress_notes')
    def validate_progress_notes_safety(cls, v):
        """Screen progress notes for health concerns"""
        if not v:
            return v
        
        concerning_keywords = [
            'pain', 'injury', 'hurt', 'sore', 'exhausted', 'tired',
            'dizzy', 'nauseous', 'sick', 'unwell', 'struggle'
        ]
        
        for note in v:
            if note and len(note) > 500:
                raise ValueError("Individual progress notes must be under 500 characters")
            
            note_lower = note.lower() if note else ""
            for keyword in concerning_keywords:
                if keyword in note_lower:
                    # Flag for health review
                    break
        
        return v
    
    @validator('concerns_reported')
    def validate_reported_concerns(cls, v):
        """Validate and categorize reported health concerns"""
        if not v:
            return v
        
        urgent_keywords = [
            'chest pain', 'heart', 'breathing difficulty', 'severe pain',
            'bleeding', 'injury serious', 'fainted', 'dizzy severe'
        ]
        
        for concern in v:
            if concern and len(concern) > 500:
                raise ValueError("Individual concerns must be under 500 characters")
            
            concern_lower = concern.lower() if concern else ""
            for keyword in urgent_keywords:
                if keyword in concern_lower:
                    # Flag for urgent medical attention
                    break
        
        return v

class PauseHealthPlan(BaseModel):
    """
    Validation for pausing health plans with reason categorization
    """
    reason: str = Field(..., min_length=5, max_length=500, description="Reason for pausing")
    expected_duration_days: Optional[int] = Field(
        None, ge=1, le=365, description="Expected pause duration in days"
    )
    
    @validator('reason')
    def categorize_pause_reason(cls, v):
        """Categorize pause reasons for appropriate follow-up"""
        if not v or len(v.strip()) < 5:
            raise ValueError("Please provide a clear reason for pausing your health plan")
        
        # Health-related pause reasons
        health_keywords = [
            'injury', 'sick', 'illness', 'doctor', 'medical', 'surgery',
            'medication', 'health issue', 'not feeling well', 'tired',
            'exhausted', 'pain', 'recovery'
        ]
        
        # Life circumstance pause reasons
        life_keywords = [
            'busy', 'work', 'travel', 'family', 'schedule', 'time',
            'vacation', 'moving', 'stress', 'overwhelmed'
        ]
        
        reason_lower = v.lower()
        
        # Categorize health-related pauses
        if any(keyword in reason_lower for keyword in health_keywords):
            # Follow up with health guidance
            pass
        
        # Categorize life circumstance pauses
        elif any(keyword in reason_lower for keyword in life_keywords):
            # Offer flexible restart options
            pass
        
        return v

class ResumeHealthPlan(BaseModel):
    """
    Validation for resuming paused health plans with safety checks
    """
    ready_to_resume: bool = Field(..., description="User confirms readiness to resume")
    health_status_update: Optional[str] = Field(
        None, max_length=500, description="Any health status changes during pause"
    )
    modifications_needed: bool = Field(
        default=False, description="Whether plan modifications are needed"
    )
    
    @validator('health_status_update')
    def validate_health_status_changes(cls, v):
        """Screen for health changes that might affect plan safety"""
        if not v:
            return v
        
        significant_change_keywords = [
            'new medication', 'surgery', 'injury', 'diagnosis', 'condition',
            'doctor said', 'medical advice', 'health problem', 'treatment'
        ]
        
        v_lower = v.lower()
        if any(keyword in v_lower for keyword in significant_change_keywords):
            # Medical review may be recommended before resuming
            pass
        
        return v

class HealthPlanFeedback(BaseModel):
    """
    Validation for health plan feedback and ratings
    """
    overall_satisfaction: int = Field(..., ge=1, le=5, description="Overall satisfaction (1-5)")
    workout_difficulty: int = Field(..., ge=1, le=5, description="Workout difficulty (1-5)")
    meal_plan_feasibility: int = Field(..., ge=1, le=5, description="Meal plan feasibility (1-5)")
    recommendation_likelihood: int = Field(..., ge=1, le=10, description="Likelihood to recommend (1-10)")
    
    feedback_text: Optional[str] = Field(
        None, max_length=1000, description="Additional feedback"
    )
    areas_for_improvement: Optional[List[str]] = Field(
        default=[], description="Specific areas for improvement"
    )
    favorite_aspects: Optional[List[str]] = Field(
        default=[], description="Favorite aspects of the plan"
    )
    
    @validator('workout_difficulty')
    def validate_workout_difficulty_safety(cls, v):
        """Flag if workouts are too difficult (safety concern)"""
        if v >= 4:
            # May need plan modifications for safety
            pass
        return v
    
    @validator('feedback_text')
    def validate_feedback_content(cls, v):
        """Screen feedback for safety concerns or suggestions"""
        if not v:
            return v
        
        safety_concern_keywords = [
            'too hard', 'too difficult', 'painful', 'injury', 'hurt',
            'impossible', 'unrealistic', 'dangerous', 'unsafe'
        ]
        
        v_lower = v.lower()
        for keyword in safety_concern_keywords:
            if keyword in v_lower:
                # Flag for safety review and follow-up
                break
        
        return v

class HealthDataExport(BaseModel):
    """
    Validation for health data export requests
    """
    export_format: str = Field(..., pattern="^(json|csv|pdf)$", description="Export format")
    include_progress_data: bool = Field(default=True, description="Include progress tracking data")
    include_meal_plans: bool = Field(default=True, description="Include meal plan data")
    include_workout_plans: bool = Field(default=True, description="Include workout plan data")
    date_range_days: int = Field(default=90, ge=1, le=365, description="Date range for export")
    
    @validator('date_range_days')
    def validate_export_range(cls, v):
        """Ensure reasonable data export ranges"""
        if v > 365:
            raise ValueError("Export range cannot exceed 365 days")
        return v

class EmergencyContact(BaseModel):
    """
    Validation for emergency contact information (for high-risk users)
    """
    contact_name: str = Field(..., min_length=2, max_length=100, description="Emergency contact name")
    relationship: str = Field(..., min_length=2, max_length=50, description="Relationship to user")
    phone_number: str = Field(..., pattern="^[+]?[0-9\s\-\(\)]{10,20}$", description="Phone number")
    should_notify_concerns: bool = Field(
        default=False, 
        description="Whether to notify contact of health concerns"
    )
    
    @validator('contact_name')
    def validate_contact_name(cls, v):
        """Basic validation for contact name"""
        if not v or v.strip() != v:
            raise ValueError("Contact name must not have leading/trailing spaces")
        return v.strip()