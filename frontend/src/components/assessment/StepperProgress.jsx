import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function StepperProgress({ currentStep = 1, totalSteps = 6, onStepClick = null, stepTitles = [] }) {
  const { isDark } = useTheme();

  return (
    <div className="w-full space-y-3">
      {/* Step Counter & Current Name */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400 font-mono">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-semibold text-slate-200">
            {stepTitles[currentStep - 1] || `Step ${currentStep}`}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>

      {/* Stepper Track */}
      <div className="flex items-center justify-between relative">
        {/* Continuous background track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 -z-0 rounded-full" />
        
        {/* Active filled track */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 -z-0 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step Node Circles */}
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isUpcoming = stepNum > currentStep;

          return (
            <button
              key={stepNum}
              type="button"
              disabled={isUpcoming}
              onClick={() => onStepClick && onStepClick(stepNum)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 relative z-10 ${
                isDone
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-emerald-soft'
                  : isCurrent
                  ? 'bg-emerald-500 text-black ring-4 ring-emerald-500/25 font-extrabold shadow-emerald-lg'
                  : isDark
                  ? 'bg-slate-900 border-2 border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 border-2 border-slate-300 text-slate-400 cursor-not-allowed'
              }`}
              aria-label={`Step ${stepNum}: ${stepTitles[i] || ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isDone ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : stepNum}
            </button>
          );
        })}
      </div>

      {/* Step Titles Pill List (Desktop) */}
      <div className="hidden md:grid grid-cols-6 gap-2 text-center pt-1 text-[11px] text-slate-400 font-medium">
        {stepTitles.map((title, idx) => (
          <span
            key={title}
            className={`truncate ${
              idx + 1 === currentStep
                ? 'text-emerald-400 font-bold'
                : idx + 1 < currentStep
                ? 'text-slate-300'
                : 'text-slate-600'
            }`}
          >
            {title}
          </span>
        ))}
      </div>
    </div>
  );
}
