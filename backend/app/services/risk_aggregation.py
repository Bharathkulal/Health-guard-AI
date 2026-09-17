"""
Risk Aggregation Service for HealthGuard AI.

Computes the overall screening category from disease-specific probabilities.

IMPORTANT: The overall risk category is a PROJECT-DEFINED screening level,
NOT a clinical diagnosis. It aggregates model outputs into a simple
Low / Moderate / High classification for educational decision support.

The aggregation logic is:
- Transparent: clearly documented thresholds
- Configurable: thresholds can be adjusted
- Testable: pure function with no side effects
- Separate: disease-specific probabilities remain individually visible
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("healthguard.services.risk_aggregation")

# Configurable thresholds for overall risk classification
# These are project-defined, NOT clinical standards
RISK_THRESHOLDS = {
    "low_max": 0.30,       # probability below this → Low risk
    "moderate_max": 0.60,  # probability below this → Moderate risk
    # above moderate_max → High risk
}


def compute_overall_risk(
    heart_probability: float,
    diabetes_probability: float,
) -> Dict[str, Any]:
    """
    Computes the overall screening risk category.

    Strategy: Takes the MAXIMUM probability across disease models.
    This conservative approach ensures that if ANY condition shows
    elevated risk, the overall assessment reflects it.

    Args:
        heart_probability: Model-predicted probability of heart disease (0.0 - 1.0)
        diabetes_probability: Model-predicted probability of diabetes (0.0 - 1.0)

    Returns:
        {
            "overall_risk": "Low" | "Moderate" | "High",
            "max_probability": float,
            "dominant_condition": "heart" | "diabetes",
            "method": str
        }
    """
    # Clamp probabilities to valid range
    heart_prob = max(0.0, min(1.0, float(heart_probability)))
    diabetes_prob = max(0.0, min(1.0, float(diabetes_probability)))

    # Use maximum probability across conditions
    max_prob = max(heart_prob, diabetes_prob)
    dominant = "heart" if heart_prob >= diabetes_prob else "diabetes"

    # Classify into screening categories
    if max_prob < RISK_THRESHOLDS["low_max"]:
        risk_level = "Low"
    elif max_prob < RISK_THRESHOLDS["moderate_max"]:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    return {
        "overall_risk": risk_level,
        "max_probability": round(max_prob, 4),
        "dominant_condition": dominant,
        "method": f"max(heart={heart_prob:.4f}, diabetes={diabetes_prob:.4f}) → {risk_level} "
                  f"(thresholds: Low<{RISK_THRESHOLDS['low_max']}, "
                  f"Moderate<{RISK_THRESHOLDS['moderate_max']}, "
                  f"High≥{RISK_THRESHOLDS['moderate_max']})",
    }


def generate_risk_factors(
    input_data: Dict[str, Any],
    heart_result: Dict[str, Any],
    diabetes_result: Dict[str, Any],
    heart_importances: List[Dict[str, Any]],
    diabetes_importances: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Generates explainable risk factors based on model feature importances
    and the user's actual input values.

    Uses wording like "These factors contributed to the model's risk estimate"
    rather than "Your disease is caused by X."

    Args:
        input_data: Assessment form data
        heart_result: Heart prediction result
        diabetes_result: Diabetes prediction result
        heart_importances: Feature importances from heart model
        diabetes_importances: Feature importances from diabetes model

    Returns:
        List of risk factor dicts with feature, value, impact, direction, explanation
    """
    lifestyle = input_data.get("lifestyle", {}) if isinstance(input_data.get("lifestyle"), dict) else {}
    family = input_data.get("family_history", {}) if isinstance(input_data.get("family_history"), dict) else {}

    factors = []

    # Extract key values from input
    age = int(input_data.get("age", 0))
    bmi = float(input_data.get("bmi", 0) or 0)
    systolic_bp = int(input_data.get("systolic_bp", 0) or 0)
    diastolic_bp = int(input_data.get("diastolic_bp", 0) or 0)
    blood_sugar = float(input_data.get("blood_sugar", 0) or 0)
    heart_rate = int(input_data.get("heart_rate", 0) or 0)
    smoking = str(lifestyle.get("smoking", "never")).lower()

    # Blood Pressure factor
    if systolic_bp > 0:
        if systolic_bp >= 130:
            factors.append({
                "id": "f_bp",
                "feature": "Blood Pressure",
                "value": f"{systolic_bp}/{diastolic_bp} mmHg",
                "impact": round(min(0.35, 0.05 + (systolic_bp - 120) * 0.008), 2),
                "direction": "elevating",
                "explanation": "Elevated blood pressure contributes to higher risk estimates in the heart disease model.",
            })
        else:
            factors.append({
                "id": "f_bp",
                "feature": "Blood Pressure",
                "value": f"{systolic_bp}/{diastolic_bp} mmHg",
                "impact": -0.10,
                "direction": "mitigating",
                "explanation": "Blood pressure within normal range is a protective factor in the model's estimate.",
            })

    # Blood Sugar / Glucose factor
    if blood_sugar > 0:
        if blood_sugar >= 100:
            factors.append({
                "id": "f_glucose",
                "feature": "Fasting Blood Glucose",
                "value": f"{blood_sugar} mg/dL",
                "impact": round(min(0.40, 0.10 + (blood_sugar - 100) * 0.007), 2),
                "direction": "elevating",
                "explanation": "Glucose is the most important feature in the diabetes model. Elevated levels increase the risk estimate.",
            })
        else:
            factors.append({
                "id": "f_glucose",
                "feature": "Fasting Blood Glucose",
                "value": f"{blood_sugar} mg/dL",
                "impact": -0.12,
                "direction": "mitigating",
                "explanation": "Normal fasting glucose is a strong protective factor in the diabetes risk model.",
            })

    # BMI factor
    if bmi > 0:
        if bmi >= 25.0:
            factors.append({
                "id": "f_bmi",
                "feature": "Body Mass Index (BMI)",
                "value": f"{bmi} kg/m²",
                "impact": round(min(0.25, 0.05 + (bmi - 24) * 0.015), 2),
                "direction": "elevating",
                "explanation": "BMI is the second most important feature in the diabetes model. Higher BMI increases the risk estimate.",
            })
        else:
            factors.append({
                "id": "f_bmi",
                "feature": "Body Mass Index (BMI)",
                "value": f"{bmi} kg/m²",
                "impact": -0.14,
                "direction": "mitigating",
                "explanation": "Healthy BMI contributes to lower risk estimates across both models.",
            })

    # Smoking factor
    if smoking != "never":
        factors.append({
            "id": "f_smoking",
            "feature": "Tobacco History",
            "value": smoking.capitalize(),
            "impact": 0.15,
            "direction": "elevating",
            "explanation": "Tobacco use is a known risk factor that elevates the heart disease model's risk estimate.",
        })
    else:
        factors.append({
            "id": "f_smoking",
            "feature": "Tobacco History",
            "value": "Non-Smoker",
            "impact": -0.10,
            "direction": "mitigating",
            "explanation": "Non-smoking status is a protective factor in the heart disease model.",
        })

    # Age factor
    if age > 0:
        if age >= 50:
            factors.append({
                "id": "f_age",
                "feature": "Age",
                "value": f"{age} years",
                "impact": round(min(0.20, 0.02 + (age - 45) * 0.005), 2),
                "direction": "elevating",
                "explanation": "Age is a contributing factor in both models. Risk estimates increase with age.",
            })

    # Family history
    if family.get("diabetes") or family.get("heart_disease"):
        conditions = []
        if family.get("diabetes"):
            conditions.append("diabetes")
        if family.get("heart_disease"):
            conditions.append("heart disease")
        factors.append({
            "id": "f_family",
            "feature": "Family History",
            "value": ", ".join(c.title() for c in conditions),
            "impact": 0.12,
            "direction": "elevating",
            "explanation": f"Family history of {', '.join(conditions)} is a contributing factor in the model's risk estimate.",
        })

    return factors


def generate_recommendations(
    input_data: Dict[str, Any],
    overall_risk: str,
    heart_probability: float,
    diabetes_probability: float,
) -> List[Dict[str, Any]]:
    """
    Generates educational health recommendations based on the assessment results.

    These are general wellness suggestions, NOT medical prescriptions.
    """
    recs = []

    # Always recommend monitoring
    recs.append({
        "id": "rec_monitor",
        "category": "monitoring",
        "priority": "high" if overall_risk == "High" else "medium",
        "title": "Regular Health Monitoring",
        "description": "Track your vital signs regularly to establish baseline trends and detect changes early.",
        "actionableSteps": [
            "Measure blood pressure at least twice weekly",
            "Track fasting blood glucose periodically",
            "Log results in your HealthGuard AI profile for trend analysis",
        ],
        "iconName": "Activity",
    })

    # Blood sugar specific
    blood_sugar = float(input_data.get("blood_sugar", 0) or 0)
    if blood_sugar >= 100 or diabetes_probability >= 0.30:
        recs.append({
            "id": "rec_glucose",
            "category": "nutrition",
            "priority": "high" if diabetes_probability >= 0.50 else "medium",
            "title": "Blood Sugar Management",
            "description": "Consider dietary modifications that support healthy glucose metabolism.",
            "actionableSteps": [
                "Reduce refined sugar and simple carbohydrate intake",
                "Increase dietary fiber with whole grains and vegetables",
                "Discuss HbA1c testing with your healthcare provider",
            ],
            "iconName": "Droplets",
        })

    # Heart health specific
    systolic_bp = int(input_data.get("systolic_bp", 0) or 0)
    if systolic_bp >= 130 or heart_probability >= 0.30:
        recs.append({
            "id": "rec_cardio",
            "category": "lifestyle",
            "priority": "high" if heart_probability >= 0.50 else "medium",
            "title": "Cardiovascular Wellness",
            "description": "Support heart health through lifestyle modifications and regular monitoring.",
            "actionableSteps": [
                "Aim for 150 minutes of moderate aerobic activity per week",
                "Limit sodium intake to less than 2,300 mg daily",
                "Discuss cardiovascular screening with your healthcare provider",
            ],
            "iconName": "Heart",
        })

    # Sleep & lifestyle
    lifestyle = input_data.get("lifestyle", {}) if isinstance(input_data.get("lifestyle"), dict) else {}
    sleep = float(lifestyle.get("sleep_hours", 7.0) or 7.0)
    if sleep < 6.5 or sleep > 9.0:
        recs.append({
            "id": "rec_sleep",
            "category": "lifestyle",
            "priority": "medium",
            "title": "Sleep Optimization",
            "description": "Consistent sleep patterns support metabolic health and cardiovascular function.",
            "actionableSteps": [
                "Maintain a regular sleep schedule of 7-8 hours nightly",
                "Avoid screen exposure 30 minutes before bedtime",
            ],
            "iconName": "Moon",
        })

    # Professional consultation for elevated risk
    if overall_risk == "High":
        recs.append({
            "id": "rec_consult",
            "category": "medical",
            "priority": "high",
            "title": "Professional Medical Consultation",
            "description": "Based on this screening estimate, consider discussing your health profile with a healthcare provider.",
            "actionableSteps": [
                "Schedule a comprehensive health check-up",
                "Share this screening report with your doctor for context",
                "Ask about appropriate diagnostic testing",
            ],
            "iconName": "Stethoscope",
        })

    return recs
