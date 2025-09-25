from decouple import Config, RepositoryEnv
from backend.utils.timedelta import parse_timespan
import os
import logging

config = Config(RepositoryEnv("local.env"))

if os.getenv("ENVIRONMENT") == "STAGE":
    config = Config(RepositoryEnv("stage.env"))

if os.getenv("ENVIRONMENT") == "PRODUCTION":
    config = Config(RepositoryEnv("production.env"))

CORS_ORIGIN = config.get("CORS_ORIGIN", default="*")
MONGO_URI = config.get("MONGO_URI")
PORT = config.get("PORT", default=5000, cast=int)


GEMINI_API_KEY = config.get("GEMINI_API_KEY", cast=str)

NUTRITIONIX_APP_ID = config.get("NUTRITIONIX_APP_ID", cast=str)
NUTRITIONIX_API_KEY = config.get("NUTRITIONIX_API_KEY", cast=str)

__access_public_key_path = os.path.join(
    os.path.dirname(__file__), "../private/auth_public_key.pem"
)
JWT_ACCESS_KEY_PUBLIC = open(__access_public_key_path, "rb").read()

HMAC_AGENT_KEY = config.get("HMAC_AGENT_KEY", cast=str)
HMAC_USER_KEY = config.get("HMAC_USER_KEY", cast=str)


API_HOST = config.get("API_HOST", cast=str)
USER_HOST = config.get("USER_HOST", cast=str)
FRONT_HOST = config.get("FRONT_HOST", cast=str)

HEALTH_DATA_RETENTION_DAYS = config.get("HEALTH_DATA_RETENTION_DAYS", default=365, cast=int)
MAX_WORKOUT_DURATION_MINUTES = config.get("MAX_WORKOUT_DURATION_MINUTES", default=180, cast=int)
MIN_WORKOUT_DURATION_MINUTES = config.get("MIN_WORKOUT_DURATION_MINUTES", default=10, cast=int)