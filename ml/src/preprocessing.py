"""
Preprocessing Pipeline Module for HealthGuard AI.
Handles clinical bounds sanitation, missing value imputation, and feature scaling without data leakage.
"""

from typing import List
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, RobustScaler


class ClinicalOutlierClipper(BaseEstimator, TransformerMixin):
    """
    Clips extreme physiological sensor readings to realistic biological bounds
    to prevent sensor anomalies from distorting gradient updates.
    """
    def __init__(self):
        self.bounds = {
            "age": (18, 120),
            "height_cm": (100.0, 250.0),
            "weight_kg": (25.0, 300.0),
            "bmi": (12.0, 65.0),
            "systolic_bp": (70, 260),
            "diastolic_bp": (40, 160),
            "blood_sugar": (40.0, 500.0),
            "heart_rate": (35, 230),
            "sleep_hours": (1.0, 18.0),
        }

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_df = pd.DataFrame(X).copy()
        for col, (low, high) in self.bounds.items():
            if col in X_df.columns:
                X_df[col] = X_df[col].clip(lower=low, upper=high)
        return X_df


def build_preprocessor(feature_names: List[str]) -> Pipeline:
    """
    Builds a robust, leakage-free Scikit-Learn preprocessing pipeline.
    Steps:
    1. Clinical bounds verification
    2. Median imputation for any missing clinical indicators
    3. Robust scaling for continuous numerical stability
    """
    return Pipeline([
        ("clipper", ClinicalOutlierClipper()),
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
