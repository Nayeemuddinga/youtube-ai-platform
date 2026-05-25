from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router

app = FastAPI(
    title="YouTube AI Platform",
    version="0.4.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://youtube-ai-platform-jade.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(
    api_router,
    prefix="/api/v1"
)


@app.get("/")
def root():
    return {"message": "YouTube AI Platform API"}


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }