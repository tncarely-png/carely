'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserPlus, BookOpen, Share2, LayoutDashboard } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Créez votre compte',
    description:
      "Inscription gratuite en 30 secondes avec votre numéro de téléphone",
  },
  {
    number: 2,
    icon: BookOpen,
    title: 'Ajoutez vos cours',
    description: 'Définissez vos matières, horaires et tarifs mensuels',
  },
  {
    number: 3,
    icon: Share2,
    title: 'Invitez vos élèves',
    description:
      'Partagez le lien d\'inscription ou ajoutez-les manuellement',
  },
  {
    number: 4,
    icon: LayoutDashboard,
    title: 'Gérez facilement',
    description:
      'Suivez paiements et présence depuis votre tableau de bord',
  },
];

export function HowItWorksSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' });

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-[#09090B] sm:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#71717A] sm:text-lg">
            Commencez en 4 étapes simples et gérez vos cours en quelques minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="absolute top-12 left-0 right-0 hidden h-px bg-[#E4E4E7] lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
    >
      {/* Number Badge */}
      <div className="relative z-10 mb-6 flex size-24 flex-col items-center justify-center rounded-full border-4 border-white bg-[#78350F] shadow-lg">
        <Icon className="mb-1 size-6 text-white" />
        <span className="text-lg font-extrabold text-white">{step.number}</span>
      </div>

      {/* Content */}
      <h3 className="mb-2 text-lg font-bold text-[#09090B]">{step.title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-[#71717A]">
        {step.description}
      </p>
    </motion.div>
  );
}
