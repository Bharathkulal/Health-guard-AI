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
import { Footer } from '../components/common/Footer';

export function RegisterPage() {
  const { register, loading, authError, setAuthError } = useAuth();
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
    <div className="min-h-screen bg-[#F7F4EE] text-[#18201C] font-sans flex flex-col selection:bg-[#16805F] selection:text-white">
      {/* NAVBAR (matches LandingPage) */}
      <header className="w-full bg-[#F7F4EE] py-6">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded flex items-center justify-center text-[#16805F]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 16s3-2.5 3-5a3 3 0 0 0-6 0c0 2.5 3 5 3 5z" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#18201C]">HealthGuard <span className="font-normal">AI</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium">
            <Link to="/" className="text-[#66706A] hover:text-[#18201C] transition-colors">Home</Link>
            <Link to="/#how-it-works" className="text-[#66706A] hover:text-[#18201C] transition-colors">How It Works</Link>
            <Link to="/#about" className="text-[#66706A] hover:text-[#18201C] transition-colors">About</Link>
          </nav>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[15px] font-semibold bg-[#E8F2ED] text-[#16805F] hover:bg-[#d1e8dd] transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Register Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="bg-[#FFFDF9] p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] shadow-sm relative overflow-hidden transition-all">
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#E8F2ED] text-[#16805F] border border-[#16805F]/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Isolated Patient Record</span>
              </div>
              <span className="text-[11px] text-[#66706A] font-bold uppercase tracking-widest">Bcrypt + JWT</span>
            </div>

            <div className="space-y-1 mb-6 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-[#18201C]">
                Create your account
              </h1>
              <p className="text-[#66706A] font-medium text-sm">
                Start tracking longitudinal health indicators with ML risk stratification.
              </p>
            </div>

            {/* Error Alert Box */}
            {displayError && (
              <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{displayError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#18201C] block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-[#66706A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Alex Chen"
                    required
                    autoComplete="name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border border-[#E5E0D7] bg-white text-[#18201C] placeholder-[#66706A]/50 focus:border-[#16805F] focus:ring-1 focus:ring-[#16805F] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#18201C] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#66706A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="alex.chen@healthguard.ai"
                    required
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border border-[#E5E0D7] bg-white text-[#18201C] placeholder-[#66706A]/50 focus:border-[#16805F] focus:ring-1 focus:ring-[#16805F] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#18201C] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#66706A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl text-sm font-medium border border-[#E5E0D7] bg-white text-[#18201C] placeholder-[#66706A]/50 focus:border-[#16805F] focus:ring-1 focus:ring-[#16805F] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#66706A] hover:text-[#18201C] transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#18201C] block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#66706A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border border-[#E5E0D7] bg-white text-[#18201C] placeholder-[#66706A]/50 focus:border-[#16805F] focus:ring-1 focus:ring-[#16805F] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="p-3 rounded-xl border border-[#E5E0D7] bg-[#F7F4EE] text-xs font-medium grid grid-cols-2 gap-2 text-[#66706A]">
                <div className="flex items-center gap-1.5">
                  {hasLength ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16805F] flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#66706A] flex-shrink-0" />
                  )}
                  <span className={hasLength ? 'text-[#16805F] font-bold' : ''}>8+ characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasLetter ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16805F] flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#66706A] flex-shrink-0" />
                  )}
                  <span className={hasLetter ? 'text-[#16805F] font-bold' : ''}>Contains letters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumber ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16805F] flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#66706A] flex-shrink-0" />
                  )}
                  <span className={hasNumber ? 'text-[#16805F] font-bold' : ''}>Contains numbers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordsMatch ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16805F] flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#66706A] flex-shrink-0" />
                  )}
                  <span className={passwordsMatch ? 'text-[#16805F] font-bold' : ''}>Passwords match</span>
                </div>
              </div>

              {/* Clinical Decision Support Disclaimer Checkbox */}
              <label className="flex items-start gap-2.5 pt-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#E5E0D7] text-[#16805F] focus:ring-[#16805F]"
                />
                <span className="text-xs text-[#66706A] font-medium leading-relaxed group-hover:text-[#18201C] transition-colors">
                  I understand HealthGuard AI is an AI-powered clinical decision support and health optimization tool, not a substitute for diagnostic medical evaluation.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || loading || !isPasswordValid || !passwordsMatch || !disclaimerAccepted}
                className="w-full mt-4 py-4 rounded-xl text-[15px] font-bold bg-[#16805F] text-white hover:bg-[#126b4f] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Creating Patient Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register & Open Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E5E0D7]">
              <button
                type="button"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl text-[13px] font-bold border border-[#E5E0D7] bg-white text-[#18201C] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          {/* Switch to Sign In */}
          <div className="text-center text-sm font-medium text-[#66706A]">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-[#16805F] hover:text-[#126b4f] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <div className="bg-[#FFFDF9] border-t border-[#E5E0D7]">
        <Footer />
      </div>
    </div>
  );
}
