'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Wallet,
  ClipboardList,
  Camera,
  Bell,
  Users,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    emoji: '💰',
    title: 'Suivi des paiements',
    description:
      "Recevez et vérifiez les paiements de vos élèves en un clic. Plus de pertes de traces.",
  },
  {
    icon: ClipboardList,
    emoji: '📋',
    title: 'Appel des élèves',
    description:
      'Marquez la présence en 30 secondes. Bulk actions pour gagner du temps.',
  },
  {
    icon: Camera,
    emoji: '📸',
    title: 'Reçu numérique',
    description:
      'Les élèves déposent leurs reçus de paiement directement sur la plateforme.',
  },
  {
    icon: Bell,
    emoji: '🔔',
    title: 'Notifications',
    description:
      'Alertes automatiques pour les paiements en retard et les absences répétées.',
  },
  {
    icon: Users,
    emoji: '👨‍👩‍👧',
    title: 'Multi-rôles',
    description:
      'Enseignants, élèves et parents — chacun a son tableau de bord adapté.',
  },
  {
    icon: Globe,
    emoji: '🌍',
    title: 'Trilingue',
    description:
      'Interface en Français, Arabe tunisien et English. RTL inclus.',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="ninar-card ninar-top-accent group relative flex flex-col p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
    >
      {/* Icon */}
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FFFBEB] text-xl transition-colors group-hover:bg-[#78350F]/10">
        {feature.emoji}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-bold text-[#09090B]">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-[#71717A]">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' });

  return (
    <section id="features" className="bg-[#F4F4F5] py-20 sm:py-28">
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
            Tout ce dont vous avez besoin
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#71717A] sm:text-lg">
            Des outils conçus pour simplifier la gestion de vos cours particuliers
            en Tunisie.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
