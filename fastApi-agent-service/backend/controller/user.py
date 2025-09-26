from backend.models.HealthPlan import HealthPlan
from fastapi.encoders import jsonable_encoder
from backend.controller.agent import wellness_orchestrator
from backend.services.user import update_health_plan_status
from fastapi.responses import JSONResponse
from beanie import PydanticObjectId
from backend.utils.health_safety import HealthSafetyValidator, log_health_recommendation
from backend.constants.enums import HealthPlanStatus
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

async def chat_health_plan(plan_id: str, chat_data):
    """
    Interactive chat for health plan modifications and questions
    Enhanced safety measures for health-related conversations
    """
    try:
       
        health_plan = await HealthPlan.find_one({"_id": PydanticObjectId(plan_id)})
        if not health_plan:
            return JSONResponse(
                {"success": False, "message": "Health plan not found"},
                status_code=404
            )

        
        if health_plan.status != HealthPlanStatus.ACTIVE:
            return JSONResponse(
                {"success": False, "message": f"Cannot modify {health_plan.status.value} health plan"},
                status_code=400
            )

        
        user_message = chat_data.message.lower()
        concerning_keywords = [
            "chest pain", "severe pain", "can't breathe", "dizzy", "nauseous",
            "injured", "hurt", "emergency", "hospital", "bleeding", "fainted"
        ]

        if any(keyword in user_message for keyword in concerning_keywords):
            logger.warning(f"Concerning symptoms mentioned in chat for plan {plan_id}: {chat_data.message}")
            return JSONResponse(
                {
                    "success": False,
                    "message": "Based on your message, please seek immediate medical attention if you're experiencing concerning symptoms. For non-emergency questions, please consult with your healthcare provider.",
                    "urgent_consultation_recommended": True,
                    "emergency_resources": {
                        "emergency_number": "911 (US)",
                        "poison_control": "1-800-222-1222 (US)",
                        "crisis_text": "Text HOME to 741741"
                    }
                },
                status_code=400
            )

        
        context = {
            "user_message": chat_data.message,
            "current_plan": {
                "plan_name": health_plan.plan_name,
                "primary_goal": health_plan.primary_goal,
                "current_week": health_plan.current_week,
                "total_weeks": health_plan.plan_duration_weeks,
                "activity_level": health_plan.current_activity_level,
                "health_conditions": health_plan.health_conditions,
                "dietary_restrictions": health_plan.dietary_restrictions
            },
            "safety_profile": {
                "medical_clearance": health_plan.medical_clearance,
                "age": health_plan.age,
                "disclaimer_acknowledged": health_plan.health_disclaimer_acknowledged
            }
        }

       
        result_state = await wellness_orchestrator(
            user_profile={
                "user_id": str(health_plan.user_id),
                "age": health_plan.age,
                "current_activity_level": health_plan.current_activity_level,
                "primary_goal": health_plan.primary_goal,
                "time_availability_minutes": health_plan.time_availability_minutes,
                "preferred_workout_types": health_plan.preferred_workout_types,
                "available_equipment": health_plan.available_equipment,
            },
            health_conditions=health_plan.health_conditions,
            dietary_restrictions=health_plan.dietary_restrictions,
            medical_clearance=health_plan.medical_clearance,
            operation_type="modify_plan"
        )

        
        response_data = {
            "success": True,
            "response": generate_safe_health_response(chat_data.message, context, result_state),
            "plan_modifications": result_state.get("plan_modifications", {}),
            "safety_notes": result_state.get("safety_notes", []),
            "professional_consultation_recommended": bool(result_state.get("analysis_result", {}).get("professional_consultations_recommended"))
        }

        
        log_health_recommendation(
            user_id=str(health_plan.user_id),
            recommendation_type="health_chat_response",
            safety_check={"user_message": chat_data.message, "response_safe": True}
        )

        
        health_plan.last_accessed_at = datetime.utcnow()
        await health_plan.save()

        logger.info(f"Health plan chat response generated for plan {plan_id}")
        return JSONResponse(response_data, status_code=200)

    except Exception as e:
        logger.error(f"Error in health plan chat: {str(e)}")
        return JSONResponse(
            {
                "success": False, 
                "message": "Unable to process your health question at this time. Please consult with healthcare professionals for immediate assistance.",
                "error_type": "system_error",
                "professional_consultation_recommended": True
            },
            status_code=500,
        )

async def get_health_plan_messages(plan_id: str):
    """
    Retrieve health plan conversation history with privacy protection
    """
    try:
        health_plan = await HealthPlan.find_one({"_id": PydanticObjectId(plan_id)})
        if not health_plan:
            return JSONResponse(
                {"success": False, "message": "Health plan not found"},
                status_code=404
            )

        
        sanitized_data = {
            "plan_id": str(health_plan.id),
            "plan_name": health_plan.plan_name,
            "created_at": health_plan.created_at.isoformat(),
            "last_accessed": health_plan.last_accessed_at.isoformat() if health_plan.last_accessed_at else None,
            "current_week": health_plan.current_week,
            "total_weeks": health_plan.plan_duration_weeks,
            "progress_notes_count": len(health_plan.progress_notes),
            "status": health_plan.status.value
        }

        return JSONResponse(
            {"success": True, "data": sanitized_data}, 
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error retrieving health plan messages: {str(e)}")
        return JSONResponse(
            {"success": False, "message": "Error retrieving conversation history"},
            status_code=500
        )

async def update_health_plan_progress(plan_id: str, progress_data):
    """
    Update health plan progress with comprehensive safety monitoring
    """
    try:
        health_plan = await HealthPlan.find_one({"_id": PydanticObjectId(plan_id)})
        if not health_plan:
            return JSONResponse(
                {"success": False, "message": "Health plan not found"},
                status_code=404
            )

        
        safety_validation = validate_progress_update_safety(progress_data, health_plan)
        if not safety_validation["is_safe"]:
            return JSONResponse(
                {
                    "success": False,
                    "message": "Safety concerns detected in progress update",
                    "safety_concerns": safety_validation["concerns"],
                    "professional_consultation_required": True
                },
                status_code=400
            )

        
        original_week = health_plan.current_week
        health_plan.current_week = min(progress_data.current_week, health_plan.plan_duration_weeks)
        
       
        if progress_data.progress_notes:
            timestamped_notes = [
                f"[{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}] {note}"
                for note in progress_data.progress_notes
            ]
            health_plan.progress_notes.extend(timestamped_notes)

       
        if hasattr(progress_data, 'completed_workouts'):
            
            pass 

        
        if health_plan.current_week >= health_plan.plan_duration_weeks:
            health_plan.status = HealthPlanStatus.COMPLETED
            logger.info(f"Health plan {plan_id} marked as completed")

        health_plan.updated_at = datetime.utcnow()
        await health_plan.save()

        
        try:
            update_result = update_health_plan_status({
                "plan_id": plan_id,
                "current_week": health_plan.current_week,
                "status": health_plan.status.value,
                "progress_percentage": (health_plan.current_week / health_plan.plan_duration_weeks) * 100
            })
            
            if not update_result.get("success"):
                logger.warning(f"Failed to sync progress with user service: {update_result}")
        except Exception as sync_error:
            logger.error(f"Error syncing with user service: {sync_error}")

        response_data = {
            "success": True,
            "message": "Progress updated successfully",
            "current_week": health_plan.current_week,
            "total_weeks": health_plan.plan_duration_weeks,
            "completion_percentage": (health_plan.current_week / health_plan.plan_duration_weeks) * 100,
            "status": health_plan.status.value,
            "safety_notes": safety_validation.get("recommendations", [])
        }

        logger.info(f"Progress updated for health plan {plan_id}: week {original_week} -> {health_plan.current_week}")
        return JSONResponse(response_data, status_code=200)

    except Exception as e:
        logger.error(f"Error updating health plan progress: {str(e)}")
        return JSONResponse(
            {"success": False, "message": "Error updating progress - please consult healthcare provider"},
            status_code=500
        )

async def pause_health_plan(plan_id: str, pause_data):
    """
    Safely pause a health plan with proper logging and safety checks
    """
    try:
        health_plan = await HealthPlan.find_one({"_id": PydanticObjectId(plan_id)})
        if not health_plan:
            return JSONResponse(
                {"success": False, "message": "Health plan not found"},
                status_code=404
            )

        if health_plan.status != HealthPlanStatus.ACTIVE:
            return JSONResponse(
                {"success": False, "message": f"Cannot pause {health_plan.status.value} health plan"},
                status_code=400
            )

        
        pause_reason = pause_data.reason.lower() if pause_data.reason else ""
        health_concerns = ["injury", "illness", "pain", "doctor", "medical", "hospital"]
        
        if any(concern in pause_reason for concern in health_concerns):
            logger.warning(f"Health-related pause for plan {plan_id}: {pause_data.reason}")
            health_plan.progress_notes.append(f"[PAUSE - HEALTH CONCERN] {pause_data.reason}")
        else:
            health_plan.progress_notes.append(f"[PAUSE] {pause_data.reason or 'User requested pause'}")

        health_plan.status = HealthPlanStatus.PAUSED
        health_plan.updated_at = datetime.utcnow()
        await health_plan.save()

        
        try:
            update_health_plan_status({
                "plan_id": plan_id,
                "status": health_plan.status.value,
                "pause_reason": pause_data.reason
            })
        except Exception as sync_error:
            logger.error(f"Error syncing pause with user service: {sync_error}")

        logger.info(f"Health plan {plan_id} paused: {pause_data.reason}")
        return JSONResponse(
            {
                "success": True,
                "message": "Health plan paused successfully",
                "status": health_plan.status.value,
                "can_resume": True,
                "recommendations": [
                    "Consult healthcare provider if pause is health-related",
                    "Resume when you're ready and have appropriate clearance",
                    "Consider professional guidance for safe re-entry"
                ]
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error pausing health plan: {str(e)}")
        return JSONResponse(
            {"success": False, "message": "Error pausing health plan"},
            status_code=500
        )

def generate_safe_health_response(user_message: str, context: dict, ai_result: dict) -> str:
    """
    Generate safe, conservative responses to health-related questions
    Always err on the side of professional consultation
    """
    
    base_response = """
    Thank you for your question about your health plan. Based on your current plan and profile, here are some general wellness considerations:

    {specific_guidance}

    IMPORTANT REMINDERS:
    - This is general wellness information, not medical advice
    - Always consult with healthcare professionals for medical concerns
    - Stop any activity that causes pain or discomfort
    - Your safety is the top priority

    If you're experiencing any concerning symptoms or have specific health questions, please consult with your healthcare provider.
    """

    
    analysis = ai_result.get("analysis_result", {})
    safety_level = analysis.get("risk_level", "moderate")
    
    if safety_level in ["high", "very_high"]:
        specific_guidance = "Based on your health profile, we recommend consulting with healthcare professionals before making any changes to your wellness routine."
    elif "exercise" in user_message.lower():
        specific_guidance = "For exercise modifications, ensure you maintain proper form, start gradually, and listen to your body. Consider working with a certified fitness professional."
    elif "diet" in user_message.lower() or "nutrition" in user_message.lower():
        specific_guidance = "For nutrition questions, focus on balanced, whole foods and adequate hydration. A registered dietitian can provide personalized guidance."
    else:
        specific_guidance = "Continue following your plan as designed, monitoring how you feel, and making gradual adjustments as needed."

    return base_response.format(specific_guidance=specific_guidance)

def validate_progress_update_safety(progress_data, health_plan) -> dict:
    """
    Validate progress updates for safety concerns
    """
    validation_result = {
        "is_safe": True,
        "concerns": [],
        "recommendations": []
    }

    
    week_jump = progress_data.current_week - health_plan.current_week
    if week_jump > 2:
        validation_result["concerns"].append("Rapid progression detected - ensure adequate recovery time")
        validation_result["recommendations"].append("Consider slowing progression for safety")

   
    if hasattr(progress_data, 'progress_notes') and progress_data.progress_notes:
        concerning_keywords = ["pain", "injury", "hurt", "dizzy", "nauseous", "exhausted"]
        for note in progress_data.progress_notes:
            if any(keyword in note.lower() for keyword in concerning_keywords):
                validation_result["is_safe"] = False
                validation_result["concerns"].append(f"Concerning symptom reported: {note}")
                validation_result["recommendations"].append("Consult healthcare provider before continuing")

   
    completion_pct = (progress_data.current_week / health_plan.plan_duration_weeks) * 100
    if completion_pct > 150:  
        validation_result["concerns"].append("Progress exceeds plan duration")
        validation_result["recommendations"].append("Consider plan revision or professional consultation")

    return validation_result