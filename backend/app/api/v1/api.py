from fastapi import APIRouter
from app.api.v1.endpoints import auth, seo, youtube, thumbnails, analytics

api_router = APIRouter()

# DO NOT ADD PREFIXES HERE
api_router.include_router(auth.router)
api_router.include_router(seo.router)
api_router.include_router(youtube.router)
api_router.include_router(thumbnails.router)
api_router.include_router(analytics.router)