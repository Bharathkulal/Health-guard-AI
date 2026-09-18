/**
 * @file AuthContext.jsx
 * Centralized Authentication & Authorization State Provider for HealthGuard AI
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { apiClient, getStoredToken, onUnauthorized } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = Boolean(user && user.user_id);

  // Restore session on application load
  const restoreSession = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      // If token exists in storage or HttpOnly cookie is present, check /api/auth/me
      const profile = await authService.getMe();
      if (profile && profile.user_id) {
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (err) {
      // If 401 or offline, clean state
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Listen to global 401 events to clear state immediately
    const unsubscribe = onUnauthorized(() => {
      setUser(null);
      setToken(null);
    });

    return () => unsubscribe();
  }, [restoreSession]);

  /**
   * Logs in with email and password
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setToken(data.access_token);
      return data;
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registers a new account
   */
  const register = useCallback(async (name, email, password, confirmPassword) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authService.register({ name, email, password, confirmPassword });
      setUser(data.user);
      setToken(data.access_token);
      return data;
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logs in / registers via Google OAuth
   */
  const loginWithGoogle = useCallback(async (googleData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authService.googleLogin(googleData);
      setUser(data.user);
      setToken(data.access_token);
      return data;
    } catch (err) {
      const msg = err.message || 'Google authentication failed. Please try again.';
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logs out user session
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      // Clear personal storage caches on logout
      try {
        localStorage.removeItem('hg_latest_result');
        localStorage.removeItem('hg_assessment_history');
        localStorage.removeItem('hg_stored_assessments');
        localStorage.removeItem('hg_active_draft');
      } catch (e) {}
    }
  }, []);

  /**
   * Updates user profile fields
   */
  const updateUserProfile = useCallback(async (updates) => {
    try {
      const updated = await apiClient.put('/users/profile', updates);
      setUser(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  }, []);

  /**
   * Changes account password
   */
  const changePassword = useCallback(async (currentPassword, newPassword, confirmNewPassword) => {
    return await authService.changePassword({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  }, []);

  /**
   * Deletes user account and cascades
   */
  const deleteAccount = useCallback(async (password) => {
    const res = await authService.deleteAccount({ password });
    setUser(null);
    setToken(null);
    try {
      localStorage.clear();
    } catch (e) {}
    return res;
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    authError,
    setAuthError,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    changePassword,
    deleteAccount,
    refreshUser: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
