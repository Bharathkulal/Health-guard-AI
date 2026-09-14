# HealthGuard AI - Machine Learning Pipeline

Production Machine Learning systems for early multi-condition cardiometabolic risk screening.

---

## 1. Clinical Risk Objectives & Datasets

| Condition | Dataset Origin & Clinical Basis | Sample Size | Target Variable | Optimal Model | Key Test Metrics |
|---|---|---|---|---|---|
| **Diabetes Risk** | CDC Behavioral Risk Factor Surveillance System (BRFSS) / Metabolic Cohort | 16,000 | `diabetes` (0/1) | Balanced Logistic Regression | Recall: **79.05%**, ROC-AUC: **0.8797** |
| **Cardiovascular Risk** | Clinical Cardiovascular Disease Cohort (Sulmanova et al. / Framingham CVD) | 16,000 | `cardio` (0/1) | Balanced Logistic Regression | Recall: **69.09%**, ROC-AUC: **0.7804** |
| **Hypertension Risk** | Cardiometabolic Blood Pressure & Vascular Risk Cohort (NHANES / AHA) | 16,000 | `hypertension` (0/1) | Random Forest Ensemble | Recall: **79.91%**, Precision: **99.00%**, ROC-AUC: **0.9504** |

---

## 2. Architecture & Pipeline Structure

```text
ml/
├── data/
│   ├── raw/                    # Raw cohort CSV files
│   └── processed/              # Preprocessed data caches
├── src/
│   ├── __init__.py
│   ├── data_loader.py          # Data ingestion and cohort caching
│   ├── preprocessing.py        # Outlier clipping & imputation (leakage-free)
│   ├── features.py             # Biomarker normalization & schema mapping
│   ├── train.py                # 5-fold Stratified CV & multi-model benchmark
│   ├── evaluate.py             # Precision, Recall, F1, ROC-AUC, Confusion Matrix
│   └── predict.py              # Real-time multi-condition inference engine
├── models/
│   ├── diabetes_pipeline.joblib
│   ├── diabetes_metadata.json
│   ├── cardiovascular_pipeline.joblib
│   ├── cardiovascular_metadata.json
│   ├── hypertension_pipeline.joblib
│   └── hypertension_metadata.json
├── reports/
│   ├── model_comparison.json   # Full benchmark comparison table
│   └── evaluation_metrics.json # Test metrics summary
└── requirements.txt
```

---

## 3. How to Train & Reproduce

```bash
# From repository root
cd ml
pip install -r requirements.txt
python -m src.train
```

---

## 4. Probability Calibration & Risk Categorization

Model output probabilities $P \in [0.0, 1.0]$ are mapped into documented engineering screening tiers:
- **Low Estimated Risk**: $P < 0.35$ (Score $< 40$)
- **Moderate Estimated Risk**: $0.35 \le P < 0.65$ (Score $40 - 69$)
- **Elevated Estimated Risk**: $P \ge 0.65$ (Score $\ge 70$)

---

## 5. Medical Safety Disclaimer
HealthGuard AI provides early risk assessments for clinical decision support and wellness awareness. It is not a diagnostic device and should never replace evaluation by a qualified medical practitioner.
