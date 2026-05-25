from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
from app.config import get_settings
from app.api import router
from app.middleware.rate_limiter import limiter, rate_limit_handler
from app.services.cache_service import cache_service
from app.db.session import init_db
from app.api.v1.api import api_router
import logging

logging.basicConfig(level=logging.INFO, format='{"time":"%(asctime)s","level":"%(levelname)s","msg":"%(message)s"}')
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger = logging.getLogger(__name__)
    logger.info("🚀 Starting YouTube AI Platform...")
    init_db()
    if not await cache_service.health_check():
        logger.warning("⚠️ Redis unavailable - caching disabled")
    logger.info("✅ Application ready")
    yield
    await cache_service.redis.close()
    logger.info("👋 Application shutdown complete")

app = FastAPI(title="YouTube AI Platform", version="0.4.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins="https://youtube-ai-platform-jade.vercel.app",
        "http://localhost:3000", allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    redis_ok = await cache_service.health_check()
    return {"status": "healthy", "version": "0.4.0", "services": {"redis": "connected" if redis_ok else "disconnected"}, "cache_stats": cache_service.get_stats()}

@app.get("/metrics/cache")
async def cache_metrics():
    return cache_service.get_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
