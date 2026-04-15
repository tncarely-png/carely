'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const stats = [
  { value: '500+', label: 'Enseignants' },
  { value: '10,000+', label: 'Étudiants' },
  { value: '50,000+', label: 'Paiements traités' },
];

interface HeroSectionProps {
  onLoginClick: () => void;
}

export function HeroSection({ onLoginClick }: HeroSectionProps) {
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-40 w-px bg-[#78350F]/10" />
        <div className="absolute top-40 left-20 h-px w-40 bg-[#78350F]/10" />
        <div className="absolute bottom-20 right-10 h-60 w-px bg-[#78350F]/10" />
        <div className="absolute bottom-40 right-20 h-px w-60 bg-[#78350F]/10" />
        <div className="absolute top-1/3 right-1/4 h-3 w-3 rotate-45 border border-[#78350F]/10" />
        <div className="absolute bottom-1/3 left-1/4 h-2 w-2 rotate-45 border border-[#78350F]/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Badge className="mb-6 gap-2 rounded-full border-[#78350F]/20 bg-[#FFFBEB] px-4 py-2 text-sm font-semibold text-[#78350F]">
              🇹🇳 La plateforme tunisienne pour les cours particuliers
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-[#09090B] sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Gérez vos cours particuliers{' '}
            <span className="text-[#78350F]">simplement</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-2xl text-lg leading-relaxed text-[#71717A] sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Paiements, présence, et coordination — le tout en une seule plateforme
            pour les enseignants et étudiants tunisiens.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Button
              onClick={onLoginClick}
              className="h-12 rounded-full bg-[#78350F] px-8 text-base font-bold text-white hover:bg-[#92400E]"
            >
              Commencer gratuitement
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              onClick={scrollToFeatures}
              className="h-12 rounded-full border-2 border-[#E4E4E7] bg-white px-8 text-base font-bold text-[#09090B] hover:bg-[#F4F4F5]"
              variant="ghost"
            >
              Voir les fonctionnalités
              <Play className="ml-1 size-4" />
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="mt-16 grid w-full max-w-lg grid-cols-3 gap-6 sm:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-[#78350F] sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs font-medium text-[#A1A1AA] sm:text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
