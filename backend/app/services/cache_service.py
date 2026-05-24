"""
Cache Service with Fallback Support
Handles missing/invalid Redis gracefully
"""
import logging
import json
from typing import Optional, Any, Dict
from datetime import timedelta
import redis.asyncio as redis

logger = logging.getLogger(__name__)


class CacheService:
    """Redis cache service with fallback to memory/no-op"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis: Optional[redis.Redis] = None
        self.enabled = False
        
        # Validate Redis URL format
        if redis_url and any(redis_url.startswith(s) for s in ["redis://", "rediss://", "unix://"]):
            try:
                self.redis = redis.from_url(redis_url, decode_responses=True)
                self.enabled = True
                logger.info(f"✅ Redis connected: {redis_url[:40]}...")
            except Exception as e:
                logger.warning(f"⚠️ Redis connection failed: {e}. Running without cache.")
                self.enabled = False
        else:
            logger.warning(f"⚠️ Invalid/missing REDIS_URL: '{redis_url}'. Running without cache.")
            self.enabled = False
    
    async def get(self, namespace: str, key_data: Dict[str, Any]) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled or not self.redis:
            return None
        
        try:
            cache_key = f"{namespace}:{json.dumps(key_data, sort_keys=True)}"
            value = await self.redis.get(cache_key)
            if value:
                logger.info(f"✅ Cache HIT: {cache_key}")
                return json.loads(value)
            logger.info(f"❌ Cache MISS: {cache_key}")
            return None
        except Exception as e:
            logger.error(f"❌ Cache get error: {e}")
            return None
    
    async def set(self, namespace: str, key_data: Dict[str, Any], value: Any, ttl: int = 3600) -> bool:
        """Set value in cache"""
        if not self.enabled or not self.redis:
            return False
        
        try:
            cache_key = f"{namespace}:{json.dumps(key_data, sort_keys=True)}"
            await self.redis.setex(cache_key, timedelta(seconds=ttl), json.dumps(value))
            logger.info(f"✅ Cache SET: {cache_key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"❌ Cache set error: {e}")
            return False
    
    async def health_check(self) -> bool:
        """Check if Redis is connected"""
        if not self.enabled or not self.redis:
            return False
        try:
            await self.redis.ping()
            return True
        except:
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "enabled": self.enabled,
            "connected": self.redis is not None,
            "note": "Cache disabled - check REDIS_URL environment variable" if not self.enabled else ""
        }
    
    async def close(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()


# Singleton instance - handles missing env var gracefully
from app.config import get_settings
settings = get_settings()
cache_service = CacheService(settings.REDIS_URL)