from typing import TypedDict, List, Dict, Any
from backend.utils.llm import health_llm
from backend.utils.health_safety import HealthSafetyValidator
from backend.constants.enums import (
    ActivityLevel, Goal, HealthPlanStatus, 
    HEALTH_DISCLAIMER, EXERCISE_DISCLAIMER, NUTRITION_DISCLAIMER
)
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class WellnessOrchestratorState(TypedDict):
    user_profile: dict
    health_conditions: list
    medical_clearance: bool
    workout_plan: list
    meal_plan: list
    safety_notes: list
    disclaimers: list
    analysis_result: dict

def normalize_consultation_types(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize consultation types to match Node.js Mongoose schema enums
    """
    # Map human-readable types to snake_case enum values
    type_map = {
        'Primary Care Physician': 'primary_care',
        'Primary Care': 'primary_care',
        'Registered Dietitian': 'registered_dietitian',
        'Dietitian': 'registered_dietitian',
        'Cardiologist': 'cardiologist',
        'Endocrinologist': 'endocrinologist',
        'Orthopedic Specialist': 'orthopedic',
        'Orthopedic': 'orthopedic',
        'Physical Therapist': 'physical_therapist',
        'Mental Health Professional': 'mental_health',
        'Therapist': 'mental_health',
        'Certified Fitness Professional': 'fitness_professional',
        'Fitness Professional': 'fitness_professional'
    }
    
    consultations = analysis.get('professional_consultations_recommended', [])
    for consult in consultations:
        original_type = consult.get('type', '')
        # Try to map it, otherwise convert to snake_case
        mapped_type = type_map.get(original_type)
        if not mapped_type:
            mapped_type = original_type.lower().replace(' ', '_')
        consult['type'] = mapped_type
        
        logger.info(f"Consultation type normalized: '{original_type}' -> '{mapped_type}'")
    
    return analysis

def analyze_user_health_profile(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """
    Analyze user health profile for safety concerns and provide recommendations
    This agent focuses on identifying potential risks and recommending professional consultation
    """
    profile = state["user_profile"]
    health_conditions = state.get("health_conditions", [])
    
    # Run safety validation
    profile_safety = HealthSafetyValidator.validate_user_profile_safety({
        "age": profile.get("age"),
        "primary_goal": profile.get("primary_goal"),
        "health_conditions": health_conditions,
        "current_activity_level": profile.get("current_activity_level")
    })
    
    # Build comprehensive prompt with EXPLICIT enum constraints
    prompt = f"""
You are a healthcare professional conducting a preliminary health assessment for exercise and nutrition planning.
Your primary responsibility is to identify potential risks and recommend appropriate professional consultation.

CRITICAL RESPONSIBILITIES:
- Identify health and safety red flags that require medical consultation
- Assess readiness for physical activity and dietary changes
- Recommend conservative, safe approaches
- Never provide medical diagnoses or treatment advice
- Always err on the side of caution and professional referral

User Profile Analysis:
- Age: {profile.get('age', 'Not provided')}
- Current Activity Level: {profile.get('current_activity_level', 'Not provided')}
- Primary Goal: {profile.get('primary_goal', 'Not provided')}
- Available Time: {profile.get('time_availability_minutes', 'Not provided')} minutes daily
- Self-Reported Health Conditions: {health_conditions if health_conditions else 'None reported'}
- Medical Clearance Confirmed: {state.get('medical_clearance', False)}

SAFETY CONCERNS IDENTIFIED:
{'; '.join(profile_safety.get('concerns', [])) if profile_safety.get('concerns') else 'None'}

EXISTING RECOMMENDATIONS:
{'; '.join(profile_safety.get('recommendations', [])) if profile_safety.get('recommendations') else 'None'}

CRITICAL: Use ONLY these EXACT consultation types (all lowercase, snake_case):
- primary_care
- registered_dietitian
- cardiologist
- endocrinologist
- orthopedic
- physical_therapist
- mental_health
- fitness_professional

Provide a comprehensive but conservative health readiness assessment in this EXACT JSON format (NO markdown, NO code blocks):
{{
  "overall_readiness_level": "low",
  "primary_safety_concerns": [
    "Specific concern 1",
    "Specific concern 2"
  ],
  "professional_consultations_recommended": [
    {{
      "type": "primary_care",
      "priority": "high",
      "reason": "Specific reason for consultation",
      "before_starting": true
    }},
    {{
      "type": "registered_dietitian",
      "priority": "moderate",
      "reason": "Nutrition guidance needed",
      "before_starting": false
    }}
  ],
  "safe_starting_recommendations": {{
    "exercise_approach": "Very gentle introduction with professional supervision",
    "nutrition_approach": "Conservative, balanced approach with professional guidance",
    "monitoring_needed": ["blood pressure", "energy levels", "any symptoms"],
    "red_flag_symptoms": ["chest pain", "severe shortness of breath", "dizziness", "nausea"]
  }},
  "program_modifications": [
    "Start with very low intensity",
    "Focus on safety and proper form",
    "Regular check-ins with healthcare provider"
  ],
  "estimated_timeline_to_full_program": "2-4 weeks with medical clearance",
  "additional_safety_notes": [
    "Conservative note 1",
    "Conservative note 2"
  ],
  "risk_level": "low",
  "proceed_with_ai_plan": true
}}

IMPORTANT GUIDELINES:
1. If user has ANY health conditions, recommend medical consultation
2. If age <18 or >65, recommend professional supervision
3. If user hasn't exercised recently, recommend gradual introduction
4. If user reports concerning symptoms, recommend immediate medical consultation
5. Always recommend professional consultation for weight loss goals
6. Be extremely conservative - better to over-recommend professional help
7. Use ONLY the consultation types listed above (lowercase, snake_case)
8. overall_readiness_level must be "low", "moderate", or "high"
9. risk_level must be "low", "moderate", "high", or "very_high"
10. Return ONLY valid JSON, no markdown formatting

Focus on safety, conservative approaches, and professional guidance.
"""

    try:
        response = health_llm.invoke(prompt)
        analysis = json.loads(
            response.content.strip().replace("```json\n", "").replace("```", "").replace("```json", "")
        )
        
        # CRITICAL: Normalize consultation types
        analysis = normalize_consultation_types(analysis)
        
        # Validate and enhance safety
        analysis = validate_health_analysis_safety(analysis, profile, health_conditions)
        
        # Determine if AI plan should proceed
        should_proceed = analysis.get("proceed_with_ai_plan", False)
        
        if not should_proceed or analysis.get("risk_level") in ["high", "very_high"]:
            logger.warning("High risk user profile - recommending professional consultation before AI plan")
            analysis["proceed_with_ai_plan"] = False
            analysis["primary_safety_concerns"].append(
                "Profile requires professional medical evaluation before proceeding with AI-generated plans"
            )
        
        if analysis.get("risk_level") in ["high", "very_high"]:
            logger.warning(f"High-risk user profile detected: {analysis.get('primary_safety_concerns')}")
        
        state["analysis_result"] = analysis
        state["safety_notes"].extend(analysis.get("additional_safety_notes", []))
        state["safety_notes"].extend(profile_safety.get("concerns", []))
        
        # Add disclaimers
        state["disclaimers"].extend([
            HEALTH_DISCLAIMER,
            EXERCISE_DISCLAIMER, 
            NUTRITION_DISCLAIMER,
            "This analysis is not a medical evaluation and cannot replace professional healthcare assessment."
        ])
        
        logger.info(f"Health analysis completed - Risk level: {analysis.get('risk_level')}, Proceed: {should_proceed}")
        
        return state
        
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Error in health analysis: {e}")
        
        # Ultra-conservative fallback
        fallback_analysis = {
            "overall_readiness_level": "low",
            "primary_safety_concerns": [
                "Unable to complete automated health assessment",
                "Professional medical consultation required before proceeding"
            ],
            "professional_consultations_recommended": [
                {
                    "type": "primary_care",
                    "priority": "high",
                    "reason": "Comprehensive health assessment needed before starting any program",
                    "before_starting": True
                },
                {
                    "type": "registered_dietitian",
                    "priority": "high", 
                    "reason": "Professional nutrition guidance needed",
                    "before_starting": True
                }
            ],
            "safe_starting_recommendations": {
                "exercise_approach": "Do not proceed without medical clearance",
                "nutrition_approach": "Maintain current diet until professional consultation",
                "monitoring_needed": ["consult healthcare provider"],
                "red_flag_symptoms": ["any concerning symptoms - consult doctor immediately"]
            },
            "program_modifications": [
                "Seek professional medical and nutrition consultation",
                "Do not proceed with AI-generated plans until cleared by professionals"
            ],
            "estimated_timeline_to_full_program": "After medical clearance and professional guidance",
            "additional_safety_notes": [
                "AI analysis failed - professional assessment is mandatory",
                "Do not attempt self-directed health and fitness programs without professional guidance"
            ],
            "risk_level": "very_high",
            "proceed_with_ai_plan": False
        }
        
        state["analysis_result"] = fallback_analysis
        state["safety_notes"].append("Health analysis failed - defaulting to maximum safety protocols")
        state["disclaimers"].append("AI health analysis unavailable - professional consultation mandatory")
        
        return state

def validate_health_analysis_safety(analysis: Dict[str, Any], profile: Dict[str, Any], health_conditions: List[str]) -> Dict[str, Any]:
    """
    Validate AI-generated health analysis for safety and conservatism
    """
    age = profile.get("age")
    
    # Age-based risk elevation
    if age and (age < 18 or age > 65):
        if analysis.get("risk_level") == "low":
            analysis["risk_level"] = "moderate"
        analysis["proceed_with_ai_plan"] = False
        if not any("age" in concern.lower() for concern in analysis.get("primary_safety_concerns", [])):
            analysis["primary_safety_concerns"].append("Age requires special consideration and professional supervision")
    
    # Health conditions always require consultation
    if health_conditions:
        if analysis.get("risk_level") == "low":
            analysis["risk_level"] = "moderate"
        analysis["proceed_with_ai_plan"] = False
        if not any("health condition" in concern.lower() for concern in analysis.get("primary_safety_concerns", [])):
            analysis["primary_safety_concerns"].append("Existing health conditions require medical clearance")
    
    # Ensure primary care is recommended for moderate+ risk
    if not profile.get("medical_clearance", False) and analysis.get("risk_level") in ["moderate", "high", "very_high"]:
        analysis["proceed_with_ai_plan"] = False
        analysis["primary_safety_concerns"].append("Medical clearance required before proceeding")
    
    # Add primary care consultation if missing for high risk
    if analysis.get("risk_level") in ["high", "very_high"]:
        consultations = analysis.get("professional_consultations_recommended", [])
        has_primary_care = any(c.get("type") == "primary_care" for c in consultations)
        
        if not has_primary_care:
            analysis["professional_consultations_recommended"].append({
                "type": "primary_care",
                "priority": "high", 
                "reason": "High risk profile requires medical evaluation",
                "before_starting": True
            })
    
    # Validate readiness matches risk level
    risk_readiness_mapping = {
        "low": ["low", "moderate"],
        "moderate": ["low", "moderate"], 
        "high": ["low"],
        "very_high": ["low"]
    }
    
    current_risk = analysis.get("risk_level", "low")
    current_readiness = analysis.get("overall_readiness_level", "low")
    
    if current_readiness not in risk_readiness_mapping.get(current_risk, ["low"]):
        logger.warning(f"Adjusting readiness level from {current_readiness} to match risk level {current_risk}")
        analysis["overall_readiness_level"] = "low"
    
    return analysis

def generate_progress_monitoring_plan(state: WellnessOrchestratorState) -> Dict[str, Any]:
    """
    Generate a safe progress monitoring and check-in plan
    """
    analysis = state.get("analysis_result", {})
    risk_level = analysis.get("risk_level", "low")
    
    monitoring_plan = {
        "check_in_frequency": "weekly",
        "key_metrics_to_monitor": [
            "Energy levels throughout the day",
            "Sleep quality and duration", 
            "Any unusual symptoms or discomfort",
            "Ability to complete planned activities",
            "Overall mood and wellbeing"
        ],
        "warning_signs_to_watch": [
            "Persistent fatigue beyond normal exercise tiredness",
            "Chest pain or unusual shortness of breath",
            "Dizziness or lightheadedness", 
            "Nausea or digestive issues",
            "Joint or muscle pain beyond normal soreness",
            "Sleep disturbances or mood changes"
        ],
        "when_to_seek_help": [
            "Any warning signs persist for more than 1-2 days",
            "Symptoms worsen instead of improve", 
            "New symptoms develop",
            "Difficulty maintaining basic daily activities",
            "Concerning changes in mood or mental state"
        ],
        "professional_check_ins": []
    }
    
    # Adjust based on risk level
    if risk_level in ["high", "very_high"]:
        monitoring_plan["check_in_frequency"] = "every 2-3 days initially"
        monitoring_plan["professional_check_ins"].append({
            "provider": "Primary Care Physician",
            "frequency": "Within 1 week of starting program, then monthly",
            "purpose": "Monitor response to increased activity and dietary changes"
        })
    elif risk_level == "moderate":
        monitoring_plan["professional_check_ins"].append({
            "provider": "Healthcare Provider",
            "frequency": "Within 2-3 weeks of starting",
            "purpose": "Ensure safe progress and address any concerns"
        })
    
    return monitoring_plan