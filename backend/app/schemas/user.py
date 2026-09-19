"""
User Profile, Authentication, and Demographics Schemas.
"""

import re
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name")
    email: EmailStr = Field(..., description="User Email Address")
    password: str = Field(..., min_length=8, max_length=128, description="Account Password")
    confirm_password: Optional[str] = Field(default=None, description="Password Confirmation")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Name must be at least 2 characters long.")
        return clean

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one alphabetic letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one numeric digit.")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserRegisterRequest":
        if self.confirm_password is not None and self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Account Email or Username")
    password: str = Field(..., min_length=1, description="Account Password")


class GoogleAuthRequest(BaseModel):
    token: Optional[str] = None
    credential: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    google_id: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Existing Password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New Password")
    confirm_new_password: str = Field(..., min_length=8, max_length=128, description="Confirm New Password")

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters long.")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("New password must contain at least one alphabetic letter.")
        if not re.search(r"\d", v):
            raise ValueError("New password must contain at least one numeric digit.")
        return v

    @model_validator(mode="after")
    def check_new_passwords_match(self) -> "PasswordChangeRequest":
        if self.new_password != self.confirm_new_password:
            raise ValueError("New password and confirmation do not match.")
        if self.current_password == self.new_password:
            raise ValueError("New password must be different from current password.")
        return self


class AccountDeleteRequest(BaseModel):
    password: str = Field(..., min_length=1, description="Password to confirm account deletion")
    confirmation: Optional[str] = Field(default="DELETE", description="Confirmation token text")


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: Optional[str] = "user"
    created_at: Optional[str] = None
    member_since: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=18, le=120)
    gender: Optional[str] = Field(default="other")
    height_cm: Optional[float] = Field(default=None)
    weight_kg: Optional[float] = Field(default=None)
    bmi: Optional[float] = Field(default=None)
    baseline_activity: Optional[str] = Field(default=None)
    blood_type: Optional[str] = Field(default=None)
    emergency_contact: Optional[str] = Field(default=None)
    assessment_count: Optional[int] = Field(default=0)


class UserAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    age: Optional[int] = Field(default=None, ge=18, le=120)
    gender: Optional[str] = None
    height_cm: Optional[float] = Field(default=None, ge=50, le=250)
    weight_kg: Optional[float] = Field(default=None, ge=20, le=300)
    baseline_activity: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact: Optional[str] = None


# Backwards compatibility alias
UserProfileBase = UserResponse
