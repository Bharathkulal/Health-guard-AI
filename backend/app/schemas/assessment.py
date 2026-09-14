"""
Pydantic Validation Schemas for Health Assessment Ingestion, Storage, and ML Preparation.
"""

from typing import List, Optional, Dict, Any, Union
from enum import Enum
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator, model_validator


class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class PhysicalActivityEnum(str, Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"


class SmokingEnum(str, Enum):
    NEVER = "never"
    FORMER = "former"
    CURRENT = "current"
    OCCASIONAL = "occasional"
    REGULAR = "regular"


class AlcoholEnum(str, Enum):
    NEVER = "never"
    NONE = "none"
    OCCASIONALLY = "occasionally"
    OCCASIONAL = "occasional"
    FREQUENTLY = "frequently"
    MODERATE = "moderate"
    HEAVY = "heavy"


class DietEnum(str, Enum):
    BALANCED = "balanced"
    HIGH_CARBOHYDRATE = "high_carbohydrate"
    HIGH_FAT = "high_fat"
    HIGH_SUGAR = "high_sugar"
    MIXED = "mixed"
    MEDITERRANEAN = "mediterranean"
    PLANT_BASED = "plant_based"


class LifestyleSchema(BaseModel):
    """Structured lifestyle parameters prepared for ML feature extraction."""
    physical_activity: str = Field(default="moderate", description="Physical activity frequency")
    smoking: str = Field(default="never", description="Smoking/tobacco consumption history")
    alcohol: str = Field(default="occasional", description="Alcohol intake pattern")
    sleep_hours: float = Field(default=7.0, ge=0.0, le=24.0, description="Average sleep duration in hours")
    diet: str = Field(default="balanced", description="Primary dietary pattern")

    @field_validator("sleep_hours")
    @classmethod
    def validate_sleep(cls, v: float) -> float:
        if v < 0 or v > 24:
            raise ValueError("Sleep hours must be between 0 and 24 hours per day.")
        return round(float(v), 1)


class FamilyHistorySchema(BaseModel):
    """Structured hereditary indicators for chronic illness risk profiling."""
    diabetes: bool = Field(default=False, description="Family history of Type 2 Diabetes")
    hypertension: bool = Field(default=False, description="Family history of Essential Hypertension")
    heart_disease: bool = Field(default=False, description="Family history of Coronary Artery / CVD")
    early_heart_attack: bool = Field(default=False, description="Premature cardiac event (<55 yrs)")
    other_conditions: Optional[str] = Field(default=None, description="Other hereditary conditions")


class HealthAssessmentCreate(BaseModel):
    """
    Inbound validation model for full 6-step health assessment submission.
    Ensures clinical bounds and sanitization before MongoDB storage.
    """
    user_id: Optional[str] = Field(default="usr_alex_chen_892", description="Associated user identifier")
    
    # Step 1: Demographics
    age: int = Field(..., ge=18, le=125, description="Patient age in years (Adults 18+)")
    gender: str = Field(..., description="Biological sex / gender ('male', 'female', 'other')")

    # Step 2: Vital Indicators
    height_cm: float = Field(..., ge=50.0, le=280.0, description="Height in centimeters")
    weight_kg: float = Field(..., ge=20.0, le=400.0, description="Weight in kilograms")
    systolic_bp: int = Field(..., ge=50, le=300, description="Systolic blood pressure in mmHg")
    diastolic_bp: int = Field(..., ge=30, le=200, description="Diastolic blood pressure in mmHg")
    blood_sugar: float = Field(..., ge=20.0, le=600.0, description="Fasting blood glucose in mg/dL")
    heart_rate: int = Field(..., ge=30, le=250, description="Resting heart rate in BPM")
    bmi: Optional[float] = Field(default=None, description="Auto-calculated Body Mass Index")

    # Step 3: Symptoms
    symptoms: List[str] = Field(default_factory=list, description="Array of presenting symptom tokens")

    # Step 4: Lifestyle
    lifestyle: LifestyleSchema = Field(default_factory=LifestyleSchema, description="Behavioral patterns")

    # Step 5: Family History
    family_history: FamilyHistorySchema = Field(default_factory=FamilyHistorySchema, description="Hereditary history")

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ["male", "female", "other", "non_binary"]:
            return "other"
        return clean

    @field_validator("symptoms")
    @classmethod
    def sanitize_symptoms(cls, v: List[str]) -> List[str]:
        if not v:
            return []
        cleaned = [s.strip().lower().replace(" ", "_") for s in v if s and isinstance(s, str)]
        # If 'none' is present, return empty or ['none']
        if "none" in cleaned:
            if len(cleaned) == 1:
                return []
            cleaned = [s for s in cleaned if s != "none"]
        return list(set(cleaned))

    @model_validator(mode="after")
    def compute_and_verify_bmi(self) -> "HealthAssessmentCreate":
        """
        Calculates or standardizes BMI = weight_kg / (height_m ^ 2).
        Maintains precision and accuracy across the pipeline.
        """
        if self.height_cm > 0 and self.weight_kg > 0:
            height_m = self.height_cm / 100.0
            calculated = round(self.weight_kg / (height_m ** 2), 1)
            self.bmi = calculated
        return self


class HealthAssessmentResponse(BaseModel):
    """Response returned upon successful assessment persistence."""
    assessment_id: str = Field(..., description="Unique assessment record identifier")
    status: str = Field(default="received", description="Status code indicating assessment state")
    user_id: Optional[str] = Field(default=None, description="Patient/User identifier")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    bmi: float
    systolic_bp: int
    diastolic_bp: int
    blood_sugar: float
    heart_rate: int
    symptoms: List[str]
    lifestyle: LifestyleSchema
    family_history: FamilyHistorySchema
    message: str = Field(default="Assessment received and stored securely. Ready for ML risk analysis pipeline.")


class HealthAssessmentListItem(BaseModel):
    """Summary item for assessment history lists."""
    assessment_id: str
    user_id: Optional[str]
    created_at: datetime
    age: int
    gender: str
    bmi: float
    systolic_bp: int
    diastolic_bp: int
    blood_sugar: float
    heart_rate: int
    symptoms_count: int
    status: str
