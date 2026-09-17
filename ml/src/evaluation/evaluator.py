"""
Model Evaluation Module for HealthGuard AI.

Provides centralized functions for:
- Binary classifier evaluation (accuracy, precision, recall, F1, ROC-AUC, confusion matrix)
- Confusion matrix plotting and saving
- Feature importance extraction (LR coefficients, RF importances)

All metrics are computed from ACTUAL model predictions — never hardcoded.
"""

import os
import logging
from typing import Dict, Any, List, Optional

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server-side rendering
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

logger = logging.getLogger("healthguard.ml.evaluation")


def evaluate_binary_classifier(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray,
) -> Dict[str, Any]:
    """
    Computes comprehensive evaluation metrics for a binary classifier.

    Args:
        y_true: True labels (0/1)
        y_pred: Predicted labels (0/1)
        y_prob: Predicted probabilities for the positive class

    Returns:
        Dictionary containing accuracy, precision, recall, specificity,
        F1, ROC-AUC, and confusion matrix breakdown.
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    try:
        auc = float(roc_auc_score(y_true, y_prob))
    except ValueError:
        # Can happen if only one class in y_true
        auc = 0.5
        logger.warning("ROC-AUC could not be computed (single class in y_true). Defaulting to 0.5.")

    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
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


def compute_selection_score(metrics: Dict[str, Any]) -> float:
    """
    Computes the composite model selection score.

    Strategy: 0.40 * Recall + 0.30 * ROC-AUC + 0.30 * F1

    Rationale: For a screening-oriented classifier, recall (sensitivity) is
    prioritized to minimize missed positive cases. ROC-AUC and F1 ensure
    overall discriminative quality.

    This is a project-defined selection metric, NOT a clinical standard.
    """
    score = (
        0.40 * metrics.get("recall", 0.0)
        + 0.30 * metrics.get("roc_auc", 0.0)
        + 0.30 * metrics.get("f1", 0.0)
    )
    return round(score, 4)


def plot_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    title: str,
    save_path: str,
    labels: Optional[List[str]] = None,
) -> str:
    """
    Generates and saves a confusion matrix plot as a PNG image.

    Args:
        y_true: True labels
        y_pred: Predicted labels
        title: Plot title
        save_path: Full path to save the PNG file
        labels: Class label names (default: ["Negative", "Positive"])

    Returns:
        Path to saved plot
    """
    if labels is None:
        labels = ["Negative", "Positive"]

    cm = confusion_matrix(y_true, y_pred)

    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=labels,
        yticklabels=labels,
        cbar_kws={"label": "Count"},
        linewidths=0.5,
        ax=ax,
    )
    ax.set_xlabel("Predicted Label", fontsize=12, fontweight="bold")
    ax.set_ylabel("True Label", fontsize=12, fontweight="bold")
    ax.set_title(title, fontsize=14, fontweight="bold", pad=15)

    # Add accuracy annotation
    acc = accuracy_score(y_true, y_pred)
    ax.text(
        0.5, -0.12,
        f"Overall Accuracy: {acc:.2%}",
        ha="center", va="top",
        transform=ax.transAxes,
        fontsize=10,
        style="italic",
        color="gray",
    )

    plt.tight_layout()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)

    logger.info(f"Confusion matrix saved: {save_path}")
    return save_path


def extract_feature_importances(
    model_estimator: Any,
    feature_names: List[str],
) -> List[Dict[str, Any]]:
    """
    Extracts and normalizes feature importance weights from a trained model.

    Supports:
    - Tree-based models (RandomForest, etc.): uses `feature_importances_`
    - Linear models (LogisticRegression, etc.): uses absolute `coef_`

    Args:
        model_estimator: Trained sklearn estimator (not the full pipeline)
        feature_names: List of feature names matching the model's input

    Returns:
        Sorted list of dicts: [{feature, importance, label}, ...]
    """
    importances = None

    if hasattr(model_estimator, "feature_importances_"):
        importances = model_estimator.feature_importances_
    elif hasattr(model_estimator, "coef_"):
        importances = np.abs(model_estimator.coef_[0])
    else:
        # Uniform fallback
        logger.warning("Model has no feature_importances_ or coef_. Using uniform weights.")
        importances = np.ones(len(feature_names)) / len(feature_names)

    # Normalize to sum to 1.0
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
