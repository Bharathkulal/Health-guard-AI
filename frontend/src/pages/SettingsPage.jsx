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
  Database,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';

export function SettingsPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { resetAllData } = useHealth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    quarterlyReminders: true,
    elevatedRiskAlerts: true,
    weeklyDigest: false,
  });

  const [privacy, setPrivacy] = useState({
    localTelemetry: true,
    anonymousBenchmarking: true,
  });

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetAllData();
    setConfirmResetOpen(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      navigate('/dashboard');
    }, 1500);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="space-y-1 pb-2 border-b border-emerald-500/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage system preferences, notification frequencies, telemetry security, and local data persistence.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>All local telemetry has been reset to clean default state. Redirecting to dashboard...</span>
        </div>
      )}

      {/* 1. Appearance & Theme */}
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Sun className="w-4 h-4" />
          <span>Interface Appearance</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-bold text-slate-100">
              Color Theme Mode
            </p>
            <p className="text-xs text-slate-400">
              Current mode: <strong className="capitalize text-emerald-400">{theme} Mode</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              isDark
                ? 'bg-slate-900 border-emerald-500/30 text-slate-200 hover:border-emerald-400'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-emerald-500'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Bell className="w-4 h-4" />
          <span>Notification & Advisory Preferences</span>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Quarterly Assessment Reminders</p>
              <p className="text-xs text-slate-400">Receive periodic prompts to maintain longitudinal telemetry tracking.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.quarterlyReminders}
              onChange={(e) => setNotifications(prev => ({ ...prev, quarterlyReminders: e.target.checked }))}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10">
            <div>
              <p className="text-sm font-semibold text-slate-100">Elevated Biomarker Risk Alerts</p>
              <p className="text-xs text-slate-400">Flag sudden upward shifts in blood pressure or glycemic baseline.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.elevatedRiskAlerts}
              onChange={(e) => setNotifications(prev => ({ ...prev, elevatedRiskAlerts: e.target.checked }))}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Privacy & Telemetry Storage */}
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>Privacy & Local Data Storage</span>
        </div>

        <div className="space-y-4 pt-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Client-Side Data Storage</p>
              <p className="text-slate-400">Biometric and assessment inputs are stored locally in your browser session.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/20">
              Active Local Store
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10">
            <div>
              <p className="text-sm font-semibold text-slate-100">Anonymous Risk Calibration</p>
              <p className="text-slate-400">Participate in anonymized aggregate epidemiological risk curve calibration.</p>
            </div>
            <input
              type="checkbox"
              checked={privacy.anonymousBenchmarking}
              onChange={(e) => setPrivacy(prev => ({ ...prev, anonymousBenchmarking: e.target.checked }))}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Danger Zone / Reset */}
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-rose-950/10 border-rose-500/20' : 'bg-rose-50/50 border-rose-200'
        }`}
      >
        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
          <Trash2 className="w-4 h-4" />
          <span>Data Management & Reset</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm font-bold text-slate-100">
              Clear All Assessment History & Profile
            </p>
            <p className="text-xs text-slate-400">
              Removes all local assessments, draft records, and resets the baseline profile to defaults.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold self-start sm:self-auto flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Local Data</span>
          </button>
        </div>
      </div>

      {/* Session Controls */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/40 text-slate-400 hover:text-slate-100 transition-all text-xs font-semibold bg-slate-900/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit to Public Landing Page</span>
        </button>
      </div>

      {/* Confirm Reset Dialog */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border space-y-5 shadow-2xl ${
              isDark ? 'bg-[#040c08] border-rose-500/30' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-100">
                Confirm Local Data Reset
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all stored health assessment logs and reset your biometric profile? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
