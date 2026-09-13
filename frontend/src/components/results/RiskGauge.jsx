import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { RiskBadge } from '../common/RiskBadge';

export function RiskGauge({ score = 64, level = 'Moderate', confidence = 94, className = '' }) {
  const { isDark } = useTheme();

  // SVG Gauge calculations
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle / 240 degree arc (3/4 circle)
  const arcPercentage = 0.75;
  const arcLength = circumference * arcPercentage;
  const scorePercent = Math.min(100, Math.max(0, score)) / 100;
  const dashOffset = arcLength * (1 - scorePercent);

  const getScoreColor = (sc) => {
    if (sc < 30) return '#10b981'; // emerald
    if (sc < 60) return '#f59e0b'; // amber
    if (sc < 80) return '#f97316'; // orange
    return '#f43f5e'; // rose
  };

  const strokeColor = getScoreColor(score);

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border text-center flex flex-col items-center justify-center relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-b from-[#07150e] to-[#020704] border-emerald-500/25 shadow-2xl'
          : 'bg-white border-slate-200 shadow-xl'
      } ${className}`}
    >
      {/* Ambient Radial Score Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl -z-10 opacity-30 pointer-events-none"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="w-full flex items-center justify-between text-xs font-mono mb-2">
        <span className="text-slate-400 uppercase tracking-wider">Overall Composite Risk</span>
        <span className="text-emerald-400 font-semibold">{confidence}% Model Confidence</span>
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative my-4 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated Active Score Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Inner Data */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-0.5"
          >
            <div className="text-4xl sm:text-5xl font-black text-slate-100 font-mono tracking-tight">
              {score}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              / 100 Score
            </div>
          </motion.div>
        </div>
      </div>

      {/* Risk Badge Tag */}
      <div className="mt-1">
        <RiskBadge level={level} size="lg" />
      </div>

      <p className="text-xs text-slate-400 max-w-xs mt-3 leading-relaxed">
        Composite risk index synthesizing metabolic, vascular, and lifestyle indicators.
      </p>
    </div>
  );
}
