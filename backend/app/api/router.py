"""
Main API Router aggregating sub-routes with tags and prefixes.
"""

from fastapi import APIRouter
from app.api.routes import health, assessments, users, predictions

api_router = APIRouter()

# Health & diagnostics
api_router.include_router(health.router, tags=["Health & Diagnostics"])

# Assessments
api_router.include_router(assessments.router, prefix="/assessments", tags=["Health Assessments"])

# ML Risk Predictions
api_router.include_router(predictions.router, prefix="/predict", tags=["Machine Learning Predictions"])
api_router.include_router(predictions.router, prefix="/risk", tags=["Machine Learning Predictions"])

# User Profiles
api_router.include_router(users.router, prefix="/users", tags=["Users & Profiles"])
# Legacy compatibility alias for profile
api_router.include_router(users.router, tags=["Users & Profiles"])
