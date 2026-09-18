import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HealthCoreCanvas } from '../3d/HealthCoreCanvas';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Heart, Zap, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function HeroSection() {
  const { isDark } = useTheme();

  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden tech-grid">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Narrative Copy */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Health Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              <span className="block text-slate-100">Understand Your Health.</span>
              <span className="block bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Before Risk Becomes a Problem.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className={`text-base sm:text-lg leading-relaxed max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              HealthGuard AI analyzes baseline physiological indicators to deliver early risk assessment, transparent SHAP-powered explanations, and personalized preventive wellness guidance.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Start Health Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/dashboard"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  isDark
                    ? 'border-emerald-500/25 text-slate-200 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400/40'
                    : 'border-slate-300 text-slate-800 bg-white hover:bg-slate-100 hover:border-emerald-500'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Open Dashboard</span>
              </Link>
            </div>

            {/* Small Ethical Disclaimer & Trust Badges */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Decision support, not medical diagnosis.</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>Explainable AI (SHAP) Powered</span>
            </div>

          </motion.div>

          {/* Right Hero 3D Health Intelligence Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px]"
          >
            {/* Ambient Back Glow */}
            <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl -z-10 pointer-events-none" />

            {/* Live 3D WebGL Canvas */}
            <div className="w-full h-[450px] sm:h-[520px]">
              <HealthCoreCanvas />
            </div>

            {/* Floating Live Telemetry Badges around the 3D Core */}
            {/* Top-Left: Blood Pressure */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-2 sm:left-6 glass-panel px-3.5 py-2.5 rounded-xl border border-emerald-500/30 shadow-lg pointer-events-none"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">Blood Pressure</span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">120 / 80 <span className="text-[10px] text-slate-400 font-normal">mmHg</span></div>
            </motion.div>

            {/* Top-Right: Heart Rate */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-10 right-2 sm:right-6 glass-panel px-3.5 py-2.5 rounded-xl border border-emerald-500/30 shadow-lg pointer-events-none"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Heart Rate</span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">72 <span className="text-[10px] text-slate-400 font-normal">BPM • Optimal</span></div>
            </motion.div>

            {/* Bottom-Left: Glucose */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-6 left-4 sm:left-10 glass-panel px-3.5 py-2.5 rounded-xl border border-emerald-500/30 shadow-lg pointer-events-none"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Glucose</span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">98 <span className="text-[10px] text-slate-400 font-normal">mg/dL • Fasting</span></div>
            </motion.div>

            {/* Bottom-Right: Risk Status Badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-12 right-2 sm:right-8 glass-panel px-3.5 py-2.5 rounded-xl border border-emerald-500/40 shadow-lg pointer-events-none"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">SHAP Attributed</span>
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">Early Risk Assessment: Low</div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
