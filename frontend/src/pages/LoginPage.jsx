import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/common/Footer';

export function LoginPage() {
  const { login, loading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const redirectPath = redirectParam || location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (setAuthError) setAuthError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex.chen@healthguard.ai');
    setPassword('HealthGuard2026!');
    setLocalError('');
    setSubmitting(true);
    try {
      await login('alex.chen@healthguard.ai', 'HealthGuard2026!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Demo account login failed. Please register a new account.');
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
            to="/register"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[15px] font-semibold bg-[#E8F2ED] text-[#16805F] hover:bg-[#d1e8dd] transition-all"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-[#18201C]">Welcome Back</h1>
            <p className="text-[#66706A] font-medium">
              Sign in to access your health profile and risk assessments.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#FFFDF9] p-8 rounded-3xl border border-[#E5E0D7] shadow-sm relative overflow-hidden">
            
            {/* Top Badge */}
            <div className="flex items-center justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#E8F2ED] text-[#16805F] border border-[#16805F]/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure Session</span>
              </div>
            </div>

            {/* Error Alert Box */}
            {displayError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span className="leading-snug">{displayError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#18201C] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#66706A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.chen@healthguard.ai"
                    required
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border border-[#E5E0D7] bg-white text-[#18201C] placeholder-[#66706A]/50 focus:border-[#16805F] focus:ring-1 focus:ring-[#16805F] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#18201C]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#16805F] hover:text-[#126b4f] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#66706A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full mt-4 py-4 rounded-xl text-[15px] font-bold bg-[#16805F] text-white hover:bg-[#126b4f] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="mt-8 pt-6 border-t border-[#E5E0D7]">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl text-[13px] font-bold border border-[#E5E0D7] bg-[#F7F4EE] text-[#18201C] hover:bg-[#E8F2ED] hover:border-[#16805F]/30 hover:text-[#16805F] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#16805F]" />
                <span>Quick Demo Login (Alex Chen)</span>
              </button>
            </div>
          </div>

          {/* Bottom Switch to Register */}
          <div className="text-center text-sm font-medium text-[#66706A]">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-[#16805F] hover:text-[#126b4f] transition-colors"
            >
              Create one now
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
