"""
Machine Learning Risk Prediction Endpoints for HealthGuard AI.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
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
)
async def predict_health_risk(assessment_data: HealthAssessmentCreate):
    """
    Computes genuine ML risk probabilities and factor attributions for a given assessment.
    """
    try:
        # Convert Pydantic model to dict
        raw_dict = assessment_data.model_dump()
        result = await prediction_service.predict_and_store(raw_dict)
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
    summary="Get Latest ML Risk Prediction",
    description="Fetches the most recent calculated risk assessment from MongoDB.",
    response_model=APIResponse[Optional[Dict[str, Any]]],
)
async def get_latest_prediction(
    user_id: Optional[str] = Query(None, description="Optional user ID filter")
):
    """Retrieves the latest ML risk result."""
    result = await prediction_service.get_latest_risk_assessment(user_id=user_id)
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
