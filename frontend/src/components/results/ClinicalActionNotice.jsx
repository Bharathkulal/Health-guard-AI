import React from 'react';
import { AlertTriangle, Stethoscope, PhoneCall, CheckSquare } from 'lucide-react';

export function ClinicalActionNotice({ className = '' }) {
  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border border-[#E5E0D7] bg-[#FFFDF9] shadow-sm space-y-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#B7791F]/10 border border-[#B7791F]/20 flex items-center justify-center text-[#B7791F] flex-shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-[#18201C]">
            When to Seek Professional Medical Care
          </h3>
          <p className="text-sm font-medium text-[#66706A] leading-relaxed">
            HealthGuard AI is an analytical early-warning decision-support tool. It is not an emergency triage service or diagnostic platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px]">
        {/* Urgent Attention Conditions */}
        <div className="p-5 rounded-2xl border border-[#C24141]/30 bg-[#C24141]/5 shadow-sm">
          <div className="flex items-center gap-2 text-[#C24141] font-bold uppercase tracking-widest mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Immediate / Urgent Clinical Care</span>
          </div>
          <p className="text-[#18201C] font-medium leading-relaxed mb-4">
            Seek immediate medical attention or emergency services if you experience any of the following:
          </p>
          <ul className="space-y-2 text-[#66706A] font-medium">
            <li className="flex items-start gap-2">
              <span className="text-[#C24141] font-bold">•</span>
              <span>Crushing or radiating chest pain, pressure, or tightness</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C24141] font-bold">•</span>
              <span>Sudden severe shortness of breath or difficulty breathing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C24141] font-bold">•</span>
              <span>Sudden numbness or weakness in the face, arm, or leg</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C24141] font-bold">•</span>
              <span>Systolic BP &gt; 180 mmHg or Diastolic BP &gt; 120 mmHg</span>
            </li>
          </ul>
        </div>

        {/* Routine Doctor Discussion */}
        <div className="p-5 rounded-2xl border border-[#16805F]/30 bg-[#16805F]/5 shadow-sm">
          <div className="flex items-center gap-2 text-[#16805F] font-bold uppercase tracking-widest mb-3">
            <CheckSquare className="w-4 h-4" />
            <span>Routine Primary Care Consultation</span>
          </div>
          <p className="text-[#18201C] font-medium leading-relaxed mb-4">
            Discuss your HealthGuard AI risk summary with your physician if you note:
          </p>
          <ul className="space-y-2 text-[#66706A] font-medium">
            <li className="flex items-start gap-2">
              <span className="text-[#16805F] font-bold">•</span>
              <span>Consistent pre-hypertensive or hypertensive blood pressure readings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#16805F] font-bold">•</span>
              <span>Fasting blood glucose consistently above 100 mg/dL</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#16805F] font-bold">•</span>
              <span>Unexplained persistent fatigue, polydipsia, or sleep disruption</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#16805F] font-bold">•</span>
              <span>Family history of early cardiovascular disease or diabetes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
