from fastapi import APIRouter
from app.api.v1.endpoints import auth, seo_agent
api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(seo_agent.router)
