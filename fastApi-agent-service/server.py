import uvicorn
import logging
from backend.config.main import PORT

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def start_server():
    """
    Start the Wellness AI Agent Service with production-ready configuration
    """
    logger.info("Starting Wellness AI Agent Service...")
    logger.info(f"Service will run on port {PORT}")
    logger.info("IMPORTANT: This service provides general wellness information only")
    logger.info("Always consult healthcare professionals for medical advice")
    
   
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,  
        workers=1,  
        log_level="info",
        access_log=True,
        server_header=False,  
        date_header=True,
        timeout_keep_alive=30,
        timeout_graceful_shutdown=30,
    )

def start_development_server():
    """
    Start the server in development mode with hot reload
    """
    logger.info("Starting Wellness AI Agent Service in DEVELOPMENT mode...")
    logger.warning("Development mode - not suitable for production health data")
    
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
        log_level="debug",
        access_log=True,
    )

if __name__ == "__main__":
    import os
    
   
    environment = os.getenv("ENVIRONMENT", "development").lower()
    
    if environment in ["production", "prod"]:
        logger.info("Running in PRODUCTION mode")
        start_server()
    else:
        logger.info("Running in DEVELOPMENT mode")
        start_development_server()