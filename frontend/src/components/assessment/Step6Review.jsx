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
import { getBMICategory } from '../../services/assessmentEngine';

export function Step6Review({ data, onJumpToStep, onSubmit, isSubmitting = false }) {
  const vitals = data.vitals || {};
  const lifestyle = data.lifestyle || {};
  const family = data.familyHistory || {};
  const symptoms = (data.symptoms || []).filter((s) => s !== 'none');
  const bmiCategory = getBMICategory(vitals.bmi);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-clinical-text flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-clinical-green" />
          <span>Review Health Assessment</span>
        </h2>
        <p className="text-sm text-clinical-textMuted">
          Verify all recorded clinical biomarkers before saving and dispatching to the secure risk pipeline.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {/* Section 1: Basic Information */}
        <div className="p-4 rounded-2xl border bg-white border-clinical-border shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
            <div className="flex items-center gap-2 text-xs font-bold text-clinical-green uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>1. Basic Information</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-bold text-clinical-textMuted hover:text-clinical-green flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-xs">
            <div>
              <span className="text-clinical-textMuted block font-bold">Age:</span>
              <span className="text-clinical-text font-bold text-sm">{data.age} years</span>
            </div>
            <div>
              <span className="text-clinical-textMuted block font-bold">Biological Sex:</span>
              <span className="text-clinical-text font-bold text-sm capitalize">{data.gender || data.sex || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Vital Information */}
        <div className="p-4 rounded-2xl border bg-white border-clinical-border shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
            <div className="flex items-center gap-2 text-xs font-bold text-clinical-green uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>2. Vital Information</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs font-bold text-clinical-textMuted hover:text-clinical-green flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-3 text-xs">
            <div>
              <span className="text-clinical-textMuted block font-bold">Height:</span>
              <span className="text-clinical-text font-bold text-sm">{vitals.heightCm || '--'} <span className="text-[10px] text-clinical-textMuted font-normal">cm</span></span>
            </div>
            <div>
              <span className="text-clinical-textMuted block font-bold">Weight:</span>
              <span className="text-clinical-text font-bold text-sm">{vitals.weightKg || '--'} <span className="text-[10px] text-clinical-textMuted font-normal">kg</span></span>
            </div>
            <div>
              <span className="text-clinical-textMuted block font-bold">Blood Pressure:</span>
              <span className="text-clinical-text font-bold text-sm">{vitals.systolicBP || '--'} / {vitals.diastolicBP || '--'} <span className="text-[10px] text-clinical-textMuted font-normal">mmHg</span></span>
            </div>
            <div>
              <span className="text-clinical-textMuted block font-bold">Blood Sugar:</span>
              <span className="text-clinical-text font-bold text-sm">{vitals.fastingBloodSugar || vitals.bloodSugar || '--'} <span className="text-[10px] text-clinical-textMuted font-normal">mg/dL</span></span>
            </div>
            <div>
              <span className="text-clinical-textMuted block font-bold">Heart Rate:</span>
              <span className="text-clinical-text font-bold text-sm">{vitals.heartRate || '--'} <span className="text-[10px] text-clinical-textMuted font-normal">BPM</span></span>
            </div>
            <div>
              <span className="text-clinical-textMuted block font-bold">Calculated BMI:</span>
              <span className="text-clinical-text font-bold text-sm font-mono">{vitals.bmi || '--'}</span>
              <span className={`text-[10px] block font-bold ${vitals.bmi ? 'text-clinical-green' : 'text-clinical-textMuted'}`}>({bmiCategory.label})</span>
            </div>
          </div>
        </div>

        {/* Section 3: Symptoms */}
        <div className="p-4 rounded-2xl border bg-white border-clinical-border shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
            <div className="flex items-center gap-2 text-xs font-bold text-clinical-green uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>3. Symptoms ({symptoms.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs font-bold text-clinical-textMuted hover:text-clinical-green flex items-center gap-1 transition-colors"
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
                    className="px-2.5 py-1.5 rounded-lg bg-clinical-greenLight border border-clinical-green/20 text-clinical-green text-xs font-bold capitalize"
                  >
                    {sym.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-clinical-textMuted italic font-medium">No active symptoms reported (None / Asymptomatic).</span>
            )}
          </div>
        </div>

        {/* Section 4 & 5: Lifestyle & Family History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lifestyle */}
          <div className="p-4 rounded-2xl border bg-white border-clinical-border shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
              <div className="flex items-center gap-2 text-xs font-bold text-clinical-green uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>4. Lifestyle</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="text-xs font-bold text-clinical-textMuted hover:text-clinical-green flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="space-y-2 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Activity:</span>
                <span className="text-clinical-text font-bold capitalize">{lifestyle.physicalActivity || lifestyle.physical_activity || 'moderate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Smoking:</span>
                <span className="text-clinical-text font-bold capitalize">{lifestyle.smoking || 'never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Alcohol:</span>
                <span className="text-clinical-text font-bold capitalize">{lifestyle.alcohol || 'occasionally'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Sleep:</span>
                <span className="text-clinical-text font-bold">{lifestyle.sleepHours || lifestyle.sleep_hours || 7} hrs/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Diet:</span>
                <span className="text-clinical-text font-bold capitalize">{(lifestyle.dietPattern || lifestyle.diet || 'balanced').replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Family History */}
          <div className="p-4 rounded-2xl border bg-white border-clinical-border shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
              <div className="flex items-center gap-2 text-xs font-bold text-clinical-green uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>5. Family History</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(5)}
                className="text-xs font-bold text-clinical-textMuted hover:text-clinical-green flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="space-y-2 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Diabetes:</span>
                <span className={family.diabetes ? 'text-amber-600 font-bold' : 'text-clinical-text font-bold'}>
                  {family.diabetes ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Hypertension:</span>
                <span className={family.hypertension ? 'text-amber-600 font-bold' : 'text-clinical-text font-bold'}>
                  {family.hypertension ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Heart Disease:</span>
                <span className={family.heart_disease || family.cardiovascular ? 'text-amber-600 font-bold' : 'text-clinical-text font-bold'}>
                  {family.heart_disease || family.cardiovascular ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textMuted font-bold">Premature Cardiac Event (&lt;55):</span>
                <span className={family.early_heart_attack || family.earlyHeartAttack ? 'text-rose-600 font-bold' : 'text-clinical-text font-bold'}>
                  {family.early_heart_attack || family.earlyHeartAttack ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-4 rounded-2xl border flex items-start gap-3 text-xs bg-clinical-primary border-clinical-border text-clinical-text">
        <ShieldCheck className="w-5 h-5 text-clinical-green flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          HealthGuard AI provides an early health-risk assessment for informational and decision-support purposes. It does not provide a medical diagnosis and should not replace professional medical advice.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full py-4 px-6 rounded-2xl text-base font-bold bg-clinical-green text-white hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isSubmitting ? 'Saving Assessment...' : 'Analyze My Health Risk'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
