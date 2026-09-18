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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
            Health Biometric Trends
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-emerald-500/10' : 'border-[#E5E0D7]'}`}>
        <div className="space-y-1.5">
          <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isDark
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-[#E8F2ED] border border-[#16805F]/15 text-[#16805F]'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Longitudinal Telemetry Analysis</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
            Biometric & Risk Trends
          </h1>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
            Analyzing {trends.length} chronological evaluations from {oldest?.date} to {newest?.date}.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border text-xs font-semibold ${
          isDark
            ? 'bg-slate-900/60 border-emerald-500/15'
            : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-xs'
        }`}>
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
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeframe === tf.id
                  ? isDark
                    ? 'bg-emerald-500 text-black font-bold shadow-emerald-soft'
                    : 'bg-[#16805F] text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/20'
                  : 'text-[#66706A] hover:text-[#18201C] hover:bg-[#F7F4EE]'
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
          className={`p-5 rounded-3xl border transition-all ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
            Composite Risk
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-slate-100 font-mono' : 'text-[#18201C]'}`}>
              {newest?.overallRisk}
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>/ 100</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-xs">
            {riskDelta < 0 ? (
              <span className="text-[#16805F] flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(riskDelta)} pts (Improved)
              </span>
            ) : riskDelta > 0 ? (
              <span className="text-amber-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{riskDelta} pts (Elevated)
              </span>
            ) : (
              <span className={`flex items-center gap-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
                <Minus className="w-3 h-3" />
                Stable
              </span>
            )}
          </div>
        </div>

        {/* Blood Pressure Delta */}
        <div
          className={`p-5 rounded-3xl border transition-all ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
            Systolic BP
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-slate-100 font-mono' : 'text-[#18201C]'}`}>
              {newest?.systolicBP}
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>mmHg</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-xs">
            {bpSysDelta < 0 ? (
              <span className="text-[#16805F] flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(bpSysDelta)} mmHg (Reduced)
              </span>
            ) : bpSysDelta > 0 ? (
              <span className="text-amber-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{bpSysDelta} mmHg (Elevated)
              </span>
            ) : (
              <span className={`flex items-center gap-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
                <Minus className="w-3 h-3" />
                Stable
              </span>
            )}
          </div>
        </div>

        {/* Glucose Delta */}
        <div
          className={`p-5 rounded-3xl border transition-all ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
            Fasting Glucose
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-slate-100 font-mono' : 'text-[#18201C]'}`}>
              {newest?.fastingBloodSugar}
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>mg/dL</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-xs">
            {glucoseDelta < 0 ? (
              <span className="text-[#16805F] flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(glucoseDelta)} mg/dL (Reduced)
              </span>
            ) : glucoseDelta > 0 ? (
              <span className="text-amber-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{glucoseDelta} mg/dL (Elevated)
              </span>
            ) : (
              <span className={`flex items-center gap-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
                <Minus className="w-3 h-3" />
                Stable
              </span>
            )}
          </div>
        </div>

        {/* BMI Delta */}
        <div
          className={`p-5 rounded-3xl border transition-all ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>
            Body Mass Index
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-slate-100 font-mono' : 'text-[#18201C]'}`}>
              {newest?.bmi}
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400 font-mono' : 'text-[#66706A]'}`}>kg/m²</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-xs">
            {bmiDelta < 0 ? (
              <span className="text-[#16805F] flex items-center gap-0.5 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(bmiDelta)} kg/m² (Reduced)
              </span>
            ) : bmiDelta > 0 ? (
              <span className="text-amber-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{bmiDelta} kg/m²
              </span>
            ) : (
              <span className={`flex items-center gap-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
                <Minus className="w-3 h-3" />
                Stable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <TrendChart data={trends} />

      {/* Action to add a new check-in */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/30 to-[#040d08] border-emerald-500/20'
            : 'bg-[#FFFDF9] border-[#E5E0D7] shadow-sm'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isDark
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-[#E8F2ED] border border-[#16805F]/20 text-[#16805F]'
          }`}>
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-[#18201C]'}`}>
              Maintain Regular Assessment Tracking
            </h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#66706A]'}`}>
              Periodic assessments improve machine learning trend precision and early risk detection sensitivity.
            </p>
          </div>
        </div>

        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold bg-[#16805F] text-white hover:bg-[#126b4f] transition-all shadow-md flex-shrink-0"
        >
          <span>Log New Check-in</span>
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
