import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  BrainCircuit,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function AdminSettingsView() {
  const { isDark } = useTheme();

  const [settings, setSettings] = useState({
    auto_activate_models: true,
    default_training_algorithm: 'RandomForest',
    default_test_split: 0.2,
    session_timeout_minutes: 1440,
    enable_class_weight_balancing: true,
    email_alerts_on_high_risk: false,
    maintenance_mode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await adminApi.get('/admin/settings');
        if (res?.success && res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await adminApi.post('/admin/settings', settings);
      if (res?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError('Failed to update settings.');
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Admin <span className="text-emerald-400">Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure model lifecycle automation, inference defaults, security policies, and administrative alerts.
        </p>
      </header>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* ML Defaults Section */}
        <div
          className={`p-6 rounded-3xl border space-y-5 ${
            isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              ML Automation & Training Defaults
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Auto-Activate */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Auto-Activate Trained Models</span>
                <span className="text-[11px] text-slate-400">
                  Automatically set newly trained models as the active prediction pipeline if training passes evaluation.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_activate_models}
                onChange={(e) => setSettings({ ...settings, auto_activate_models: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Class Weight Balancing */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Balanced Class Weighting</span>
                <span className="text-[11px] text-slate-400">
                  Enable clinical cost-sensitive class balancing during Scikit-Learn training to mitigate class imbalance.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_class_weight_balancing}
                onChange={(e) => setSettings({ ...settings, enable_class_weight_balancing: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Default Algorithm */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                Default Classification Algorithm
              </label>
              <select
                value={settings.default_training_algorithm}
                onChange={(e) => setSettings({ ...settings, default_training_algorithm: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="RandomForest">Random Forest Classifier (Ensemble)</option>
                <option value="LogisticRegression">Logistic Regression</option>
                <option value="GradientBoosting">Gradient Boosting</option>
                <option value="DecisionTree">Decision Tree</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & System Section */}
        <div
          className={`p-6 rounded-3xl border space-y-5 ${
            isDark ? 'bg-[#050f0a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              Security & Session Policies
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                Admin Session Timeout (Minutes)
              </label>
              <input
                type="number"
                value={settings.session_timeout_minutes}
                onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) || 60 })}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Admin settings saved successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-emerald-soft disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
