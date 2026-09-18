"""
Authentication and Identity API Endpoints for HealthGuard AI.
Provides registration, login, token refresh, password alteration, and account deletion.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.rate_limiter import rate_limit_auth
from app.schemas.response import APIResponse
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    GoogleAuthRequest,
    UserResponse,
    UserAuthResponse,
    PasswordChangeRequest,
    AccountDeleteRequest,
)
from app.services.auth_service import auth_service

router = APIRouter()


def _set_auth_cookie(response: Response, token: str):
    """Configures secure, HTTP-only cookie with defense-in-depth flags."""
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )


def _clear_auth_cookie(response: Response):
    """Clears authentication cookie on session termination."""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register New User Account",
    description="Creates a new account with validated credentials and hashed password, issuing a JWT access token.",
    response_model=APIResponse[UserAuthResponse],
    dependencies=[Depends(rate_limit_auth)],
)
async def register(reg_data: UserRegisterRequest, response: Response):
    """Registers a new user and returns authentication token."""
    auth_result = await auth_service.register_user(reg_data)
    _set_auth_cookie(response, auth_result.access_token)
    return APIResponse(
        success=True,
        data=auth_result,
        message="Account registered successfully. Welcome to HealthGuard AI!",
    )


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="Authenticate User and Issue Token",
    description="Validates email and password credentials, returning a signed JWT access token and session cookie.",
    response_model=APIResponse[UserAuthResponse],
    dependencies=[Depends(rate_limit_auth)],
)
async def login(login_data: UserLoginRequest, response: Response):
    """Authenticates credentials and returns user payload."""
    auth_result = await auth_service.authenticate_user(login_data)
    _set_auth_cookie(response, auth_result.access_token)
    return APIResponse(
        success=True,
        data=auth_result,
        message="Authentication successful.",
    )


@router.post(
    "/google",
    status_code=status.HTTP_200_OK,
    summary="Authenticate with Google OAuth",
    description="Authenticates or signs up a patient using Google OAuth credential or token.",
    response_model=APIResponse[UserAuthResponse],
    dependencies=[Depends(rate_limit_auth)],
)
async def google_auth(google_data: GoogleAuthRequest, response: Response):
    """Authenticates credentials via Google OAuth and issues JWT."""
    auth_result = await auth_service.authenticate_google_user(google_data)
    _set_auth_cookie(response, auth_result.access_token)
    return APIResponse(
        success=True,
        data=auth_result,
        message="Google authentication successful.",
    )


@router.get(
    "/me",
    summary="Get Current Authenticated User Session",
    description="Returns sanitized profile details for the currently active JWT session.",
    response_model=APIResponse[UserResponse],
)
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Restores user profile and session identity."""
    profile = await auth_service.get_current_user_profile(current_user["user_id"])
    return APIResponse(
        success=True,
        data=profile,
        message="Session active.",
    )


@router.post(
    "/logout",
    summary="Logout User Session",
    description="Clears client authentication cookie and terminates current session.",
    response_model=APIResponse[Dict[str, bool]],
)
async def logout(response: Response):
    """Logs out current user session."""
    _clear_auth_cookie(response)
    return APIResponse(
        success=True,
        data={"logged_out": True},
        message="Logged out successfully.",
    )


@router.post(
    "/change-password",
    summary="Change User Password",
    description="Verifies the current password and establishes a new secure password hash.",
    response_model=APIResponse[Dict[str, bool]],
)
async def change_password(
    change_data: PasswordChangeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Changes password for authenticated user."""
    await auth_service.change_password(current_user["user_id"], change_data)
    return APIResponse(
        success=True,
        data={"changed": True},
        message="Password updated successfully.",
    )


@router.delete(
    "/account",
    summary="Delete User Account Permanently",
    description="Cascading deletion of user profile, historical health assessments, and risk predictions.",
    response_model=APIResponse[Dict[str, bool]],
)
async def delete_account(
    delete_data: AccountDeleteRequest,
    response: Response,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Permanently deletes authenticated user account."""
    await auth_service.delete_user_account(current_user["user_id"], delete_data)
    _clear_auth_cookie(response)
    return APIResponse(
        success=True,
        data={"deleted": True},
        message="Account and all associated health records permanently deleted.",
    )
