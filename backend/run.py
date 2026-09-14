"""
Convenience launcher for the HealthGuard AI FastAPI backend server.
"""

import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"Starting HealthGuard AI Backend on http://{settings.HOST}:{settings.PORT} ...")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
