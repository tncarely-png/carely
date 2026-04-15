'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const benefits = [
  'Gratuit pendant 14 jours',
  'Sans carte bancaire',
  'Annulation à tout moment',
];

interface CTASectionProps {
  onLoginClick: () => void;
}

export function CTASection({ onLoginClick }: CTASectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section className="bg-[#09090B] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Decorative Line */}
          <div className="mb-8 h-px w-12 bg-[#78350F]" />

          <h2 className="max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            Prêt à simplifier la gestion de vos cours ?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-base text-[#A1A1AA] sm:text-lg">
            Rejoignez des centaines d&apos;enseignants tunisiens qui ont déjà adopté
            9arini.tn
          </p>

          <Button
            onClick={onLoginClick}
            className="mt-10 h-12 rounded-full bg-white px-8 text-base font-bold text-[#09090B] hover:bg-[#F4F4F5]"
          >
            Commencer gratuitement
            <ArrowRight className="ml-1 size-4" />
          </Button>

          {/* Benefits */}
          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <Check className="size-4 text-[#F59E0B]" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
