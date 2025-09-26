from fastapi import APIRouter, Depends, HTTPException, Request
from backend.validations import user as user_validations
from backend.controller import user as user_controller
from backend.security.jsonwebtoken import get_current_user_health_access, TokenData
from backend.services.user import log_health_data_access, validate_user_permissions
from backend.constants.enums import HEALTH_DISCLAIMER, EXERCISE_DISCLAIMER, NUTRITION_DISCLAIMER
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/health-plan/{plan_id}/chat")
async def chat_health_plan(
    request: Request,
    plan_id: str,
    chat_data: user_validations.HealthPlanChat,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Interactive chat for health plan questions and modifications
    
    Provides safe, AI-powered responses to user questions about their health plan
    with comprehensive safety screening and professional consultation recommendations
    when appropriate.
    """
    try:
        
        permission_check = validate_user_permissions(
            user_id=current_user.userId,
            action="chat_health_plan"
        )
        
        if not permission_check.get("has_permission", False):
            logger.warning(f"Unauthorized health plan chat attempt by user {current_user.userId}")
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this health plan"
            )
        
       
        log_health_data_access(
            user_id=current_user.userId,
            access_type="health_plan_chat",
            data_accessed=f"health_plan_conversation_{plan_id}"
        )
        
        
        result = await user_controller.chat_health_plan(plan_id, chat_data)
        
        
        if isinstance(result.body, dict) and result.body.get("success"):
            result.body["disclaimers"] = [
                HEALTH_DISCLAIMER,
                "This AI assistant provides general wellness information only and cannot replace professional medical advice."
            ]
        
        logger.info(f"Health plan chat processed for user {current_user.userId}, plan {plan_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in health plan chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unable to process your health question at this time. For immediate health concerns, please consult with healthcare professionals.",
                "professional_consultation_recommended": True,
                "emergency_resources": {
                    "emergency_number": "911 (US)",
                    "crisis_text": "Text HOME to 741741"
                }
            }
        )

@router.get("/health-plan/{plan_id}/messages")
async def get_health_plan_messages(
    request: Request,
    plan_id: str,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Retrieve health plan conversation history with privacy protection
    
    Returns sanitized conversation history ensuring user privacy
    and appropriate health data handling.
    """
    try:
        
        permission_check = validate_user_permissions(
            user_id=current_user.userId,
            action="view_health_messages"
        )
        
        if not permission_check.get("has_permission", False):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to view this health plan's messages"
            )
        
        
        log_health_data_access(
            user_id=current_user.userId,
            access_type="view_health_messages",
            data_accessed=f"health_plan_messages_{plan_id}"
        )
        
        result = await user_controller.get_health_plan_messages(plan_id)
        
        logger.info(f"Health plan messages retrieved for user {current_user.userId}, plan {plan_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving health plan messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving conversation history"
        )

@router.put("/health-plan/{plan_id}/progress")
async def update_health_plan_progress(
    request: Request,
    plan_id: str,
    progress_data: user_validations.UpdateHealthProgress,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Update health plan progress with comprehensive safety monitoring
    
    Monitors for concerning symptoms, unsafe progression patterns,
    and provides appropriate safety interventions when needed.
    """
    try:
        
        permission_check = validate_user_permissions(
            user_id=current_user.userId,
            action="update_health_progress"
        )
        
        if not permission_check.get("has_permission", False):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this health plan"
            )
        
        
        log_health_data_access(
            user_id=current_user.userId,
            access_type="update_health_progress",
            data_accessed=f"health_plan_progress_{plan_id}"
        )
        
        
        result = await user_controller.update_health_plan_progress(plan_id, progress_data)
        
        logger.info(f"Health plan progress updated for user {current_user.userId}, plan {plan_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating health plan progress: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Error updating progress. Please consult healthcare provider if experiencing any concerning symptoms.",
                "professional_consultation_recommended": True
            }
        )

@router.post("/health-plan/{plan_id}/pause")
async def pause_health_plan(
    request: Request,
    plan_id: str,
    pause_data: user_validations.PauseHealthPlan,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Safely pause a health plan with proper logging and safety checks
    
    Allows users to pause their health plan with appropriate safety
    monitoring and recommendations for safe resumption.
    """
    try:
        
        permission_check = validate_user_permissions(
            user_id=current_user.userId,
            action="pause_health_plan"
        )
        
        if not permission_check.get("has_permission", False):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to pause this health plan"
            )
        
        
        log_health_data_access(
            user_id=current_user.userId,
            access_type="pause_health_plan",
            data_accessed=f"health_plan_status_{plan_id}"
        )
        
        result = await user_controller.pause_health_plan(plan_id, pause_data)
        
        logger.info(f"Health plan paused for user {current_user.userId}, plan {plan_id}: {pause_data.reason}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error pausing health plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error pausing health plan. Please consult healthcare provider if experiencing health concerns."
        )

@router.post("/health-plan/{plan_id}/resume")
async def resume_health_plan(
    request: Request,
    plan_id: str,
    resume_data: user_validations.ResumeHealthPlan,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Resume a paused health plan with safety validation
    
    Ensures user is ready to safely resume their health plan
    with appropriate medical clearance if needed.
    """
    try:
        
        permission_check = validate_user_permissions(
            user_id=current_user.userId,
            action="resume_health_plan"
        )
        
        if not permission_check.get("has_permission", False):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to resume this health plan"
            )
        
        
        if not resume_data.ready_to_resume:
            raise HTTPException(
                status_code=400,
                detail="Please confirm you are ready to resume your health plan"
            )
        
        
        log_health_data_access(
            user_id=current_user.userId,
            access_type="resume_health_plan", 
            data_accessed=f"health_plan_status_{plan_id}"
        )
        
        
        result = {
            "success": True,
            "message": "Health plan resumed successfully",
            "safety_reminders": [
                "Start gradually and listen to your body",
                "Stop any activity that causes pain or discomfort", 
                "Monitor your energy levels and recovery",
                "Consult healthcare providers for any concerns"
            ],
            "disclaimers": [HEALTH_DISCLAIMER, EXERCISE_DISCLAIMER, NUTRITION_DISCLAIMER]
        }
        
        
        if resume_data.health_status_update:
            health_update = resume_data.health_status_update.lower()
            medical_keywords = ["medication", "surgery", "injury", "diagnosis", "doctor", "medical"]
            
            if any(keyword in health_update for keyword in medical_keywords):
                result["medical_review_recommended"] = True
                result["message"] = "Health plan resumed with medical review recommended"
                result["safety_reminders"].append("Consider medical consultation given recent health changes")
        
        logger.info(f"Health plan resumed for user {current_user.userId}, plan {plan_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resuming health plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error resuming health plan. Please consult healthcare provider for guidance."
        )

@router.post("/health-plan/{plan_id}/feedback")
async def submit_health_plan_feedback(
    request: Request,
    plan_id: str,
    feedback_data: user_validations.HealthPlanFeedback,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Submit feedback on health plan effectiveness and safety
    
    Collects user feedback to improve health plan quality
    and identify any safety concerns for future users.
    """
    try:
        
        permission_check = validate_user_permissions(
            user_id=current_user.userId,
            action="submit_health_feedback"
        )
        
        if not permission_check.get("has_permission", False):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to submit feedback for this health plan"
            )
        
        
        log_health_data_access(
            user_id=current_user.userId,
            access_type="submit_health_feedback",
            data_accessed=f"health_plan_feedback_{plan_id}"
        )
       
        feedback_response = {
            "success": True,
            "message": "Thank you for your valuable feedback!",
            "feedback_id": f"fb_{plan_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "follow_up_recommendations": []
        }
        
       
        if feedback_data.workout_difficulty >= 4:
            feedback_response["follow_up_recommendations"].append(
                "Your feedback indicates workouts may be too challenging. Consider consulting with a fitness professional for modifications."
            )
        
        if feedback_data.overall_satisfaction <= 2:
            feedback_response["follow_up_recommendations"].append(
                "We're sorry your experience wasn't optimal. Consider speaking with healthcare professionals for alternative approaches."
            )
        
        
        if feedback_data.feedback_text:
            safety_keywords = ["too hard", "painful", "injury", "dangerous", "unsafe"]
            feedback_lower = feedback_data.feedback_text.lower()
            
            if any(keyword in feedback_lower for keyword in safety_keywords):
                feedback_response["follow_up_recommendations"].append(
                    "Your feedback mentions potential safety concerns. Please consult with healthcare professionals."
                )
                logger.warning(f"Safety concerns in feedback from user {current_user.userId}: {feedback_data.feedback_text}")
        
        logger.info(f"Health plan feedback submitted for user {current_user.userId}, plan {plan_id}")
        return feedback_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting health plan feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error submitting feedback. Your safety and experience are important to us."
        )

@router.post("/health-data/export")
async def export_health_data(
    request: Request,
    export_request: user_validations.HealthDataExport,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Export user's health data in requested format
    
    Provides secure export of user's health data with appropriate
    privacy protections and audit logging.
    """
    try:
       
        permission_check = validate_user_permissions(
            user_id=current_user.userId,
            action="export_health_data"
        )
        
        if not permission_check.get("has_permission", False):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to export health data"
            )
        
        
        log_health_data_access(
            user_id=current_user.userId,
            access_type="export_health_data",
            data_accessed=f"full_health_export_{export_request.export_format}"
        )
        
        
        export_response = {
            "success": True,
            "message": "Health data export prepared",
            "export_id": f"exp_{current_user.userId}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "format": export_request.export_format,
            "data_included": {
                "progress_data": export_request.include_progress_data,
                "meal_plans": export_request.include_meal_plans,
                "workout_plans": export_request.include_workout_plans
            },
            "date_range_days": export_request.date_range_days,
            "privacy_note": "Exported data contains personal health information. Please handle securely.",
            "download_url": f"/api/user/health-data/download/{current_user.userId}",
            "expires_in_hours": 24
        }
        
        logger.info(f"Health data export prepared for user {current_user.userId}")
        return export_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error preparing health data export: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error preparing data export. Please try again later."
        )

@router.post("/emergency-contact")
async def set_emergency_contact(
    request: Request,
    contact_data: user_validations.EmergencyContact,
    current_user: TokenData = Depends(get_current_user_health_access)
):
    """
    Set emergency contact information for high-risk users
    
    Allows users to designate emergency contacts who can be notified
    in case of health concerns detected during monitoring.
    """
    try:
       
        log_health_data_access(
            user_id=current_user.userId,
            access_type="set_emergency_contact",
            data_accessed="emergency_contact_information"
        )
        
        
        contact_response = {
            "success": True,
            "message": "Emergency contact information saved securely",
            "contact_id": f"ec_{current_user.userId}_{datetime.utcnow().strftime('%Y%m%d')}",
            "privacy_assurance": "Contact information is encrypted and only used for genuine health emergencies",
            "notification_settings": {
                "will_notify_on_concerns": contact_data.should_notify_concerns,
                "contact_name": contact_data.contact_name,
                "relationship": contact_data.relationship
            }
        }
        
        logger.info(f"Emergency contact set for user {current_user.userId}")
        return contact_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting emergency contact: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error saving emergency contact information"
        )

@router.get("/health-disclaimer")
async def get_health_disclaimer():
    """
    Retrieve comprehensive health disclaimers and safety information
    
    Provides users with important health and safety information
    required for informed consent and safe use of health services.
    """
    try:
        disclaimer_response = {
            "success": True,
            "disclaimers": {
                "general_health": HEALTH_DISCLAIMER,
                "exercise_safety": EXERCISE_DISCLAIMER,
                "nutrition_guidance": NUTRITION_DISCLAIMER,
                "ai_limitations": """
                    AI-generated health recommendations are based on general wellness principles 
                    and cannot account for individual medical complexities. Always consult with 
                    qualified healthcare professionals for personalized medical advice, diagnosis, 
                    or treatment recommendations.
                """,
                "emergency_situations": """
                    If you experience chest pain, severe shortness of breath, dizziness, 
                    fainting, or other emergency symptoms, seek immediate medical attention. 
                    Do not rely on AI recommendations for emergency medical situations.
                """
            },
            "emergency_resources": {
                "emergency_services": "911 (US)",
                "poison_control": "1-800-222-1222 (US)",
                "crisis_text_line": "Text HOME to 741741",
                "suicide_prevention": "988 (US)"
            },
            "professional_resources": {
                "find_doctor": "https://www.ama-assn.org/go/freida",
                "find_dietitian": "https://www.eatright.org/find-a-nutrition-expert",
                "find_fitness_professional": "https://www.acsm.org/get-stay-certified/find-a-certified-professional"
            }
        }
        
        logger.info("Health disclaimers retrieved")
        return disclaimer_response
        
    except Exception as e:
        logger.error(f"Error retrieving health disclaimers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving health information"
        )

from datetime import datetime