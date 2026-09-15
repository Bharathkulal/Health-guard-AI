"""
Feature Engineering and Biomarker Normalization Module.
Transforms raw patient assessment dictionaries into feature vectors matching each trained model.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd


def compute_bmi(height_cm: float, weight_kg: float) -> float:
    """Calculates Body Mass Index (BMI in kg/m^2)."""
    if height_cm <= 0 or weight_kg <= 0:
        return 24.0
    height_m = height_cm / 100.0
    return round(float(weight_kg / (height_m ** 2)), 1)


def compute_pulse_pressure(systolic: int, diastolic: int) -> int:
    """Calculates Pulse Pressure = SBP - DBP."""
    return max(10, int(systolic) - int(diastolic))


def compute_mean_arterial_pressure(systolic: int, diastolic: int) -> float:
    """Calculates Mean Arterial Pressure (MAP) = DBP + (1/3 * (SBP - DBP))."""
    return round(float(diastolic) + (float(systolic) - float(diastolic)) / 3.0, 1)


def map_activity_to_numeric(activity_str: str) -> int:
    """Maps activity string to 0..3."""
    mapping = {
        "sedentary": 0,
        "light": 1,
        "moderate": 2,
        "active": 3,
    }
    return mapping.get(str(activity_str).lower(), 1)


def map_smoking_to_numeric(smoking_str: str) -> int:
    """Maps smoking status to 0..2."""
    mapping = {
        "never": 0,
        "former": 1,
        "current": 2,
        "occasional": 1,
        "regular": 2,
    }
    return mapping.get(str(smoking_str).lower(), 0)


def map_alcohol_to_numeric(alcohol_str: str) -> int:
    """Maps alcohol intake to 0..2."""
    mapping = {
        "never": 0,
        "none": 0,
        "occasionally": 1,
        "occasional": 1,
        "frequently": 2,
        "moderate": 1,
        "heavy": 2,
    }
    return mapping.get(str(alcohol_str).lower(), 1)


def map_gender_to_numeric(gender_str: str) -> int:
    """Maps gender to 0 (female) or 1 (male/other baseline)."""
    g = str(gender_str).lower()
    if g == "female":
        return 0
    return 1


# Feature schemas expected by each model
DIABETES_FEATURES = [
    "age",
    "gender",
    "bmi",
    "systolic_bp",
    "diastolic_bp",
    "blood_sugar",
    "heart_rate",
    "physical_activity",
    "smoking",
    "alcohol",
    "sleep_hours",
    "family_history_diabetes",
    "symptoms_count",
]

CARDIOVASCULAR_FEATURES = [
    "age",
    "gender",
    "height_cm",
    "weight_kg",
    "bmi",
    "systolic_bp",
    "diastolic_bp",
    "blood_sugar",
    "heart_rate",
    "smoking",
    "alcohol",
    "physical_activity",
    "family_history_cardio",
]

HYPERTENSION_FEATURES = [
    "age",
    "gender",
    "bmi",
    "systolic_bp",
    "diastolic_bp",
    "heart_rate",
    "sleep_hours",
    "physical_activity",
    "smoking",
    "alcohol",
    "family_history_hypertension",
]


def extract_features_from_assessment(assessment_dict: Dict[str, Any]) -> Dict[str, pd.DataFrame]:
    """
    Transforms an assessment dictionary (from frontend/database) into formatted single-row
    Pandas DataFrames ready for inference on Diabetes, Cardiovascular, and Hypertension pipelines.
    """
    vitals = assessment_dict.get("vitals", {}) if isinstance(assessment_dict.get("vitals"), dict) else {}
    lifestyle = assessment_dict.get("lifestyle", {}) if isinstance(assessment_dict.get("lifestyle"), dict) else {}
    family = assessment_dict.get("family_history", {}) if isinstance(assessment_dict.get("family_history"), dict) else {}
    symptoms = assessment_dict.get("symptoms", [])

    age = int(assessment_dict.get("age", 40))
    gender = map_gender_to_numeric(assessment_dict.get("gender") or assessment_dict.get("sex", "male"))

    height_cm = float(assessment_dict.get("height_cm") or vitals.get("height_cm") or vitals.get("heightCm") or 170.0)
    weight_kg = float(assessment_dict.get("weight_kg") or vitals.get("weight_kg") or vitals.get("weightKg") or 70.0)
    bmi = float(assessment_dict.get("bmi") or vitals.get("bmi") or compute_bmi(height_cm, weight_kg))

    systolic_bp = int(assessment_dict.get("systolic_bp") or vitals.get("systolic_bp") or vitals.get("systolicBP") or 120)
    diastolic_bp = int(assessment_dict.get("diastolic_bp") or vitals.get("diastolic_bp") or vitals.get("diastolicBP") or 80)
    blood_sugar = float(assessment_dict.get("blood_sugar") or vitals.get("blood_sugar") or vitals.get("fastingBloodSugar") or 95.0)
    heart_rate = int(assessment_dict.get("heart_rate") or vitals.get("heart_rate") or vitals.get("heartRate") or 72)

    activity_raw = lifestyle.get("physical_activity") or lifestyle.get("physicalActivity") or assessment_dict.get("physical_activity") or "moderate"
    smoking_raw = lifestyle.get("smoking") or assessment_dict.get("smoking") or "never"
    alcohol_raw = lifestyle.get("alcohol") or assessment_dict.get("alcohol") or "occasional"
    sleep_raw = lifestyle.get("sleep_hours") or lifestyle.get("sleepHours") or assessment_dict.get("sleep_hours") or 7.0

    activity_num = map_activity_to_numeric(activity_raw)
    smoking_num = map_smoking_to_numeric(smoking_raw)
    alcohol_num = map_alcohol_to_numeric(alcohol_raw)
    sleep_hours = float(sleep_raw)

    fam_diab = 1 if (family.get("diabetes") or assessment_dict.get("family_history_diabetes")) else 0
    fam_cardio = 1 if (family.get("heart_disease") or family.get("cardiovascular") or family.get("early_heart_attack") or assessment_dict.get("family_history_cardio")) else 0
    fam_htn = 1 if (family.get("hypertension") or assessment_dict.get("family_history_hypertension")) else 0

    symptoms_count = len([s for s in symptoms if s and s != "none"]) if isinstance(symptoms, list) else int(assessment_dict.get("symptoms_count", 0))

    # Build DataFrames matching exact training column signatures
    df_diabetes = pd.DataFrame([{
        "age": age,
        "gender": gender,
        "bmi": bmi,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "blood_sugar": blood_sugar,
        "heart_rate": heart_rate,
        "physical_activity": activity_num,
        "smoking": smoking_num,
        "alcohol": alcohol_num,
        "sleep_hours": sleep_hours,
        "family_history_diabetes": fam_diab,
        "symptoms_count": symptoms_count,
    }])[DIABETES_FEATURES]

    df_cardio = pd.DataFrame([{
        "age": age,
        "gender": gender,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "bmi": bmi,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "blood_sugar": blood_sugar,
        "heart_rate": heart_rate,
        "smoking": 1 if smoking_num > 0 else 0,
        "alcohol": 1 if alcohol_num > 0 else 0,
        "physical_activity": 1 if activity_num > 0 else 0,
        "family_history_cardio": fam_cardio,
    }])[CARDIOVASCULAR_FEATURES]

    df_htn = pd.DataFrame([{
        "age": age,
        "gender": gender,
        "bmi": bmi,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "heart_rate": heart_rate,
        "sleep_hours": sleep_hours,
        "physical_activity": activity_num,
        "smoking": smoking_num,
        "alcohol": alcohol_num,
        "family_history_hypertension": fam_htn,
    }])[HYPERTENSION_FEATURES]

    return {
        "diabetes": df_diabetes,
        "cardiovascular": df_cardio,
        "hypertension": df_htn,
    }
