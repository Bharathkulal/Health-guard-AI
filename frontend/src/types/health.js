/**
 * @file health.js
 * Comprehensive JSDoc Type Definitions for HealthGuard AI Platform
 * 
 * Provides clear schemas for user profiles, baseline biometrics, multi-step
 * health assessments, ML risk stratifications, SHAP explainability factors,
 * personalized wellness recommendations, and longitudinal health trends.
 */

/**
 * @typedef {'Low' | 'Moderate' | 'Elevated' | 'High'} RiskLevel
 */

/**
 * @typedef {'male' | 'female' | 'other'} BiologicalSex
 */

/**
 * @typedef {'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'} ActivityLevel
 */

/**
 * @typedef {'never' | 'former' | 'occasional' | 'regular'} SmokingStatus
 */

/**
 * @typedef {'none' | 'occasional' | 'moderate' | 'heavy'} AlcoholConsumption
 */

/**
 * @typedef {'balanced' | 'mediterranean' | 'plant_based' | 'high_sodium' | 'high_sugar' | 'keto'} DietPattern
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {number} age
 * @property {BiologicalSex} sex
 * @property {number} heightCm
 * @property {number} weightKg
 * @property {number} bmi
 * @property {ActivityLevel} baselineActivity
 * @property {string} [bloodType]
 * @property {string} [emergencyContact]
 * @property {string} avatarUrl
 * @property {string} memberSince
 */

/**
 * @typedef {Object} HealthVitals
 * @property {number} systolicBP - Systolic blood pressure in mmHg
 * @property {number} diastolicBP - Diastolic blood pressure in mmHg
 * @property {number} fastingBloodSugar - Fasting blood glucose in mg/dL
 * @property {number} heartRate - Resting heart rate in BPM
 * @property {number} heightCm - Height in centimeters
 * @property {number} weightKg - Weight in kilograms
 * @property {number} bmi - Calculated Body Mass Index (kg/m²)
 */

/**
 * @typedef {Object} LifestyleFactors
 * @property {ActivityLevel} physicalActivity
 * @property {SmokingStatus} smoking
 * @property {AlcoholConsumption} alcohol
 * @property {number} sleepHours - Average hours per night
 * @property {DietPattern} dietPattern
 */

/**
 * @typedef {Object} FamilyHistory
 * @property {boolean} diabetes - Type 2 Diabetes in 1st-degree relatives
 * @property {boolean} hypertension - Hypertension in 1st-degree relatives
 * @property {boolean} cardiovascular - Heart disease / stroke in 1st-degree relatives
 * @property {boolean} earlyHeartAttack - Early cardiovascular event before age 55
 */

/**
 * @typedef {Object} AssessmentInput
 * @property {string} [id]
 * @property {string} [userId]
 * @property {number} age
 * @property {BiologicalSex} sex
 * @property {HealthVitals} vitals
 * @property {string[]} symptoms - Array of active symptom keys
 * @property {LifestyleFactors} lifestyle
 * @property {FamilyHistory} familyHistory
 * @property {string} timestamp
 */

/**
 * @typedef {Object} RiskCategoryDetail
 * @property {string} id - 'diabetes' | 'cardiovascular' | 'hypertension'
 * @property {string} name
 * @property {number} score - 0 to 100 risk score
 * @property {RiskLevel} level
 * @property {string} summary - Short clinical insight
 * @property {string[]} keyDrivers - Contributing physiological factors
 * @property {string} previousScore - For trend delta comparison
 */

/**
 * @typedef {Object} ExplainableFactor
 * @property {string} id
 * @property {string} feature - Name of biological or lifestyle feature
 * @property {string} value - Current measured value formatted with unit
 * @property {number} impact - Normalized SHAP attribution score (-1.0 to +1.0)
 * @property {'elevating' | 'mitigating' | 'neutral'} direction
 * @property {string} explanation - Plain-language clinical rationale
 */

/**
 * @typedef {Object} RecommendationItem
 * @property {string} id
 * @property {'lifestyle' | 'nutrition' | 'activity' | 'monitoring' | 'clinical'} category
 * @property {'high' | 'medium' | 'routine'} priority
 * @property {string} title
 * @property {string} description
 * @property {string[]} actionableSteps
 * @property {string} iconName
 */

/**
 * @typedef {Object} RiskAssessmentResult
 * @property {string} id - Assessment ID
 * @property {string} userId
 * @property {string} date - Formatted date string
 * @property {string} timestamp - ISO timestamp
 * @property {number} overallScore - 0 to 100
 * @property {RiskLevel} overallLevel
 * @property {number} confidence - ML confidence percentage (e.g., 94)
 * @property {Object.<string, RiskCategoryDetail>} categories - diabetes, cardiovascular, hypertension
 * @property {ExplainableFactor[]} explainableFactors - Sorted SHAP attributions
 * @property {RecommendationItem[]} recommendations - Tailored guidance
 * @property {HealthVitals} vitalsSnapshot
 * @property {string} clinicalDisclaimer
 */

/**
 * @typedef {Object} HealthTrendPoint
 * @property {string} id
 * @property {string} date
 * @property {string} shortDate
 * @property {number} overallRisk
 * @property {number} diabetesRisk
 * @property {number} cardiovascularRisk
 * @property {number} hypertensionRisk
 * @property {number} systolicBP
 * @property {number} diastolicBP
 * @property {number} fastingBloodSugar
 * @property {number} bmi
 * @property {number} heartRate
 */

export {};
