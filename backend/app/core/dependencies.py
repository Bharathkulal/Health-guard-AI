"""
FastAPI Dependencies for Authentication, Authorization & Security Contexts.
"""

import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.security import decode_access_token
from app.services.auth_service import auth_service

logger = logging.getLogger("healthguard.dependencies")

# HTTPBearer scheme that doesn't auto-error so cookie fallback can be examined
http_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer_scheme),
) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and verifies the active user's JWT token.
    Checks Authorization: Bearer <token> header first, then falls back to HTTP-only cookie.
    
    Raises HTTP 401 Unauthorized if the token is missing, invalid, or expired.
    Returns sanitized current user dictionary.
    """
    token: Optional[str] = None

    if auth_header and auth_header.credentials:
        token = auth_header.credentials
    elif settings.COOKIE_NAME in request.cookies:
        token = request.cookies[settings.COOKIE_NAME]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or authentication token is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await auth_service.find_user_by_id(user_id, include_sensitive=False)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_optional_current_user(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer_scheme),
) -> Optional[Dict[str, Any]]:
    """
    Optional authentication dependency for routes that personalize output if logged in.
    Returns None if no valid session token exists without throwing 401.
    """
    token: Optional[str] = None

    if auth_header and auth_header.credentials:
        token = auth_header.credentials
    elif settings.COOKIE_NAME in request.cookies:
        token = request.cookies[settings.COOKIE_NAME]

    if not token:
        return None

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        return None

    return await auth_service.find_user_by_id(payload["sub"], include_sensitive=False)
