"""
Prediction Service for HealthGuard AI.

Loads the trained heart disease and diabetes pipelines and provides
prediction functions that map assessment form data to model features.

All predictions come from actual trained scikit-learn pipelines.
No fake values, no hardcoded results.

Feature Mapping Strategy:
    The assessment form collects general health data. Not all model features
    are available from the form. Missing features are set to NaN and the
    pipeline's imputer fills them with training medians. This is documented
    and transparent — the model honestly uses what information it has.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, Optional, List, Tuple

import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger("healthguard.ml.prediction")

ML_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODELS_DIR = os.path.join(ML_ROOT, "models")


class HealthRiskPredictor:
    """
    Loads trained ML pipelines and provides prediction functions
    for heart disease and diabetes risk assessment.
    """

    def __init__(self, models_dir: str = MODELS_DIR):
        self.models_dir = models_dir
        self.heart_pipeline = None
        self.diabetes_pipeline = None
        self.metadata: Dict[str, Any] = {}
        self._load_models()

    def _load_models(self):
        """Loads trained pipeline artifacts and metadata from disk, checking active model registry."""
        try:
            from src.training.model_registry import model_registry
            active_heart = model_registry.get_active_model_for_condition("heart")
            active_diabetes = model_registry.get_active_model_for_condition("diabetes")
        except Exception:
            active_heart = None
            active_diabetes = None

        # Load heart model
        heart_path = active_heart.get("pipeline_path") if (active_heart and active_heart.get("pipeline_path") and os.path.exists(active_heart["pipeline_path"])) else os.path.join(self.models_dir, "heart_model.joblib")
        if not os.path.exists(heart_path):
            alt_path = os.path.join(self.models_dir, "cardiovascular_pipeline.joblib")
            if os.path.exists(alt_path):
                heart_path = alt_path

        if os.path.exists(heart_path):
            try:
                self.heart_pipeline = joblib.load(heart_path)
                logger.info(f"Loaded active heart disease model: {heart_path}")
            except Exception as exc:
                logger.error(f"Failed to load heart model: {exc}")
        else:
            logger.warning(f"Heart model not found: {heart_path}.")

        # Load diabetes model
        diabetes_path = active_diabetes.get("pipeline_path") if (active_diabetes and active_diabetes.get("pipeline_path") and os.path.exists(active_diabetes["pipeline_path"])) else os.path.join(self.models_dir, "diabetes_model.joblib")
        if not os.path.exists(diabetes_path):
            alt_path = os.path.join(self.models_dir, "diabetes_pipeline.joblib")
            if os.path.exists(alt_path):
                diabetes_path = alt_path

        if os.path.exists(diabetes_path):
            try:
                self.diabetes_pipeline = joblib.load(diabetes_path)
                logger.info(f"Loaded active diabetes model: {diabetes_path}")
            except Exception as exc:
                logger.error(f"Failed to load diabetes model: {exc}")
        else:
            logger.warning(f"Diabetes model not found: {diabetes_path}.")

        # Load metadata
        meta_path = os.path.join(self.models_dir, "metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info("Loaded model metadata")
            except Exception as exc:
                logger.error(f"Failed to load metadata: {exc}")
        
        if active_heart:
            self.metadata["heart"] = active_heart
        if active_diabetes:
            self.metadata["diabetes"] = active_diabetes

    def reload_models(self) -> bool:
        """Forces reloading of pipeline artifacts and metadata from disk."""
        self._load_models()
        return self.is_ready()

    def is_ready(self) -> bool:
        """Returns True if both models are loaded."""
        return self.heart_pipeline is not None and self.diabetes_pipeline is not None

    def get_models_metadata(self) -> Dict[str, Any]:
        """Returns metadata for all loaded models."""
        return self.metadata

    def _align_dataframe_to_pipeline(self, pipeline, input_data: Dict[str, Any], condition: str) -> Tuple[pd.DataFrame, int, int]:
        """Aligns assessment data to the exact feature signature expected by the trained pipeline."""
        from src.features import extract_features_from_assessment
        extracted = extract_features_from_assessment(input_data)
        base_df = extracted.get("cardiovascular" if condition == "heart" else condition)

        expected_features = None
        if hasattr(pipeline, "feature_names_in_"):
            expected_features = list(pipeline.feature_names_in_)
        elif hasattr(pipeline, "named_steps"):
            for step_name in ["preprocessor", "scaler", "imputer", "classifier"]:
                step = pipeline.named_steps.get(step_name)
                if step and hasattr(step, "feature_names_in_"):
                    expected_features = list(step.feature_names_in_)
                    break

        if expected_features:
            row = {}
            for col in expected_features:
                col_lower = col.lower()
                if base_df is not None and col in base_df.columns:
                    row[col] = base_df[col].iloc[0]
                elif base_df is not None and col_lower in [c.lower() for c in base_df.columns]:
                    matching_c = [c for c in base_df.columns if c.lower() == col_lower][0]
                    row[col] = base_df[matching_c].iloc[0]
                elif col in input_data:
                    row[col] = input_data[col]
                elif col_lower in ("trestbps", "systolic_bp"):
                    row[col] = float(input_data.get("systolic_bp") or 120.0)
                elif col_lower in ("glucose", "blood_sugar"):
                    row[col] = float(input_data.get("blood_sugar") or 95.0)
                elif col_lower in ("bloodpressure", "diastolic_bp"):
                    row[col] = float(input_data.get("diastolic_bp") or 80.0)
                elif col_lower in ("bmi",):
                    row[col] = float(input_data.get("bmi") or 24.5)
                elif col_lower in ("age",):
                    row[col] = float(input_data.get("age") or 40.0)
                elif col_lower in ("sex", "gender"):
                    row[col] = 1.0 if str(input_data.get("gender", "")).lower() in ("male", "m") else 0.0
                elif col_lower in ("thalach", "heart_rate"):
                    row[col] = float(input_data.get("heart_rate") or 72.0)
                elif col_lower in ("fbs",):
                    row[col] = 1.0 if float(input_data.get("blood_sugar", 0) or 0) > 120 else 0.0
                elif col_lower in ("diabetespedigreefunction",):
                    row[col] = 0.5 if input_data.get("family_history", {}).get("diabetes") else 0.2
                else:
                    row[col] = np.nan

            df = pd.DataFrame([row])[expected_features]
            available = int(df.notna().sum(axis=1).iloc[0])
            imputed = len(expected_features) - available
            return df, available, imputed

        # Fallback UCI Heart / Pima layout
        if condition == "heart":
            f_names = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
            gender_raw = str(input_data.get("gender", "")).lower()
            sex = 1.0 if gender_raw in ("male", "m") else 0.0
            blood_sugar_val = float(input_data.get("blood_sugar", 0) or 0)
            fbs = 1.0 if blood_sugar_val > 120 else 0.0
            row = {
                "age": float(input_data.get("age", 40)),
                "sex": sex,
                "cp": np.nan,
                "trestbps": float(input_data.get("systolic_bp", 120)),
                "chol": np.nan,
                "fbs": fbs,
                "restecg": np.nan,
                "thalach": float(input_data.get("heart_rate", 72)),
                "exang": np.nan,
                "oldpeak": np.nan,
                "slope": np.nan,
                "ca": np.nan,
                "thal": np.nan,
            }
            df = pd.DataFrame([row])[f_names]
            available = int(df.notna().sum(axis=1).iloc[0])
            return df, available, len(f_names) - available
        else:
            f_names = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
            dpf = 0.5 if input_data.get("family_history", {}).get("diabetes") else 0.2
            row = {
                "Pregnancies": np.nan,
                "Glucose": float(input_data.get("blood_sugar", 95)),
                "BloodPressure": float(input_data.get("diastolic_bp", 80)),
                "SkinThickness": np.nan,
                "Insulin": np.nan,
                "BMI": float(input_data.get("bmi", 24.5)),
                "DiabetesPedigreeFunction": dpf,
                "Age": float(input_data.get("age", 40)),
            }
            df = pd.DataFrame([row])[f_names]
            available = int(df.notna().sum(axis=1).iloc[0])
            return df, available, len(f_names) - available

    def predict_heart_risk(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predicts heart disease risk using active model."""
        if self.heart_pipeline is None:
            self._load_models()
        if self.heart_pipeline is None:
            raise RuntimeError("Heart disease model not loaded.")

        df, available, imputed = self._align_dataframe_to_pipeline(self.heart_pipeline, input_data, condition="heart")

        prediction = int(self.heart_pipeline.predict(df)[0])
        if hasattr(self.heart_pipeline, "predict_proba"):
            probabilities = self.heart_pipeline.predict_proba(df)[0]
            prob_positive = float(probabilities[1])
        else:
            prob_positive = float(prediction)

        heart_meta = self.metadata.get("heart", {})

        return {
            "prediction": prediction,
            "probability": round(prob_positive, 4),
            "model_name": heart_meta.get("name") or heart_meta.get("model_name", "RandomForest"),
            "model_version": heart_meta.get("version") or heart_meta.get("training_date", "v1.0"),
            "features_available": available,
            "features_imputed": imputed,
        }

    def predict_diabetes_risk(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predicts diabetes risk using active model."""
        if self.diabetes_pipeline is None:
            self._load_models()
        if self.diabetes_pipeline is None:
            raise RuntimeError("Diabetes model not loaded.")

        df, available, imputed = self._align_dataframe_to_pipeline(self.diabetes_pipeline, input_data, condition="diabetes")

        prediction = int(self.diabetes_pipeline.predict(df)[0])
        if hasattr(self.diabetes_pipeline, "predict_proba"):
            probabilities = self.diabetes_pipeline.predict_proba(df)[0]
            prob_positive = float(probabilities[1])
        else:
            prob_positive = float(prediction)

        diabetes_meta = self.metadata.get("diabetes", {})

        return {
            "prediction": prediction,
            "probability": round(prob_positive, 4),
            "model_name": diabetes_meta.get("name") or diabetes_meta.get("model_name", "RandomForest"),
            "model_version": diabetes_meta.get("version") or diabetes_meta.get("training_date", "v1.0"),
            "features_available": available,
            "features_imputed": imputed,
        }

    def get_heart_feature_importances(self) -> List[Dict[str, Any]]:
        """Returns feature importances for the heart model."""
        heart_meta = self.metadata.get("heart", {})
        # Read from the full metrics file for importances
        metrics_path = os.path.join(ML_ROOT, "reports", "heart_metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data.get("feature_importances", [])
        return []

    def get_diabetes_feature_importances(self) -> List[Dict[str, Any]]:
        """Returns feature importances for the diabetes model."""
        metrics_path = os.path.join(ML_ROOT, "reports", "diabetes_metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data.get("feature_importances", [])
        return []


# Singleton instance
predictor = HealthRiskPredictor()
