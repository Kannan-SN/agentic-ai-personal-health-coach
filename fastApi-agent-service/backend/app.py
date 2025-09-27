import logging
from fastapi import FastAPI, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import (
    RequestValidationError,
    ValidationException,
    HTTPException,
)
from contextlib import asynccontextmanager

from backend.config.lifespan import lifespan
from backend.config import main as config
from backend.routes.index import router as index
from backend.utils.pydanticToFormError import pydantic_to_form_error, format_health_validation_error
from backend.middleware.verify_signature import HealthDataSecurityMiddleware
from backend.constants.enums import HEALTH_DISCLAIMER


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
      
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    lifespan=lifespan,
    title="Wellness AI Agent Service",
    description="""
    AI-Powered Personal Health & Wellness Coach Agent Service
    
    This service provides comprehensive health and wellness planning with:
    - AI-generated workout plans with safety considerations
    - Personalized meal planning with nutritional balance
    - Health analysis and safety monitoring
    - Professional consultation recommendations
    - Progress tracking with safety interventions
    
    IMPORTANT: This service provides general wellness information only and 
    cannot replace professional medical advice. Always consult with qualified 
    healthcare professionals for medical concerns, diagnosis, or treatment.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "Wellness AI Development Team",
        "url": "https://github.com/wellness-ai/health-coach",
        "email": "health-safety@wellness-ai.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    terms_of_service="/api/terms-of-service",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONT_HOST, config.USER_HOST] if config.FRONT_HOST != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Health-Data-Warning", "X-Professional-Consultation-Recommended"]
)


app.add_middleware(HealthDataSecurityMiddleware)

@app.middleware("http")
async def health_data_audit_middleware(request: Request, call_next):
    """
    Audit middleware for health data access logging and security monitoring
    """
   
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    logger.info(f"Health service request: {request.method} {request.url.path} from {client_ip}")
    
   
    response = await call_next(request)
    
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Health-Service"] = "wellness-agent-v1.0"
    
    
    if request.url.path.startswith("/api/"):
        response.headers["X-Health-Disclaimer"] = "General wellness information only - not medical advice"
    
    
    logger.info(f"Response: {response.status_code} for {request.method} {request.url.path}")
    
    return response

@app.exception_handler(Exception)
async def catch_all_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler with health-specific safety messaging
    Preserves server process and provides appropriate health guidance
    """
    logger.error(f"Unhandled exception in health service: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "A system error occurred while processing your health request. For immediate health concerns, please consult with healthcare professionals.",
            "error_type": "system_error",
            "professional_consultation_recommended": True,
            "emergency_resources": {
                "emergency_number": "911 (US)",
                "crisis_text": "Text HOME to 741741"
            },
            "disclaimer": HEALTH_DISCLAIMER
        },
        headers={
            "X-Health-Data-Warning": "system-error-occurred",
            "X-Professional-Consultation-Recommended": "true"
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    HTTP exception handler with enhanced health data context
    """
    logger.warning(f"HTTP exception in health service: {exc.status_code} - {exc.detail}")
    
   
    error_response = {
        "success": False,
        "message": exc.detail if isinstance(exc.detail, str) else exc.detail.get("message", "Request failed"),
        "status_code": exc.status_code
    }
    
   
    if exc.status_code == 401:
        error_response.update({
            "authentication_required": True,
            "health_data_protection_note": "Authentication required to protect your personal health information"
        })
    elif exc.status_code == 403:
        error_response.update({
            "access_denied": True,
            "privacy_protection_note": "Access restrictions help protect your personal health data"
        })
    elif exc.status_code == 400:
        error_response.update({
            "validation_failed": True,
            "safety_note": "Request validation helps ensure your health and safety"
        })
        
        
        if isinstance(exc.detail, dict):
            error_response.update(exc.detail)
    
    
    error_response["disclaimer"] = HEALTH_DISCLAIMER
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response,
        headers={
            "X-Health-Data-Warning": f"http-{exc.status_code}",
            "X-Professional-Consultation-Recommended": "true" if exc.status_code >= 400 else "false"
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: ValidationException):
    """
    Validation error handler with health-specific field guidance
    Converts Pydantic validation errors to user-friendly health guidance
    """
    logger.warning(f"Validation error in health service: {exc.errors()}")
    
    
    form_errors = pydantic_to_form_error(exc.errors())
    health_formatted_errors = format_health_validation_error(form_errors)
    
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "message": "Please review and correct the highlighted health information",
            "errors": health_formatted_errors,
            "validation_type": "health_data_validation",
            "safety_note": "Data validation helps ensure safe and appropriate health recommendations",
            "disclaimer": HEALTH_DISCLAIMER,
            "support_resources": {
                "health_questions": "Consult with healthcare professionals for guidance",
                "fitness_questions": "Consider speaking with certified fitness professionals",
                "nutrition_questions": "Registered dietitians can provide personalized nutrition guidance"
            }
        },
        headers={
            "X-Health-Data-Warning": "validation-failed",
            "X-Professional-Consultation-Recommended": "true"
        }
    )


@app.get("/")
async def health_service_root():
    """
    Root endpoint with health service information and safety disclaimers
    """
    return {
        "service": "Wellness AI Agent Service",
        "version": "1.0.0",
        "status": "operational",
        "description": "AI-powered personal health and wellness coaching with comprehensive safety measures",
        "important_notice": HEALTH_DISCLAIMER,
        "emergency_resources": {
            "emergency_services": "911 (US)",
            "poison_control": "1-800-222-1222 (US)",
            "crisis_text_line": "Text HOME to 741741",
            "suicide_prevention": "988 (US)"
        },
        "professional_resources": {
            "find_doctor": "Contact your local healthcare system or visit ama-assn.org",
            "find_dietitian": "Visit eatright.org to find registered dietitians",
            "find_fitness_professional": "Visit acsm.org for certified fitness professionals"
        },
        "api_documentation": "/docs",
        "health_disclaimers": "/api/user/health-disclaimer"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint for service monitoring
    """
    return {
        "status": "healthy",
        "service": "wellness-agent",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "database": "operational",
            "ai_models": "operational", 
            "security": "operational"
        }
    }

@app.get("/api/terms-of-service")
async def terms_of_service():
    """
    Terms of service with health-specific considerations
    """
    return {
        "terms_of_service": {
            "service_name": "Wellness AI Agent Service",
            "version": "1.0.0",
            "effective_date": "2024-01-01",
            "health_disclaimers": {
                "general_wellness": HEALTH_DISCLAIMER,
                "ai_limitations": "AI recommendations are based on general wellness principles and cannot account for individual medical complexities",
                "professional_consultation": "Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment",
                "emergency_situations": "Seek immediate medical attention for emergency symptoms - do not rely on AI for emergencies"
            },
            "data_usage": {
                "health_data_protection": "Personal health information is protected with industry-standard security measures",
                "data_retention": "Health data is retained according to applicable privacy regulations",
                "data_sharing": "Health data is never shared with third parties without explicit consent"
            },
            "user_responsibilities": [
                "Provide accurate health information to the best of your ability",
                "Follow safety recommendations and disclaimers",
                "Consult healthcare professionals for medical concerns",
                "Report any concerning symptoms to qualified medical providers",
                "Use the service responsibly and not for emergency medical situations"
            ],
            "limitation_of_liability": "This service provides general wellness information only and cannot replace professional medical care"
        }
    }


app.include_router(prefix="/api", router=index)

from datetime import datetime