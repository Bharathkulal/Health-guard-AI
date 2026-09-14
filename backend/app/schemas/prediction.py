"""
Pydantic Validation Schemas for Machine Learning Predictions & Risk Stratifications.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from app.schemas.assessment import HealthAssessmentCreate, LifestyleSchema, FamilyHistorySchema


class ConditionRiskDetail(BaseModel):
    id: str = Field(..., example="diabetes")
    name: str = Field(..., example="Diabetes Risk")
    score: int = Field(..., ge=0, le=100, example=62)
    probability: float = Field(..., ge=0.0, le=1.0, example=0.6234)
    level: str = Field(..., example="Moderate")
    color: str = Field(..., example="amber")
    model_name: str = Field(..., example="LogisticRegression")
    model_version: str = Field(..., example="1.0")
    model_roc_auc: Optional[float] = Field(default=0.88)
    keyDrivers: List[str] = Field(default_factory=list)
    summary: str = Field(...)


class ExplainableFactor(BaseModel):
    id: str
    feature: str
    value: str
    impact: float
    direction: str
    explanation: str


class ActionableRecommendation(BaseModel):
    id: str
    category: str
    priority: str
    title: str
    description: str
    actionableSteps: List[str]
    iconName: str


class RiskAssessmentResponse(BaseModel):
    assessment_id: str
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    overallScore: int = Field(..., ge=0, le=100)
    overallLevel: str = Field(..., example="Moderate")
    confidence: int = Field(default=94)
    categories: Dict[str, ConditionRiskDetail]
    explainableFactors: List[ExplainableFactor]
    recommendations: List[ActionableRecommendation]
    modelsUsed: Dict[str, Any]
    clinicalDisclaimer: str
