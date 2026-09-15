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
  CheckCircle2,
  AlertTriangle,
  Database,
  Calendar,
  Clock,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { assessmentService } from '../services/assessmentService';
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
  'Review & Submit',
];

export function AssessmentPage() {
  const { isDark } = useTheme();
  const { activeDraft, updateDraft, resetDraft, submitAssessment } = useHealth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Validate step before advancing
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!activeDraft.age || activeDraft.age < 18 || activeDraft.age > 120) {
        errs.age = 'Please enter a valid adult age between 18 and 120.';
      }
    } else if (step === 2) {
      const vitals = activeDraft.vitals || {};
      if (!vitals.systolicBP || vitals.systolicBP < 70 || vitals.systolicBP > 260) {
        errs['vitals.systolicBP'] = 'Systolic BP must be between 70 and 260 mmHg.';
      }
      if (!vitals.diastolicBP || vitals.diastolicBP < 40 || vitals.diastolicBP > 160) {
        errs['vitals.diastolicBP'] = 'Diastolic BP must be between 40 and 160 mmHg.';
      }
      if (!vitals.fastingBloodSugar || vitals.fastingBloodSugar < 50 || vitals.fastingBloodSugar > 500) {
        errs['vitals.fastingBloodSugar'] = 'Blood glucose must be between 50 and 500 mg/dL.';
      }
      if (!vitals.heartRate || vitals.heartRate < 40 || vitals.heartRate > 220) {
        errs['vitals.heartRate'] = 'Heart rate must be between 40 and 220 BPM.';
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
    // Validate required steps 1 & 2
    if (!validateStep(1) || !validateStep(2)) {
      setSubmissionError('Please resolve indicated errors in Demographics and Vitals before submitting.');
      return;
    }

    setSubmissionError(null);
    setShowLoadingOverlay(true);

    try {
      // Execute ML Prediction & Persistence pipeline via HealthContext
      const result = await submitAssessment(activeDraft);
      setSubmissionResult(result);
    } catch (err) {
      console.error('Submission failed:', err);
      setShowLoadingOverlay(false);
      setSubmissionError(
        err.message ||
        "We couldn't submit your assessment right now. Please check your connection and try again."
      );
    }
  };

  const handleLoadingComplete = () => {
    setShowLoadingOverlay(false);
  };

  const handleStartNew = () => {
    resetDraft();
    setSubmissionResult(null);
    setSubmissionError(null);
    setCurrentStep(1);
  };

  // If successfully submitted, show structured Confirmation receipt screen
  if (submissionResult && !showLoadingOverlay) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Success Card */}
        <div
          className={`p-6 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden ${
            isDark
              ? 'bg-[#040c08] border-emerald-500/30 shadow-[0_0_80px_-10px_rgba(16,185,129,0.2)]'
              : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          {/* Top ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-48 bg-emerald-500/15 blur-3xl -z-10 pointer-events-none" />

          <div className="space-y-6">
            {/* Header Badge & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Assessment Stored in Database</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                    Assessment Received Successfully
                  </h1>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block font-mono">Record Reference ID</span>
                <span className="text-lg font-black text-emerald-400 font-mono tracking-wider">
                  {submissionResult.assessment_id || 'HG-A8921'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Status: <strong className="text-emerald-400 uppercase font-mono">{submissionResult.status || 'received'}</strong>
                </span>
              </div>
            </div>

            {/* Stage Explanation Alert */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${
                isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-100 text-sm">
                    Clinical Data Securely Recorded
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Your multi-factor physiological markers, lifestyle habits, and family medical history have been verified and persisted in MongoDB. This foundation is structured for direct ingestion into the upcoming Machine Learning risk prediction pipeline.
                  </p>
                </div>
              </div>
            </div>

            {/* Biometric Summary Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recorded Biomarker Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-emerald-500/15 bg-slate-900/60">
                  <span className="text-[11px] text-slate-400 block">Demographics</span>
                  <span className="text-sm font-bold text-slate-100 capitalize">
                    {submissionResult.age || activeDraft.age} yrs • {submissionResult.gender || activeDraft.gender || activeDraft.sex}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-500/15 bg-slate-900/60">
                  <span className="text-[11px] text-slate-400 block">Blood Pressure</span>
                  <span className="text-sm font-bold text-slate-100">
                    {submissionResult.systolic_bp || activeDraft.vitals?.systolicBP} / {submissionResult.diastolic_bp || activeDraft.vitals?.diastolicBP} mmHg
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-500/15 bg-slate-900/60">
                  <span className="text-[11px] text-slate-400 block">Blood Glucose</span>
                  <span className="text-sm font-bold text-slate-100">
                    {submissionResult.blood_sugar || activeDraft.vitals?.fastingBloodSugar} mg/dL
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-500/15 bg-slate-900/60">
                  <span className="text-[11px] text-slate-400 block">Calculated BMI</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {submissionResult.bmi || activeDraft.vitals?.bmi} kg/m²
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/results')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-emerald-soft"
              >
                <Sparkles className="w-4 h-4" />
                <span>View ML Risk Analysis & Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={handleStartNew}
                className="w-full sm:w-auto px-4 py-3 rounded-xl text-slate-400 font-semibold text-xs hover:text-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Assessment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <span>Multi-Factor Clinical Assessment</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              HealthGuard AI Clinical Assessment
            </h1>
            <p className="text-xs text-slate-400">
              Complete the guided clinical evaluation to establish your baseline health markers.
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

      {/* Submission Error Banner if any */}
      {submissionError && (
        <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <p>{submissionError}</p>
        </div>
      )}

      {/* Main Active Form Step Card */}
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

        {/* Navigation Step Buttons (Hidden on Step 6 where Review has submit CTA) */}
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

      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <LoadingOverlay onComplete={handleLoadingComplete} />
      )}
    </div>
  );
}
