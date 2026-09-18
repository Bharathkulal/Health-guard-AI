import React from 'react';
import { motion } from 'framer-motion';
import { RiskBadge } from '../common/RiskBadge';

export function RiskGauge({ score = 64, level = 'Moderate', confidence = 94, className = '' }) {
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
    if (sc < 30) return '#16805F'; // Low (Green)
    if (sc < 70) return '#B7791F'; // Moderate (Amber)
    return '#C24141'; // High (Red)
  };

  const strokeColor = getScoreColor(score);

  return (
    <div
      className={`text-center flex flex-col items-center justify-center relative w-full h-full ${className}`}
    >
      <div className="w-full flex items-center justify-between text-xs font-bold mb-4">
        <span className="text-[#66706A] uppercase tracking-widest">Overall Composite Risk</span>
        <span className="text-[#16805F]">{confidence}% Model Confidence</span>
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative my-4 flex items-center justify-center w-full">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E0D7"
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
            className="space-y-0.5 mt-2"
          >
            <div className="text-4xl sm:text-5xl font-black text-[#18201C] tracking-tight">
              {score}
            </div>
            <div className="text-xs font-bold text-[#66706A] uppercase tracking-wide">
              / 100 Score
            </div>
          </motion.div>
        </div>
      </div>

      {/* Risk Badge Tag */}
      <div className="mt-4">
        <RiskBadge level={level} size="lg" />
      </div>

      <p className="text-[13px] text-[#66706A] font-medium max-w-[260px] mt-4 leading-relaxed">
        Composite risk index synthesizing relevant health indicators.
      </p>
    </div>
  );
}
