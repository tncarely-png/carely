'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      "9arini.tn m'a fait gagner 2 heures par semaine. Fini les relances WhatsApp pour les paiements.",
    name: 'Ahmed B.',
    role: 'Enseignant de maths, Tunis',
    rating: 5,
  },
  {
    quote:
      'Enfin je peux voir mes absences et payer en ligne. Mon parent reçoit aussi les alertes.',
    name: 'Sonia T.',
    role: 'Étudiante, Sousse',
    rating: 5,
  },
  {
    quote:
      'Simple, propre, et ça marche. Exactement ce qu\'il fallait pour les cours en Tunisie.',
    name: 'Karim M.',
    role: 'Enseignant de physique, Sfax',
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? 'fill-[#F59E0B] text-[#F59E0B]'
              : 'fill-transparent text-[#D4D4D8]'
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="ninar-card flex flex-col p-6 sm:p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
    >
      {/* Star Rating */}
      <StarRating rating={testimonial.rating} />

      {/* Quote */}
      <blockquote className="mt-4 flex-1 text-base leading-relaxed text-[#09090B] sm:text-lg">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#78350F] text-sm font-bold text-white">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-[#09090B]">{testimonial.name}</p>
          <p className="text-xs text-[#A1A1AA]">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' });

  return (
    <section className="bg-white py-20 sm:py-28">
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
            Ce qu&apos;ils en disent
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#71717A] sm:text-lg">
            Des enseignants et étudiants tunisiens nous font confiance.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
