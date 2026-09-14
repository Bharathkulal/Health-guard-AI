"""
User Profile and Demographic Schemas.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserProfileBase(BaseModel):
    user_id: str = Field(..., description="Unique User ID")
    name: str = Field(..., description="Full Name")
    email: Optional[EmailStr] = Field(default=None, description="User Email")
    age: Optional[int] = Field(default=None, ge=18, le=120)
    gender: Optional[str] = Field(default="male")
    height_cm: Optional[float] = Field(default=None)
    weight_kg: Optional[float] = Field(default=None)
    bmi: Optional[float] = Field(default=None)
    baseline_activity: Optional[str] = Field(default="moderate")
    blood_type: Optional[str] = Field(default="A+")
    emergency_contact: Optional[str] = Field(default=None)


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    baseline_activity: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact: Optional[str] = None
