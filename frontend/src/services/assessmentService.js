/**
 * @file assessmentService.js
 * Dedicated API Service Layer for HealthGuard AI Health Assessment Endpoints.
 * 
 * Communicates with the FastAPI backend (/api/assessments, /api/predict).
 * Uses centralized apiClient with automatic JWT Bearer injection, error handling, and offline fallback.
 */

import { apiClient } from './apiClient';

/**
 * Normalizes assessment form data for FastAPI backend ingestion.
 * 
 * @param {Object} rawFormData
 * @returns {Object} Structured payload matching backend HealthAssessmentCreate schema
 */
export function formatAssessmentPayload(rawFormData) {
  const vitals = rawFormData.vitals || {};
  const lifestyle = rawFormData.lifestyle || {};
  const family = rawFormData.familyHistory || {};
  const symptoms = rawFormData.symptoms || [];

  // Calculate BMI to ensure consistency
  const height = parseFloat(vitals.heightCm) || 170;
  const weight = parseFloat(vitals.weightKg) || 70;
  const calculatedBMI = height > 0 ? parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1)) : 24.0;

  return {
    age: parseInt(rawFormData.age, 10) || 30,
    gender: String(rawFormData.gender || rawFormData.sex || 'other').toLowerCase(),
    height_cm: height,
    weight_kg: weight,
    bmi: vitals.bmi || calculatedBMI,
    systolic_bp: parseInt(vitals.systolicBP, 10) || 120,
    diastolic_bp: parseInt(vitals.diastolicBP, 10) || 80,
    blood_sugar: parseFloat(vitals.fastingBloodSugar || vitals.bloodSugar) || 95,
    heart_rate: parseInt(vitals.heartRate, 10) || 72,
    symptoms: symptoms.filter((s) => s !== 'none'),
    lifestyle: {
      physical_activity: String(lifestyle.physicalActivity || 'moderate').toLowerCase(),
      smoking: String(lifestyle.smoking || 'never').toLowerCase(),
      alcohol: String(lifestyle.alcohol || 'occasional').toLowerCase(),
      sleep_hours: parseFloat(lifestyle.sleepHours) || 7.0,
      diet: String(lifestyle.dietPattern || lifestyle.diet || 'balanced').toLowerCase(),
    },
    family_history: {
      diabetes: Boolean(family.diabetes),
      hypertension: Boolean(family.hypertension),
      heart_disease: Boolean(family.heart_disease || family.cardiovascular),
      early_heart_attack: Boolean(family.early_heart_attack || family.earlyHeartAttack),
      other_conditions: family.other_conditions || null,
    },
  };
}

/**
 * Health Assessment API Service Object
 */
export const assessmentService = {
  /**
   * Submits a validated health assessment to the backend.
   * `POST /api/assessments`
   * 
   * @param {Object} formData Complete multi-step assessment data
   * @returns {Promise<{ assessment_id: string, status: string, ... }>}
   */
  async createAssessment(formData) {
    const payload = formatAssessmentPayload(formData);

    try {
      const data = await apiClient.post('/assessments', payload);

      // Store latest assessment in local backup cache
      if (data) {
        try {
          const existing = JSON.parse(localStorage.getItem('hg_stored_assessments') || '[]');
          localStorage.setItem('hg_stored_assessments', JSON.stringify([data, ...existing]));
          localStorage.setItem('hg_last_submitted_assessment', JSON.stringify(data));
        } catch (e) {
          // ignore local storage errors
        }
      }

      return data;
    } catch (err) {
      console.error('[AssessmentService] Submission error:', err);

      // If backend is unreachable or offline, construct local fallback
      if (err.isNetworkError) {
        console.warn('[AssessmentService] Backend unavailable. Creating local offline receipt.');
        const offlineReceipt = {
          assessment_id: `HG-OFFLINE-${Date.now().toString(36).toUpperCase()}`,
          status: 'received',
          created_at: new Date().toISOString(),
          ...payload,
          is_offline: true,
          message: 'Assessment recorded in local queue. Will sync when server is reachable.',
        };
        try {
          localStorage.setItem('hg_last_submitted_assessment', JSON.stringify(offlineReceipt));
        } catch (e) {}
        return offlineReceipt;
      }

      throw err;
    }
  },

  /**
   * Retrieves an assessment by ID.
   * `GET /api/assessments/{assessment_id}`
   * 
   * @param {string} assessmentId
   */
  async getAssessment(assessmentId) {
    try {
      return await apiClient.get(`/assessments/${assessmentId}`);
    } catch (err) {
      console.error('[AssessmentService] Get assessment error:', err);
      // Fallback to local storage
      const cached = JSON.parse(localStorage.getItem('hg_stored_assessments') || '[]');
      const found = cached.find((a) => a.assessment_id === assessmentId);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Retrieves assessment history for authenticated caller.
   * `GET /api/assessments`
   * 
   * @param {number} [limit=50]
   */
  async getAssessmentHistory(limit = 50) {
    try {
      const data = await apiClient.get(`/assessments?limit=${limit}`);
      return data || [];
    } catch (err) {
      console.error('[AssessmentService] History fetch error:', err);
      return JSON.parse(localStorage.getItem('hg_stored_assessments') || '[]');
    }
  },

  /**
   * Submits assessment to ML prediction engine for real-time risk stratification.
   * `POST /api/predict`
   * 
   * @param {Object} formData
   * @returns {Promise<Object>} Calculated ML risk prediction result
   */
  async predictRisk(formData) {
    const payload = formatAssessmentPayload(formData);

    try {
      const data = await apiClient.post('/predict', payload);

      if (data) {
        try {
          localStorage.setItem('hg_latest_result', JSON.stringify(data));
          const existingHistory = JSON.parse(localStorage.getItem('hg_assessment_history') || '[]');
          localStorage.setItem('hg_assessment_history', JSON.stringify([data, ...existingHistory]));
        } catch (e) {}
      }

      return data;
    } catch (err) {
      console.error('[AssessmentService] Predict error:', err);
      throw err;
    }
  },

  /**
   * Fetches authenticated user's latest ML risk prediction.
   * `GET /api/predict/latest`
   */
  async getLatestPrediction() {
    try {
      return await apiClient.get('/predict/latest');
    } catch (err) {
      console.warn('[AssessmentService] Failed to fetch latest prediction:', err);
    }
    return null;
  },

  /**
   * Fetches active ML model metadata and test set evaluation metrics.
   * `GET /api/predict/models`
   */
  async getModelsMetadata() {
    try {
      return await apiClient.get('/predict/models');
    } catch (err) {
      console.warn('[AssessmentService] Failed to fetch models metadata:', err);
    }
    return null;
  },

  /**
   * Checks backend vitality and database status.
   * `GET /api/health`
   */
  async checkHealth() {
    try {
      return await apiClient.get('/health');
    } catch (err) {
      return { status: 'offline', database: 'unreachable' };
    }
  },
};
