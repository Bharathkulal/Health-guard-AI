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
  const symptoms = data.symptoms || [];
  const bmiCategory = getBMICategory(vitals.bmi);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" />
          <span>Review Assessment Inputs</span>
        </h2>
        <p className="text-xs text-slate-400">
          Verify all entered physiological parameters before initiating ML risk stratification and explainability inference.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {/* Section 1: Demographics */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Demographics</span>
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
              <span className="text-slate-100 font-bold text-sm capitalize">{data.sex || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Vitals */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#07130e]/80 border-emerald-500/20' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Vitals & Body Measurements</span>
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
              <span className="text-slate-400 block">Blood Pressure:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.systolicBP || '--'} / {vitals.diastolicBP || '--'} <span className="text-[10px] text-slate-400">mmHg</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Fasting Sugar:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.fastingBloodSugar || '--'} <span className="text-[10px] text-slate-400">mg/dL</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Resting HR:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.heartRate || '--'} <span className="text-[10px] text-slate-400">BPM</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Height:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.heightCm || '--'} <span className="text-[10px] text-slate-400">cm</span></span>
            </div>
            <div>
              <span className="text-slate-400 block">Weight:</span>
              <span className="text-slate-100 font-bold text-sm">{vitals.weightKg || '--'} <span className="text-[10px] text-slate-400">kg</span></span>
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
              <span>Reported Symptoms ({symptoms.length})</span>
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
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                  >
                    {sym.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No active symptoms reported (Asymptomatic).</span>
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
                <span>Lifestyle</span>
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
                <span className="text-slate-100 font-bold capitalize">{lifestyle.physicalActivity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Smoking:</span>
                <span className="text-slate-100 font-bold capitalize">{lifestyle.smoking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sleep:</span>
                <span className="text-slate-100 font-bold">{lifestyle.sleepHours} hrs/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diet:</span>
                <span className="text-slate-100 font-bold capitalize">{lifestyle.dietPattern?.replace(/_/g, ' ')}</span>
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
                <span>Family History</span>
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
                <span className="text-slate-400">Type 2 Diabetes:</span>
                <span className={family.diabetes ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {family.diabetes ? 'Yes (Positive)' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hypertension:</span>
                <span className={family.hypertension ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {family.hypertension ? 'Yes (Positive)' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cardiovascular Disease:</span>
                <span className={family.cardiovascular ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {family.cardiovascular ? 'Yes (Positive)' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Early Heart Attack (&lt;55):</span>
                <span className={family.earlyHeartAttack ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {family.earlyHeartAttack ? 'Yes (Positive)' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Required Pre-Submission Disclaimer */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
          isDark
            ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-300'
            : 'bg-emerald-50 border-emerald-300 text-slate-700'
        }`}
      >
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Clinical Safety Disclaimer:</strong> HealthGuard AI provides an early risk assessment and clinical decision-support information for informational and preventive purposes. It does not provide a medical diagnosis.
        </p>
      </div>

      {/* Big Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full py-4 px-6 rounded-2xl text-base font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isSubmitting ? 'Analyzing Biomarkers...' : 'Analyze My Health Risk'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
