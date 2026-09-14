"""
System Health and Diagnostics Endpoints.
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.database.mongodb import is_database_connected

router = APIRouter()


@router.get(
    "/health",
    summary="System Health and Status Check",
    description="Returns service vitality, version, and database connectivity status.",
    response_model=dict,
)
async def get_health_status():
    """
    Health check endpoint returning system status and MongoDB connectivity.
    Matches specification: `GET /api/health` -> { "status": "ok", "service": "healthguard-api" }
    """
    db_status = "connected" if is_database_connected() else "offline (fallback mode)"
    return {
        "status": "ok",
        "service": "healthguard-api",
        "version": settings.VERSION,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
