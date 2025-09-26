import hmac
import hashlib
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import json
import os
import logging

from backend.config import main as config

logger = logging.getLogger(__name__)


HMAC_SECRETS = {
    "agent": config.HMAC_AGENT_KEY,
    "user": config.HMAC_USER_KEY,
}

async def verify_signature(request: Request):
    """
    Verify HMAC signature for secure inter-service communication
    Enhanced security for health data transmission between services
    
    Headers required:
    - wellness-signature: HMAC signature
    - wellness-origin: Source service (agent/user)  
    - wellness-validate: Validation type (body/query/both)
    - wellness-timestamp: Request timestamp for replay protection
    """
    headers = request.headers

    signature = headers.get("wellness-signature")
    origin = headers.get("wellness-origin") 
    validate = headers.get("wellness-validate")
    timestamp = headers.get("wellness-timestamp")
    
    
    logger.info(f"Inter-service signature verification attempt from origin: {origin}")

    if not all([signature, origin, validate, timestamp]):
        logger.error(f"Incomplete signature headers from {origin}: signature={bool(signature)}, validate={bool(validate)}, timestamp={bool(timestamp)}")
        raise HTTPException(status_code=403, detail="Signature Invalid - Missing Headers")

    
    body_bytes = await request.body()
    try:
        body_json = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
    except json.JSONDecodeError:
        logger.warning("Failed to decode request body JSON")
        body_json = {}

    query_params = dict(request.query_params)

    
    if validate == "query":
        validator = json.dumps(query_params, separators=(',', ':')) + timestamp
    elif validate == "both":
        validator = json.dumps(query_params, separators=(',', ':')) + json.dumps(body_json, separators=(',', ':')) + timestamp
    else: 
        validator = json.dumps(body_json, separators=(',', ':')) + timestamp

   
    key = HMAC_SECRETS.get(origin)
    if not key:
        logger.error(f"Unknown origin attempting inter-service communication: {origin}")
        raise HTTPException(status_code=403, detail="Signature Invalid - Unknown Origin")

    
    generated_signature = hmac.new(
        key.encode("utf-8"),
        validator.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    
    if not hmac.compare_digest(generated_signature, signature):
        logger.error(f"Signature mismatch from {origin} - potential security breach")
        raise HTTPException(status_code=403, detail="Signature Invalid - Authentication Failed")

   
    try:
        request_timestamp = int(timestamp)
        current_timestamp = int(datetime.now().timestamp() * 1000)
        time_diff = abs(current_timestamp - request_timestamp)
        
        
        if time_diff > 300000:  
            logger.warning(f"Request timestamp outside acceptable window from {origin}: {time_diff}ms")
            raise HTTPException(status_code=403, detail="Signature Invalid - Timestamp Expired")
            
    except (ValueError, TypeError):
        logger.error(f"Invalid timestamp format from {origin}: {timestamp}")
        raise HTTPException(status_code=403, detail="Signature Invalid - Invalid Timestamp")

    logger.info(f"Signature verification successful for {origin}")
    return True

class HealthDataSecurityMiddleware(BaseHTTPMiddleware):
    """
    Middleware for enhanced health data security and audit logging
    """
    
    async def dispatch(self, request: Request, call_next):
        
        user_agent = request.headers.get("user-agent", "Unknown")
        client_ip = request.client.host if request.client else "Unknown"
        
        logger.info(f"Health data request: {request.method} {request.url.path} from {client_ip} ({user_agent})")
        
       
        sensitive_endpoints = [
            "/api/internal/create-health-plan",
            "/api/internal/update-health-plan", 
            "/api/user/health-plan",
            "/api/user/progress",
            "/api/user/health-data"
        ]
        
        is_sensitive = any(endpoint in str(request.url.path) for endpoint in sensitive_endpoints)
        
        if is_sensitive:
            logger.info(f"Sensitive health data endpoint accessed: {request.url.path}")
            
           
            response = await call_next(request)
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
            
            return response
        
        return await call_next(request)

from datetime import datetime

async def verify_health_data_access(request: Request, user_id: str = None):
    """
    Additional verification layer for health data access
    Ensures proper authentication and logs access for compliance
    """
    
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.error(f"Health data access attempted without proper authentication")
        raise HTTPException(status_code=401, detail="Authentication required for health data access")
    
    
    access_time = datetime.now().isoformat()
    logger.info(f"Health data accessed by user {user_id} at {access_time}")
    
    
    request_count_key = f"health_access_{user_id}_{datetime.now().strftime('%Y-%m-%d-%H')}"
    
    
    
    return True

def validate_health_plan_request(request_data: dict) -> dict:
    """
    Validate health plan request data for safety and completeness
    """
    validation_result = {
        "is_valid": True,
        "errors": [],
        "warnings": []
    }
    
    
    required_fields = ["user_id", "primary_goal", "current_activity_level"]
    for field in required_fields:
        if field not in request_data or not request_data[field]:
            validation_result["is_valid"] = False
            validation_result["errors"].append(f"Required field missing: {field}")
    
    
    age = request_data.get("age")
    if age:
        if age < 13:
            validation_result["is_valid"] = False
            validation_result["errors"].append("Age below minimum safety threshold")
        elif age < 18:
            validation_result["warnings"].append("Minor - parental supervision recommended")
        elif age > 75:
            validation_result["warnings"].append("Advanced age - medical consultation strongly recommended")
    
    
    health_conditions = request_data.get("health_conditions", [])
    high_risk_conditions = [
        "heart", "cardiac", "diabetes", "blood pressure", "eating disorder",
        "pregnancy", "surgery", "injury", "medication"
    ]
    
    for condition in health_conditions:
        if any(risk in condition.lower() for risk in high_risk_conditions):
            validation_result["warnings"].append(f"Health condition requires medical consultation: {condition}")
    
    
    medical_clearance = request_data.get("medical_clearance", False)
    if validation_result["warnings"] and not medical_clearance:
        validation_result["warnings"].append("Medical clearance recommended before proceeding")
    
    return validation_result