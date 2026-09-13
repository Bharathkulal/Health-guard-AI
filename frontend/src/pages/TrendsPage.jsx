import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Scale,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { TrendChart } from '../components/trends/TrendChart';
import { EmptyState } from '../components/common/EmptyState';

export function TrendsPage() {
  const { isDark } = useTheme();
  const { trends, history } = useHealth();
  const [timeframe, setTimeframe] = useState('6m');

  if (!trends || trends.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-100">
            Health Biometric Trends
          </h1>
          <p className="text-xs text-slate-400">
            Track risk indices, blood pressure, glucose, and metabolic changes over time.
          </p>
        </div>

        <EmptyState
          icon={TrendingUp}
          title="No Historical Health Trends Yet"
          description="Your longitudinal health trends will appear here as you log periodic health assessments."
          actionText="Take Your First Assessment"
          actionHref="/assessment"
        />
      </div>
    );
  }

  // Calculate baseline changes between first and most recent assessment
  const oldest = trends[0];
  const newest = trends[trends.length - 1];

  const riskDelta = newest && oldest ? newest.overallRisk - oldest.overallRisk : 0;
  const bpSysDelta = newest && oldest ? newest.systolicBP - oldest.systolicBP : 0;
  const glucoseDelta = newest && oldest ? newest.fastingBloodSugar - oldest.fastingBloodSugar : 0;
  const bmiDelta = newest && oldest ? Math.round((newest.bmi - oldest.bmi) * 10) / 10 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-500/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Longitudinal Telemetry Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Biometric & Risk Trends
          </h1>
          <p className="text-xs text-slate-400">
            Analyzing {trends.length} chronological evaluations from {oldest?.date} to {newest?.date}.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-emerald-500/15 text-xs font-semibold">
          {[
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: '6m', label: '6 Months' },
            { id: 'all', label: 'All Time' },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === tf.id
                  ? 'bg-emerald-500 text-black font-bold shadow-emerald-soft'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/20'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trajectory Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Risk Score Trajectory */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Composite Risk Delta
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {newest?.overallRisk}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-mono">
            {riskDelta < 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(riskDelta)} pts (Improved)
              </span>
            ) : riskDelta > 0 ? (
              <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{riskDelta} pts (Elevated)
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-0.5">
                <Minus className="w-3 h-3" />
                Stable
              </span>
            )}
          </div>
        </div>

        {/* Blood Pressure Delta */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Systolic BP Delta
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {newest?.systolicBP}
            </span>
            <span className="text-xs text-slate-400 font-mono">mmHg</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-mono">
            {bpSysDelta < 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(bpSysDelta)} mmHg (Reduced)
              </span>
            ) : bpSysDelta > 0 ? (
              <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{bpSysDelta} mmHg (Elevated)
              </span>
            ) : (
              <span className="text-slate-400">Stable</span>
            )}
          </div>
        </div>

        {/* Glucose Delta */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Fasting Glucose Delta
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {newest?.fastingBloodSugar}
            </span>
            <span className="text-xs text-slate-400 font-mono">mg/dL</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-mono">
            {glucoseDelta < 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(glucoseDelta)} mg/dL (Reduced)
              </span>
            ) : glucoseDelta > 0 ? (
              <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{glucoseDelta} mg/dL (Elevated)
              </span>
            ) : (
              <span className="text-slate-400">Stable</span>
            )}
          </div>
        </div>

        {/* BMI Delta */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            BMI Trajectory
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {newest?.bmi}
            </span>
            <span className="text-xs text-slate-400 font-mono">kg/m²</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-mono">
            {bmiDelta < 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(bmiDelta)} kg/m² (Reduced)
              </span>
            ) : bmiDelta > 0 ? (
              <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{bmiDelta} kg/m²
              </span>
            ) : (
              <span className="text-slate-400">Stable</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <TrendChart data={trends} />

      {/* Action to add a new check-in */}
      <div
        className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/30 to-[#040d08] border-emerald-500/20'
            : 'bg-emerald-50 border-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              Maintain Regular Assessment Tracking
            </h4>
            <p className="text-xs text-slate-400">
              Periodic quarterly assessments improve machine learning trend precision and early risk detection sensitivity.
            </p>
          </div>
        </div>

        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-emerald-soft flex-shrink-0"
        >
          <span>Log New Check-in</span>
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
