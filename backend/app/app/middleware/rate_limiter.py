from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from app.config import get_settings

settings = get_settings()
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
    strategy="fixed-window"
)

async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> HTTPException:
    remaining = int(exc.meta.get("remaining_time", 60))
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail={"error": "Rate limit exceeded", "message": f"Please wait {remaining} seconds", "retry_after": remaining},
        headers={"Retry-After": str(remaining)}
    )
