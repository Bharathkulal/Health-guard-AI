"""
Machine Learning Risk Prediction Endpoints for HealthGuard AI.
Provides authenticated, rate-limited ML risk inference and user-isolated predictions retrieval.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.core.rate_limiter import rate_limit_prediction
from app.schemas.response import APIResponse
from app.schemas.assessment import HealthAssessmentCreate
from app.services.prediction_service import prediction_service

router = APIRouter()


@router.post(
    "",
    status_code=status.HTTP_200_OK,
    summary="Execute Real-time ML Health Risk Prediction",
    description=(
        "Ingests patient health biometrics, normalizes features, executes inference across "
        "Diabetes, Cardiovascular, and Hypertension models, and saves the calibrated result to MongoDB."
    ),
    response_model=APIResponse[Dict[str, Any]],
    dependencies=[Depends(rate_limit_prediction)],
)
async def predict_health_risk(
    assessment_data: HealthAssessmentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Computes genuine ML risk probabilities and factor attributions for an authenticated assessment.
    Enforces user identity derived from the verified JWT context.
    """
    try:
        raw_dict = assessment_data.model_dump()
        result = await prediction_service.predict_and_store(
            assessment_data=raw_dict,
            user_id=current_user["user_id"],
        )
        return APIResponse(
            success=True,
            data=result,
            message="Health risk assessment computed successfully via Machine Learning models.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate ML risk prediction: {str(exc)}",
        )


@router.get(
    "/latest",
    summary="Get Latest Authenticated ML Risk Prediction",
    description="Fetches the most recent calculated risk assessment strictly for the authenticated user.",
    response_model=APIResponse[Optional[Dict[str, Any]]],
)
async def get_latest_prediction(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves the authenticated user's latest ML risk result."""
    result = await prediction_service.get_latest_risk_assessment(user_id=current_user["user_id"])
    if not result:
        return APIResponse(
            success=True,
            data=None,
            message="No previous risk assessment records found.",
        )
    return APIResponse(
        success=True,
        data=result,
        message="Latest ML risk assessment retrieved successfully.",
    )


@router.get(
    "/models",
    summary="Get Active ML Models Metadata",
    description="Returns metadata, sample sizes, and evaluated test set metrics for all active models.",
    response_model=APIResponse[Dict[str, Any]],
)
async def get_models_metadata():
    """Retrieves metadata and test set performance for active condition models."""
    metadata = prediction_service.get_models_metadata()
    return APIResponse(
        success=True,
        data=metadata,
        message="Active ML model metadata retrieved successfully.",
    )
