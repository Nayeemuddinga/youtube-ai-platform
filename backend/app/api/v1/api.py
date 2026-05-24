from fastapi import APIRouter
from app.api.v1.endpoints import auth, seo, youtube, thumbnails

api_router = APIRouter()

# Make sure you're NOT including auth twice
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])  # Use ONE tag
api_router.include_router(seo.router, prefix="/seo", tags=["seo"])
api_router.include_router(youtube.router, prefix="/youtube", tags=["youtube"])
api_router.include_router(thumbnails.router, prefix="/thumbnails", tags=["thumbnails"])