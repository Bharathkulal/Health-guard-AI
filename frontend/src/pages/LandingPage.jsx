import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { HealthDataStorySection } from '../components/sections/HealthDataStorySection';
import { AIAnalysisPipelineSection } from '../components/sections/AIAnalysisPipelineSection';
import { RiskAssessmentSection } from '../components/sections/RiskAssessmentSection';
import { ExplainableAISection } from '../components/sections/ExplainableAISection';
import { PersonalizedGuidanceSection } from '../components/sections/PersonalizedGuidanceSection';
import { DashboardPreviewSection } from '../components/sections/DashboardPreviewSection';
import { FinalCtaSection } from '../components/sections/FinalCtaSection';
import { Footer } from '../components/common/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      <main>
        <HeroSection />
        <HealthDataStorySection />
        <AIAnalysisPipelineSection />
        <RiskAssessmentSection />
        <ExplainableAISection />
        <PersonalizedGuidanceSection />
        <DashboardPreviewSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
