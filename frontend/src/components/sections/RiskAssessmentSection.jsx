import React from 'react';
import { motion } from 'framer-motion';
import { RiskOrbCanvas } from '../3d/RiskOrbCanvas';
import { Heart, Activity, AlertTriangle, ShieldCheck, Gauge, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function RiskAssessmentSection() {
  const { isDark } = useTheme();

  const riskCategories = [
    {
      title: 'Cardiovascular Risk',
      level: 'Moderate Risk',
      score: 64,
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/30',
      barColor: 'bg-amber-400',
      details: 'Influenced by baseline arterial pressure markers and activity index.',
      icon: Heart,
    },
    {
      title: 'Type-2 Diabetes Risk',
      level: 'Low Risk',
      score: 28,
      color: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/30',
      barColor: 'bg-emerald-400',
      details: 'Optimal fasting glucose and BMI ratio maintain low metabolic stress.',
      icon: Activity,
    },
    {
      title: 'Hypertension Risk',
      level: 'Moderate Risk',
      score: 72,
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/30',
      barColor: 'bg-amber-400',
      details: 'Systolic variance indicates early vascular stiffness consideration.',
      icon: Gauge,
    },
  ];

  return (
    <section id="risk-assessment" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span>Scene 04 • Multi-Vector Stratification</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            <span>See Potential Risk</span><br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Before It Becomes Invisible.
            </span>
          </h2>

          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Rather than a single binary label, HealthGuard AI stratifies composite probabilities across critical physiological subsystems with calm, objective clarity.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-slate-800/40 text-slate-400 border border-slate-700/50">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Illustrative demonstration — not an individual medical evaluation</span>
          </div>
        </div>

        {/* Central 3D Risk Orb + Stratified Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive 3D Risk Core Gauge */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="w-full h-[380px] sm:h-[440px] relative">
              <RiskOrbCanvas riskScore={64} />

              {/* Floating Center Overlay Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 text-center shadow-2xl backdrop-blur-xl">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                    Composite Assessment
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight mt-1">
                    64 <span className="text-xl font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
                    Moderate Early Risk
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-axis calibrated risk score</span>
            </div>
          </div>

          {/* Right Column: Detailed Stratified Risk Vectors */}
          <div className="lg:col-span-6 space-y-4">
            {riskCategories.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className={`rounded-2xl p-5 border transition-all ${
                    isDark ? 'bg-[#07130e]/80 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-white border-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base text-slate-100">{item.title}</h3>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.bgGlow} ${item.color}`}>
                      {item.level} ({item.score}%)
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + idx * 0.1 }}
                      className={`h-full rounded-full ${item.barColor}`}
                    />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.details}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
