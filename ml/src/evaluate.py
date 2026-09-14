"""
Model Evaluation and Metrics Module for HealthGuard AI.
Calculates clinical screening performance metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix).
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)


def evaluate_binary_classifier(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray
) -> Dict[str, Any]:
    """
    Computes rigorous clinical evaluation metrics for a binary classifier.
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    try:
        auc = float(roc_auc_score(y_true, y_prob))
    except Exception:
        auc = 0.5

    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4), # Sensitivity
        "specificity": round(specificity, 4),
        "f1": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
        },
    }


def extract_feature_importances(
    model_estimator: Any,
    feature_names: List[str]
) -> List[Dict[str, Any]]:
    """
    Extracts normalized feature importance weights from linear models or tree ensembles.
    """
    importances = None
    if hasattr(model_estimator, "feature_importances_"):
        importances = model_estimator.feature_importances_
    elif hasattr(model_estimator, "coef_"):
        importances = np.abs(model_estimator.coef_[0])

    if importances is None:
        # Uniform fallback
        importances = np.ones(len(feature_names)) / len(feature_names)

    # Normalize to 1.0 sum
    total = np.sum(importances)
    if total > 0:
        norm_importances = importances / total
    else:
        norm_importances = importances

    ranked = []
    for name, weight in zip(feature_names, norm_importances):
        ranked.append({
            "feature": name,
            "importance": round(float(weight), 4),
            "label": name.replace("_", " ").title(),
        })

    # Sort descending by importance
    ranked.sort(key=lambda x: x["importance"], reverse=True)
    return ranked
