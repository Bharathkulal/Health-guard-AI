import React from 'react';
import { Heart, Activity, Scale, Ruler, Droplets, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { calculateBMI, getBMICategory } from '../../services/assessmentEngine';

export function Step2Vitals({ data, onChange, errors = {} }) {
  const { isDark } = useTheme();
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
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>Vital Indicators & Biometrics</span>
        </h2>
        <p className="text-xs text-slate-400">
          Enter your current or most recent clinical readings. Target reference ranges are indicated for clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {/* Systolic BP */}
        <div className="space-y-1.5">
          <label htmlFor="systolic-bp" className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Systolic Pressure <span className="text-emerald-400">*</span></span>
            <span className="text-[11px] text-slate-400 font-mono">Target: 90-120</span>
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
                  ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30'
                  : isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 focus:ring-emerald-500/20 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
              mmHg
            </span>
          </div>
          {errors['vitals.systolicBP'] && (
            <p className="text-xs text-rose-400">{errors['vitals.systolicBP']}</p>
          )}
        </div>

        {/* Diastolic BP */}
        <div className="space-y-1.5">
          <label htmlFor="diastolic-bp" className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Diastolic Pressure <span className="text-emerald-400">*</span></span>
            <span className="text-[11px] text-slate-400 font-mono">Target: 60-80</span>
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
                  ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30'
                  : isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 focus:ring-emerald-500/20 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
              mmHg
            </span>
          </div>
          {errors['vitals.diastolicBP'] && (
            <p className="text-xs text-rose-400">{errors['vitals.diastolicBP']}</p>
          )}
        </div>

        {/* Fasting Blood Sugar */}
        <div className="space-y-1.5">
          <label htmlFor="fasting-glucose" className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Fasting Blood Glucose <span className="text-emerald-400">*</span></span>
            <span className="text-[11px] text-slate-400 font-mono">Target: 70-99</span>
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
                  ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30'
                  : isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 focus:ring-emerald-500/20 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
              mg/dL
            </span>
          </div>
          {errors['vitals.fastingBloodSugar'] && (
            <p className="text-xs text-rose-400">{errors['vitals.fastingBloodSugar']}</p>
          )}
        </div>

        {/* Resting Heart Rate */}
        <div className="space-y-1.5">
          <label htmlFor="heart-rate" className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Resting Heart Rate <span className="text-emerald-400">*</span></span>
            <span className="text-[11px] text-slate-400 font-mono">Target: 60-85</span>
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
                  ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30'
                  : isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 focus:ring-emerald-500/20 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
              BPM
            </span>
          </div>
          {errors['vitals.heartRate'] && (
            <p className="text-xs text-rose-400">{errors['vitals.heartRate']}</p>
          )}
        </div>

        {/* Height in CM */}
        <div className="space-y-1.5">
          <label htmlFor="height-cm" className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Height <span className="text-emerald-400">*</span></span>
            <span className="text-[11px] text-slate-400 font-mono">Metric</span>
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
                  ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30'
                  : isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 focus:ring-emerald-500/20 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
              cm
            </span>
          </div>
        </div>

        {/* Weight in KG */}
        <div className="space-y-1.5">
          <label htmlFor="weight-kg" className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Weight <span className="text-emerald-400">*</span></span>
            <span className="text-[11px] text-slate-400 font-mono">Metric</span>
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
                  ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30'
                  : isDark
                  ? 'bg-slate-900/80 border-emerald-500/20 focus:border-emerald-400 focus:ring-emerald-500/20 text-slate-100'
                  : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Calculated BMI Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-500/25'
            : 'bg-emerald-50/70 border-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Calculated Body Mass Index (BMI)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Auto-Computed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Computed automatically from height ({vitals.heightCm || '--'} cm) and weight ({vitals.weightKg || '--'} kg).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {currentBMI > 0 ? currentBMI : '--'} <span className="text-xs text-slate-400 font-normal">kg/m²</span>
            </div>
            <div className={`text-xs font-bold ${bmiCategory.color}`}>
              {bmiCategory.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
