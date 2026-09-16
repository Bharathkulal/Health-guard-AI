/**
 * @file authService.js
 * HealthGuard AI Authentication and Identity API Service
 */

import { apiClient, setStoredToken, removeStoredToken } from './apiClient';

export const authService = {
  /**
   * Registers a new user account.
   * `POST /api/auth/register`
   */
  async register({ name, email, password, confirmPassword }) {
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirm_password: confirmPassword || password,
    };

    const data = await apiClient.post('/auth/register', payload);
    if (data?.access_token) {
      setStoredToken(data.access_token);
    }
    return data;
  },

  /**
   * Authenticates user credentials.
   * `POST /api/auth/login`
   */
  async login({ email, password }) {
    const payload = {
      email: email.trim().toLowerCase(),
      password,
    };

    const data = await apiClient.post('/auth/login', payload);
    if (data?.access_token) {
      setStoredToken(data.access_token);
    }
    return data;
  },

  /**
   * Restores active user session.
   * `GET /api/auth/me`
   */
  async getMe() {
    return await apiClient.get('/auth/me');
  },

  /**
   * Clears server session cookie and local credentials.
   * `POST /api/auth/logout`
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      removeStoredToken();
    }
    return { success: true };
  },

  /**
   * Changes the user's password securely.
   * `POST /api/auth/change-password`
   */
  async changePassword({ currentPassword, newPassword, confirmNewPassword }) {
    return await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword || newPassword,
    });
  },

  /**
   * Permanently deletes user account and all personal health telemetry.
   * `DELETE /api/auth/account`
   */
  async deleteAccount({ password, confirmation = 'DELETE' }) {
    const res = await apiClient.delete('/auth/account', {
      password,
      confirmation,
    });
    removeStoredToken();
    return res;
  },
};
