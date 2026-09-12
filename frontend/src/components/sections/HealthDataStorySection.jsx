import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Gauge, Flame, Footprints, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function HealthDataStorySection() {
  const { isDark } = useTheme();
  const [activeSignal, setActiveSignal] = useState(0);

  const signals = [
    {
      id: 'bp',
      icon: Gauge,
      title: 'Blood Pressure',
      value: '120 / 80',
      unit: 'mmHg',
      status: 'Optimal Baseline',
      statusColor: 'emerald',
      narrative: 'Systolic and diastolic pressures reflect arterial resistance. Even mild elevation serves as an early indicator for cardiovascular strain.',
    },
    {
      id: 'hr',
      icon: Heart,
      title: 'Resting Heart Rate',
      value: '72',
      unit: 'BPM',
      status: 'Resting Normal',
      statusColor: 'emerald',
      narrative: 'Resting pulse stability offers direct insight into autonomic balance, myocardial fitness, and systemic stress response.',
    },
    {
      id: 'bmi',
      icon: Activity,
      title: 'Body Mass Index',
      value: '22.4',
      unit: 'kg/m²',
      status: 'Healthy Range',
      statusColor: 'emerald',
      narrative: 'Calculated from stature and weight to model adiposity risk factors and metabolic equilibrium over time.',
    },
    {
      id: 'glucose',
      icon: Flame,
      title: 'Fasting Blood Glucose',
      value: '98',
      unit: 'mg/dL',
      status: 'Euglycemic',
      statusColor: 'emerald',
      narrative: 'Baseline circulating sugar metrics detect early glycemic fluctuations prior to prediabetic thresholds.',
    },
    {
      id: 'activity',
      icon: Footprints,
      title: 'Daily Movement & Activity',
      value: '7,420',
      unit: 'steps/day',
      status: 'Active Target',
      statusColor: 'emerald',
      narrative: 'Habitual kinetic output counteracts insulin resistance and maintains endothelial vascular flexibility.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span>Scene 02 • Signal Telemetry</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Every Signal Tells a Story.
          </h2>

          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Non-invasive biometric observations form a holistic health fingerprint. HealthGuard AI continuously synthesizes subtle variations into early risk awareness.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-slate-800/40 text-slate-400 border border-slate-700/50">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Values presented are illustrative demo metrics</span>
          </div>
        </div>

        {/* Signals Grid & Interactive Telemetry Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            const isSelected = activeSignal === index;

            return (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setActiveSignal(index)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/40 border-emerald-400 shadow-emerald-soft'
                      : 'bg-emerald-50/90 border-emerald-500 shadow-glass-light'
                    : isDark
                      ? 'bg-[#07130e]/70 border-emerald-500/15 hover:border-emerald-500/40 hover:bg-[#0b1d16]/70'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                {/* Subtle top indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                    isSelected ? 'bg-emerald-400' : 'bg-transparent group-hover:bg-emerald-500/30'
                  }`}
                />

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl border transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:text-emerald-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    {signal.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                    {signal.title}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-100">
                      {signal.value}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {signal.unit}
                    </span>
                  </div>
                </div>

                <p className={`mt-4 text-xs sm:text-sm leading-relaxed border-t pt-3 ${
                  isDark ? 'border-emerald-500/10 text-slate-300' : 'border-slate-100 text-slate-600'
                }`}>
                  {signal.narrative}
                </p>
              </motion.div>
            );
          })}

          {/* Aggregated Biometric Fingerprint Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`rounded-2xl p-6 border flex flex-col justify-between ${
              isDark
                ? 'bg-gradient-to-br from-emerald-950/30 via-[#07130e] to-[#030806] border-emerald-500/30'
                : 'bg-gradient-to-br from-emerald-50 via-white to-slate-50 border-emerald-300'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Signal Synthesis Engine
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                Multi-Vector Correlation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                HealthGuard AI never evaluates markers in isolation. Pulse pressure, BMI ratio, and metabolic rates are normalized into a unified multidimensional feature matrix.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Status: Stream Ready</span>
              <span className="text-emerald-400 font-semibold">100% Non-Invasive</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
