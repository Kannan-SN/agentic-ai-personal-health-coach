import requests
import json
import logging
from typing import Dict, Any, Optional

from backend.utils.create_signature import create_hmac_signature
from backend.config import main as config

logger = logging.getLogger(__name__)

def update_health_plan_status(data: Dict[str, Any], plan_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Update health plan status in the user service with enhanced security and error handling
    
    Args:
        data: Dictionary containing plan update data
        plan_id: Optional plan ID for URL construction
        
    Returns:
        Dictionary with success status and any error information
    """
    try:
        
        if not data:
            return {"success": False, "error": "No data provided for update"}
        
        
        update_payload = {
            **data,
            "updated_at": datetime.utcnow().isoformat(),
            "service_origin": "wellness_agent"
        }
        
        
        signature_data = create_hmac_signature(body=update_payload, mode="body")
        
        
        headers = {
            "Content-Type": "application/json",
            "wellness-signature": signature_data["signature"],
            "wellness-timestamp": str(signature_data["timestamp"]),
            "wellness-origin": "agent",
            "wellness-validate": "body",
            "X-Service-Type": "health-data-update"
        }
        
        
        if plan_id:
            url = f"{config.USER_HOST}/api/internal/update-health-plan/{plan_id}"
        else:
            url = f"{config.USER_HOST}/api/internal/update-health-plan"
        
        logger.info(f"Updating health plan status via user service: {url}")
        
        
        response = requests.post(
            url, 
            headers=headers, 
            json=update_payload,
            timeout=30,  
            verify=True  
        )
        
       
        if response.status_code == 200:
            parsed_response = response.json()
            logger.info(f"Health plan status updated successfully: {parsed_response.get('message', 'Success')}")
            return parsed_response
        else:
            logger.error(f"Health plan update failed with status {response.status_code}: {response.text}")
            return {
                "success": False, 
                "error": f"HTTP {response.status_code}: {response.text}",
                "status_code": response.status_code
            }
            
    except requests.exceptions.Timeout:
        logger.error("Timeout while updating health plan status")
        return {"success": False, "error": "Service timeout - health plan update may not have been saved"}
    
    except requests.exceptions.ConnectionError:
        logger.error("Connection error while updating health plan status")
        return {"success": False, "error": "Unable to connect to user service"}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error while updating health plan status: {str(e)}")
        return {"success": False, "error": f"Request failed: {str(e)}"}
    
    except json.JSONDecodeError:
        logger.error("Invalid JSON response from user service")
        return {"success": False, "error": "Invalid response from user service"}
    
    except Exception as e:
        logger.error(f"Unexpected error updating health plan status: {str(e)}")
        return {"success": False, "error": f"Unexpected error: {str(e)}"}

def sync_health_metrics(user_id: str, metrics_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sync health metrics and progress data with user service
    
    Args:
        user_id: User ID for the metrics
        metrics_data: Health metrics and progress data
        
    Returns:
        Dictionary with sync status and results
    """
    try:
        
        metrics_payload = {
            "user_id": user_id,
            "metrics": metrics_data,
            "timestamp": datetime.utcnow().isoformat(),
            "service_origin": "wellness_agent",
            "data_type": "health_metrics"
        }
        
        
        signature_data = create_hmac_signature(body=metrics_payload, mode="body")
        
        headers = {
            "Content-Type": "application/json",
            "wellness-signature": signature_data["signature"],
            "wellness-timestamp": str(signature_data["timestamp"]),
            "wellness-origin": "agent",
            "wellness-validate": "body",
            "X-Service-Type": "health-metrics-sync",
            "X-User-ID": user_id  
        }
        
        url = f"{config.USER_HOST}/api/internal/sync-health-metrics"
        
        logger.info(f"Syncing health metrics for user {user_id}")
        
        response = requests.post(
            url,
            headers=headers,
            json=metrics_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Health metrics synced successfully for user {user_id}")
            return result
        else:
            logger.error(f"Health metrics sync failed: {response.status_code} - {response.text}")
            return {
                "success": False,
                "error": f"Sync failed: {response.text}",
                "status_code": response.status_code
            }
            
    except Exception as e:
        logger.error(f"Error syncing health metrics: {str(e)}")
        return {"success": False, "error": f"Metrics sync failed: {str(e)}"}

def notify_health_concern(user_id: str, concern_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Notify user service of health concerns that may require intervention
    
    Args:
        user_id: User ID for the health concern
        concern_data: Details about the health concern
        
    Returns:
        Dictionary with notification status
    """
    try:
        
        concern_payload = {
            "user_id": user_id,
            "concern_type": concern_data.get("type", "general"),
            "severity": concern_data.get("severity", "medium"),
            "description": concern_data.get("description", ""),
            "requires_immediate_attention": concern_data.get("urgent", False),
            "recommended_actions": concern_data.get("actions", []),
            "timestamp": datetime.utcnow().isoformat(),
            "service_origin": "wellness_agent"
        }
        
        
        signature_data = create_hmac_signature(body=concern_payload, mode="body")
        
        headers = {
            "Content-Type": "application/json",
            "wellness-signature": signature_data["signature"],
            "wellness-timestamp": str(signature_data["timestamp"]),
            "wellness-origin": "agent",
            "wellness-validate": "body",
            "X-Service-Type": "health-concern-alert",
            "X-User-ID": user_id,
            "X-Priority": concern_data.get("severity", "medium")
        }
        
        url = f"{config.USER_HOST}/api/internal/health-concern-notification"
        
        logger.warning(f"Notifying health concern for user {user_id}: {concern_data.get('type', 'general')}")
        
        response = requests.post(
            url,
            headers=headers,
            json=concern_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Health concern notification sent successfully for user {user_id}")
            return result
        else:
            logger.error(f"Health concern notification failed: {response.status_code}")
            
            return {
                "success": False,
                "error": "Failed to notify user service of health concern",
                "status_code": response.status_code,
                "requires_retry": True
            }
            
    except Exception as e:
        logger.error(f"Error notifying health concern: {str(e)}")
        return {
            "success": False, 
            "error": f"Health concern notification failed: {str(e)}",
            "requires_retry": True
        }

def get_user_health_profile(user_id: str) -> Dict[str, Any]:
    """
    Retrieve user health profile information from user service
    
    Args:
        user_id: User ID to retrieve profile for
        
    Returns:
        Dictionary with user health profile data
    """
    try:
        
        query_params = {
            "user_id": user_id,
            "include_health_data": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        signature_data = create_hmac_signature(query=query_params, mode="query")
        
        headers = {
            "wellness-signature": signature_data["signature"],
            "wellness-timestamp": str(signature_data["timestamp"]),
            "wellness-origin": "agent",
            "wellness-validate": "query",
            "X-Service-Type": "health-profile-request",
            "X-User-ID": user_id
        }
        
        url = f"{config.USER_HOST}/api/internal/user-health-profile"
        
        logger.info(f"Retrieving health profile for user {user_id}")
        
        response = requests.get(
            url,
            headers=headers,
            params=query_params,
            timeout=30
        )
        
        if response.status_code == 200:
            profile_data = response.json()
            logger.info(f"Health profile retrieved successfully for user {user_id}")
            return profile_data
        else:
            logger.error(f"Failed to retrieve health profile: {response.status_code}")
            return {
                "success": False,
                "error": f"Profile retrieval failed: {response.text}",
                "status_code": response.status_code
            }
            
    except Exception as e:
        logger.error(f"Error retrieving user health profile: {str(e)}")
        return {"success": False, "error": f"Profile retrieval error: {str(e)}"}

def validate_user_permissions(user_id: str, action: str) -> Dict[str, Any]:
    """
    Validate user permissions for health data operations
    
    Args:
        user_id: User ID to validate permissions for
        action: Action being attempted (create_plan, modify_plan, etc.)
        
    Returns:
        Dictionary with permission validation results
    """
    try:
        permission_payload = {
            "user_id": user_id,
            "requested_action": action,
            "service_origin": "wellness_agent",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        signature_data = create_hmac_signature(body=permission_payload, mode="body")
        
        headers = {
            "Content-Type": "application/json",
            "wellness-signature": signature_data["signature"],
            "wellness-timestamp": str(signature_data["timestamp"]),
            "wellness-origin": "agent",
            "wellness-validate": "body",
            "X-Service-Type": "permission-validation",
            "X-User-ID": user_id
        }
        
        url = f"{config.USER_HOST}/api/internal/validate-health-permissions"
        
        response = requests.post(
            url,
            headers=headers,
            json=permission_payload,
            timeout=15  
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Permission validation failed: {response.status_code}")
            return {
                "success": False,
                "has_permission": False,
                "error": "Permission validation failed"
            }
            
    except Exception as e:
        logger.error(f"Error validating user permissions: {str(e)}")
        return {
            "success": False,
            "has_permission": False,
            "error": f"Permission validation error: {str(e)}"
        }

def log_health_data_access(user_id: str, access_type: str, data_accessed: str) -> bool:
    """
    Log health data access for audit and compliance purposes
    
    Args:
        user_id: User whose data was accessed
        access_type: Type of access (read, write, modify, etc.)
        data_accessed: Description of data accessed
        
    Returns:
        Boolean indicating if logging was successful
    """
    try:
        log_payload = {
            "user_id": user_id,
            "access_type": access_type,
            "data_accessed": data_accessed,
            "timestamp": datetime.utcnow().isoformat(),
            "service_origin": "wellness_agent",
            "session_id": f"agent_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        }
        
        signature_data = create_hmac_signature(body=log_payload, mode="body")
        
        headers = {
            "Content-Type": "application/json",
            "wellness-signature": signature_data["signature"],
            "wellness-timestamp": str(signature_data["timestamp"]),
            "wellness-origin": "agent",
            "wellness-validate": "body",
            "X-Service-Type": "audit-log",
            "X-User-ID": user_id
        }
        
        url = f"{config.USER_HOST}/api/internal/log-health-access"
        
        
        response = requests.post(
            url,
            headers=headers,
            json=log_payload,
            timeout=10
        )
        
        if response.status_code == 200:
            return True
        else:
            logger.warning(f"Audit log failed: {response.status_code}")
            return False
            
    except Exception as e:
        logger.warning(f"Failed to log health data access: {str(e)}")
        return False

from datetime import datetime