import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Footprints, Apple, Stethoscope, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function PersonalizedGuidanceSection() {
  const { isDark } = useTheme();

  const guidancePillars = [
    {
      id: 'monitor',
      pillar: 'Monitor',
      icon: Gauge,
      action: 'Track Blood Pressure Trends',
      description: 'Record resting blood pressure at consistent intervals to observe longitudinal patterns rather than reacting to single readings.',
      tag: 'Vascular Awareness',
    },
    {
      id: 'move',
      pillar: 'Move',
      icon: Footprints,
      action: 'Sustain Consistent Physical Activity',
      description: 'Integrate 150 minutes of moderate aerobic movement or daily brisk walking to improve insulin sensitivity and arterial elasticity.',
      tag: 'Kinetic Health',
    },
    {
      id: 'nourish',
      pillar: 'Nourish',
      icon: Apple,
      action: 'Prioritize Nutrient-Dense Whole Foods',
      description: 'Emphasize high-fiber vegetables, lean proteins, and controlled sodium intake to stabilize glycemic curves and metabolic metrics.',
      tag: 'Metabolic Balance',
    },
    {
      id: 'consult',
      pillar: 'Consult',
      icon: Stethoscope,
      action: 'Review Trends with a Physician',
      description: 'Share your synthesized health history and biomarker logs during routine checkups for personalized professional medical guidance.',
      tag: 'Clinical Collaboration',
    },
  ];

  return (
    <section id="guidance" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span>Scene 06 • Actionable Guidance</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            <span>Turn Insight</span><br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Into Action.
            </span>
          </h2>

          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Data intelligence is only as valuable as the decisions it empowers. HealthGuard AI translates risk assessments into clear, proactive wellness pillars.
          </p>
        </div>

        {/* 4 Guidance Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guidancePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${
                  isDark
                    ? 'bg-[#07130e]/80 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-soft'
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xl'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {pillar.tag}
                    </span>
                  </div>

                  <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold block mb-1">
                    Pillar: {pillar.pillar}
                  </span>

                  <h3 className="text-lg font-bold text-slate-100 mb-2">
                    {pillar.action}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs text-emerald-400 font-medium">
                  <span>Proactive Recommendation</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ethical Wellness Disclaimer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>General lifestyle suggestions designed to complement, not substitute, physician consultations.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
