from fastapi import APIRouter
from app.api.v1.endpoints import auth, seo_agent, youtube_growth, thumbnails

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(seo_agent.router)
api_router.include_router(youtube_growth.router)
api_router.include_router(thumbnails.router)
