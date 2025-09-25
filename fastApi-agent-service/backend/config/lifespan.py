from contextlib import asynccontextmanager

from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from backend.config.main import MONGO_URI
import logging

from backend.models.HealthPlan import HealthPlan

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.db = AsyncIOMotorClient(MONGO_URI)["wellness-agent-service"]
    await init_beanie(
        database=app.db,
        document_models=[HealthPlan],
    )
    logging.info("Database initialized")
    yield
    logging.info("Server closed successfully")