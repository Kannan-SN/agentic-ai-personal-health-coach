from fastapi import APIRouter
from backend.routes.internal import router as internal_router
from backend.routes.user import router as user_router

router = APIRouter()


router.include_router(prefix="/internal", router=internal_router)


router.include_router(prefix="/user", router=user_router)