from langgraph.graph import StateGraph, END, START
from typing import TypedDict, Dict, Any
from backend.controller.agents.workout_plan_generator import generate_safe_workout_plan, validate_workout_safety_post_generation
from backend.controller.agents.meal_plan_generator import generate_safe_meal_plan, validate_meal_plan_nutrition, check_dietary_restriction_compliance
from backend.controller.agents.health_analyzer import analyze_user_health_profile, generate_progress_monitoring_plan
from backend.utils.health_safety import log_health_recommendation
import logging

logger = logging.getLogger(__name__)

class WellnessOrchestratorState(TypedDict):
    """State management for the wellness coaching orchestrator"""
    
    user_profile: dict
    health_conditions: list
    dietary_restrictions: list
    medical_clearance: bool
    health_documents: str  
    workout_plan: list
    meal_plan: list
    
    
    analysis_result: dict
    safety_notes: list
    disclaimers: list
    
    
    final_result: dict
    monitoring_plan: dict

async def wellness_orchestrator(
    user_profile: dict,
    health_conditions: list = None,
    dietary_restrictions: list = None,
    medical_clearance: bool = False,
    health_documents: str = "",
    operation_type: str = "create_plan"
) -> dict:
    """
    Main orchestrator for wellness coaching plans
    
    Args:
        user_profile: User's basic profile (age, activity level, goals, etc.)
        health_conditions: List of self-reported health conditions
        dietary_restrictions: List of dietary restrictions/preferences  
        medical_clearance: Whether user has confirmed medical clearance
        health_documents: Optional text from uploaded health documents
        operation_type: Type of operation ('create_plan', 'analyze_only', etc.)
    """
    graph = create_wellness_orchestrator_graph()

    initial_state = {
        "user_profile": user_profile,
        "health_conditions": health_conditions or [],
        "dietary_restrictions": dietary_restrictions or [],
        "medical_clearance": medical_clearance,
        "health_documents": health_documents,
        "workout_plan": [],
        "meal_plan": [],
        "analysis_result": {},
        "safety_notes": [],
        "disclaimers": [],
        "final_result": {},
        "monitoring_plan": {}
    }
    

    log_health_recommendation(
        user_id=user_profile.get("user_id", "anonymous"),
        recommendation_type=operation_type,
        safety_check={"user_profile": user_profile, "health_conditions": health_conditions}
    )

    return await graph.ainvoke(initial_state)

def route_based_on_health_analysis(state: WellnessOrchestratorState) -> str:
    """
    Route the workflow based on health analysis results
    Safety-first routing that prioritizes professional consultation over AI plans
    """
    analysis = state.get("analysis_result", {})
    risk_level = analysis.get("risk_level", "very_high")  
    proceed_with_ai = analysis.get("proceed_with_ai_plan", False)
    
    
    logger.info(f"Health analysis routing - Risk: {risk_level}, Proceed: {proceed_with_ai}")
    
    
    if risk_level in ["very_high", "high"] or not proceed_with_ai:
        logger.warning("High risk detected - routing to professional consultation recommendation")
        return "generate_consultation_plan"
    elif risk_level == "moderate":
        logger.info("Moderate risk - proceeding with enhanced safety measures")
        return "generate_plans_with_enhanced_safety"
    else:
        logger.info("Low risk - proceeding with standard safety measures")  
        return "generate_plans_with_standard_safety"

def generate_plans_with_standard_safety(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """Generate workout and meal plans with standard safety measures"""
    try:
        state = generate_safe_workout_plan(state)
        
        
        workout_safety = validate_workout_safety_post_generation(state["workout_plan"])
        if not workout_safety["is_safe"]:
            logger.warning(f"Workout plan safety issues: {workout_safety['warnings']}")
            state["safety_notes"].extend(workout_safety["warnings"])
        
        
        state = generate_safe_meal_plan(state)
        
        
        meal_safety = validate_meal_plan_nutrition(state["meal_plan"])
        if not meal_safety["is_nutritionally_safe"]:
            logger.warning(f"Meal plan safety issues: {meal_safety['warnings']}")
            state["safety_notes"].extend(meal_safety["warnings"])
        
       
        dietary_compliance = check_dietary_restriction_compliance(
            state["meal_plan"], 
            state["dietary_restrictions"]
        )
        if not dietary_compliance["is_compliant"]:
            logger.error(f"Dietary restriction violations: {dietary_compliance['violations']}")
            state["safety_notes"].extend([f"DIETARY VIOLATION: {v}" for v in dietary_compliance["violations"]])
        
        state["safety_notes"].append("Plans generated with standard safety protocols")
        
        return state
        
    except Exception as e:
        logger.error(f"Error generating plans with standard safety: {e}")
        return generate_consultation_plan(state)

def generate_plans_with_enhanced_safety(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """Generate plans with enhanced safety measures for moderate risk users"""
    try:
        
        profile = state["user_profile"]
        
        
        original_time = profile.get("time_availability_minutes", 60)
        profile["time_availability_minutes"] = min(original_time, 45)  
        
      
        if profile.get("current_activity_level") in ["very_active", "extremely_active"]:
            profile["current_activity_level"] = "moderately_active"
            state["safety_notes"].append("Activity level adjusted downward for safety")
        
       
        state = generate_safe_workout_plan(state)
        state = generate_safe_meal_plan(state)
        
       
        workout_safety = validate_workout_safety_post_generation(state["workout_plan"])
        meal_safety = validate_meal_plan_nutrition(state["meal_plan"])
        
        if not workout_safety["is_safe"] or not meal_safety["is_nutritionally_safe"]:
            logger.warning("Enhanced safety plans still have issues - routing to consultation")
            return generate_consultation_plan(state)
        
        state["safety_notes"].extend([
            "Plans generated with enhanced safety protocols for moderate risk profile",
            "Conservative approach taken due to health profile assessment",
            "Regular professional check-ins strongly recommended"
        ])
        
        return state
        
    except Exception as e:
        logger.error(f"Error generating enhanced safety plans: {e}")
        return generate_consultation_plan(state)

def generate_consultation_plan(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """
    Generate professional consultation recommendations instead of AI plans
    This is the safety fallback for high-risk users
    """
    analysis = state.get("analysis_result", {})
    
    consultation_plan = {
        "type": "professional_consultation_required",
        "message": "Based on your health profile, we recommend professional consultation before proceeding with fitness and nutrition plans.",
        "required_consultations": analysis.get("professional_consultations_recommended", [
            {
                "type": "Primary Care Physician",
                "priority": "high",
                "reason": "Comprehensive health assessment needed",
                "before_starting": True
            }
        ]),
        "safety_concerns": analysis.get("primary_safety_concerns", [
            "Health profile requires professional medical evaluation"
        ]),
        "next_steps": [
            "Schedule appointment with primary care physician",
            "Discuss fitness and nutrition goals with healthcare provider", 
            "Request medical clearance for exercise program",
            "Consider consultation with registered dietitian",
            "Return to our service with professional clearance"
        ],
        "interim_recommendations": [
            "Continue current safe activities as tolerated",
            "Focus on maintaining current nutrition without major changes",
            "Monitor health symptoms and report concerns to healthcare provider",
            "Avoid starting new exercise or diet programs until cleared"
        ]
    }
    
    state["final_result"] = consultation_plan
    state["workout_plan"] = [] 
    state["meal_plan"] = []
    
    state["safety_notes"].append("Professional consultation required - AI plans not generated")
    state["disclaimers"].extend([
        "This assessment indicates that professional medical consultation is necessary before proceeding.",
        "AI-generated health plans are not appropriate for your current health profile.",
        "Please consult with qualified healthcare professionals for personalized guidance."
    ])
    
    logger.info("Generated professional consultation plan for high-risk user")
    
    return state

def finalize_wellness_plan(state: WellnessOrchestratorState) -> WellnessOrchestratorState:
    """
    Finalize the wellness plan with all safety information and monitoring recommendations
    """
    
    monitoring_plan = generate_progress_monitoring_plan(state)
    state["monitoring_plan"] = monitoring_plan
    

    if state.get("final_result", {}).get("type") == "professional_consultation_required":
        return state
    
    
    final_result = {
        "type": "wellness_plan_generated",
        "message": "Wellness plan generated with appropriate safety measures",
        "workout_plan": state["workout_plan"],
        "meal_plan": state["meal_plan"],
        "health_analysis": state["analysis_result"],
        "monitoring_plan": monitoring_plan,
        "safety_notes": list(set(state["safety_notes"])),  
        "disclaimers": list(set(state["disclaimers"])),
        "plan_duration_weeks": 4,  
        "revision_recommended_after": "2 weeks",
        "professional_check_in_recommended": True
    }
    
    state["final_result"] = final_result
    
    logger.info("Wellness plan finalized successfully")
    
    return state

def create_wellness_orchestrator_graph():
    """Create the LangGraph workflow for wellness coaching orchestration"""
    graph = StateGraph(WellnessOrchestratorState)

   
    graph.add_node("analyze_health_profile", analyze_user_health_profile)
    graph.add_node("generate_plans_with_standard_safety", generate_plans_with_standard_safety)
    graph.add_node("generate_plans_with_enhanced_safety", generate_plans_with_enhanced_safety)
    graph.add_node("generate_consultation_plan", generate_consultation_plan)
    graph.add_node("finalize_wellness_plan", finalize_wellness_plan)

    
    graph.add_edge(START, "analyze_health_profile")
    
    
    graph.add_conditional_edges(
        "analyze_health_profile", 
        route_based_on_health_analysis,
        {
            "generate_plans_with_standard_safety": "generate_plans_with_standard_safety",
            "generate_plans_with_enhanced_safety": "generate_plans_with_enhanced_safety", 
            "generate_consultation_plan": "generate_consultation_plan"
        }
    )

    
    graph.add_edge("generate_plans_with_standard_safety", "finalize_wellness_plan")
    graph.add_edge("generate_plans_with_enhanced_safety", "finalize_wellness_plan")
    graph.add_edge("generate_consultation_plan", "finalize_wellness_plan")
    graph.add_edge("finalize_wellness_plan", END)

    return graph.compile()