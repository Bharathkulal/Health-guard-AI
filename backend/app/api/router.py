"""
Main API Router aggregating sub-routes with tags and prefixes.
"""

from fastapi import APIRouter
from app.api.routes import health, auth, assessments, users, predictions, health_assess, admin

api_router = APIRouter()

# Admin Analytics
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & Analytics"])

# Authentication & Identity
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Security"])

# Health & diagnostics
api_router.include_router(health.router, tags=["Health & Diagnostics"])

# ML Health Risk Assessment (real trained models)
api_router.include_router(health_assess.router, prefix="/health/assess", tags=["ML Health Assessment"])

# Assessments
api_router.include_router(assessments.router, prefix="/assessments", tags=["Health Assessments"])

# ML Risk Predictions (legacy)
api_router.include_router(predictions.router, prefix="/predict", tags=["Machine Learning Predictions"])

# User Profiles
api_router.include_router(users.router, prefix="/users", tags=["Users & Profiles"])
# Root alias for /profile
api_router.include_router(users.router, tags=["Users & Profiles"])

