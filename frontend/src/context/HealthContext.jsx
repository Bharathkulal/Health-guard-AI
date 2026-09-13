/**
 * @file HealthContext.jsx
 * Central State Management Provider for HealthGuard AI
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { healthApi } from '../services/api';
import { calculateBMI } from '../services/assessmentEngine';

const HealthContext = createContext(null);

const INITIAL_DRAFT = {
  age: 38,
  sex: 'male',
  vitals: {
    systolicBP: 124,
    diastolicBP: 82,
    fastingBloodSugar: 96,
    heartRate: 72,
    heightCm: 178,
    weightKg: 78,
    bmi: 24.6,
  },
  symptoms: [],
  lifestyle: {
    physicalActivity: 'moderate',
    smoking: 'never',
    alcohol: 'occasional',
    sleepHours: 7,
    dietPattern: 'balanced',
  },
  familyHistory: {
    diabetes: true,
    hypertension: false,
    cardiovascular: false,
    earlyHeartAttack: false,
  },
};

export function HealthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [activeDraft, setActiveDraft] = useState(() => {
    try {
      const saved = localStorage.getItem('hg_active_draft');
      return saved ? JSON.parse(saved) : INITIAL_DRAFT;
    } catch (e) {
      return INITIAL_DRAFT;
    }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data from service layer
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, latestData, historyData, trendsData] = await Promise.all([
        healthApi.getProfile(),
        healthApi.getLatestRiskResult(),
        healthApi.getAssessmentHistory(),
        healthApi.getHealthTrends('6m'),
      ]);
      setUser(profileData);
      setLatestResult(latestData);
      setHistory(historyData);
      setTrends(trendsData);
    } catch (err) {
      console.error('Failed to load HealthGuard data:', err);
      setError('Unable to fetch latest health data. Using cached offline mode.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Persist draft changes
  const updateDraft = useCallback((updater) => {
    setActiveDraft((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      
      // Auto-recalculate BMI if height or weight modified in vitals
      if (next.vitals) {
        const height = next.vitals.heightCm;
        const weight = next.vitals.weightKg;
        if (height && weight) {
          next.vitals.bmi = calculateBMI(height, weight);
        }
      }

      try {
        localStorage.setItem('hg_active_draft', JSON.stringify(next));
      } catch (e) {
        // ignore storage error
      }
      return next;
    });
  }, []);

  const resetDraft = useCallback(() => {
    setActiveDraft(INITIAL_DRAFT);
    localStorage.removeItem('hg_active_draft');
  }, []);

  // Submit complete assessment
  const submitAssessment = useCallback(async (customData = null) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = customData || activeDraft;
      const result = await healthApi.submitAssessment(payload);
      setLatestResult(result);
      
      // Refresh history and trends
      const [newHistory, newTrends, newProfile] = await Promise.all([
        healthApi.getAssessmentHistory(),
        healthApi.getHealthTrends('6m'),
        healthApi.getProfile(),
      ]);
      setHistory(newHistory);
      setTrends(newTrends);
      setUser(newProfile);
      return result;
    } catch (err) {
      console.error('Assessment submission error:', err);
      setError('Failed to compute risk assessment. Please check your inputs and retry.');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [activeDraft]);

  // Update user profile
  const updateUserProfile = useCallback(async (profileUpdates) => {
    try {
      const updated = await healthApi.updateProfile(profileUpdates);
      setUser(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  }, []);

  // Inspect past assessment result
  const viewHistoricalAssessment = useCallback((assessmentId) => {
    const found = history.find((item) => item.id === assessmentId);
    if (found) {
      setLatestResult(found);
      return found;
    }
    return null;
  }, [history]);

  // Reset all local demo data
  const resetAllData = useCallback(() => {
    healthApi.resetLocalData();
    localStorage.removeItem('hg_active_draft');
    loadInitialData();
  }, [loadInitialData]);

  const value = {
    user,
    latestResult,
    history,
    trends,
    activeDraft,
    loading,
    submitting,
    error,
    updateDraft,
    resetDraft,
    submitAssessment,
    updateUserProfile,
    viewHistoricalAssessment,
    refreshData: loadInitialData,
    resetAllData,
  };

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
