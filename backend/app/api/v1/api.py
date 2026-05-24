from fastapi import APIRouter
from app.api.v1.endpoints import auth, seo, youtube, thumbnails, analytics  # Add analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(seo.router, prefix="/seo", tags=["seo"])
api_router.include_router(youtube.router, prefix="/youtube", tags=["youtube"])
api_router.include_router(thumbnails.router, prefix="/thumbnails", tags=["thumbnails"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])  # Add this