import React from 'react';
import HeroSection from '@/components/hero-section';
import ProblemAgitationSection from '@/components/problem-agitation-section';

export default function LandingConversion() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemAgitationSection />
    </div>
  );
}