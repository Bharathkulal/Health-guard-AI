import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Database, CheckCircle2, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LOADING_STAGES = [
  { id: 1, label: 'Preparing your assessment...', detail: 'Validating clinical ranges & calculating standard BMI', icon: Activity, duration: 900 },
  { id: 2, label: 'Securely processing your health information...', detail: 'Encrypting payload & transmitting to FastAPI backend', icon: Lock, duration: 1000 },
  { id: 3, label: 'Assessment received', detail: 'Persisting record in MongoDB database for ML pipeline', icon: Database, duration: 800 },
];

export function LoadingOverlay({ onComplete, isSubmitting = true }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    let timer;
    if (currentStageIndex < LOADING_STAGES.length - 1) {
      timer = setTimeout(() => {
        setCurrentStageIndex((prev) => prev + 1);
      }, LOADING_STAGES[currentStageIndex].duration);
    } else if (currentStageIndex === LOADING_STAGES.length - 1) {
      timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 700);
    }
    return () => clearTimeout(timer);
  }, [currentStageIndex, onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / LOADING_STAGES.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-10 border shadow-2xl relative overflow-hidden ${
          isDark
            ? 'bg-[#040c08] border-emerald-500/30 shadow-[0_0_80px_-10px_rgba(16,185,129,0.3)]'
            : 'bg-white border-slate-200 shadow-2xl'
        }`}
      >
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-3xl -z-10 pointer-events-none" />

        <div className="text-center space-y-6">
          {/* Animated Spinner Core */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40"
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center"
            >
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </motion.div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono uppercase border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              <span>Secure Clinical Transmission</span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {LOADING_STAGES[currentStageIndex].label}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {LOADING_STAGES[currentStageIndex].detail}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className={`flex justify-between text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>Step {currentStageIndex + 1} of {LOADING_STAGES.length}</span>
              <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{progressPercent}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Step Sequence Checklist */}
          <div className="space-y-2 text-left pt-2">
            {LOADING_STAGES.map((stage, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              const isCurrentStyle = isDark
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-sm'
                : 'bg-emerald-50 border-emerald-500/30 text-emerald-800 shadow-sm';
              const isDoneStyle = isDark
                ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-400'
                : 'bg-emerald-50/50 border-emerald-200 text-slate-600';
              const isNotDoneStyle = isDark
                ? 'bg-transparent border-transparent text-slate-600 opacity-60'
                : 'bg-transparent border-transparent text-slate-400 opacity-60';

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all duration-300 ${
                    isCurrent ? isCurrentStyle : isDone ? isDoneStyle : isNotDoneStyle
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full"
                      />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    )}
                  </div>
                  <span className={`font-medium ${isCurrent ? (isDark ? 'text-slate-100 font-semibold' : 'text-slate-900 font-semibold') : ''}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            Data secured with End-to-End Encryption. No clinical diagnosis is performed at this stage.
          </p>
        </div>
      </div>
    </div>
  );
}
