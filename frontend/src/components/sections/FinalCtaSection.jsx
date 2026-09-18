import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Sparkles, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { useTheme } from '../../context/ThemeContext';

export function FinalCtaSection() {
  const { isDark } = useTheme();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Main Closer Card */}
        <div className={`rounded-3xl p-8 sm:p-14 border text-center relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-b from-emerald-950/40 via-[#06140d] to-[#020704] border-emerald-500/30 shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)]'
            : 'bg-gradient-to-b from-emerald-50 via-white to-slate-50 border-emerald-300 shadow-2xl'
        }`}>
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/15 blur-3xl -z-10 pointer-events-none" />

          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Health Intelligence</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              <span>Your Health.</span><br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Better Understood.
              </span>
            </h2>

            <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Explore how HealthGuard AI turns health indicators into understandable, explainable early risk insights for proactive, informed decisions.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Start Risk Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 px-6 py-4 rounded-full text-sm font-semibold border transition-all ${
                  isDark
                    ? 'border-emerald-500/30 text-slate-200 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400/50'
                    : 'border-slate-300 text-slate-800 bg-white hover:bg-slate-100 hover:border-emerald-500'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Launch Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Prominent Medical Disclaimer Banner */}
        <DisclaimerBanner />

      </div>
    </section>
  );
}
