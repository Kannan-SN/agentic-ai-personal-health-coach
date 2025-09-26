import requests
from fastapi.responses import JSONResponse
from backend.utils.file_reader import read_file_safely_from_bytes
from backend.controller.agent import wellness_orchestrator
from backend.utils.health_safety import HealthSafetyValidator, log_health_recommendation
from backend.constants.enums import ActivityLevel, Goal, DietaryRestriction
import json
import logging

from backend.models.HealthPlan import HealthPlan

logger = logging.getLogger(__name__)

async def create_health_plan(health_plan_data):
    """
    Create a comprehensive health and wellness plan using AI orchestration
    Enhanced safety measures and validation for health recommendations
    """
    try:
        
        health_documents_text = ""
        if health_plan_data.health_documents:
            try:
                response = requests.get(health_plan_data.health_documents, timeout=30)
                if response.status_code == 200:
                    health_docs_bytes = response.content
                    filename = health_plan_data.health_documents.split("/")[-1]
                    health_documents_text = read_file_safely_from_bytes(health_docs_bytes, filename)
                    logger.info(f"Health documents processed for user: {health_plan_data.user_id}")
                else:
                    logger.warning(f"Could not retrieve health documents: {response.status_code}")
                    return JSONResponse(
                        {"success": False, "message": "Could not retrieve the uploaded health documents"},
                        status_code=400,
                    )
            except requests.RequestException as e:
                logger.error(f"Error fetching health documents: {e}")
                return JSONResponse(
                    {"success": False, "message": "Error processing health documents"},
                    status_code=400,
                )

        
        user_profile = {
            "user_id": str(health_plan_data.user_id),
            "age": health_plan_data.age,
            "current_activity_level": health_plan_data.current_activity_level,
            "primary_goal": health_plan_data.primary_goal,
            "time_availability_minutes": health_plan_data.time_availability_minutes,
            "preferred_workout_types": health_plan_data.preferred_workout_types or [],
            "available_equipment": health_plan_data.available_equipment or [],
        }

        
        profile_safety = HealthSafetyValidator.validate_user_profile_safety({
            "age": health_plan_data.age,
            "primary_goal": health_plan_data.primary_goal,
            "health_conditions": health_plan_data.health_conditions or [],
            "current_activity_level": health_plan_data.current_activity_level
        })

        
        log_health_recommendation(
            user_id=str(health_plan_data.user_id),
            recommendation_type="health_plan_creation",
            safety_check=profile_safety
        )

        
        if not profile_safety.get("is_safe", True):
            logger.warning(f"High-risk profile detected for user {health_plan_data.user_id}")
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

        
        result_state = await wellness_orchestrator(
            user_profile=user_profile,
            health_conditions=health_plan_data.health_conditions or [],
            dietary_restrictions=health_plan_data.dietary_restrictions or [],
            medical_clearance=health_plan_data.medical_clearance,
            health_documents=health_documents_text,
            operation_type="create_plan"
        )

        
        final_result = result_state.get("final_result", {})
        if final_result.get("type") == "professional_consultation_required":
            logger.info(f"AI recommended professional consultation for user {health_plan_data.user_id}")
            return JSONResponse(
                {
                    "success": False,
                    "message": final_result.get("message"),
                    "consultation_plan": final_result,
                    "require_professional_consultation": True
                },
                status_code=202, 
            )

        
        workout_plan = result_state.get("workout_plan", [])
        meal_plan = result_state.get("meal_plan", [])
        analysis_result = result_state.get("analysis_result", {})
        safety_notes = result_state.get("safety_notes", [])
        disclaimers = result_state.get("disclaimers", [])

        
        health_plan = HealthPlan(
            user_id=health_plan_data.user_id,
            plan_name=health_plan_data.plan_name or "AI-Generated Wellness Plan",
            age=health_plan_data.age,
            current_activity_level=health_plan_data.current_activity_level,
            primary_goal=health_plan_data.primary_goal,
            dietary_restrictions=health_plan_data.dietary_restrictions or [],
            health_conditions=health_plan_data.health_conditions or [],
            preferred_workout_types=health_plan_data.preferred_workout_types or [],
            available_equipment=health_plan_data.available_equipment or [],
            time_availability_minutes=health_plan_data.time_availability_minutes,
            workout_plan=workout_plan,
            meal_plan=meal_plan,
            plan_duration_weeks=final_result.get("plan_duration_weeks", 4),
            health_disclaimer_acknowledged=health_plan_data.health_disclaimer_acknowledged,
            medical_clearance=health_plan_data.medical_clearance,
        )

        await health_plan.save()

        
        response_data = {
            "success": True,
            "message": "Health and wellness plan created successfully with appropriate safety measures",
            "health_plan_id": str(health_plan.id),
            "plan_summary": {
                "plan_name": health_plan.plan_name,
                "duration_weeks": health_plan.plan_duration_weeks,
                "workout_days_per_week": len([w for w in workout_plan if not w.get("rest_day", False)]),
                "daily_meal_plans": len(meal_plan),
                "primary_goal": health_plan_data.primary_goal,
                "risk_level": analysis_result.get("risk_level", "low")
            },
            "safety_information": {
                "safety_notes": safety_notes,
                "disclaimers": disclaimers,
                "professional_consultation_recommended": analysis_result.get("professional_consultations_recommended", []),
                "monitoring_plan": result_state.get("monitoring_plan", {})
            },
            "next_steps": [
                "Review all safety information and disclaimers",
                "Start with the recommended monitoring approach",
                "Follow the gradual progression outlined in your plan",
                "Consult healthcare professionals as recommended",
                "Track your progress and adjust as needed"
            ]
        }

        logger.info(f"Health plan created successfully for user {health_plan_data.user_id}")
        return JSONResponse(response_data, status_code=201)

    except Exception as e:
        logger.error(f"Error creating health plan: {str(e)}")
        return JSONResponse(
            {
                "success": False, 
                "message": "An error occurred while creating your health plan. Please try again or consult with healthcare professionals.",
                "error_type": "system_error"
            },
            status_code=500,
        )

async def update_health_plan_progress(plan_id: str, progress_data):
    """
    Update health plan progress with safety monitoring
    """
    try:
        
        health_plan = await HealthPlan.find_one({"_id": plan_id})
        if not health_plan:
            return JSONResponse(
                {"success": False, "message": "Health plan not found"},
                status_code=404
            )

        
        if progress_data.reported_issues:
            logger.warning(f"Health issues reported for plan {plan_id}: {progress_data.reported_issues}")
            
           
            concerning_symptoms = [
                "chest pain", "severe shortness of breath", "dizziness", 
                "nausea", "severe fatigue", "joint pain", "injury"
            ]
            
            for issue in progress_data.reported_issues:
                if any(symptom in issue.lower() for symptom in concerning_symptoms):
                    logger.error(f"Concerning symptoms reported: {issue}")
                    return JSONResponse(
                        {
                            "success": False,
                            "message": "Based on your reported symptoms, please consult with a healthcare professional immediately.",
                            "urgent_consultation_needed": True,
                            "reported_symptom": issue
                        },
                        status_code=400
                    )

        
        health_plan.progress_notes.extend(progress_data.progress_notes or [])
        health_plan.current_week = progress_data.current_week
        health_plan.updated_at = datetime.utcnow()
        
        
        logger.info(f"Progress updated for health plan {plan_id}, week {progress_data.current_week}")
        
        await health_plan.save()

        return JSONResponse(
            {
                "success": True,
                "message": "Progress updated successfully",
                "current_week": health_plan.current_week,
                "total_weeks": health_plan.plan_duration_weeks
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error updating health plan progress: {str(e)}")
        return JSONResponse(
            {"success": False, "message": "Error updating progress"},
            status_code=500
        )

async def get_health_plan_analytics(plan_id: str):
    """
    Get health plan analytics and safety monitoring data
    """
    try:
        health_plan = await HealthPlan.find_one({"_id": plan_id})
        if not health_plan:
            return JSONResponse(
                {"success": False, "message": "Health plan not found"},
                status_code=404
            )

        
        total_workouts = len([w for w in health_plan.workout_plan if not w.get("rest_day", False)])
        total_meals_planned = sum(len(day.get("meals", [])) for day in health_plan.meal_plan)
        
        analytics = {
            "plan_overview": {
                "total_workout_days": total_workouts,
                "total_rest_days": len(health_plan.workout_plan) - total_workouts,
                "total_meals_planned": total_meals_planned,
                "current_progress_week": health_plan.current_week,
                "total_duration_weeks": health_plan.plan_duration_weeks,
                "completion_percentage": (health_plan.current_week / health_plan.plan_duration_weeks) * 100
            },
            "safety_monitoring": {
                "risk_level": "low",  
                "medical_clearance": health_plan.medical_clearance,
                "disclaimer_acknowledged": health_plan.health_disclaimer_acknowledged,
                "progress_notes_count": len(health_plan.progress_notes)
            },
            "plan_details": {
                "primary_goal": health_plan.primary_goal,
                "activity_level": health_plan.current_activity_level,
                "dietary_restrictions": health_plan.dietary_restrictions,
                "health_conditions": health_plan.health_conditions
            }
        }

        return JSONResponse(
            {
                "success": True,
                "analytics": analytics,
                "last_updated": health_plan.updated_at.isoformat()
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error retrieving health plan analytics: {str(e)}")
        return JSONResponse(
            {"success": False, "message": "Error retrieving analytics"},
            status_code=500
        )

from datetime import datetime