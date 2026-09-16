"""
User Profile and Demographics API Endpoints.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from app.core.dependencies import get_current_user
from app.schemas.response import APIResponse
from app.schemas.user import UserResponse, UserProfileUpdate
from app.services.auth_service import auth_service

router = APIRouter()


@router.get(
    "/profile",
    summary="Get Authenticated User Profile",
    description="Retrieves the current authenticated user's profile and baseline biometric calibrations.",
    response_model=APIResponse[UserResponse],
)
async def get_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves profile of the authenticated caller."""
    profile = await auth_service.get_current_user_profile(current_user["user_id"])
    return APIResponse(
        success=True,
        data=profile,
        message="User profile retrieved successfully",
    )


@router.put(
    "/profile",
    summary="Update Authenticated User Profile",
    description="Updates user demographic and baseline biometric parameters.",
    response_model=APIResponse[UserResponse],
)
async def update_user_profile(
    updates: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Updates profile attributes for the authenticated caller."""
    updated = await auth_service.update_user_profile(current_user["user_id"], updates)
    return APIResponse(
        success=True,
        data=updated,
        message="User profile updated successfully",
    )
