/**
 * @file RegisterPage.jsx
 * HealthGuard AI Secure User Registration Interface
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function RegisterPage() {
  const { register, loading, authError, setAuthError } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Password validation criteria checks
  const hasLength = formData.password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const passwordsMatch = Boolean(
    formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
  );

  const isPasswordValid = hasLength && hasLetter && hasNumber;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setLocalError('');
    if (setAuthError) setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setLocalError('Please provide your full legal or patient name (at least 2 characters).');
      return;
    }

    if (!formData.email.trim()) {
      setLocalError('Please provide a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setLocalError('Please ensure your password satisfies all security criteria (8+ characters, letters, and numbers).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match. Please re-type your password confirmation.');
      return;
    }

    if (!disclaimerAccepted) {
      setLocalError('Please acknowledge the clinical decision support disclaimer to proceed.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.confirmPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between tech-grid transition-colors duration-300 ${
        isDark ? 'bg-[#030806] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Ambient Glow */}
      <div className="fixed inset-0 radial-glow pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-emerald-400">
            <Activity className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight flex items-center gap-1.5">
              <span className={isDark ? 'text-white' : 'text-slate-900'}>HealthGuard</span>
              <span className="text-emerald-500 font-extrabold text-xs px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                AI
              </span>
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Register Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border relative shadow-2xl backdrop-blur-xl transition-all ${
              isDark
                ? 'bg-[#020704]/90 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.08)]'
                : 'bg-white/95 border-slate-200 shadow-xl'
            }`}
          >
            {/* Top Security Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Isolated Patient Record</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Bcrypt + JWT</span>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
                Create your account
              </h1>
              <p className="text-xs text-slate-400">
                Start tracking longitudinal health indicators with ML risk stratification.
              </p>
            </div>

            {/* Error Alert Box */}
            {displayError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{displayError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Dr. Alex Chen"
                    required
                    autoComplete="name"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#06140d]/80 border-emerald-500/20 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="alex.chen@healthguard.ai"
                    required
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#06140d]/80 border-emerald-500/20 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#06140d]/80 border-emerald-500/20 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#06140d]/80 border-emerald-500/20 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className={`p-3 rounded-2xl border text-[11px] grid grid-cols-2 gap-2 ${
                isDark ? 'bg-[#06140d]/40 border-emerald-500/15 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-1.5">
                  {hasLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={hasLength ? 'text-emerald-300 font-medium' : ''}>8+ characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasLetter ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={hasLetter ? 'text-emerald-300 font-medium' : ''}>Contains letters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={hasNumber ? 'text-emerald-300 font-medium' : ''}>Contains numbers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordsMatch ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={passwordsMatch ? 'text-emerald-300 font-medium' : ''}>Passwords match</span>
                </div>
              </div>

              {/* Clinical Decision Support Disclaimer Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-[11px] text-slate-400 leading-snug">
                  I understand HealthGuard AI is an AI-powered clinical decision support and health optimization tool, not a substitute for diagnostic medical evaluation.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || loading || !isPasswordValid || !passwordsMatch || !disclaimerAccepted}
                className="w-full mt-2 py-3 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-soft transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {submitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Creating Patient Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch to Sign In */}
          <div className="text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto p-4 sm:p-6 text-center text-[11px] text-slate-500 font-mono">
        HealthGuard AI Clinical Decision Support • End-to-End Cryptographic Security
      </footer>
    </div>
  );
}
