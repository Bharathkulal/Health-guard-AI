import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Sparkles, Cpu, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const STAGES = [
  { id: 1, label: 'Preparing health biometrics & normalizations...', icon: Activity, duration: 800 },
  { id: 2, label: 'Analyzing physiological risk indicators...', icon: Cpu, duration: 900 },
  { id: 3, label: 'Evaluating multi-condition ML risk patterns...', icon: Sparkles, duration: 900 },
  { id: 4, label: 'Generating explainable SHAP factor attributions...', icon: ShieldCheck, duration: 800 },
];

export function LoadingOverlay({ onComplete, isSubmitting = true }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    let timer;
    if (currentStageIndex < STAGES.length - 1) {
      timer = setTimeout(() => {
        setCurrentStageIndex((prev) => prev + 1);
      }, STAGES[currentStageIndex].duration);
    } else if (currentStageIndex === STAGES.length - 1) {
      timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 700);
    }
    return () => clearTimeout(timer);
  }, [currentStageIndex, onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / STAGES.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-10 border shadow-2xl relative overflow-hidden ${
          isDark
            ? 'bg-[#040c08] border-emerald-500/30 shadow-[0_0_80px_-10px_rgba(16,185,129,0.3)]'
            : 'bg-white border-slate-200 shadow-2xl'
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-3xl -z-10 pointer-events-none" />

        <div className="text-center space-y-6">
          {/* Animated Core Icon */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center"
            >
              <Sparkles className="w-7 h-7 text-emerald-400" />
            </motion.div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span>ML Analysis in Progress</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Analyzing Health Risk Baseline
            </h3>
            <p className="text-xs text-slate-400">
              Evaluating your physiological metrics with explainable decision support models.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Phase {currentStageIndex + 1} of {STAGES.length}</span>
              <span className="text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Sequential Stage Items */}
          <div className="space-y-2.5 text-left pt-2">
            {STAGES.map((stage, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isPending = idx > currentStageIndex;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : isDone
                      ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-400'
                      : 'bg-transparent border-transparent text-slate-500 opacity-60'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full"
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <span className={`font-medium ${isCurrent ? 'text-slate-100 font-semibold' : ''}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Clinical Note */}
          <p className="text-[11px] text-slate-500 leading-tight">
            Decision support risk inference. No diagnosis is performed.
          </p>
        </div>
      </div>
    </div>
  );
}
