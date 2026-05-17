'use client'

import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { HERO_CONTENT, TRUST_BADGES } from '@/lib/store-content'

export default function HeroSection() {
  const { navigate } = useAppStore()

  const handleScrollToApps = () => {
    const el = document.getElementById('app-cards-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden blur-contained py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-carely-mint via-carely-light/50 to-carely-mint" />

      <div className="absolute top-10 left-10 w-72 h-72 bg-carely-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-carely-gold/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-carely-light/60 rounded-full blur-2xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-carely-green/10 mx-auto">
          <span className="text-4xl">🛍️</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-carely-dark leading-tight mb-4">
          {HERO_CONTENT.hero_title}
          <br />
          <span className="text-carely-green">{HERO_CONTENT.hero_subtitle}</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-carely-gray max-w-2xl mx-auto mb-2 leading-relaxed">
          {HERO_CONTENT.hero_description}
        </p>
        <p className="text-sm sm:text-base md:text-lg text-carely-gray max-w-2xl mx-auto mb-8 leading-relaxed">
          {HERO_CONTENT.hero_subdescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            variant="ghost"
            size="lg"
            className="carely-btn-primary text-base px-8 py-3 h-auto"
            onClick={handleScrollToApps}
          >
            {HERO_CONTENT.cta_primary_text}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="carely-btn-outline text-base px-8 py-3 h-auto"
            onClick={() => navigate('contact')}
          >
            {HERO_CONTENT.cta_secondary_text}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge}
              className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-carely-dark shadow-sm"
            >
              <Check className="size-4 text-carely-green shrink-0" />
              <span className="font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
