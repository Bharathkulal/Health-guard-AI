/**
 * @file SettingsPage.jsx
 * HealthGuard AI Application Settings, Security Management & Privacy Controls
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Bell,
  Lock,
  Moon,
  Sun,
  Shield,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  User,
  ShieldAlert,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    quarterlyReminders: true,
    elevatedRiskAlerts: true,
    weeklyDigest: false,
  });

  // Privacy & Research Preferences
  const [privacy, setPrivacy] = useState({
    anonymousBenchmarking: true,
    shareWithProvider: false,
  });

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmNewPassword
      );
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Verify current password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Account deletion submission
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Please enter your account password to confirm deletion.');
      return;
    }

    if (deleteConfirmation.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in the confirmation field.');
      return;
    }

    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteModalOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account. Incorrect password.');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className={`space-y-1 pb-4 border-b ${isDark ? 'border-emerald-500/10' : 'border-[#E5E0D7]'}`}>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
          <Settings className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`} />
          <span>Application Settings</span>
        </h1>
        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
          Manage identity security, authentication credentials, privacy boundaries, and system preferences.
        </p>
      </div>

      {/* 1. Account Identity Section */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>
          <User className="w-4 h-4" />
          <span>Account Identity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className={`p-4 rounded-2xl border ${isDark ? 'border-emerald-500/10 bg-slate-900/30' : 'border-[#E5E0D7] bg-white'}`}>
            <span className={`text-[11px] uppercase font-bold block mb-1 ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
              Registered Patient Name
            </span>
            <span className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>{user?.name || 'Patient'}</span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'border-emerald-500/10 bg-slate-900/30' : 'border-[#E5E0D7] bg-white'}`}>
            <span className={`text-[11px] uppercase font-bold block mb-1 ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
              Verified Email Address
            </span>
            <span className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>{user?.email || 'user@healthguard.ai'}</span>
          </div>
        </div>
      </div>

      {/* 2. Security & Password Management */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>
            <KeyRound className="w-4 h-4" />
            <span>Security & Password</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            isDark
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-mono'
              : 'text-[#16805F] bg-[#E8F2ED] border-[#16805F]/20'
          }`}>
            Bcrypt Hashed
          </span>
        </div>

        {/* Password Success Alert */}
        {passwordSuccess && (
          <div className="p-4 rounded-2xl bg-[#E8F2ED] border border-[#16805F]/30 text-[#16805F] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#16805F] flex-shrink-0" />
            <span>Your password has been successfully updated and re-encrypted.</span>
          </div>
        )}

        {/* Password Error Alert */}
        {passwordError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="••••••••••••"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                    isDark
                      ? 'bg-slate-900/80 border-emerald-500/20 text-slate-100 focus:border-emerald-400'
                      : 'bg-white border-[#E5E0D7] text-[#18201C] focus:border-[#16805F]'
                  }`}
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Min 8 characters"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                    isDark
                      ? 'bg-slate-900/80 border-emerald-500/20 text-slate-100 focus:border-emerald-400'
                      : 'bg-white border-[#E5E0D7] text-[#18201C] focus:border-[#16805F]'
                  }`}
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                  }
                  placeholder="Confirm password"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                    isDark
                      ? 'bg-slate-900/80 border-emerald-500/20 text-slate-100 focus:border-emerald-400'
                      : 'bg-white border-[#E5E0D7] text-[#18201C] focus:border-[#16805F]'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`text-xs flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#66706A] hover:text-[#18201C]'}`}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`} />}
              <span>{showPassword ? 'Hide passwords' : 'Show passwords'}</span>
            </button>

            <button
              type="submit"
              disabled={passwordSaving}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${
                isDark
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                  : 'bg-[#16805F] text-white hover:bg-[#126b4f]'
              }`}
            >
              {passwordSaving ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Appearance & Theme */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>
          <Sun className="w-4 h-4" />
          <span>Interface Appearance</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>Color Theme Mode</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
              Current mode: <strong className={`capitalize ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>{theme} Mode</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              isDark
                ? 'bg-slate-900 border-emerald-500/30 text-slate-200 hover:border-emerald-400'
                : 'bg-white border-[#E5E0D7] text-[#18201C] hover:border-[#16805F]'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* 4. Notification Preferences */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>
          <Bell className="w-4 h-4" />
          <span>Notification & Alert Preferences</span>
        </div>

        <div className="space-y-4 pt-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>Quarterly Assessment Reminders</p>
              <p className={isDark ? 'text-slate-400' : 'text-[#66706A]'}>Receive periodic prompts to maintain longitudinal telemetry tracking.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.quarterlyReminders}
              onChange={(e) => setNotifications((prev) => ({ ...prev, quarterlyReminders: e.target.checked }))}
              className="w-5 h-5 accent-[#16805F] rounded cursor-pointer"
            />
          </div>

          <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-emerald-500/10' : 'border-[#E5E0D7]'}`}>
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>Elevated Biomarker Risk Alerts</p>
              <p className={isDark ? 'text-slate-400' : 'text-[#66706A]'}>Flag sudden upward shifts in blood pressure or glycemic baseline.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.elevatedRiskAlerts}
              onChange={(e) => setNotifications((prev) => ({ ...prev, elevatedRiskAlerts: e.target.checked }))}
              className="w-5 h-5 accent-[#16805F] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 5. Privacy & Health Data Governance */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`}>
          <Shield className="w-4 h-4" />
          <span>Privacy & Data Governance</span>
        </div>

        <div className="space-y-4 pt-2 text-xs">
          <div className={`p-4 rounded-2xl border leading-relaxed ${
            isDark
              ? 'bg-emerald-500/5 border-emerald-500/15 text-slate-300'
              : 'bg-[#E8F2ED] border-[#16805F]/20 text-[#18201C]'
          }`}>
            <p className={`font-bold mb-1 ${isDark ? 'text-emerald-300' : 'text-[#16805F]'}`}>HIPAA & GDPR Architectural Alignment</p>
            Personal health assessments, vitals, and ML risk stratifications are strictly isolated by your user ID. Data is never shared across accounts and never embedded into URL query strings or client tokens.
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>Anonymous Epidemiological Calibration</p>
              <p className={isDark ? 'text-slate-400' : 'text-[#66706A]'}>Contribute de-identified risk distributions for population health model calibration.</p>
            </div>
            <input
              type="checkbox"
              checked={privacy.anonymousBenchmarking}
              onChange={(e) => setPrivacy((prev) => ({ ...prev, anonymousBenchmarking: e.target.checked }))}
              className="w-5 h-5 accent-[#16805F] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 6. Account Lifecycle & Danger Zone */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-rose-950/10 border-rose-500/20' : 'bg-rose-50/60 border-rose-200'
        }`}
      >
        <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Account Controls & Data Deletion</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>Delete Account & Wipe Health Telemetry</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
              Permanently cascades deletion across your user profile, all clinical assessments, and ML prediction records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold self-start sm:self-auto flex items-center gap-2 bg-white"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl border text-xs font-bold transition-all shadow-sm ${
            isDark
              ? 'border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-white bg-slate-900/60'
              : 'border-[#E5E0D7] hover:border-[#16805F] text-[#18201C] bg-[#FFFDF9]'
          }`}
        >
          <LogOut className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`} />
          <span>Log Out of Session</span>
        </button>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border space-y-5 shadow-2xl ${
              isDark ? 'bg-[#040c08] border-rose-500/30' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>Confirm Account Deletion</h3>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#66706A]'}`}>
              This action is <strong className="text-rose-500 font-bold">irreversible</strong>. All your historical assessments, longitudinal trends, and biometric calibrations will be permanently purged from MongoDB.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
                  Enter Password to Confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none ${
                    isDark
                      ? 'bg-slate-900/80 border-emerald-500/20 text-slate-100 focus:border-rose-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
                  Type <span className="font-mono font-bold text-rose-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                    isDark
                      ? 'bg-slate-900/80 border-emerald-500/20 text-slate-100 focus:border-rose-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || deleteConfirmation.trim().toUpperCase() !== 'DELETE'}
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Permanently Delete</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
