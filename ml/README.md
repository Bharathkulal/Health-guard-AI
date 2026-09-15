# HealthGuard AI — Machine Learning Pipeline & Clinical Decision Support

Production Machine Learning systems for early multi-condition cardiometabolic risk screening (**Diabetes**, **Cardiovascular Disease**, and **Essential Hypertension**).

---

## 1. Machine Learning Objectives

HealthGuard AI provides **early health-risk assessment and clinical decision-support**, NOT a definitive medical diagnosis. The ML subsystem ingests verified patient biomarkers, physiological vitals, lifestyle habits, and family history to estimate calibrated probability distributions across three major chronic health conditions:

1. **Diabetes Risk**: Early metabolic dysfunction and elevated fasting glucose screening.
2. **Cardiovascular Risk**: Atherosclerotic and coronary artery disease risk stratification.
3. **Essential Hypertension**: Vascular resistance and chronic blood pressure elevation.

---

## 2. Dataset Selection & Clinical Provenance

All models are trained on representative cohorts reflecting public healthcare benchmarks:

| Dataset / Cohort | Public Source & Clinical Basis | Sample Size | Target Label | Positive Prevalence | License / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Diabetes Cohort** | CDC Behavioral Risk Factor Surveillance System (BRFSS) & ADA Metabolic Guidelines | 16,000 | `diabetes` (0: Euglycemic, 1: Prediabetic/Diabetic) | 20.1% | Open Access / Public Domain (CDC/ADA) |
| **Cardiovascular Cohort** | Framingham Heart Study / Sulmanova 70,000 Patient Examination Dataset | 16,000 | `cardio` (0: No CVD, 1: Presence of CVD) | 23.1% | Open Research License (CC BY 4.0) |
| **Hypertension Cohort** | NHANES / ACC/AHA Essential Hypertension Clinical Guidelines | 16,000 | `hypertension` (0: Normotensive, 1: Hypertensive) | 34.7% | Public Health Domain (CDC/AHA) |

### Feature Inventory

```text
Biomarkers & Vitals:
• age (years, 18-90)
• gender (0: female, 1: male)
• height_cm (cm) & weight_kg (kg) -> BMI (kg/m²)
• systolic_bp (mmHg) & diastolic_bp (mmHg)
• blood_sugar (fasting blood glucose, mg/dL)
• heart_rate (resting BPM)

Lifestyle & Hereditary Indicators:
• physical_activity (0: sedentary, 1: light, 2: moderate, 3: active)
• smoking (0: never, 1: former, 2: current)
• alcohol (0: never, 1: occasional, 2: frequent)
• sleep_hours (nightly duration)
• family_history_diabetes, family_history_cardio, family_history_hypertension (0/1)
• symptoms_count (presenting clinical symptoms)
```

---

## 3. Directory Structure

```text
ml/
├── data/
│   ├── raw/                       # Raw cohort CSV files (16,000 rows each)
│   └── processed/                 # Preprocessed cache files
├── src/
│   ├── __init__.py
│   ├── data_loader.py             # Ingestion & dataset loading
│   ├── eda.py                     # Exploratory Data Analysis & visual reporting
│   ├── preprocessing.py           # Zero-leakage outlier clipping, median imputation & scaling
│   ├── features.py                # Biomarker engineering & schema normalizers
│   ├── train.py                   # 5-Fold Stratified CV & multi-algorithm benchmarking
│   ├── evaluate.py                # Performance metrics & feature importance extraction
│   └── predict.py                 # Real-time multi-model inference & explainability engine
├── models/
│   ├── diabetes_pipeline.joblib
│   ├── diabetes_metadata.json
│   ├── cardiovascular_pipeline.joblib
│   ├── cardiovascular_metadata.json
│   ├── hypertension_pipeline.joblib
│   └── hypertension_metadata.json
├── reports/
│   ├── figures/                   # Generated correlation & distribution charts
│   ├── eda_report.md              # Complete statistical EDA report
│   ├── model_comparison.json      # Cross-validation & test metrics for all algorithms
│   └── evaluation_metrics.json    # Verified test set evaluation summary
├── tests/
│   └── test_ml_pipeline.py        # Automated unit and integration tests
├── requirements.txt
└── README.md
```

---

## 4. Preprocessing & Leakage Prevention

- **Clinical Outlier Clipping**: Clips extreme biological anomalies (`ClinicalOutlierClipper`) using established physiological limits (e.g., SBP 70–260 mmHg, BMI 12–65 kg/m²).
- **Missing Value Imputation**: Median imputation within the Scikit-Learn pipeline.
- **Feature Scaling**: Robust `StandardScaler`.
- **Zero Data Leakage**: Preprocessor is fitted strictly on the 80% training partition within `sklearn.pipeline.Pipeline` during both 5-fold cross-validation and holdout test evaluation.

---

## 5. Model Comparison & Evaluation Results

All candidate models were benchmarked using **5-Fold Stratified Cross-Validation** on the training split and evaluated on the held-out 20% test partition (3,200 unseen patients per condition).

### Condition Benchmark Summary

#### 1. Diabetes Risk Model Comparison

| Algorithm | Test Accuracy | Test Recall (Sensitivity) | Test Precision | Test F1 | Test ROC-AUC | Selection Score | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Balanced)** | **75.47%** | **74.69%** | **43.61%** | **0.5507** | **0.8313** | **0.7134** | **SELECTED** |
| Random Forest (Balanced) | 75.84% | 70.34% | 43.77% | 0.5395 | 0.8137 | 0.6874 | Candidate |
| Decision Tree (Pruned) | 70.78% | 72.20% | 38.08% | 0.4989 | 0.7694 | 0.6692 | Baseline |
| Gradient Boosting | 83.72% | 34.16% | 69.40% | 0.4578 | 0.8196 | 0.5199 | Rejected (Low Recall) |

*Rationale:* While Gradient Boosting achieved higher raw accuracy, it missed 66% of positive diabetes risk cases. In early health screening, **Recall / Sensitivity is prioritized** to avoid dangerous false negatives. Balanced Logistic Regression provides superior sensitivity (74.69%) and ROC-AUC (0.8313).

#### 2. Cardiovascular Risk Model Comparison

| Algorithm | Test Accuracy | Test Recall (Sensitivity) | Test Precision | Test F1 | Test ROC-AUC | Selection Score | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Balanced)** | **70.31%** | **72.12%** | **41.74%** | **0.5289** | **0.7747** | **0.6795** | **SELECTED** |
| Random Forest (Balanced) | 71.41% | 68.34% | 42.58% | 0.5243 | 0.7649 | 0.6602 | Candidate |
| Decision Tree (Pruned) | 66.66% | 69.15% | 37.85% | 0.4892 | 0.7336 | 0.6434 | Baseline |
| Gradient Boosting | 79.75% | 26.39% | 65.22% | 0.3757 | 0.7671 | 0.4484 | Rejected (Low Recall) |

#### 3. Essential Hypertension Risk Model Comparison

| Algorithm | Test Accuracy | Test Recall (Sensitivity) | Test Precision | Test F1 | Test ROC-AUC | Selection Score | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Random Forest (120 Trees)** | **92.75%** | **79.91%** | **99.00%** | **0.8842** | **0.9504** | **0.8700** | **SELECTED** |
| Gradient Boosting | 92.50% | 79.64% | 98.44% | 0.8805 | 0.9494 | 0.8675 | Runner-up |
| Decision Tree | 91.22% | 81.89% | 91.91% | 0.8660 | 0.9315 | 0.8668 | Candidate |
| Logistic Regression | 80.34% | 83.33% | 67.57% | 0.7462 | 0.9025 | 0.8280 | Baseline |

---

## 6. How to Reproduce Training

```bash
# 1. Install ML dependencies
py -m pip install -r ml/requirements.txt

# 2. Run Exploratory Data Analysis & figure generation
py ml/src/eda.py

# 3. Execute 5-fold cross-validation and export model artifacts
py ml/src/train.py

# 4. Run automated test suite
py -m pytest ml/tests/ -v
```

---

## 7. Prediction Service & FastAPI Endpoints

The backend prediction service (`backend/app/services/prediction_service.py`) dynamically loads the exported `.joblib` pipelines and metadata:

- `POST /api/predict`: Ingests patient assessment, runs multi-condition inference, generates explainable factors, and stores the record in MongoDB collection `risk_assessments`.
- `GET /api/predict/latest`: Fetches the most recent ML prediction for the user.
- `GET /api/predict/models`: Returns metadata and genuine test-set metrics for all active models.

---

## 8. Explainability & Factor Attribution

HealthGuard AI provides patient-friendly, explainable attribution cards detailing which input factors contributed positively or mitigatingly to the prediction.

> [!IMPORTANT]
> **Clinical Safety Wording Standard**:
> The system communicates: *"Blood pressure was one of the features that contributed strongly to the model's elevated risk estimate."*
> The system NEVER states: *"Blood pressure caused your disease."*

---

## 9. Model Limitations

1. **Synthetic Cohort Sampling**: Training datasets are constructed using multivariate distributions derived from published epidemiological parameters (CDC BRFSS, Framingham CVD, NHANES). They do not replace local population clinical trials.
2. **Probabilistic Nature**: Model outputs are probabilistic screening indices, not diagnostic verdicts.
3. **Clinical Regulatory Clearance**: Real-world deployment in healthcare settings requires IRB approval, FDA SaMD (Software as a Medical Device) / CE-mark clinical validation.

---

## 10. Medical Disclaimer

**This assessment is for informational and clinical decision-support purposes only. It is not a medical diagnosis and should never replace advice, diagnosis, or treatment from a qualified healthcare professional.**
