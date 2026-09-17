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
from typing import Dict, Any, Optional, List

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
        """Loads trained pipeline artifacts and metadata from disk."""
        # Load heart model
        heart_path = os.path.join(self.models_dir, "heart_model.joblib")
        if os.path.exists(heart_path):
            try:
                self.heart_pipeline = joblib.load(heart_path)
                logger.info(f"Loaded heart disease model: {heart_path}")
            except Exception as exc:
                logger.error(f"Failed to load heart model: {exc}")
        else:
            logger.warning(f"Heart model not found: {heart_path}. Run train_heart.py first.")

        # Load diabetes model
        diabetes_path = os.path.join(self.models_dir, "diabetes_model.joblib")
        if os.path.exists(diabetes_path):
            try:
                self.diabetes_pipeline = joblib.load(diabetes_path)
                logger.info(f"Loaded diabetes model: {diabetes_path}")
            except Exception as exc:
                logger.error(f"Failed to load diabetes model: {exc}")
        else:
            logger.warning(f"Diabetes model not found: {diabetes_path}. Run train_diabetes.py first.")

        # Load metadata
        meta_path = os.path.join(self.models_dir, "metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info("Loaded model metadata")
            except Exception as exc:
                logger.error(f"Failed to load metadata: {exc}")

    def is_ready(self) -> bool:
        """Returns True if both models are loaded."""
        return self.heart_pipeline is not None and self.diabetes_pipeline is not None

    def get_models_metadata(self) -> Dict[str, Any]:
        """Returns metadata for all loaded models."""
        return self.metadata

    def predict_heart_risk(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts heart disease risk from assessment form data.

        Feature Mapping (Assessment Form → UCI Heart Disease features):
            age         → age
            gender      → sex (male=1, female=0)
            systolic_bp → trestbps (resting blood pressure)
            blood_sugar → fbs (1 if > 120 mg/dL, else 0)
            heart_rate  → thalach (used as proxy for max heart rate)
            cp, chol, restecg, exang, oldpeak, slope, ca, thal → NaN (imputed)

        Returns:
            {
                "prediction": 0 or 1,
                "probability": float (0.0 to 1.0),
                "model_name": str,
                "model_version": str,
                "features_available": int,
                "features_imputed": int
            }
        """
        if self.heart_pipeline is None:
            raise RuntimeError("Heart disease model not loaded. Run train_heart.py first.")

        # Extract values from assessment data
        lifestyle = input_data.get("lifestyle", {}) if isinstance(input_data.get("lifestyle"), dict) else {}
        symptoms = input_data.get("symptoms", []) if isinstance(input_data.get("symptoms"), list) else []

        # Map gender
        gender_raw = str(input_data.get("gender", "")).lower()
        sex = 1 if gender_raw in ("male", "m") else 0

        # Map blood sugar to fbs (binary: >120 = 1)
        blood_sugar_val = float(input_data.get("blood_sugar", 0) or 0)
        fbs = 1 if blood_sugar_val > 120 else 0

        # Try to infer chest pain type from symptoms
        cp_val = np.nan
        symptom_set = set(s.lower().replace(" ", "_") for s in symptoms if s)
        if "chest_pain" in symptom_set or "chest_pressure" in symptom_set:
            cp_val = 2.0  # atypical angina as default when chest pain reported
        elif "angina" in symptom_set:
            cp_val = 1.0  # typical angina

        # Build feature DataFrame matching UCI Heart Disease column order
        features = {
            "age": float(input_data.get("age", np.nan)),
            "sex": float(sex),
            "cp": cp_val,  # chest pain type — may be NaN (imputed)
            "trestbps": float(input_data.get("systolic_bp", np.nan)),
            "chol": np.nan,  # cholesterol — not in form (imputed)
            "fbs": float(fbs),
            "restecg": np.nan,  # resting ECG — not in form (imputed)
            "thalach": float(input_data.get("heart_rate", np.nan)),  # proxy
            "exang": np.nan,  # exercise angina — not in form (imputed)
            "oldpeak": np.nan,  # ST depression — not in form (imputed)
            "slope": np.nan,  # ST slope — not in form (imputed)
            "ca": np.nan,  # vessels by fluoroscopy — not in form (imputed)
            "thal": np.nan,  # thalassemia — not in form (imputed)
        }

        feature_names = [
            "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
            "thalach", "exang", "oldpeak", "slope", "ca", "thal"
        ]

        df = pd.DataFrame([features])[feature_names]

        # Count available vs imputed features
        available = int(df.notna().sum(axis=1).iloc[0])
        imputed = len(feature_names) - available

        # Run prediction through the pipeline (imputer handles NaN)
        prediction = int(self.heart_pipeline.predict(df)[0])
        probabilities = self.heart_pipeline.predict_proba(df)[0]
        prob_positive = float(probabilities[1])

        heart_meta = self.metadata.get("heart", {})

        return {
            "prediction": prediction,
            "probability": round(prob_positive, 4),
            "model_name": heart_meta.get("model_name", "RandomForest"),
            "model_version": heart_meta.get("training_date", "unknown"),
            "features_available": available,
            "features_imputed": imputed,
        }

    def predict_diabetes_risk(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts diabetes risk from assessment form data.

        Feature Mapping (Assessment Form → Pima Diabetes features):
            blood_sugar → Glucose (plasma glucose, used directly)
            diastolic_bp → BloodPressure (diastolic)
            bmi → BMI
            age → Age
            family_history.diabetes → DiabetesPedigreeFunction (0.5 if yes, 0.2 if no)
            Pregnancies, SkinThickness, Insulin → NaN (imputed)

        Returns:
            {
                "prediction": 0 or 1,
                "probability": float (0.0 to 1.0),
                "model_name": str,
                "model_version": str,
                "features_available": int,
                "features_imputed": int
            }
        """
        if self.diabetes_pipeline is None:
            raise RuntimeError("Diabetes model not loaded. Run train_diabetes.py first.")

        # Extract family history
        family = input_data.get("family_history", {}) if isinstance(input_data.get("family_history"), dict) else {}

        # Map family history to pedigree function proxy
        has_family_diabetes = bool(family.get("diabetes", False))
        dpf = 0.5 if has_family_diabetes else 0.2  # rough proxy for DiabetesPedigreeFunction

        # Build feature DataFrame matching Pima dataset column order
        features = {
            "Pregnancies": np.nan,  # not in form (imputed)
            "Glucose": float(input_data.get("blood_sugar", np.nan)),
            "BloodPressure": float(input_data.get("diastolic_bp", np.nan)),
            "SkinThickness": np.nan,  # not in form (imputed)
            "Insulin": np.nan,  # not in form (imputed)
            "BMI": float(input_data.get("bmi", np.nan)),
            "DiabetesPedigreeFunction": dpf,
            "Age": float(input_data.get("age", np.nan)),
        }

        feature_names = [
            "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
        ]

        df = pd.DataFrame([features])[feature_names]

        # Count available vs imputed features
        available = int(df.notna().sum(axis=1).iloc[0])
        imputed = len(feature_names) - available

        # Run prediction through the pipeline
        prediction = int(self.diabetes_pipeline.predict(df)[0])
        probabilities = self.diabetes_pipeline.predict_proba(df)[0]
        prob_positive = float(probabilities[1])

        diabetes_meta = self.metadata.get("diabetes", {})

        return {
            "prediction": prediction,
            "probability": round(prob_positive, 4),
            "model_name": diabetes_meta.get("model_name", "RandomForest"),
            "model_version": diabetes_meta.get("training_date", "unknown"),
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
