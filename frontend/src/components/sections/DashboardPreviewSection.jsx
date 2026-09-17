import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Heart, Shield, TrendingUp, Sparkles, User, Bell, Search, Gauge, ArrowUpRight, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function DashboardPreviewSection() {
  const { isDark } = useTheme();
  const [rotateX, setRotateX] = useState(6);
  const [rotateY, setRotateY] = useState(-3);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateY(x * 10);
    setRotateX(-y * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(4);
    setRotateY(-2);
  };

  return (
    <section id="dashboard-preview" className="py-24 relative overflow-hidden bg-emerald-950/20 border-y border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span>Scene 07 • Product Interface Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            <span>Designed for Clarity.</span><br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Engineered for Decision Support.
            </span>
          </h2>

          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Experience how biometrics, ML risk stratification, SHAP attribution, and clinical summaries converge in the HealthGuard AI dashboard.
          </p>
        </div>

        {/* 3D Perspective Interactive Dashboard Mockup */}
        <Link
          to="/dashboard"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1200 }}
          className="relative max-w-5xl mx-auto block cursor-pointer group"
        >
          <motion.div
            animate={{ rotateX, rotateY }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className={`rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-emerald-400/50 ${
              isDark
                ? 'bg-[#040c08] border-emerald-500/30 shadow-[0_20px_70px_-15px_rgba(16,185,129,0.3)]'
                : 'bg-white border-slate-300 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)]'
            }`}
          >
            {/* Top Mac/App Window Bar */}
            <div className={`px-5 py-3 border-b flex items-center justify-between ${
              isDark ? 'bg-[#020704] border-emerald-500/15' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                  https://app.healthguard.ai/dashboard/overview
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/20">
                  Live Interactive Mode
                </span>
              </div>
            </div>

            {/* Dashboard Inner Canvas */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/15">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <span>Clinical Decision Overview</span>
                      ID: #HG----
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Last evaluation: Today at 08:30 AM • Baseline model: XGBoost + TreeSHAP
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validated In-Range</span>
                  </div>
                </div>
              </div>

              {/* 3 Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-start text-xs text-slate-400 font-mono">
                    <span>OVERALL RISK</span>
                    <Gauge className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 mt-2">
                    -- <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400">
                    -- • Multi-Factor
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-start text-xs text-slate-400 font-mono">
                    <span>BLOOD PRESSURE</span>
                    <Heart className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 mt-2">
                    -- / -- <span className="text-xs font-normal text-slate-400">mmHg</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400">
                    Unknown
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-start text-xs text-slate-400 font-mono">
                    <span>METABOLIC / BMI</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 mt-2">
                    -- <span className="text-xs font-normal text-slate-400">kg/m²</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400">
                    Unknown
                  </div>
                </div>
              </div>

              {/* Main Visuals Grid: SHAP Mini Breakdown + Historical Trends */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left: SHAP Factor Bars */}
                <div className={`md:col-span-7 p-5 rounded-2xl border ${isDark ? 'bg-[#07130e] border-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      SHAP Factor Decomposition
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Local Attribution</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">Factor 1</span>
                        <span className="text-slate-400 font-mono">-- (--)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-slate-500 h-2 rounded-full w-[0%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">Factor 2</span>
                        <span className="text-slate-400 font-mono">-- (--)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-slate-500 h-2 rounded-full w-[0%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">Factor 3</span>
                        <span className="text-slate-400 font-mono">-- (--)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-slate-500 h-2 rounded-full w-[0%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Trend Line Visualization Preview */}
                <div className={`md:col-span-5 p-5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#07130e] border-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        6-Month Risk Trend
                      </span>
                      <span className="text-xs text-slate-400 font-mono">--% Net</span>
                    </div>

                    {/* Simulated Sparkline Graph */}
                    <div className="h-20 flex items-end gap-2 pt-4">
                      <div className="flex-1 bg-slate-500/20 h-[10%] rounded-t-sm" />
                      <div className="flex-1 bg-slate-500/20 h-[10%] rounded-t-sm" />
                      <div className="flex-1 bg-slate-500/20 h-[10%] rounded-t-sm" />
                      <div className="flex-1 bg-slate-500/20 h-[10%] rounded-t-sm" />
                      <div className="flex-1 bg-slate-500/20 h-[10%] rounded-t-sm" />
                      <div className="flex-1 bg-slate-500/20 h-[10%] rounded-t-sm" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-500/10 text-[11px] text-slate-400 flex justify-between">
                    <span>Oct</span>
                    <span>Dec</span>
                    <span>Feb</span>
                    <span>Apr</span>
                    <span>Jun</span>
                    <span>Current</span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </Link>

        {/* Action Button below Preview */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-soft transition-all transform hover:-translate-y-0.5"
          >
            <span>Enter Live Application Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
