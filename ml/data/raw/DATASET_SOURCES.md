# Dataset Sources & Attribution

## 1. UCI Heart Disease Dataset (Cleveland)

- **Full Name**: Heart Disease Data Set (Cleveland subset)
- **Source**: UCI Machine Learning Repository
- **URL**: https://archive.ics.uci.edu/dataset/45/heart+disease
- **Original Creators**: 
  - Hungarian Institute of Cardiology (Andras Janosi, M.D.)
  - University Hospital, Zurich (William Steinbrunn, M.D.)
  - University Hospital, Basel (Matthias Pfisterer, M.D.)
  - V.A. Medical Center, Long Beach / Cleveland Clinic Foundation (Robert Detrano, M.D., Ph.D.)
- **Donor**: David W. Aha (aha@ics.uci.edu)
- **Date Donated**: July 1988
- **Records**: 303 instances (Cleveland subset)
- **Features**: 13 clinical attributes + 1 target
- **Target**: `target` — Angiographic disease status (0 = <50% diameter narrowing = no disease; 1-4 = >50% = disease; converted to binary 0/1)
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Citation**:
  ```
  Detrano, R., Janosi, A., Steinbrunn, W., Pfisterer, M., Schmid, J., Sandhu, S., 
  Guppy, K., Lee, S., & Froelicher, V. (1989). International application of a new 
  probability algorithm for the diagnosis of coronary artery disease. American Journal 
  of Cardiology, 64, 304-310.
  ```

### Feature Definitions

| Feature | Description | Type | Range |
|---------|-------------|------|-------|
| age | Age in years | Continuous | 29–77 |
| sex | Sex (1 = male; 0 = female) | Binary | 0, 1 |
| cp | Chest pain type (1=typical angina, 2=atypical, 3=non-anginal, 4=asymptomatic) | Categorical | 1–4 |
| trestbps | Resting blood pressure (mm Hg on admission) | Continuous | 94–200 |
| chol | Serum cholesterol (mg/dl) | Continuous | 126–564 |
| fbs | Fasting blood sugar > 120 mg/dl (1 = true; 0 = false) | Binary | 0, 1 |
| restecg | Resting ECG results (0=normal, 1=ST-T abnormality, 2=LV hypertrophy) | Categorical | 0–2 |
| thalach | Maximum heart rate achieved | Continuous | 71–202 |
| exang | Exercise induced angina (1 = yes; 0 = no) | Binary | 0, 1 |
| oldpeak | ST depression induced by exercise relative to rest | Continuous | 0–6.2 |
| slope | Slope of peak exercise ST segment (1=upsloping, 2=flat, 3=downsloping) | Categorical | 1–3 |
| ca | Number of major vessels colored by fluoroscopy | Ordinal | 0–3 |
| thal | Thalassemia (3=normal, 6=fixed defect, 7=reversible defect) | Categorical | 3, 6, 7 |
| target | Diagnosis of heart disease (0 = absent, 1–4 = present → binary) | Binary | 0, 1 |

---

## 2. Pima Indians Diabetes Database

- **Full Name**: Pima Indians Diabetes Database
- **Source**: National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) / UCI Machine Learning Repository
- **URL**: https://archive.ics.uci.edu/dataset/34/diabetes
- **Original Source**: Smith, J.W., Everhart, J.E., Dickson, W.C., Knowler, W.C., & Johannes, R.S. (1988)
- **Records**: 768 instances
- **Features**: 8 clinical attributes + 1 target
- **Population**: Pima Indian females, age ≥ 21 years
- **Target**: `Outcome` — Class variable (0 = no diabetes, 1 = tested positive for diabetes)
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Citation**:
  ```
  Smith, J.W., Everhart, J.E., Dickson, W.C., Knowler, W.C., & Johannes, R.S. (1988). 
  Using the ADAP learning algorithm to forecast the onset of diabetes mellitus. 
  In Proceedings of the Symposium on Computer Applications and Medical Care (pp. 261-265). 
  IEEE Computer Society Press.
  ```

### Feature Definitions

| Feature | Description | Type | Range |
|---------|-------------|------|-------|
| Pregnancies | Number of times pregnant | Discrete | 0–17 |
| Glucose | Plasma glucose concentration (2hr OGTT, mg/dL) | Continuous | 0–199 |
| BloodPressure | Diastolic blood pressure (mm Hg) | Continuous | 0–122 |
| SkinThickness | Triceps skinfold thickness (mm) | Continuous | 0–99 |
| Insulin | 2-Hour serum insulin (mu U/ml) | Continuous | 0–846 |
| BMI | Body mass index (weight kg / height m²) | Continuous | 0–67.1 |
| DiabetesPedigreeFunction | Diabetes pedigree function (hereditary risk score) | Continuous | 0.078–2.42 |
| Age | Age in years | Discrete | 21–81 |
| Outcome | Class (0 = no diabetes, 1 = diabetes) | Binary | 0, 1 |

### Known Data Quality Issues
- **Zero values in Glucose, BloodPressure, SkinThickness, Insulin, BMI** are physiologically impossible and represent missing data. These must be replaced with NaN before imputation.

---

## Important Disclaimers

1. **Population Bias**: The Pima Indians dataset was collected exclusively from Pima Indian females aged ≥21. Model performance on other populations may differ significantly.
2. **Historical Data**: Both datasets were collected decades ago. Clinical practices and population health profiles have changed since then.
3. **Educational Use**: These datasets are used for educational ML model training. Model performance on benchmark datasets does NOT establish clinical validity.
4. **Not a Diagnosis**: Predictions from models trained on these datasets are screening estimates, not medical diagnoses.
