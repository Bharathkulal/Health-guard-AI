import React from 'react';
import {
  ClipboardCheck,
  Edit2,
  User,
  Activity,
  AlertCircle,
  Zap,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getBMICategory } from '../../services/assessmentEngine';

export function Step6Review({ data, onJumpToStep, onSubmit, isSubmitting = false }) {
  const { isDark } = useTheme();
  const vitals = data.vitals || {};
  const lifestyle = data.lifestyle || {};
  const family = data.familyHistory || {};
  const symptoms = (data.symptoms || []).filter((s) => s !== 'none');
  const bmiCategory = getBMICategory(vitals.bmi);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" />
          <span>Review Health Assessment</span>
        </h2>
        <p className="text-xs text-slate-400">
          Verify all recorded clinical biomarkers before saving and dispatching to the secure risk pipeline.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {/* Section 1: Basic Information */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>1. Basic Information</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block">Age:</span>
              <span className="text-slate-100 font-bold text-sm">{data.age} years</span>
            </div>
            <div>
              <span className="text-slate-400 block">Biological Sex:</span>
              <span className="text-slate-100 font-bold text-sm capitalize">{data.gender || data.sex || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Vital Information */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>2. Vital Information</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block">Height:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.heightCm || '--'} <span className="text-[10px] text-slate-400">cm</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Weight:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.weightKg || '--'} <span className="text-[10px] text-slate-400">kg</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Blood Pressure:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.systolicBP || '--'} / {vitals.diastolicBP || '--'} <span className="text-[10px] text-slate-400">mmHg</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Blood Sugar:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.fastingBloodSugar || vitals.bloodSugar || '--'} <span className="text-[10px] text-slate-400">mg/dL</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Heart Rate:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.heartRate || '--'} <span className="text-[10px] text-slate-400">BPM</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Calculated BMI:</span>
              <span className="text-slate-100 font-bold text-sm font-mono">{vitals.bmi || '--'}</span>
              <span className={`text-[10px] block font-semibold ${bmiCategory.color}`}>({bmiCategory.label})</span>
            </div>
          </div>
        </div>

        {/* Section 3: Symptoms */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>3. Symptoms ({symptoms.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-3">
            {symptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {symptoms.map((sym) => (
                  <span
                    key={sym}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium capitalize"
                  >
                    {sym.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No active symptoms reported (None / Asymptomatic).</span>
            )}
          </div>
        </div>

        {/* Section 4 & 5: Lifestyle & Family History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lifestyle */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>4. Lifestyle</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="space-y-1.5 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Activity:</span>
                <span className="text-slate-100 font-bold capitalize">{lifestyle.physicalActivity || lifestyle.physical_activity || 'moderate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Smoking:</span>
                <span className="text-slate-100 font-bold capitalize">{lifestyle.smoking || 'never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alcohol:</span>
                <span className="text-slate-100 font-bold capitalize">{lifestyle.alcohol || 'occasionally'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sleep:</span>
                <span className="text-slate-100 font-bold">{lifestyle.sleepHours || lifestyle.sleep_hours || 7} hrs/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diet:</span>
                <span className="text-slate-100 font-bold capitalize">{(lifestyle.dietPattern || lifestyle.diet || 'balanced').replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Family History */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>5. Family History</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(5)}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="space-y-1.5 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Diabetes:</span>
                <span className={family.diabetes ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {family.diabetes ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hypertension:</span>
                <span className={family.hypertension ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {family.hypertension ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heart Disease:</span>
                <span className={family.heart_disease || family.cardiovascular ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {family.heart_disease || family.cardiovascular ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Premature Cardiac Event (&lt;55):</span>
                <span className={family.early_heart_attack || family.earlyHeartAttack ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {family.early_heart_attack || family.earlyHeartAttack ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
          isDark
            ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-300'
            : 'bg-emerald-50 border-emerald-300 text-slate-700'
        }`}
      >
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          HealthGuard AI provides an early health-risk assessment for informational and decision-support purposes. It does not provide a medical diagnosis and should not replace professional medical advice.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full py-4 px-6 rounded-2xl text-base font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isSubmitting ? 'Saving Assessment...' : 'Analyze My Health Risk'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
