"""
Health Assessment API Endpoints.
Provides authenticated clinical assessment ingestion, secure IDOR-protected lookup, and user-scoped historical records.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user
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
        "Calculates and validates BMI, stores record in MongoDB under the authenticated user's account, "
        "and prepares data for ML inference."
    ),
    response_model=APIResponse[Dict[str, Any]],
)
async def create_assessment(
    assessment_data: HealthAssessmentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Submits a completed health assessment.
    Derives user ownership directly from the authenticated session context.
    """
    try:
        saved = await assessment_service.create_assessment(
            assessment_data,
            user_id=current_user["user_id"],
        )
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
    description="Retrieves an assessment document strictly owned by the authenticated caller (IDOR defense).",
    response_model=APIResponse[Dict[str, Any]],
)
async def get_assessment(
    assessment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves an existing health assessment verifying caller ownership."""
    assessment = await assessment_service.get_assessment_by_id(
        assessment_id=assessment_id,
        user_id=current_user["user_id"],
    )
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
    description="Lists recent assessment submissions strictly belonging to the authenticated user.",
    response_model=APIResponse[List[Dict[str, Any]]],
)
async def get_assessment_history(
    limit: int = Query(50, ge=1, le=100, description="Max records to return"),
    skip: int = Query(0, ge=0, description="Pagination skip offset"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves authenticated user's historical health assessments."""
    history = await assessment_service.get_assessment_history(
        user_id=current_user["user_id"],
        limit=limit,
        skip=skip,
    )
    return APIResponse(
        success=True,
        data=history,
        message=f"Retrieved {len(history)} assessment records",
    )
