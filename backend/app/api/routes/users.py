"""
User Profile and Demographics API Endpoints.
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.schemas.response import APIResponse
from app.schemas.user import UserProfileBase, UserProfileUpdate

router = APIRouter()

# Default mock user profile in fallback store
_DEFAULT_USER_PROFILE = {
    "user_id": "usr_alex_chen_892",
    "name": "Alex Chen",
    "email": "alex.chen@healthguard.ai",
    "age": 38,
    "gender": "male",
    "height_cm": 178.0,
    "weight_kg": 78.0,
    "bmi": 24.6,
    "baseline_activity": "moderate",
    "blood_type": "A+",
    "emergency_contact": "+1 (555) 234-8901",
    "member_since": "March 2025",
}


@router.get(
    "/profile",
    summary="Get User Profile",
    description="Retrieves the current user's profile and baseline biometric calibrations.",
    response_model=APIResponse[Dict[str, Any]],
)
async def get_user_profile():
    return APIResponse(
        success=True,
        data=_DEFAULT_USER_PROFILE,
        message="User profile retrieved successfully",
    )


@router.put(
    "/profile",
    summary="Update User Profile",
    description="Updates user profile attributes.",
    response_model=APIResponse[Dict[str, Any]],
)
async def update_user_profile(updates: UserProfileUpdate):
    for key, value in updates.model_dump(exclude_unset=True).items():
        if value is not None:
            _DEFAULT_USER_PROFILE[key] = value

    # Recalculate BMI if height or weight changed
    h = _DEFAULT_USER_PROFILE.get("height_cm")
    w = _DEFAULT_USER_PROFILE.get("weight_kg")
    if h and w and h > 0 and w > 0:
        _DEFAULT_USER_PROFILE["bmi"] = round(w / ((h / 100.0) ** 2), 1)

    return APIResponse(
        success=True,
        data=_DEFAULT_USER_PROFILE,
        message="User profile updated successfully",
    )
