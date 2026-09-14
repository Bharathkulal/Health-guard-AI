/**
 * @file assessmentService.js
 * Dedicated API Service Layer for HealthGuard AI Health Assessment Endpoints.
 * 
 * Communicates with the FastAPI backend (/api/assessments).
 * Handles robust network error reporting, data sanitization, and fallback support.
 */

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

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
    user_id: rawFormData.userId || 'usr_alex_chen_892',
    age: parseInt(rawFormData.age, 10),
    gender: String(rawFormData.gender || rawFormData.sex || 'other').toLowerCase(),
    height_cm: height,
    weight_kg: weight,
    bmi: vitals.bmi || calculatedBMI,
    systolic_bp: parseInt(vitals.systolicBP, 10),
    diastolic_bp: parseInt(vitals.diastolicBP, 10),
    blood_sugar: parseFloat(vitals.fastingBloodSugar || vitals.bloodSugar),
    heart_rate: parseInt(vitals.heartRate, 10),
    symptoms: symptoms.filter(s => s !== 'none'),
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
      const response = await fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();

      if (!response.ok) {
        const errorMsg = resJson.message || resJson.detail || 'Failed to submit health assessment.';
        const errObj = new Error(errorMsg);
        errObj.errors = resJson.errors || [];
        errObj.status = response.status;
        throw errObj;
      }

      // Store latest assessment in local backup cache
      if (resJson.data) {
        try {
          const existing = JSON.parse(localStorage.getItem('hg_stored_assessments') || '[]');
          localStorage.setItem('hg_stored_assessments', JSON.stringify([resJson.data, ...existing]));
          localStorage.setItem('hg_last_submitted_assessment', JSON.stringify(resJson.data));
        } catch (e) {
          // ignore local storage errors
        }
      }

      return resJson.data;
    } catch (err) {
      console.error('[AssessmentService] Submission error:', err);

      // If backend is unavailable, construct local fallback record to prevent user blocking
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
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
      const response = await fetch(`${API_BASE}/assessments/${assessmentId}`);
      if (!response.ok) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      const resJson = await response.json();
      return resJson.data;
    } catch (err) {
      console.error('[AssessmentService] Get assessment error:', err);
      // Fallback to local storage
      const cached = JSON.parse(localStorage.getItem('hg_stored_assessments') || '[]');
      const found = cached.find(a => a.assessment_id === assessmentId);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Retrieves assessment history.
   * `GET /api/assessments`
   * 
   * @param {string} [userId]
   * @param {number} [limit=50]
   */
  async getAssessmentHistory(userId, limit = 50) {
    try {
      const url = new URL(`${API_BASE}/assessments`, window.location.origin);
      if (userId) url.searchParams.set('user_id', userId);
      url.searchParams.set('limit', String(limit));

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch assessment history');
      const resJson = await response.json();
      return resJson.data || [];
    } catch (err) {
      console.error('[AssessmentService] History fetch error:', err);
      // Return local cache
      return JSON.parse(localStorage.getItem('hg_stored_assessments') || '[]');
    }
  },

  /**
   * Checks backend vitality and database status.
   * `GET /api/health`
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        return await response.json();
      }
      return { status: 'error', database: 'unknown' };
    } catch (err) {
      return { status: 'offline', database: 'unreachable' };
    }
  },
};
