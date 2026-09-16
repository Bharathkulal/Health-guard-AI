/**
 * @file ForgotPasswordPage.jsx
 * HealthGuard AI Password Recovery & Account Verification Interface
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Mail,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function ForgotPasswordPage() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    // Simulating secure token generation / dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between tech-grid transition-colors duration-300 ${
        isDark ? 'bg-[#030806] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border relative shadow-2xl backdrop-blur-xl transition-all ${
              isDark
                ? 'bg-[#020704]/90 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.08)]'
                : 'bg-white/95 border-slate-200 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Account Recovery</span>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
                Reset your password
              </h1>
              <p className="text-xs text-slate-400">
                Enter your verified patient email address to receive password reset instructions.
              </p>
            </div>

            {submitted ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Recovery Dispatch Complete</p>
                    <p className="text-slate-300 leading-relaxed">
                      If an active HealthGuard account is associated with <span className="font-mono text-emerald-300">{email}</span>, a cryptographic reset verification link has been dispatched.
                    </p>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.chen@healthguard.ai"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                        isDark
                          ? 'bg-[#06140d]/80 border-emerald-500/20 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-soft transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Instructions</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center text-xs text-slate-400">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto p-4 sm:p-6 text-center text-[11px] text-slate-500 font-mono">
        HealthGuard AI Clinical Decision Support • End-to-End Cryptographic Security
      </footer>
    </div>
  );
}
