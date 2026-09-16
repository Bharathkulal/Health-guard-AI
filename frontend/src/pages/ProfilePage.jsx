import React, { useState } from 'react';
import {
  User,
  Activity,
  Heart,
  Scale,
  Ruler,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { calculateBMI, getBMICategory } from '../services/assessmentEngine';

export function ProfilePage() {
  const { isDark } = useTheme();
  const { user, updateUserProfile, history } = useHealth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || 35,
    sex: user?.gender || user?.sex || 'male',
    heightCm: user?.height_cm || user?.heightCm || 175,
    weightKg: user?.weight_kg || user?.weightKg || 75,
    baselineActivity: user?.baseline_activity || user?.baselineActivity || 'moderate',
    bloodType: user?.blood_type || user?.bloodType || 'A+',
    emergencyContact: user?.emergency_contact || user?.emergencyContact || '',
  });

  // Sync state when user profile is fetched
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || 35,
        sex: user.gender || user.sex || 'male',
        heightCm: user.height_cm || user.heightCm || 175,
        weightKg: user.weight_kg || user.weightKg || 75,
        baselineActivity: user.baseline_activity || user.baselineActivity || 'moderate',
        bloodType: user.blood_type || user.bloodType || 'A+',
        emergencyContact: user.emergency_contact || user.emergencyContact || '',
      });
    }
  }, [user]);

  const [savedStatus, setSavedStatus] = useState(false);
  const [saving, setSaving] = useState(false);

  const calculatedBMI = calculateBMI(formData.heightCm, formData.weightKg);
  const bmiCategory = getBMICategory(calculatedBMI);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSavedStatus(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(formData);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const assessmentCount = user?.assessment_count ?? history?.length ?? 0;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
          isDark
            ? 'bg-[#07130e]/90 border-emerald-500/25 shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-extrabold text-xl shadow-emerald-soft">
              {formData.name ? formData.name.split(' ').map((n) => n[0]).join('') : 'HG'}
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
                {formData.name || 'User Profile'}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Member Since {user?.member_since || user?.memberSince || 'Recent'} • {assessmentCount} {assessmentCount === 1 ? 'Assessment' : 'Assessments'} • ID: #{user?.user_id || user?.id || 'usr_active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedStatus && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile Saved</span>
              </span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-soft transition-all transform hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Personal Information */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDark ? 'bg-[#040c08]/90 border-emerald-500/20 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="pb-3 border-b border-emerald-500/10 flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>Personal Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
              }`}
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                    : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Age (Years)
            </label>
            <input
              type="number"
              min="18"
              max="120"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value, 10) || '')}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
              }`}
            />
          </div>

          {/* Biological Sex */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Biological Sex
            </label>
            <select
              value={formData.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
              }`}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Non-Binary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Health Profile & Biometrics */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDark ? 'bg-[#040c08]/90 border-emerald-500/20 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="pb-3 border-b border-emerald-500/10 flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Health Profile & Baseline Biometrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          {/* Height */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Height (cm)
            </label>
            <div className="relative">
              <input
                type="number"
                min="100"
                max="250"
                value={formData.heightCm}
                onChange={(e) => handleChange('heightCm', parseFloat(e.target.value) || '')}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                    : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">cm</span>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Weight (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                min="30"
                max="300"
                step="0.5"
                value={formData.weightKg}
                onChange={(e) => handleChange('weightKg', parseFloat(e.target.value) || '')}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                    : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">kg</span>
            </div>
          </div>

          {/* Auto BMI */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Calculated BMI
            </label>
            <div
              className={`px-4 py-3 rounded-xl border text-sm font-mono font-bold flex items-center justify-between ${
                isDark ? 'bg-slate-900/40 border-emerald-500/20 text-slate-100' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span>{calculatedBMI > 0 ? calculatedBMI : '--'} kg/m²</span>
              <span className={`text-[11px] ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
            </div>
          </div>

          {/* Baseline Activity */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Baseline Activity
            </label>
            <select
              value={formData.baselineActivity}
              onChange={(e) => handleChange('baselineActivity', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
              }`}
            >
              <option value="sedentary">Sedentary (&lt;1 day/wk)</option>
              <option value="light">Light Activity (1-2 days/wk)</option>
              <option value="moderate">Moderate (3-4 days/wk)</option>
              <option value="active">Active (5+ days/wk)</option>
            </select>
          </div>

          {/* Blood Type */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Blood Type
            </label>
            <input
              type="text"
              value={formData.bloodType}
              onChange={(e) => handleChange('bloodType', e.target.value)}
              placeholder="e.g. A+"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
              }`}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-300">
              Emergency Contact
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                    : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
