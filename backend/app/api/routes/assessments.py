"""
Health Assessment API Endpoints.
Provides clinical assessment ingestion, lookup, and historical records.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.assessment import HealthAssessmentCreate
from app.schemas.response import APIResponse
from app.services.assessment_service import assessment_service

router = APIRouter()


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Submit and Store a Complete Health Assessment",
    description=(
        "Ingests patient demographics, biometrics, symptoms, lifestyle, and hereditary history. "
        "Calculates and validates BMI, stores record in MongoDB, and prepares data for future ML inference."
    ),
    response_model=APIResponse[Dict[str, Any]],
)
async def create_assessment(assessment_data: HealthAssessmentCreate):
    """
    Submits a completed health assessment.
    Returns status: 'received' and the generated assessment_id.
    """
    try:
        saved = await assessment_service.create_assessment(assessment_data)
        return APIResponse(
            success=True,
            data=saved,
            message="Assessment saved successfully",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and store assessment: {str(exc)}",
        )


@router.get(
    "/{assessment_id}",
    summary="Get Health Assessment by ID",
    description="Retrieves a full assessment document by its unique assessment ID.",
    response_model=APIResponse[Dict[str, Any]],
)
async def get_assessment(assessment_id: str):
    """Retrieves an existing health assessment by ID."""
    assessment = await assessment_service.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assessment with ID '{assessment_id}' not found.",
        )
    return APIResponse(
        success=True,
        data=assessment,
        message="Assessment retrieved successfully",
    )


@router.get(
    "",
    summary="Get Health Assessment History",
    description="Lists recent assessment submissions, optionally filtered by user ID.",
    response_model=APIResponse[List[Dict[str, Any]]],
)
async def get_assessment_history(
    user_id: Optional[str] = Query(None, description="Optional user ID filter"),
    limit: int = Query(50, ge=1, le=100, description="Max records to return"),
    skip: int = Query(0, ge=0, description="Pagination skip offset"),
):
    """Retrieves historical health assessments log."""
    history = await assessment_service.get_assessment_history(user_id=user_id, limit=limit, skip=skip)
    return APIResponse(
        success=True,
        data=history,
        message=f"Retrieved {len(history)} assessment records",
    )
