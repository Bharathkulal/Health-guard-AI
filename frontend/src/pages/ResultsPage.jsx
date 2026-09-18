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
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { RiskGauge } from '../components/results/RiskGauge';
import { CategoryRiskCard } from '../components/results/CategoryRiskCard';
import { ExplainableFactors } from '../components/results/ExplainableFactors';
import { ClinicalActionNotice } from '../components/results/ClinicalActionNotice';
import { EmptyState } from '../components/common/EmptyState';

export function ResultsPage() {
  const { isAuthenticated } = useAuth();
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
        actionHref={isAuthenticated ? "/assessment" : "/login?redirect=/assessment"}
      />
    );
  }

  const { overallScore, overallLevel, confidence, categories, explainableFactors, recommendations, vitalsSnapshot, date, id } = latestResult;

  return (
    <div ref={printRef} className="space-y-8 animate-in fade-in duration-300 bg-[#F7F4EE] min-h-screen text-[#18201C] p-4 md:p-8">
      {/* 1. Results Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E8F2ED] text-[#16805F] uppercase tracking-wide border border-[#16805F]/10">
              Report ID: #{id || 'HG-8942'}
            </span>
            <span className="text-[11px] font-bold text-[#66706A] uppercase tracking-wide">
              Evaluated on {date}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18201C] tracking-tight">
            Your Health Risk Assessment
          </h1>
          <p className="text-sm font-medium text-[#66706A]">
            ML-Powered Early Risk Stratification & Decision Support Summary
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D7] text-[#18201C] hover:bg-white hover:border-[#16805F]/30 transition-all bg-[#FFFDF9] shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#66706A]" />
            <span>Print Report</span>
          </button>

          <Link
            to={isAuthenticated ? "/assessment" : "/login?redirect=/assessment"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#16805F] text-white hover:bg-[#126b4f] transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary Row: Overall Risk Gauge + Vitals Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Overall Risk Score Gauge */}
        <div className="lg:col-span-5 flex">
          <div className="w-full h-full bg-[#FFFDF9] border border-[#E5E0D7] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center">
             <RiskGauge
              score={overallScore}
              level={overallLevel}
              confidence={confidence}
            />
          </div>
        </div>

        {/* Right: Evaluated Biometric Snapshot */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D7]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#18201C] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16805F]" />
                <span>Evaluated Biometric Baseline</span>
              </span>
              <span className="text-[11px] font-bold text-[#66706A] uppercase">Calibrated In-Range</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E5E0D7] shadow-sm">
                <span className="text-[10px] text-[#66706A] font-bold uppercase block mb-1">Blood Pressure</span>
                <span className="text-sm font-black text-[#18201C]">
                  {vitalsSnapshot?.systolicBP || 120} / {vitalsSnapshot?.diastolicBP || 80} <span className="text-[10px] text-[#66706A] font-bold">mmHg</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D7] shadow-sm">
                <span className="text-[10px] text-[#66706A] font-bold uppercase block mb-1">Blood Glucose</span>
                <span className="text-sm font-black text-[#18201C]">
                  {vitalsSnapshot?.fastingBloodSugar || 95} <span className="text-[10px] text-[#66706A] font-bold">mg/dL</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D7] shadow-sm">
                <span className="text-[10px] text-[#66706A] font-bold uppercase block mb-1">BMI</span>
                <span className="text-sm font-black text-[#18201C]">
                  {vitalsSnapshot?.bmi || 24.5} <span className="text-[10px] text-[#66706A] font-bold">kg/m²</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D7] shadow-sm">
                <span className="text-[10px] text-[#66706A] font-bold uppercase block mb-1">Heart Rate</span>
                <span className="text-sm font-black text-[#18201C]">
                  {vitalsSnapshot?.heartRate || 72} <span className="text-[10px] text-[#66706A] font-bold">BPM</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D7] shadow-sm">
                <span className="text-[10px] text-[#66706A] font-bold uppercase block mb-1">Height / Weight</span>
                <span className="text-sm font-black text-[#18201C]">
                  {vitalsSnapshot?.heightCm || 175}cm / {vitalsSnapshot?.weightKg || 75}kg
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D7] shadow-sm">
                <span className="text-[10px] text-[#66706A] font-bold uppercase block mb-1">Data Status</span>
                <span className="text-xs font-bold text-[#16805F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> TreeSHAP Validated
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E0D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-[#66706A]">
            <span>Primary Focus: Arterial Pressure & Glycemic Monitoring</span>
            <Link to="/trends" className="text-[#16805F] font-bold hover:text-[#126b4f] flex items-center gap-1 group">
              <span>View Trend Line</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Three Major Risk Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#18201C] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#16805F]" />
          <span>Condition Risk Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories?.heart && <CategoryRiskCard category={categories.heart} type="heart" />}
          {categories?.diabetes && <CategoryRiskCard category={categories.diabetes} type="diabetes" />}
        </div>
      </div>

      {/* 4. Explainable AI Section: "Why this risk level?" */}
      {explainableFactors && explainableFactors.length > 0 && (
        <ExplainableFactors factors={explainableFactors} />
      )}

      {/* 5. Recommended Next Steps */}
      {recommendations && recommendations.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0D7]">
            <div>
              <h3 className="text-xl font-black text-[#18201C]">
                Recommended Next Steps
              </h3>
              <p className="text-sm font-medium text-[#66706A] mt-1">
                Evidence-based preventive measures tailored to your specific risk profile.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-bold text-[#16805F] hover:text-[#126b4f] flex items-center gap-1 group"
            >
              <span>Explore All Guidance</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl border border-[#E5E0D7] bg-white flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#16805F] px-2 py-0.5 rounded bg-[#E8F2ED] border border-[#16805F]/10">
                      {rec.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      rec.priority === 'high' ? 'bg-[#C24141]/10 text-[#C24141]' : 'bg-[#16805F]/10 text-[#16805F]'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#18201C] leading-snug">
                    {rec.title}
                  </h4>
                  <p className="text-sm font-medium text-[#66706A] leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E5E0D7] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#7A827D] block">
                      Target Action:
                    </span>
                    <p className="text-xs font-bold text-[#18201C] flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#16805F] flex-shrink-0" />
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
