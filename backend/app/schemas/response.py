"""
Standardized API Response Models for HealthGuard AI.
"""

from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized API response wrapper matching frontend expectations."""
    success: bool = Field(..., description="Indicates whether the request was successful")
    data: Optional[T] = Field(default=None, description="Payload data returned by the endpoint")
    message: str = Field(..., description="Human-readable response message")
    errors: Optional[List[Any]] = Field(default=None, description="Detailed validation or execution errors if any")


class HealthCheckResponse(BaseModel):
    """System health check payload."""
    status: str = Field(..., examples=["ok"])
    service: str = Field(..., examples=["healthguard-api"])
    version: str = Field(..., examples=["1.0.0"])
    database: str = Field(..., examples=["connected"])
    timestamp: str = Field(..., description="Current ISO-8601 UTC server timestamp")
