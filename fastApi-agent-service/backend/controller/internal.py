import requests
from fastapi.responses import JSONResponse
from backend.utils.file_reader import read_file_safely_from_bytes
from backend.controller.agent import wellness_orchestrator
from backend.utils.health_safety import HealthSafetyValidator, log_health_recommendation
from backend.constants.enums import ActivityLevel, Goal, DietaryRestriction
import json
import logging
import traceback
from datetime import datetime

logger = logging.getLogger(__name__)

async def create_health_plan(health_plan_data):
    """
    Create a comprehensive health and wellness plan using AI orchestration
    Returns plan data for the User Service to save - does NOT save to database
    This is a microservice that generates plans, User Service handles persistence
    """
    try:
        logger.info(f"[AGENT-INTERNAL] ===== CREATE HEALTH PLAN START =====")
        logger.info(f"[AGENT-INTERNAL] User ID: {health_plan_data.user_id}")
        logger.info(f"[AGENT-INTERNAL] Plan name: {health_plan_data.plan_name}")
        
        # Process health documents if provided
        health_documents_text = ""
        if health_plan_data.health_documents:
            try:
                logger.info(f"[AGENT-INTERNAL] Processing health documents from URL: {health_plan_data.health_documents}")
                response = requests.get(health_plan_data.health_documents, timeout=30)
                if response.status_code == 200:
                    health_docs_bytes = response.content
                    filename = health_plan_data.health_documents.split("/")[-1]
                    health_documents_text = read_file_safely_from_bytes(health_docs_bytes, filename)
                    logger.info(f"[AGENT-INTERNAL] Health documents processed successfully")
                else:
                    logger.warning(f"[AGENT-INTERNAL] Could not retrieve health documents: {response.status_code}")
                    return JSONResponse(
                        {"success": False, "message": "Could not retrieve the uploaded health documents"},
                        status_code=400,
                    )
            except requests.RequestException as e:
                logger.error(f"[AGENT-INTERNAL] Error fetching health documents: {e}")
                return JSONResponse(
                    {"success": False, "message": "Error processing health documents"},
                    status_code=400,
                )

        # Prepare user profile
        user_profile = {
            "user_id": str(health_plan_data.user_id),
            "age": health_plan_data.age,
            "current_activity_level": health_plan_data.current_activity_level,
            "primary_goal": health_plan_data.primary_goal,
            "time_availability_minutes": health_plan_data.time_availability_minutes,
            "preferred_workout_types": health_plan_data.preferred_workout_types or [],
            "available_equipment": health_plan_data.available_equipment or [],
        }

        logger.info(f"[AGENT-INTERNAL] User profile created:")
        logger.info(f"- Age: {user_profile['age']}")
        logger.info(f"- Activity Level: {user_profile['current_activity_level']}")
        logger.info(f"- Primary Goal: {user_profile['primary_goal']}")
        logger.info(f"- Time Availability: {user_profile['time_availability_minutes']} minutes")

        # Validate user profile safety
        profile_safety = HealthSafetyValidator.validate_user_profile_safety({
            "age": health_plan_data.age,
            "primary_goal": health_plan_data.primary_goal,
            "health_conditions": health_plan_data.health_conditions or [],
            "current_activity_level": health_plan_data.current_activity_level
        })

        logger.info(f"[AGENT-INTERNAL] Profile safety check:")
        logger.info(f"- Is safe: {profile_safety.get('is_safe', True)}")
        logger.info(f"- Risk level: {profile_safety.get('risk_level', 'low')}")
        logger.info(f"- Concerns: {profile_safety.get('concerns', [])}")

        # Log health recommendation
        log_health_recommendation(
            user_id=str(health_plan_data.user_id),
            recommendation_type="health_plan_creation",
            safety_check=profile_safety
        )

        # Check if profile is safe for AI plan generation
        if not profile_safety.get("is_safe", True):
            logger.warning(f"[AGENT-INTERNAL] High-risk profile detected for user {health_plan_data.user_id}")
            logger.warning(f"[AGENT-INTERNAL] Safety concerns: {profile_safety.get('concerns', [])}")
            
            return JSONResponse(
                {
                    "success": False,
                    "message": "Based on your health profile, we recommend consulting with healthcare professionals before creating an AI-generated plan.",
                    "safety_concerns": profile_safety.get("concerns", []),
                    "recommendations": profile_safety.get("recommendations", []),
                    "require_professional_consultation": True
                },
                status_code=400,
            )

        # Call wellness orchestrator to generate plan
        logger.info(f"[AGENT-INTERNAL] Calling wellness orchestrator...")
        result_state = await wellness_orchestrator(
            user_profile=user_profile,
            health_conditions=health_plan_data.health_conditions or [],
            dietary_restrictions=health_plan_data.dietary_restrictions or [],
            medical_clearance=health_plan_data.medical_clearance,
            health_documents=health_documents_text,
            operation_type="create_plan"
        )

        logger.info(f"[AGENT-INTERNAL] Wellness orchestrator completed")
        logger.info(f"[AGENT-INTERNAL] Final result type: {result_state.get('final_result', {}).get('type')}")

        # Check if professional consultation is required
        final_result = result_state.get("final_result", {})
        if final_result.get("type") == "professional_consultation_required":
            logger.info(f"[AGENT-INTERNAL] Professional consultation recommended for user {health_plan_data.user_id}")
            
            return JSONResponse(
                {
                    "success": False,
                    "message": final_result.get("message"),
                    "consultation_plan": final_result,
                    "require_professional_consultation": True
                },
                status_code=202,  # 202 Accepted - indicates consultation needed
            )

        # Extract plan components
        workout_plan = result_state.get("workout_plan", [])
        meal_plan = result_state.get("meal_plan", [])
        analysis_result = result_state.get("analysis_result", {})
        safety_notes = result_state.get("safety_notes", [])
        disclaimers = result_state.get("disclaimers", [])

        logger.info(f"[AGENT-INTERNAL] Plan components extracted:")
        logger.info(f"- Workout plan days: {len(workout_plan)}")
        logger.info(f"- Meal plan days: {len(meal_plan)}")
        logger.info(f"- Safety notes: {len(safety_notes)}")

        # CRITICAL: Final validation to ensure all data is clean
        logger.info(f"[AGENT-INTERNAL] Performing final data validation...")
        
        # Validate workout plan structure
        for idx, day in enumerate(workout_plan):
            # Ensure rest days don't have intensity_level
            if day.get('rest_day', False):
                if 'intensity_level' in day:
                    logger.warning(f"[AGENT-INTERNAL] Removing intensity_level from rest day {day.get('day')}")
                    del day['intensity_level']
            
            # Validate exercises exist
            if 'exercises' not in day:
                day['exercises'] = []
            
            # Log any potential issues
            if not day.get('rest_day', False) and len(day.get('exercises', [])) == 0:
                logger.warning(f"[AGENT-INTERNAL] Day {day.get('day')} is not a rest day but has no exercises")
        
        # Deduplicate safety notes and disclaimers
        safety_notes = list(dict.fromkeys(safety_notes))  # Remove duplicates while preserving order
        disclaimers = list(dict.fromkeys(disclaimers))
        
        logger.info(f"[AGENT-INTERNAL] Validation complete - data ready for Node.js")

        # MICROSERVICE ARCHITECTURE: Return plan data, don't save to database
        # The Node.js User Service is responsible for saving to its MongoDB
        response_data = {
            "success": True,
            "message": "Health and wellness plan created successfully with appropriate safety measures",
            "plan_data": {
                "plan_name": health_plan_data.plan_name or "AI-Generated Wellness Plan",
                "user_id": str(health_plan_data.user_id),
                "age": health_plan_data.age,
                "current_activity_level": health_plan_data.current_activity_level,
                "primary_goal": health_plan_data.primary_goal,
                "dietary_restrictions": health_plan_data.dietary_restrictions or [],
                "health_conditions": health_plan_data.health_conditions or [],
                "preferred_workout_types": health_plan_data.preferred_workout_types or [],
                "available_equipment": health_plan_data.available_equipment or [],
                "time_availability_minutes": health_plan_data.time_availability_minutes,
                "workout_plan": workout_plan,  # Already normalized in workout_plan_generator
                "meal_plan": meal_plan,
                "plan_duration_weeks": final_result.get("plan_duration_weeks", 4),
                "health_disclaimer_acknowledged": health_plan_data.health_disclaimer_acknowledged,
                "medical_clearance": health_plan_data.medical_clearance,
            },
            "plan_summary": {
                "plan_name": health_plan_data.plan_name or "AI-Generated Wellness Plan",
                "duration_weeks": final_result.get("plan_duration_weeks", 4),
                "workout_days_per_week": len([w for w in workout_plan if not w.get("rest_day", False)]),
                "daily_meal_plans": len(meal_plan),
                "primary_goal": health_plan_data.primary_goal,
                "risk_level": analysis_result.get("risk_level", "low"),
            },
            "safety_information": {
                "safety_notes": safety_notes,
                "disclaimers": disclaimers,
                "professional_consultations_recommended": analysis_result.get("professional_consultations_recommended", []),
                "monitoring_plan": result_state.get("monitoring_plan", {}),
                "health_analysis": analysis_result
            },
            "next_steps": [
                "Review all safety information and disclaimers",
                "Start with the recommended monitoring approach",
                "Follow the gradual progression outlined in your plan",
                "Consult healthcare professionals as recommended",
                "Track your progress and adjust as needed"
            ]
        }

        logger.info(f"[AGENT-INTERNAL] ===== CREATE HEALTH PLAN SUCCESS =====")
        return JSONResponse(response_data, status_code=201)

    except ValueError as ve:
        # Handle validation errors
        logger.error(f"[AGENT-INTERNAL] Validation error: {str(ve)}")
        logger.error(f"[AGENT-INTERNAL] Traceback: {traceback.format_exc()}")
        
        return JSONResponse(
            {
                "success": False, 
                "message": "Invalid data provided for health plan creation",
                "error": str(ve),
                "error_type": "validation_error"
            },
            status_code=400,
        )
    
    except Exception as e:
        # Handle all other errors
        logger.error(f"[AGENT-INTERNAL] ===== CREATE HEALTH PLAN ERROR =====")
        logger.error(f"[AGENT-INTERNAL] Error: {str(e)}")
        logger.error(f"[AGENT-INTERNAL] Error type: {type(e).__name__}")
        logger.error(f"[AGENT-INTERNAL] Full traceback:\n{traceback.format_exc()}")
        
        # Log request data for debugging
        try:
            request_summary = {
                "user_id": str(health_plan_data.user_id),
                "age": health_plan_data.age,
                "primary_goal": health_plan_data.primary_goal,
                "current_activity_level": health_plan_data.current_activity_level
            }
            logger.error(f"[AGENT-INTERNAL] Request summary: {json.dumps(request_summary, indent=2)}")
        except Exception as log_error:
            logger.error(f"[AGENT-INTERNAL] Could not log request data: {log_error}")
        
        return JSONResponse(
            {
                "success": False, 
                "message": "An error occurred while creating your health plan. Please try again or consult with healthcare professionals.",
                "error": str(e) if logging.getLogger().level == logging.DEBUG else None,
                "error_type": "system_error"
            },
            status_code=500,
        )

async def update_health_plan_progress(plan_id: str, progress_data):
    """
    Update health plan progress with safety monitoring
    In microservice architecture, this would typically forward to User Service
    """
    try:
        logger.info(f"[AGENT-INTERNAL] Progress update request for plan: {plan_id}")
        
        # In microservice architecture, this endpoint might not be needed
        # Or it could forward the request to the User Service
        # For now, return success to indicate the Agent Service received it
        
        return JSONResponse(
            {
                "success": True,
                "message": "Progress update received - forward to User Service for persistence",
                "plan_id": plan_id
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"[AGENT-INTERNAL] Error processing progress update: {str(e)}")
        logger.error(f"[AGENT-INTERNAL] Traceback: {traceback.format_exc()}")
        
        return JSONResponse(
            {"success": False, "message": "Error processing progress update"},
            status_code=500
        )

async def get_health_plan_analytics(plan_id: str):
    """
    Get health plan analytics
    In microservice architecture, this would query the User Service
    """
    try:
        logger.info(f"[AGENT-INTERNAL] Analytics request for plan: {plan_id}")
        
        # In microservice architecture, this would typically query the User Service
        # which owns the data persistence layer
        
        return JSONResponse(
            {
                "success": True,
                "message": "Analytics request received - query User Service for data",
                "plan_id": plan_id
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"[AGENT-INTERNAL] Error retrieving analytics: {str(e)}")
        logger.error(f"[AGENT-INTERNAL] Traceback: {traceback.format_exc()}")
        
        return JSONResponse(
            {"success": False, "message": "Error retrieving analytics"},
            status_code=500
        )