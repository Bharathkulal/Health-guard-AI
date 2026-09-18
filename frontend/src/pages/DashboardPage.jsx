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
import { useHealth } from '../context/HealthContext';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';
import { TrendChart } from '../components/trends/TrendChart';

export function DashboardPage() {
  const { user, latestResult, history, trends, viewHistoricalAssessment } = useHealth();

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name || 'Patient';
  const vitals = latestResult?.vitalsSnapshot || user || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#F7F4EE] min-h-screen p-4 md:p-8">
      {/* 1. Top Hero Section */}
      <div className="p-6 sm:p-10 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16805F]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#E8F2ED] border border-[#16805F]/10 text-[#16805F]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Clinical Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#18201C]">
              {getGreeting()}, <span className="text-[#16805F]">{userName}</span>
            </h1>

            <p className="text-sm sm:text-base font-medium leading-relaxed text-[#66706A]">
              Understand your health risks. Make informed decisions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold bg-[#16805F] text-white hover:bg-[#126b4f] transition-all duration-300 transform hover:-translate-y-0.5 shadow-md"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Start Health Assessment</span>
            </Link>

            <Link
              to="/results"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold border border-[#E5E0D7] text-[#18201C] bg-[#FFFDF9] hover:bg-slate-50 transition-all"
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
          <h2 className="text-lg font-black text-[#18201C] flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#16805F]" />
            <span>Health Risk Overview</span>
          </h2>
          <span className="text-[11px] text-[#66706A] font-bold uppercase tracking-wider">
            Evaluated: {latestResult?.date || 'Recent'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Overall Composite Risk */}
          <div className="p-6 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#16805F]/30">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-[#66706A] font-bold uppercase tracking-widest">OVERALL RISK</span>
                <RiskBadge level={latestResult?.overallLevel || 'Moderate'} size="sm" />
              </div>
              <div className="text-4xl font-black text-[#18201C] mt-2">
                {latestResult?.overallScore || '--'} <span className="text-sm font-bold text-[#66706A]">/ 100</span>
              </div>
              <p className="text-[13px] font-medium text-[#66706A] mt-3 leading-relaxed">
                Screening estimate from trained heart disease and diabetes ML models.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#E5E0D7] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#66706A]">
              <span>ML-Computed</span>
              <Link to="/results" className="text-[#16805F] hover:text-[#126b4f] flex items-center gap-1 group">
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Heart Disease Risk */}
          <div className="p-6 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#16805F]/30">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-[#66706A] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#C24141]" />
                  <span>HEART DISEASE</span>
                </span>
                <RiskBadge level={latestResult?.categories?.heart?.level || 'Moderate'} size="sm" />
              </div>
              <div className="text-4xl font-black text-[#18201C] mt-2">
                {latestResult?.categories?.heart?.score || '--'} <span className="text-sm font-bold text-[#66706A]">/ 100</span>
              </div>
              <p className="text-[13px] font-medium text-[#66706A] mt-3 line-clamp-2">
                {latestResult?.categories?.heart?.summary || 'Complete an assessment to see heart disease risk estimate.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#E5E0D7] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#66706A]">
              <span>Updated: {latestResult?.date || '--'}</span>
              <span className="text-[#16805F]">UCI Model</span>
            </div>
          </div>

          {/* Diabetes Risk */}
          <div className="p-6 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#16805F]/30">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-[#66706A] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#16805F]" />
                  <span>DIABETES RISK</span>
                </span>
                <RiskBadge level={latestResult?.categories?.diabetes?.level || 'Moderate'} size="sm" />
              </div>
              <div className="text-4xl font-black text-[#18201C] mt-2">
                {latestResult?.categories?.diabetes?.score || '--'} <span className="text-sm font-bold text-[#66706A]">/ 100</span>
              </div>
              <p className="text-[13px] font-medium text-[#66706A] mt-3 line-clamp-2">
                {latestResult?.categories?.diabetes?.summary || 'Complete an assessment to see diabetes risk estimate.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#E5E0D7] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#66706A]">
              <span>Updated: {latestResult?.date || '--'}</span>
              <span className="text-[#16805F]">Pima Model</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Health Snapshot Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#18201C] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#16805F]" />
            <span>Health Snapshot</span>
          </h2>
          <span className="text-[11px] font-bold text-[#66706A] uppercase tracking-wider">Baseline Biometric Readings</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            label="Age"
            value={user?.age || '--'}
            unit="yrs"
            status="Calibrated"
            statusType="neutral"
            targetRange="Adult 18+"
          />
          <MetricCard
            label="Blood Pressure"
            value={vitals.systolicBP && vitals.diastolicBP ? `${vitals.systolicBP}/${vitals.diastolicBP}` : '--/--'}
            unit="mmHg"
            status={vitals.systolicBP >= 130 ? 'Elevated' : (vitals.systolicBP ? 'Normal' : 'Unknown')}
            statusType={vitals.systolicBP >= 130 ? 'warning' : 'normal'}
            icon={Heart}
            targetRange="< 120/80"
          />
          <MetricCard
            label="Blood Sugar"
            value={vitals.fastingBloodSugar || '--'}
            unit="mg/dL"
            status={vitals.fastingBloodSugar >= 100 ? 'Elevated' : (vitals.fastingBloodSugar ? 'Normal Range' : 'Unknown')}
            statusType={vitals.fastingBloodSugar >= 100 ? 'warning' : 'normal'}
            icon={Droplets}
            targetRange="70 - 99"
          />
          <MetricCard
            label="BMI"
            value={vitals.bmi || '--'}
            unit="kg/m²"
            status={vitals.bmi >= 25 ? 'Elevated' : (vitals.bmi ? 'Normal Range' : 'Unknown')}
            statusType={vitals.bmi >= 25 ? 'warning' : 'normal'}
            icon={Scale}
            targetRange="18.5 - 24.9"
          />
          <MetricCard
            label="Heart Rate"
            value={vitals.heartRate || '--'}
            unit="BPM"
            status={vitals.heartRate ? 'Recorded' : 'Unknown'}
            statusType="normal"
            icon={Activity}
            targetRange="60 - 85"
          />
          <MetricCard
            label="Activity Level"
            value={user?.baseline_activity || '--'}
            status="Baseline"
            statusType="normal"
            icon={Sparkles}
            targetRange="150 min/wk"
          />
        </div>
      </div>

      {/* 4. Risk Trend Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#18201C] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#16805F]" />
            <span>Longitudinal Risk Trend</span>
          </h2>
          <Link to="/trends" className="text-xs text-[#16805F] hover:text-[#126b4f] flex items-center gap-1 font-bold uppercase tracking-wider group">
            <span>Full Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
          <h2 className="text-lg font-black text-[#18201C] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#16805F]" />
            <span>Assessment History</span>
          </h2>
          <span className="text-[11px] font-bold text-[#66706A] uppercase tracking-widest">
            {history.length} Saved Records
          </span>
        </div>

        {history.length > 0 ? (
          <div className="rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E0D7] bg-[#F7F4EE] font-bold uppercase tracking-wider text-[#66706A]">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-5">Overall Risk</th>
                    <th className="py-4 px-5">Diabetes</th>
                    <th className="py-4 px-5">Cardiovascular</th>
                    <th className="py-4 px-5">Hypertension</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D7]">
                  {history.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="py-4 px-6 font-bold text-[#18201C] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#16805F]" />
                        <span>{record.date}</span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#18201C]">{record.overallScore}</span>
                          <RiskBadge level={record.overallLevel} size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold text-[#18201C]">
                        {record.categories?.diabetes?.score || '--'} <span className="text-[#66706A] text-[10px] font-bold uppercase ml-1">({record.categories?.diabetes?.level})</span>
                      </td>
                      <td className="py-4 px-5 font-bold text-[#18201C]">
                        {record.categories?.cardiovascular?.score || '--'} <span className="text-[#66706A] text-[10px] font-bold uppercase ml-1">({record.categories?.cardiovascular?.level})</span>
                      </td>
                      <td className="py-4 px-5 font-bold text-[#18201C]">
                        {record.categories?.hypertension?.score || '--'} <span className="text-[#66706A] text-[10px] font-bold uppercase ml-1">({record.categories?.hypertension?.level})</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2 py-1 rounded bg-[#E8F2ED] text-[#16805F] border border-[#16805F]/20 text-[10px] font-bold uppercase tracking-widest">
                          Verified
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to="/results"
                          onClick={() => viewHistoricalAssessment(record.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8F2ED] text-[#16805F] border border-[#16805F]/10 hover:bg-[#16805F] hover:text-white transition-all"
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
            <div className="md:hidden divide-y divide-[#E5E0D7] p-2 space-y-2 bg-[#FFFDF9]">
              {history.map((record) => (
                <div key={record.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#18201C]">
                      <Calendar className="w-4 h-4 text-[#16805F]" />
                      <span>{record.date}</span>
                    </div>
                    <RiskBadge level={record.overallLevel} size="sm" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                    <div className="p-2 rounded-xl bg-white border border-[#E5E0D7] text-center shadow-sm">
                      <span className="text-[9px] text-[#66706A] font-bold uppercase tracking-wider block mb-1">Diabetes</span>
                      <span className="font-black text-[#18201C] text-sm">{record.categories?.diabetes?.score}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E5E0D7] text-center shadow-sm">
                      <span className="text-[9px] text-[#66706A] font-bold uppercase tracking-wider block mb-1">CVD</span>
                      <span className="font-black text-[#18201C] text-sm">{record.categories?.cardiovascular?.score}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E5E0D7] text-center shadow-sm">
                      <span className="text-[9px] text-[#66706A] font-bold uppercase tracking-wider block mb-1">Hypertension</span>
                      <span className="font-black text-[#18201C] text-sm">{record.categories?.hypertension?.score}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Link
                      to="/results"
                      onClick={() => viewHistoricalAssessment(record.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E8F2ED] text-[#16805F] border border-[#16805F]/10 hover:bg-[#16805F] hover:text-white transition-all w-full justify-center"
                    >
                      <Eye className="w-4 h-4" />
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
