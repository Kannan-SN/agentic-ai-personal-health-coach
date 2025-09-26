from fastapi import APIRouter, Depends, HTTPException, Request
from backend.validations import internal as internal_validations
from backend.controller import internal as internal_controller
from backend.middleware.verify_signature import verify_signature, validate_health_plan_request
from backend.services.user import log_health_data_access
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/create-health-plan")
async def create_health_plan(
    request: Request,
    health_plan_data: internal_validations.CreateHealthPlan, 
    signature_verified: dict = Depends(verify_signature)
):
    """
    Create a comprehensive health and wellness plan with AI-powered recommendations
    
    This endpoint handles the creation of personalized health plans including:
    - Workout routines with safety considerations
    - Meal plans with nutritional balance
    - Progress monitoring and safety protocols
    - Professional consultation recommendations when needed
    
    Enhanced security and safety measures are applied throughout the process.
    """
    try:
        
        health_validation = validate_health_plan_request(health_plan_data.dict())
        
        if not health_validation["is_valid"]:
            logger.warning(f"Health plan validation failed: {health_validation['errors']}")
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Health plan request failed safety validation",
                    "errors": health_validation["errors"],
                    "warnings": health_validation.get("warnings", []),
                    "professional_consultation_recommended": True
                }
            )
        
        
        if health_validation.get("warnings"):
            logger.warning(f"Health plan creation warnings for user {health_plan_data.user_id}: {health_validation['warnings']}")
        
        
        log_health_data_access(
            user_id=str(health_plan_data.user_id),
            access_type="create_health_plan",
            data_accessed="full_health_profile"
        )
        
        
        result = await internal_controller.create_health_plan(health_plan_data)
        
        logger.info(f"Health plan creation request processed for user {health_plan_data.user_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in health plan creation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "An unexpected error occurred. Please consult with healthcare professionals for immediate assistance.",
                "error_type": "system_error",
                "professional_consultation_recommended": True
            }
        )

@router.post("/update-health-plan-progress/{plan_id}")
async def update_health_plan_progress(
    request: Request,
    plan_id: str,
    progress_data: internal_validations.UpdateHealthPlanProgress,
    signature_verified: dict = Depends(verify_signature)
):
    """
    Update health plan progress with comprehensive safety monitoring
    
    Monitors for concerning symptoms, unsafe progression patterns,
    and provides appropriate safety interventions when needed.
    """
    try:
        
        if not plan_id or len(plan_id) < 10:
            raise HTTPException(
                status_code=400,
                detail="Invalid health plan ID format"
            )
        
        
        log_health_data_access(
            user_id="extracted_from_plan",  
            access_type="update_progress",
            data_accessed=f"health_plan_progress_{plan_id}"
        )
        
        
        result = await internal_controller.update_health_plan_progress(plan_id, progress_data)
        
        logger.info(f"Health plan progress updated for plan {plan_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating health plan progress: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating progress. Please consult healthcare provider if experiencing any concerning symptoms."
        )

@router.get("/health-plan-analytics/{plan_id}")
async def get_health_plan_analytics(
    request: Request,
    plan_id: str,
    analytics_params: internal_validations.HealthPlanAnalytics = Depends(),
    signature_verified: dict = Depends(verify_signature)
):
    """
    Retrieve comprehensive health plan analytics and safety monitoring data
    
    Provides insights into user progress, safety metrics, and recommendations
    for plan adjustments or professional consultations.
    """
    try:
        if not plan_id or len(plan_id) < 10:
            raise HTTPException(
                status_code=400,
                detail="Invalid health plan ID format"
            )
        
        
        log_health_data_access(
            user_id="extracted_from_plan",
            access_type="view_analytics",
            data_accessed=f"health_plan_analytics_{plan_id}"
        )
        
        result = await internal_controller.get_health_plan_analytics(plan_id)
        
        logger.info(f"Health plan analytics retrieved for plan {plan_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving health plan analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving analytics data"
        )

@router.post("/emergency-health-alert")
async def handle_emergency_health_alert(
    request: Request,
    alert_data: dict,
    signature_verified: dict = Depends(verify_signature)
):
    """
    Handle emergency health alerts from user service
    
    Processes urgent health concerns and coordinates appropriate responses
    including immediate safety protocols and professional consultation referrals.
    """
    try:
        user_id = alert_data.get("user_id")
        alert_type = alert_data.get("alert_type", "general")
        severity = alert_data.get("severity", "medium")
        description = alert_data.get("description", "")
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="User ID required for emergency health alert"
            )
        
        logger.error(f"EMERGENCY HEALTH ALERT - User {user_id}: {alert_type} - {description}")
        
        
        log_health_data_access(
            user_id=user_id,
            access_type="emergency_alert",
            data_accessed=f"emergency_health_data_{alert_type}"
        )
        
        
        emergency_response = {
            "alert_acknowledged": True,
            "response_time": datetime.utcnow().isoformat(),
            "recommended_actions": [],
            "immediate_consultation_required": False
        }
        
        if severity in ["high", "critical"]:
            emergency_response.update({
                "immediate_consultation_required": True,
                "recommended_actions": [
                    "Seek immediate medical attention",
                    "Contact emergency services if experiencing severe symptoms",
                    "Do not continue with current health plan until cleared by medical professional",
                    "Pause all physical activity until medical consultation"
                ],
                "emergency_contacts": {
                    "emergency_services": "911 (US)",
                    "poison_control": "1-800-222-1222 (US)",
                    "crisis_text_line": "Text HOME to 741741"
                }
            })
        elif severity == "medium":
            emergency_response["recommended_actions"] = [
                "Consult with healthcare provider within 24-48 hours",
                "Monitor symptoms closely",
                "Consider pausing intensive activities until consultation",
                "Document any changes in symptoms"
            ]
        
        logger.info(f"Emergency health alert processed for user {user_id}")
        
        return {
            "success": True,
            "message": "Emergency health alert processed",
            "response": emergency_response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing emergency health alert: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing emergency alert - please seek immediate medical attention if experiencing severe symptoms"
        )

@router.post("/validate-health-modifications")
async def validate_health_plan_modifications(
    request: Request,
    modification_data: dict,
    signature_verified: dict = Depends(verify_signature)
):
    """
    Validate proposed health plan modifications for safety
    
    Reviews requested changes to ensure they remain within safe parameters
    and don't introduce health risks.
    """
    try:
        plan_id = modification_data.get("plan_id")
        proposed_changes = modification_data.get("changes", {})
        user_id = modification_data.get("user_id")
        
        if not all([plan_id, user_id]):
            raise HTTPException(
                status_code=400,
                detail="Plan ID and User ID required for modification validation"
            )
        
        
        log_health_data_access(
            user_id=user_id,
            access_type="validate_modifications",
            data_accessed=f"health_plan_modifications_{plan_id}"
        )
        
        
        validation_result = {
            "modifications_safe": True,
            "approved_changes": [],
            "rejected_changes": [],
            "warnings": [],
            "professional_consultation_recommended": False
        }
        
       
        unsafe_patterns = [
            "extreme", "maximum", "no rest", "ignore pain", "push through",
            "crash diet", "very low calorie", "intense daily", "no breaks"
        ]
        
        for change_type, change_details in proposed_changes.items():
            change_text = str(change_details).lower()
            
            if any(pattern in change_text for pattern in unsafe_patterns):
                validation_result["rejected_changes"].append({
                    "change_type": change_type,
                    "reason": "Modification contains potentially unsafe patterns",
                    "original_request": change_details
                })
                validation_result["modifications_safe"] = False
                validation_result["professional_consultation_recommended"] = True
            else:
                validation_result["approved_changes"].append({
                    "change_type": change_type,
                    "details": change_details,
                    "safety_approved": True
                })
        
        if not validation_result["modifications_safe"]:
            validation_result["warnings"].append(
                "Some requested modifications were rejected for safety reasons. Please consult with healthcare professionals for guidance."
            )
        
        logger.info(f"Health plan modification validation completed for plan {plan_id}")
        
        return {
            "success": True,
            "validation_result": validation_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating health plan modifications: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error validating modifications - please consult healthcare professionals"
        )

from datetime import datetime