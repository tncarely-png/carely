'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: '/mois',
    description: 'Pour commencer et découvrir la plateforme',
    badge: null,
    features: [
      "Jusqu'à 10 élèves",
      'Suivi des paiements',
      "Appel des élèves",
      'Notifications basiques',
    ],
    buttonLabel: "S'inscrire gratuitement",
    buttonVariant: 'outline' as const,
    featured: false,
  },
  {
    name: 'Premium',
    price: '29',
    period: ' DT/mois',
    description: 'Pour les enseignants sérieux et professionnels',
    badge: '⭐ Populaire',
    features: [
      'Élèves illimités',
      'Reçu numérique upload',
      'Export PDF/Excel',
      'Support prioritaire',
      'Multi-cours',
      'Rapports détaillés',
    ],
    buttonLabel: 'Essai gratuit 14 jours',
    buttonVariant: 'default' as const,
    featured: true,
  },
];

interface PricingSectionProps {
  onLoginClick: () => void;
}

export function PricingSection({ onLoginClick }: PricingSectionProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' });

  return (
    <section id="pricing" className="bg-[#F4F4F5] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-[#09090B] sm:text-4xl">
            Tarifs simples et transparents
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#71717A] sm:text-lg">
            Commencez gratuitement, passez à Premium quand vous êtes prêt.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={index}
              onLoginClick={onLoginClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  index,
  onLoginClick,
}: {
  plan: (typeof plans)[0];
  index: number;
  onLoginClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={`relative flex flex-col rounded-2xl bg-white p-8 transition-shadow ${
        plan.featured
          ? 'border-2 border-[#78350F] shadow-lg sm:scale-105'
          : 'border border-[#E4E4E7] shadow-sm'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
    >
      {/* Badge */}
      {plan.badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#78350F] px-4 py-1 text-xs font-bold text-white">
          {plan.badge}
        </Badge>
      )}

      {/* Plan Name */}
      <h3 className="text-lg font-bold text-[#09090B]">{plan.name}</h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-extrabold text-[#09090B]">
          {plan.price}
        </span>
        <span className="ml-1 text-base text-[#71717A]">{plan.period}</span>
      </div>

      <p className="mt-2 text-sm text-[#A1A1AA]">{plan.description}</p>

      {/* Divider */}
      <div className="my-6 h-px bg-[#E4E4E7]" />

      {/* Features */}
      <ul className="flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FFFBEB]">
              <Check className="size-3 text-[#78350F]" />
            </div>
            <span className="text-sm text-[#09090B]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        onClick={onLoginClick}
        className={`mt-8 h-12 w-full rounded-full font-bold ${
          plan.featured
            ? 'bg-[#78350F] text-white hover:bg-[#92400E]'
            : 'border-2 border-[#E4E4E7] bg-white text-[#09090B] hover:bg-[#F4F4F5]'
        }`}
        variant={plan.featured ? 'default' : 'ghost'}
      >
        {plan.buttonLabel}
        <ArrowRight className="ml-1 size-4" />
      </Button>
    </motion.div>
  );
}
