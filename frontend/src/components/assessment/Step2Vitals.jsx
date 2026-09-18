import React from 'react';
import { Activity, Scale } from 'lucide-react';
import { calculateBMI, getBMICategory } from '../../services/assessmentEngine';

export function Step2Vitals({ data, onChange, errors = {} }) {
  const vitals = data.vitals || {};

  const handleVitalChange = (field, rawValue) => {
    const value = rawValue === '' ? '' : parseFloat(rawValue);
    const updatedVitals = {
      ...vitals,
      [field]: value,
    };

    // Auto-calculate BMI
    const h = field === 'heightCm' ? value : vitals.heightCm;
    const w = field === 'weightKg' ? value : vitals.weightKg;
    if (h && w && h > 0 && w > 0) {
      updatedVitals.bmi = calculateBMI(h, w);
    }

    onChange({ vitals: updatedVitals });
  };

  const currentBMI = vitals.bmi || calculateBMI(vitals.heightCm, vitals.weightKg);
  const bmiCategory = getBMICategory(currentBMI);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-clinical-text flex items-center gap-2">
          <Activity className="w-5 h-5 text-clinical-green" />
          <span>Vital Indicators & Biometrics</span>
        </h2>
        <p className="text-sm text-clinical-textMuted">
          Enter your current or most recent clinical readings. Target reference ranges are indicated for clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {/* Systolic BP */}
        <div className="space-y-1.5">
          <label htmlFor="systolic-bp" className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            <span>Systolic Pressure <span className="text-clinical-green">*</span></span>
            <span className="text-[11px] font-mono">Target: 90-120</span>
          </label>
          <div className="relative">
            <input
              id="systolic-bp"
              type="number"
              min="70"
              max="240"
              value={vitals.systolicBP || ''}
              onChange={(e) => handleVitalChange('systolicBP', e.target.value)}
              placeholder="e.g. 120"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors['vitals.systolicBP']
                  ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
                  : 'bg-white border-clinical-border focus:border-clinical-green focus:ring-clinical-green/20 text-clinical-text placeholder:text-slate-400'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-clinical-textMuted text-xs font-bold">
              mmHg
            </span>
          </div>
          {errors['vitals.systolicBP'] && (
            <p className="text-xs font-semibold text-rose-500">{errors['vitals.systolicBP']}</p>
          )}
        </div>

        {/* Diastolic BP */}
        <div className="space-y-1.5">
          <label htmlFor="diastolic-bp" className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            <span>Diastolic Pressure <span className="text-clinical-green">*</span></span>
            <span className="text-[11px] font-mono">Target: 60-80</span>
          </label>
          <div className="relative">
            <input
              id="diastolic-bp"
              type="number"
              min="40"
              max="140"
              value={vitals.diastolicBP || ''}
              onChange={(e) => handleVitalChange('diastolicBP', e.target.value)}
              placeholder="e.g. 80"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors['vitals.diastolicBP']
                  ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
                  : 'bg-white border-clinical-border focus:border-clinical-green focus:ring-clinical-green/20 text-clinical-text placeholder:text-slate-400'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-clinical-textMuted text-xs font-bold">
              mmHg
            </span>
          </div>
          {errors['vitals.diastolicBP'] && (
            <p className="text-xs font-semibold text-rose-500">{errors['vitals.diastolicBP']}</p>
          )}
        </div>

        {/* Fasting Blood Sugar */}
        <div className="space-y-1.5">
          <label htmlFor="fasting-glucose" className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            <span>Fasting Blood Glucose <span className="text-clinical-green">*</span></span>
            <span className="text-[11px] font-mono">Target: 70-99</span>
          </label>
          <div className="relative">
            <input
              id="fasting-glucose"
              type="number"
              min="50"
              max="400"
              value={vitals.fastingBloodSugar || ''}
              onChange={(e) => handleVitalChange('fastingBloodSugar', e.target.value)}
              placeholder="e.g. 95"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors['vitals.fastingBloodSugar']
                  ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
                  : 'bg-white border-clinical-border focus:border-clinical-green focus:ring-clinical-green/20 text-clinical-text placeholder:text-slate-400'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-clinical-textMuted text-xs font-bold">
              mg/dL
            </span>
          </div>
          {errors['vitals.fastingBloodSugar'] && (
            <p className="text-xs font-semibold text-rose-500">{errors['vitals.fastingBloodSugar']}</p>
          )}
        </div>

        {/* Resting Heart Rate */}
        <div className="space-y-1.5">
          <label htmlFor="heart-rate" className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            <span>Resting Heart Rate <span className="text-clinical-green">*</span></span>
            <span className="text-[11px] font-mono">Target: 60-85</span>
          </label>
          <div className="relative">
            <input
              id="heart-rate"
              type="number"
              min="40"
              max="200"
              value={vitals.heartRate || ''}
              onChange={(e) => handleVitalChange('heartRate', e.target.value)}
              placeholder="e.g. 72"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors['vitals.heartRate']
                  ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
                  : 'bg-white border-clinical-border focus:border-clinical-green focus:ring-clinical-green/20 text-clinical-text placeholder:text-slate-400'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-clinical-textMuted text-xs font-bold">
              BPM
            </span>
          </div>
          {errors['vitals.heartRate'] && (
            <p className="text-xs font-semibold text-rose-500">{errors['vitals.heartRate']}</p>
          )}
        </div>

        {/* Height in CM */}
        <div className="space-y-1.5">
          <label htmlFor="height-cm" className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            <span>Height <span className="text-clinical-green">*</span></span>
            <span className="text-[11px] font-mono">Metric</span>
          </label>
          <div className="relative">
            <input
              id="height-cm"
              type="number"
              min="100"
              max="250"
              value={vitals.heightCm || ''}
              onChange={(e) => handleVitalChange('heightCm', e.target.value)}
              placeholder="e.g. 178"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors['vitals.heightCm']
                  ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
                  : 'bg-white border-clinical-border focus:border-clinical-green focus:ring-clinical-green/20 text-clinical-text placeholder:text-slate-400'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-clinical-textMuted text-xs font-bold">
              cm
            </span>
          </div>
        </div>

        {/* Weight in KG */}
        <div className="space-y-1.5">
          <label htmlFor="weight-kg" className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-clinical-textMuted">
            <span>Weight <span className="text-clinical-green">*</span></span>
            <span className="text-[11px] font-mono">Metric</span>
          </label>
          <div className="relative">
            <input
              id="weight-kg"
              type="number"
              min="30"
              max="300"
              step="0.5"
              value={vitals.weightKg || ''}
              onChange={(e) => handleVitalChange('weightKg', e.target.value)}
              placeholder="e.g. 78"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors['vitals.weightKg']
                  ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
                  : 'bg-white border-clinical-border focus:border-clinical-green focus:ring-clinical-green/20 text-clinical-text placeholder:text-slate-400'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-clinical-textMuted text-xs font-bold">
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Calculated BMI Card */}
      <div className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-clinical-greenLight border-clinical-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-clinical-border flex items-center justify-center text-clinical-green shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-clinical-text">
                Calculated Body Mass Index (BMI)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-clinical-green border border-clinical-border font-bold shadow-sm">
                Auto-Computed
              </span>
            </div>
            <p className="text-xs text-clinical-textMuted mt-0.5">
              Computed automatically from height ({vitals.heightCm || '--'} cm) and weight ({vitals.weightKg || '--'} kg).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-2xl font-black text-clinical-text font-mono">
              {currentBMI > 0 ? currentBMI : '--'} <span className="text-xs text-clinical-textMuted font-normal">kg/m²</span>
            </div>
            {currentBMI > 0 && (
              <div className="text-xs font-bold text-clinical-textMuted">
                {bmiCategory.label}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
