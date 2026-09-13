import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Scale,
  Calendar,
  Eye,
  ShieldCheck,
  Gauge,
  Clock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';
import { TrendChart } from '../components/trends/TrendChart';

export function DashboardPage() {
  const { isDark } = useTheme();
  const { user, latestResult, history, trends, viewHistoricalAssessment } = useHealth();

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name || 'Alex Chen';
  const vitals = latestResult?.vitalsSnapshot || user || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Top Hero Section */}
      <div
        className={`p-6 sm:p-10 rounded-3xl border relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/40 via-[#06140d] to-[#020704] border-emerald-500/20 shadow-2xl'
            : 'bg-gradient-to-r from-emerald-50 via-white to-slate-50 border-emerald-200 shadow-sm'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Clinical Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-100">
              {getGreeting()}, <span className="text-emerald-400">{userName}</span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Understand your health risks. Make informed decisions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Start Health Assessment</span>
            </Link>

            <Link
              to="/results"
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                isDark
                  ? 'border-emerald-500/25 text-slate-200 bg-emerald-950/30 hover:bg-emerald-900/40 hover:border-emerald-400/40'
                  : 'border-slate-300 text-slate-800 bg-white hover:bg-slate-100 hover:border-emerald-400'
              }`}
            >
              <span>View Latest Results</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Health Overview Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <span>Health Risk Overview</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Evaluated: {latestResult?.date || 'Recent'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Overall Composite Risk */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all glass-panel-interactive ${
              isDark
                ? 'bg-gradient-to-b from-emerald-950/30 to-[#07130e] border-emerald-500/30 shadow-lg'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex justify-between items-start text-xs text-slate-400 font-mono mb-2">
                <span className="uppercase tracking-wider">OVERALL RISK</span>
                <RiskBadge level={latestResult?.overallLevel || 'Moderate'} size="sm" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-100 font-mono mt-2">
                {latestResult?.overallScore || 64} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Multi-factor composite calculated from baseline vitals and genetics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Confidence: 94%</span>
              <Link to="/results" className="text-emerald-400 hover:underline flex items-center gap-1">
                <span>Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Diabetes Risk */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all glass-panel-interactive ${
              isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex justify-between items-start text-xs text-slate-400 font-mono mb-2">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DIABETES RISK</span>
                </span>
                <RiskBadge level={latestResult?.categories?.diabetes?.level || 'Moderate'} size="sm" />
              </div>
              <div className="text-3xl font-black text-slate-100 font-mono mt-2">
                {latestResult?.categories?.diabetes?.score || 58} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {latestResult?.categories?.diabetes?.summary || 'Fasting blood glucose within upper normal margin.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-500/10 text-[11px] text-slate-400 font-mono flex justify-between">
              <span>Updated: {latestResult?.date || 'Today'}</span>
              <span className="text-emerald-400 font-semibold">Stable</span>
            </div>
          </div>

          {/* Cardiovascular Risk */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all glass-panel-interactive ${
              isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex justify-between items-start text-xs text-slate-400 font-mono mb-2">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>CARDIOVASCULAR</span>
                </span>
                <RiskBadge level={latestResult?.categories?.cardiovascular?.level || 'Moderate'} size="sm" />
              </div>
              <div className="text-3xl font-black text-slate-100 font-mono mt-2">
                {latestResult?.categories?.cardiovascular?.score || 64} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {latestResult?.categories?.cardiovascular?.summary || 'Mildly elevated systolic blood pressure.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-500/10 text-[11px] text-slate-400 font-mono flex justify-between">
              <span>Updated: {latestResult?.date || 'Today'}</span>
              <span className="text-emerald-400 font-semibold">-3 pts</span>
            </div>
          </div>

          {/* Hypertension Risk */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all glass-panel-interactive ${
              isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex justify-between items-start text-xs text-slate-400 font-mono mb-2">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>HYPERTENSION</span>
                </span>
                <RiskBadge level={latestResult?.categories?.hypertension?.level || 'Moderate'} size="sm" />
              </div>
              <div className="text-3xl font-black text-slate-100 font-mono mt-2">
                {latestResult?.categories?.hypertension?.score || 62} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {latestResult?.categories?.hypertension?.summary || 'Pre-hypertensive stage 1 readings.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-500/10 text-[11px] text-slate-400 font-mono flex justify-between">
              <span>Updated: {latestResult?.date || 'Today'}</span>
              <span className="text-emerald-400 font-semibold">-3 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Health Snapshot Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Health Snapshot</span>
          </h2>
          <span className="text-xs text-slate-400">Baseline Biometric Readings</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            label="Age"
            value={user?.age || 38}
            unit="yrs"
            status="Calibrated"
            statusType="neutral"
            targetRange="Adult 18+"
          />
          <MetricCard
            label="Blood Pressure"
            value={`${vitals.systolicBP || 128}/${vitals.diastolicBP || 84}`}
            unit="mmHg"
            status="Stage 1 Pre"
            statusType="warning"
            icon={Heart}
            targetRange="< 120/80"
          />
          <MetricCard
            label="Blood Sugar"
            value={vitals.fastingBloodSugar || 98}
            unit="mg/dL"
            status="Normal Range"
            statusType="normal"
            icon={Droplets}
            targetRange="70 - 99"
          />
          <MetricCard
            label="BMI"
            value={vitals.bmi || 24.6}
            unit="kg/m²"
            status="Normal Range"
            statusType="normal"
            icon={Scale}
            targetRange="18.5 - 24.9"
          />
          <MetricCard
            label="Heart Rate"
            value={vitals.heartRate || 74}
            unit="BPM"
            status="Resting Normal"
            statusType="normal"
            icon={Activity}
            targetRange="60 - 85"
          />
          <MetricCard
            label="Activity Level"
            value="Moderate"
            status="3-4 days/wk"
            statusType="normal"
            icon={Sparkles}
            targetRange="150 min/wk"
          />
        </div>
      </div>

      {/* 4. Risk Trend Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Longitudinal Risk Trend</span>
          </h2>
          <Link to="/trends" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
            <span>Full Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {trends.length > 0 ? (
          <TrendChart data={trends} />
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No Risk Trend Available"
            description="Your health trend will appear here after your first assessment."
            actionText="Start Assessment"
            actionHref="/assessment"
          />
        )}
      </div>

      {/* 5. Recent Assessments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Assessment History</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {history.length} Saved Records
          </span>
        </div>

        {history.length > 0 ? (
          <div
            className={`rounded-3xl border overflow-hidden ${
              isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-mono uppercase tracking-wider text-slate-400 ${
                    isDark ? 'bg-[#030906] border-emerald-500/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-4">Overall Risk</th>
                    <th className="py-3.5 px-4">Diabetes</th>
                    <th className="py-3.5 px-4">Cardiovascular</th>
                    <th className="py-3.5 px-4">Hypertension</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {history.map((record) => (
                    <tr
                      key={record.id}
                      className={`transition-colors hover:${
                        isDark ? 'bg-emerald-950/20' : 'bg-slate-50'
                      }`}
                    >
                      <td className="py-4 px-5 font-semibold text-slate-100 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{record.date}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100">{record.overallScore}</span>
                          <RiskBadge level={record.overallLevel} size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {record.categories?.diabetes?.score || '--'} <span className="text-slate-500 text-[11px]">({record.categories?.diabetes?.level})</span>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {record.categories?.cardiovascular?.score || '--'} <span className="text-slate-500 text-[11px]">({record.categories?.cardiovascular?.level})</span>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {record.categories?.hypertension?.score || '--'} <span className="text-slate-500 text-[11px]">({record.categories?.hypertension?.level})</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                          Verified Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to="/results"
                          onClick={() => viewHistoricalAssessment(record.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Transform View */}
            <div className="md:hidden divide-y divide-emerald-500/10 p-2 space-y-2">
              {history.map((record) => (
                <div key={record.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{record.date}</span>
                    </div>
                    <RiskBadge level={record.overallLevel} size="sm" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-slate-900/40 border border-emerald-500/10 text-center">
                      <span className="text-[10px] text-slate-400 block">Diabetes</span>
                      <span className="font-bold text-slate-100 font-mono">{record.categories?.diabetes?.score}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/40 border border-emerald-500/10 text-center">
                      <span className="text-[10px] text-slate-400 block">CVD</span>
                      <span className="font-bold text-slate-100 font-mono">{record.categories?.cardiovascular?.score}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/40 border border-emerald-500/10 text-center">
                      <span className="text-[10px] text-slate-400 block">Hypertension</span>
                      <span className="font-bold text-slate-100 font-mono">{record.categories?.hypertension?.score}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      to="/results"
                      onClick={() => viewHistoricalAssessment(record.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Assessment</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Previous Assessments"
            description="Complete your first health assessment to start logging historical evaluation records."
            actionText="Start Assessment"
            actionHref="/assessment"
          />
        )}
      </div>
    </div>
  );
}
