'use client';

import { useState } from 'react';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsSection,
  CTASection,
  Footer,
  LoginModal,
} from '@/components/ninar';

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      <main className="flex-1">
        <HeroSection onLoginClick={() => setLoginOpen(true)} />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection onLoginClick={() => setLoginOpen(true)} />
        <TestimonialsSection />
        <CTASection onLoginClick={() => setLoginOpen(true)} />
      </main>

      <Footer onLoginClick={() => setLoginOpen(true)} />

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
