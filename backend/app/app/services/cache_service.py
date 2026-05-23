import redis.asyncio as redis
import json
import hashlib
import logging
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class CacheService:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.stats = {"hits": 0, "misses": 0, "errors": 0}

    def _generate_key(self, prefix: str, data: dict) -> str:
        sorted_data = json.dumps(data, sort_keys=True)
        hash_digest = hashlib.sha256(sorted_data.encode()).hexdigest()[:12]
        return f"{prefix}:{hash_digest}"

    async def get(self, prefix: str, data: dict) -> Optional[dict]:
        try:
            key = self._generate_key(prefix, data)
            cached = await self.redis.get(key)
            if cached:
                self.stats["hits"] += 1
                logger.info(f"✅ Cache HIT: {key}")
                return json.loads(cached)
            self.stats["misses"] += 1
            return None
        except Exception as e:
            self.stats["errors"] += 1
            logger.error(f"Cache get error: {e}")
            return None

    async def set(self, prefix: str, data: dict, value: dict, ttl: int = None) -> bool:
        try:
            key = self._generate_key(prefix, data)
            ttl = ttl or settings.CACHE_TTL_SECONDS
            await self.redis.setex(key, ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    async def delete_pattern(self, prefix: str) -> int:
        try:
            keys = await self.redis.keys(f"{prefix}:*")
            return await self.redis.delete(*keys) if keys else 0
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return 0

    def get_stats(self) -> dict:
        total = self.stats["hits"] + self.stats["misses"]
        return {**self.stats, "hit_rate_percent": round((self.stats["hits"] / total * 100) if total > 0 else 0, 2)}

    async def health_check(self) -> bool:
        try:
            await self.redis.ping()
            return True
        except:
            return False

cache_service = CacheService(settings.REDIS_URL)
