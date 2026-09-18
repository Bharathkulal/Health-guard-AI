import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Droplets, Scale, TrendingUp, Calendar, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function TrendChart({ data = [], className = '' }) {
  const { isDark } = useTheme();
  const [activeMetric, setActiveMetric] = useState('overallRisk');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const metricsConfig = {
    overallRisk: {
      label: 'Composite Risk Score',
      shortLabel: 'Composite',
      unit: '/ 100',
      color: '#16805F',
      icon: TrendingUp,
      min: 0,
      max: 100,
      getValue: (d) => d.overallRisk,
      formatter: (v) => `${v} pts`,
    },
    bloodPressure: {
      label: 'Blood Pressure',
      shortLabel: 'Blood Pressure',
      unit: 'mmHg',
      color: '#E11D48',
      secondaryColor: '#2563EB',
      icon: Heart,
      min: 50,
      max: 180,
      getValue: (d) => d.systolicBP,
      getSecondaryValue: (d) => d.diastolicBP,
      formatter: (v, d) => `${d?.systolicBP || v} / ${d?.diastolicBP || '--'} mmHg`,
    },
    fastingBloodSugar: {
      label: 'Fasting Blood Glucose',
      shortLabel: 'Glucose',
      unit: 'mg/dL',
      color: '#D97706',
      icon: Droplets,
      min: 60,
      max: 160,
      getValue: (d) => d.fastingBloodSugar,
      formatter: (v) => `${v} mg/dL`,
    },
    bmi: {
      label: 'Body Mass Index (BMI)',
      shortLabel: 'BMI',
      unit: 'kg/m²',
      color: '#7C3AED',
      icon: Scale,
      min: 15,
      max: 38,
      getValue: (d) => d.bmi,
      formatter: (v) => `${v} kg/m²`,
    },
    heartRate: {
      label: 'Resting Heart Rate',
      shortLabel: 'Heart Rate',
      unit: 'BPM',
      color: '#DC2626',
      icon: Activity,
      min: 45,
      max: 120,
      getValue: (d) => d.heartRate,
      formatter: (v) => `${v} BPM`,
    },
  };

  const currentConfig = metricsConfig[activeMetric] || metricsConfig.overallRisk;
  const Icon = currentConfig.icon;

  if (!data || data.length === 0) {
    return (
      <div className={`p-8 text-center rounded-3xl border ${isDark ? 'bg-[#07130e]/80 border-emerald-500/20 text-slate-400' : 'bg-[#FFFDF9] border-[#E5E0D7] text-[#66706A] text-xs'}`}>
        No historical telemetry points available for chart rendering.
      </div>
    );
  }

  // SVG Chart Geometry
  const width = 800;
  const height = 260;
  const paddingX = 45;
  const paddingY = 32;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const pointsCount = data.length;
  const getX = (index) => {
    if (pointsCount === 1) return width / 2;
    return paddingX + (index / (pointsCount - 1)) * chartWidth;
  };

  const getY = (val, min = currentConfig.min, max = currentConfig.max) => {
    const clamped = Math.max(min, Math.min(max, val));
    const ratio = (clamped - min) / (max - min);
    return height - paddingY - ratio * chartHeight;
  };

  // Build SVG Path strings
  const primaryValues = data.map((d) => currentConfig.getValue(d) || 0);
  const primaryPoints = primaryValues.map((val, i) => ({
    x: getX(i),
    y: getY(val),
    val,
    dataPoint: data[i],
  }));

  const primaryPathD = primaryPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Fill area under path
  const areaPathD = primaryPoints.length > 1
    ? `${primaryPathD} L ${primaryPoints[primaryPoints.length - 1].x},${height - paddingY} L ${primaryPoints[0].x},${height - paddingY} Z`
    : '';

  // Optional secondary line for Diastolic BP
  let secondaryPathD = '';
  let secondaryPoints = [];
  if (activeMetric === 'bloodPressure' && currentConfig.getSecondaryValue) {
    const secValues = data.map((d) => currentConfig.getSecondaryValue(d) || 0);
    secondaryPoints = secValues.map((val, i) => ({
      x: getX(i),
      y: getY(val),
      val,
      dataPoint: data[i],
    }));
    secondaryPathD = secondaryPoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
      } ${className}`}
    >
      {/* Metric Selector & Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-emerald-500/10' : 'border-[#E5E0D7]'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDark
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-[#E8F2ED] border border-[#16805F]/20 text-[#16805F]'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
              {currentConfig.label}
            </h3>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
              {data.length} {data.length === 1 ? 'Longitudinal Assessment' : 'Longitudinal Assessments'}
            </span>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border ${
          isDark
            ? 'bg-slate-900/60 border-emerald-500/15'
            : 'bg-[#F7F4EE] border-[#E5E0D7]'
        }`}>
          {Object.entries(metricsConfig).map(([key, cfg]) => {
            const isSelected = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveMetric(key);
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-500 text-black shadow-emerald-soft'
                      : 'bg-[#16805F] text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/30'
                    : 'text-[#66706A] hover:text-[#18201C] hover:bg-white/80'
                }`}
              >
                {cfg.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[600px] w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - paddingY - ratio * chartHeight;
              const val = Math.round(currentConfig.min + ratio * (currentConfig.max - currentConfig.min));
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke={isDark ? 'rgba(255,255,255,0.08)' : '#E5E0D7'}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    className={`text-[11px] font-bold ${isDark ? 'fill-slate-500 font-mono' : 'fill-[#66706A]'}`}
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPathD && (
              <path d={areaPathD} fill="url(#trendGradient)" />
            )}

            {/* Primary Stroke Line */}
            {primaryPathD && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                d={primaryPathD}
                fill="none"
                stroke={currentConfig.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Secondary Stroke Line for Blood Pressure */}
            {secondaryPathD && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                d={secondaryPathD}
                fill="none"
                stroke={currentConfig.secondaryColor}
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {primaryPoints.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Vertical Guide */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={height - paddingY}
                      stroke={currentConfig.color}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.5"
                    />
                  )}

                  {/* Outer Glowing Ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 10 : 7}
                    fill={currentConfig.color}
                    fillOpacity={isHovered ? 0.35 : 0.2}
                    className="transition-all duration-200"
                  />

                  {/* Inner Solid Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4.5}
                    fill={currentConfig.color}
                    stroke={isDark ? '#07130e' : '#FFFFFF'}
                    strokeWidth={2.5}
                    className="transition-all duration-200 shadow-sm"
                  />

                  {/* X-Axis Date Label */}
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${isDark ? 'fill-slate-400 font-mono' : 'fill-[#18201C]'}`}
                  >
                    {pt.dataPoint?.shortDate || pt.dataPoint?.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dynamic Hover Tooltip Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
          hoveredIndex !== null
            ? isDark
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-[#E8F2ED] border-[#16805F]/30 text-[#16805F] shadow-xs'
            : isDark
            ? 'bg-slate-900/40 border-slate-800 text-slate-400 font-mono'
            : 'bg-[#F7F4EE] border-[#E5E0D7] text-[#66706A] font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-[#16805F]'}`} />
          <span className="font-semibold">
            {hoveredIndex !== null
              ? `Assessment on ${data[hoveredIndex]?.date}`
              : 'Hover over data points to inspect historical readings'}
          </span>
        </div>

        {hoveredIndex !== null ? (
          <div className={`font-black text-sm ${isDark ? 'text-slate-100 font-mono' : 'text-[#18201C]'}`}>
            {currentConfig.formatter(primaryValues[hoveredIndex], data[hoveredIndex])}
          </div>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16805F]">
            {currentConfig.shortLabel}
          </span>
        )}
      </div>
    </div>
  );
}
