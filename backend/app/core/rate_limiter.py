"""
HealthGuard AI - Sliding Window In-Memory Rate Limiter.
Protects sensitive authentication and ML prediction endpoints from automated brute-force abuse.
"""

import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status

from app.core.config import settings

logger = logging.getLogger("healthguard.rate_limiter")


class RateLimiter:
    """
    Sliding window in-memory rate limiter per client IP.
    """

    def __init__(self):
        # Map: route_key -> IP -> list of timestamps
        self._requests: Dict[str, Dict[str, List[float]]] = defaultdict(lambda: defaultdict(list))

    def _clean_old_requests(self, timestamps: List[float], window_seconds: float) -> List[float]:
        now = time.time()
        cutoff = now - window_seconds
        return [t for t in timestamps if t > cutoff]

    def is_rate_limited(
        self,
        request: Request,
        route_key: str,
        max_requests: int,
        window_seconds: float = 60.0,
    ) -> Tuple[bool, int, int]:
        """
        Evaluates whether a request violates rate limits.
        Returns: (is_limited, current_requests, remaining_requests)
        """
        if not settings.RATE_LIMIT_ENABLED:
            return False, 0, max_requests

        # Extract client IP safely
        client_ip = request.client.host if request.client else "127.0.0.1"
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        now = time.time()
        bucket = self._requests[route_key][client_ip]
        clean_bucket = self._clean_old_requests(bucket, window_seconds)

        if len(clean_bucket) >= max_requests:
            self._requests[route_key][client_ip] = clean_bucket
            logger.warning(
                f"Rate limit exceeded on '{route_key}' for IP '{client_ip}'. "
                f"Count: {len(clean_bucket)}/{max_requests} within {window_seconds}s"
            )
            return True, len(clean_bucket), 0

        clean_bucket.append(now)
        self._requests[route_key][client_ip] = clean_bucket
        remaining = max(0, max_requests - len(clean_bucket))
        return False, len(clean_bucket), remaining


rate_limiter = RateLimiter()


def rate_limit_auth(request: Request):
    """Dependency for authentication endpoints (e.g., login, register)."""
    limited, count, remaining = rate_limiter.is_rate_limited(
        request,
        route_key="auth",
        max_requests=settings.AUTH_RATE_LIMIT_PER_MINUTE,
        window_seconds=60.0,
    )
    if limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please wait a minute before retrying.",
            headers={"Retry-After": "60"},
        )


def rate_limit_prediction(request: Request):
    """Dependency for ML prediction endpoint."""
    limited, count, remaining = rate_limiter.is_rate_limited(
        request,
        route_key="predict",
        max_requests=settings.API_RATE_LIMIT_PER_MINUTE,
        window_seconds=60.0,
    )
    if limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded for health predictions. Please try again shortly.",
            headers={"Retry-After": "60"},
        )
