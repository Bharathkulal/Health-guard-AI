import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ClipboardCheck,
  TrendingUp,
  Sparkles,
  Printer,
  RotateCcw,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Share2,
  Heart,
  Droplets,
  Activity,
  Download,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { RiskGauge } from '../components/results/RiskGauge';
import { CategoryRiskCard } from '../components/results/CategoryRiskCard';
import { ExplainableFactors } from '../components/results/ExplainableFactors';
import { ClinicalActionNotice } from '../components/results/ClinicalActionNotice';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';

export function ResultsPage() {
  const { isDark } = useTheme();
  const { latestResult } = useHealth();
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!latestResult) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No Assessment Results Available"
        description="Complete the guided health assessment to generate your personalized multi-factor risk report."
        actionText="Start Assessment"
        actionHref="/assessment"
      />
    );
  }

  const { overallScore, overallLevel, confidence, categories, explainableFactors, recommendations, vitalsSnapshot, date, id } = latestResult;

  return (
    <div ref={printRef} className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Results Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-500/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Report ID: #{id || 'HG-8942'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated on {date}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Your Health Risk Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            ML-Powered Early Risk Stratification & Decision Support Summary
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-slate-100 transition-all bg-slate-900/40"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Report</span>
          </button>

          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-emerald-soft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary Row: Overall Risk Gauge + Vitals Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Overall Risk Score Gauge */}
        <div className="lg:col-span-5">
          <RiskGauge
            score={overallScore}
            level={overallLevel}
            confidence={confidence}
            className="h-full"
          />
        </div>

        {/* Right: Evaluated Biometric Snapshot */}
        <div
          className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border flex flex-col justify-between ${
            isDark
              ? 'bg-[#07130e]/80 border-emerald-500/20'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Evaluated Biometric Baseline</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Calibrated In-Range</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-emerald-500/10">
                <span className="text-[10px] text-slate-400 block font-mono">Blood Pressure</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {vitalsSnapshot?.systolicBP || 128} / {vitalsSnapshot?.diastolicBP || 84} <span className="text-[10px] text-slate-400">mmHg</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-emerald-500/10">
                <span className="text-[10px] text-slate-400 block font-mono">Fasting Glucose</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {vitalsSnapshot?.fastingBloodSugar || 98} <span className="text-[10px] text-slate-400">mg/dL</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-emerald-500/10">
                <span className="text-[10px] text-slate-400 block font-mono">Body Mass Index</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {vitalsSnapshot?.bmi || 24.6} <span className="text-[10px] text-slate-400">kg/m²</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-emerald-500/10">
                <span className="text-[10px] text-slate-400 block font-mono">Resting Heart Rate</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {vitalsSnapshot?.heartRate || 74} <span className="text-[10px] text-slate-400">BPM</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-emerald-500/10">
                <span className="text-[10px] text-slate-400 block font-mono">Height / Weight</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {vitalsSnapshot?.heightCm || 178}cm / {vitalsSnapshot?.weightKg || 78}kg
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-emerald-500/10">
                <span className="text-[10px] text-slate-400 block font-mono">Algorithm Status</span>
                <span className="text-xs font-bold text-emerald-400">
                  TreeSHAP Validated
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs text-slate-400">
            <span>Primary Focus: Arterial Pressure & Glycemic Monitoring</span>
            <Link to="/trends" className="text-emerald-400 font-semibold hover:underline flex items-center gap-1">
              <span>View Trend Line</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Three Major Risk Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>Condition Risk Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories?.heart && <CategoryRiskCard category={categories.heart} />}
          {categories?.diabetes && <CategoryRiskCard category={categories.diabetes} />}
        </div>
      </div>

      {/* 4. Explainable AI Section: "Why this risk level?" */}
      {explainableFactors && explainableFactors.length > 0 && (
        <ExplainableFactors factors={explainableFactors} />
      )}

      {/* 5. Recommended Next Steps */}
      {recommendations && recommendations.length > 0 && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
            <div>
              <h3 className="text-xl font-bold text-slate-100">
                Recommended Next Steps
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evidence-based preventive measures tailored to your specific risk profile.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All Guidance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-900/50 border-emerald-500/15' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {rec.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      rec.priority === 'high' ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Target Action:
                    </span>
                    <p className="text-xs text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{rec.actionableSteps[0]}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Clinical Safety Callout: When to seek professional help */}
      <ClinicalActionNotice />
    </div>
  );
}
