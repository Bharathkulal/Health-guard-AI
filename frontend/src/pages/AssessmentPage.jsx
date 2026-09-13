import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { StepperProgress } from '../components/assessment/StepperProgress';
import { Step1Demographics } from '../components/assessment/Step1Demographics';
import { Step2Vitals } from '../components/assessment/Step2Vitals';
import { Step3Symptoms } from '../components/assessment/Step3Symptoms';
import { Step4Lifestyle } from '../components/assessment/Step4Lifestyle';
import { Step5FamilyHistory } from '../components/assessment/Step5FamilyHistory';
import { Step6Review } from '../components/assessment/Step6Review';
import { LoadingOverlay } from '../components/common/LoadingOverlay';

const STEP_TITLES = [
  'Demographics',
  'Vital Biometrics',
  'Symptoms',
  'Lifestyle Patterns',
  'Family History',
  'Review & Analyze',
];

export function AssessmentPage() {
  const { isDark } = useTheme();
  const { activeDraft, updateDraft, resetDraft, submitAssessment } = useHealth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

  // Validate current step before advancing
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!activeDraft.age || activeDraft.age < 18 || activeDraft.age > 120) {
        errs.age = 'Please enter a valid adult age between 18 and 120.';
      }
    } else if (step === 2) {
      const vitals = activeDraft.vitals || {};
      if (!vitals.systolicBP || vitals.systolicBP < 70 || vitals.systolicBP > 260) {
        errs['vitals.systolicBP'] = 'Systolic BP typically ranges between 70 and 260 mmHg.';
      }
      if (!vitals.diastolicBP || vitals.diastolicBP < 40 || vitals.diastolicBP > 160) {
        errs['vitals.diastolicBP'] = 'Diastolic BP typically ranges between 40 and 160 mmHg.';
      }
      if (!vitals.fastingBloodSugar || vitals.fastingBloodSugar < 50 || vitals.fastingBloodSugar > 500) {
        errs['vitals.fastingBloodSugar'] = 'Fasting glucose typically ranges between 50 and 500 mg/dL.';
      }
      if (!vitals.heartRate || vitals.heartRate < 40 || vitals.heartRate > 220) {
        errs['vitals.heartRate'] = 'Heart rate typically ranges between 40 and 220 BPM.';
      }
      if (!vitals.heightCm || vitals.heightCm < 100 || vitals.heightCm > 250) {
        errs['vitals.heightCm'] = 'Height must be between 100 and 250 cm.';
      }
      if (!vitals.weightKg || vitals.weightKg < 30 || vitals.weightKg > 350) {
        errs['vitals.weightKg'] = 'Weight must be between 30 and 350 kg.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToStep = (stepNumber) => {
    setErrors({});
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }
    setShowLoadingOverlay(true);
    try {
      const result = await submitAssessment();
      setPendingResult(result);
    } catch (e) {
      setShowLoadingOverlay(false);
    }
  };

  const handleAnalysisComplete = () => {
    setShowLoadingOverlay(false);
    navigate('/results');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
          isDark
            ? 'bg-[#07130e]/90 border-emerald-500/25 shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/15">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Factor Risk Assessment</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              HealthGuard AI Clinical Questionnaire
            </h1>
            <p className="text-xs text-slate-400">
              Complete the guided assessment below to receive an early risk stratification.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold self-start sm:self-auto transition-colors"
            title="Reset form to default draft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="pt-6">
          <StepperProgress
            currentStep={currentStep}
            totalSteps={6}
            onStepClick={handleJumpToStep}
            stepTitles={STEP_TITLES}
          />
        </div>
      </div>

      {/* Main Active Form Card */}
      <div
        className={`p-6 sm:p-10 rounded-3xl border min-h-[440px] flex flex-col justify-between relative ${
          isDark
            ? 'bg-[#040c08]/90 border-emerald-500/20 shadow-2xl'
            : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1"
          >
            {currentStep === 1 && (
              <Step1Demographics
                data={activeDraft}
                onChange={updateDraft}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <Step2Vitals
                data={activeDraft}
                onChange={updateDraft}
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <Step3Symptoms
                data={activeDraft}
                onChange={updateDraft}
              />
            )}

            {currentStep === 4 && (
              <Step4Lifestyle
                data={activeDraft}
                onChange={updateDraft}
              />
            )}

            {currentStep === 5 && (
              <Step5FamilyHistory
                data={activeDraft}
                onChange={updateDraft}
              />
            )}

            {currentStep === 6 && (
              <Step6Review
                data={activeDraft}
                onJumpToStep={handleJumpToStep}
                onSubmit={handleSubmit}
                isSubmitting={showLoadingOverlay}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Step Buttons (Hidden on Step 6 where Review has big submit CTA) */}
        {currentStep < 6 && (
          <div className="pt-8 mt-6 border-t border-emerald-500/10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                currentStep === 1
                  ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                  : isDark
                  ? 'border-emerald-500/20 text-slate-300 hover:bg-emerald-950/40 hover:border-emerald-500/40'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Multi-Stage AI Analysis Loading Screen Overlay */}
      {showLoadingOverlay && (
        <LoadingOverlay onComplete={handleAnalysisComplete} />
      )}
    </div>
  );
}
