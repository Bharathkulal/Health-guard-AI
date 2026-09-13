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
      unit: '/ 100',
      color: '#10b981',
      icon: TrendingUp,
      min: 0,
      max: 100,
      getValue: (d) => d.overallRisk,
      formatter: (v) => `${v} pts`,
    },
    bloodPressure: {
      label: 'Blood Pressure',
      unit: 'mmHg',
      color: '#34d399',
      secondaryColor: '#60a5fa',
      icon: Heart,
      min: 50,
      max: 180,
      getValue: (d) => d.systolicBP,
      getSecondaryValue: (d) => d.diastolicBP,
      formatter: (v, d) => `${d?.systolicBP || v} / ${d?.diastolicBP || '--'} mmHg`,
    },
    fastingBloodSugar: {
      label: 'Fasting Blood Glucose',
      unit: 'mg/dL',
      color: '#f59e0b',
      icon: Droplets,
      min: 60,
      max: 160,
      getValue: (d) => d.fastingBloodSugar,
      formatter: (v) => `${v} mg/dL`,
    },
    bmi: {
      label: 'Body Mass Index (BMI)',
      unit: 'kg/m²',
      color: '#a78bfa',
      icon: Scale,
      min: 15,
      max: 38,
      getValue: (d) => d.bmi,
      formatter: (v) => `${v} kg/m²`,
    },
    heartRate: {
      label: 'Resting Heart Rate',
      unit: 'BPM',
      color: '#f43f5e',
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
      <div className="p-8 text-center text-slate-400 text-xs">
        No historical telemetry points available for chart rendering.
      </div>
    );
  }

  // SVG Chart Geometry
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;
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
  const areaPathD = primaryPoints.length > 0
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
      className={`p-5 sm:p-7 rounded-3xl border space-y-6 ${
        isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
      } ${className}`}
    >
      {/* Metric Selector Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {currentConfig.label}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {data.length} Longitudinal Assessments
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-emerald-500/15">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-emerald-soft'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/30'
                }`}
              >
                {cfg.label.split(' ')[0]}
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
                <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.3" />
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
                    stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-500 font-mono"
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
                strokeWidth="3"
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
                      stroke="rgba(16, 185, 129, 0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Circle Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 4.5}
                    fill={currentConfig.color}
                    stroke={isDark ? '#040c08' : '#ffffff'}
                    strokeWidth={2}
                    className="transition-all duration-200"
                  />

                  {/* X-Axis Date Label */}
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono"
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
        className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-mono transition-all ${
          hoveredIndex !== null
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-slate-900/30 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {hoveredIndex !== null
              ? `Assessment on ${data[hoveredIndex]?.date}`
              : 'Hover over data points to inspect historical readings'}
          </span>
        </div>

        {hoveredIndex !== null && (
          <div className="font-bold text-slate-100">
            {currentConfig.formatter(primaryValues[hoveredIndex], data[hoveredIndex])}
          </div>
        )}
      </div>
    </div>
  );
}
