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
            : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl ${
              isDark
                ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/40 text-emerald-300 shadow-emerald-soft'
                : 'bg-[#E8F2ED] border border-[#16805F]/20 text-[#16805F]'
            }`}>
              {formData.name ? formData.name.split(' ').map((n) => n[0]).join('') : 'HG'}
            </div>
            <div className="space-y-0.5">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
                {formData.name || 'User Profile'}
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
                Member Since {user?.member_since || user?.memberSince || 'Recent'} • {assessmentCount} {assessmentCount === 1 ? 'Assessment' : 'Assessments'} • ID: #{user?.user_id || user?.id || 'usr_active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedStatus && (
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border animate-in fade-in ${
                isDark
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-[#16805F] bg-[#E8F2ED] border-[#16805F]/20'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile Saved</span>
              </span>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all transform hover:-translate-y-0.5 ${
                isDark
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-soft'
                  : 'bg-[#16805F] text-white hover:bg-[#126b4f] shadow-sm'
              }`}
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
          isDark ? 'bg-[#040c08]/90 border-emerald-500/20 shadow-xl' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className={`pb-3 border-b flex items-center gap-2 font-bold text-sm uppercase tracking-wider ${
          isDark ? 'border-emerald-500/10 text-emerald-400' : 'border-[#E5E0D7] text-[#16805F]'
        }`}>
          <User className="w-4 h-4" />
          <span>Personal Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
              }`}
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
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
                    : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
                }`}
              />
              <Mail className="w-4 h-4 text-[#66706A] absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
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
                  : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
              }`}
            />
          </div>

          {/* Biological Sex */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
              Biological Sex
            </label>
            <select
              value={formData.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
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
          isDark ? 'bg-[#040c08]/90 border-emerald-500/20 shadow-xl' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className={`pb-3 border-b flex items-center gap-2 font-bold text-sm uppercase tracking-wider ${
          isDark ? 'border-emerald-500/10 text-emerald-400' : 'border-[#E5E0D7] text-[#16805F]'
        }`}>
          <Activity className="w-4 h-4" />
          <span>Health Profile & Baseline Biometrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          {/* Height */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
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
                    : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#66706A] text-xs font-bold">cm</span>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
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
                    : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#66706A] text-xs font-bold">kg</span>
            </div>
          </div>

          {/* Auto BMI */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
              Calculated BMI
            </label>
            <div
              className={`px-4 py-3 rounded-xl border text-sm font-bold flex items-center justify-between ${
                isDark ? 'bg-slate-900/40 border-emerald-500/20 text-slate-100' : 'bg-white border-[#E5E0D7] text-[#18201C]'
              }`}
            >
              <span>{calculatedBMI > 0 ? calculatedBMI : '--'} kg/m²</span>
              <span className={`text-[11px] font-bold ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
            </div>
          </div>

          {/* Baseline Activity */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
              Baseline Activity
            </label>
            <select
              value={formData.baselineActivity}
              onChange={(e) => handleChange('baselineActivity', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 text-slate-100'
                  : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
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
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
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
                  : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
              }`}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <label className={`block font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#18201C]'}`}>
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
                    : 'bg-white border-[#E5E0D7] focus:border-[#16805F] text-[#18201C]'
                }`}
              />
              <Phone className="w-4 h-4 text-[#66706A] absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
