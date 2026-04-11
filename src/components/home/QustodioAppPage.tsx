'use client'

import { useAppStore } from '@/store'
import { PLANS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowLeft } from 'lucide-react'
import FeaturesGrid from './FeaturesGrid'
import FaqAccordion from './FaqAccordion'

function QustodioHero() {
  const { navigate, setSelectedPlan } = useAppStore()

  const handleBuy = (plan: 'silver' | 'gold') => {
    setSelectedPlan(plan)
    navigate('checkout')
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-carely-mint via-white to-carely-light/30" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-carely-green/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-carely-gray hover:text-carely-green font-medium"
            onClick={() => navigate('home')}
          >
            <ArrowLeft className="size-4 ml-1" />
            <span>الرئيسية</span>
          </Button>
        </div>

        {/* Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-carely-green/10">
          <span className="text-5xl">🛡️</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-carely-dark leading-tight mb-4">
          Qustodio
        </h1>
        <p className="text-lg sm:text-xl text-carely-gray max-w-2xl mx-auto mb-4 leading-relaxed">
          أفضل تطبيق حماية أطفال في العالم — الآن بالدينار التونسي
        </p>
        <p className="text-base text-carely-gray max-w-xl mx-auto mb-10 leading-relaxed">
          حجب المواقع، مراقبة الشاشة، تتبع الموقع، وتقارير يومية — كلو من هاتفك
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start max-w-3xl mx-auto">
          {/* SILVER */}
          <div className="carely-card carely-top-accent p-6 flex flex-col">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{PLANS.silver.icon}</span>
                <div>
                  <h3 className="text-xl font-extrabold text-carely-dark">
                    {PLANS.silver.displayName}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-carely-gray mt-2">
                مناسبة للعيلة الصغيرة
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-carely-green">
                  {PLANS.silver.priceTnd}
                </span>
                <span className="text-lg text-carely-gray font-medium">دت</span>
              </div>
              <p className="text-sm text-carely-gray">/ سنة</p>
            </div>

            <div className="mb-5">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 px-3 py-1 text-sm font-bold"
              >
                {PLANS.silver.devices} أجهزة
              </Badge>
            </div>

            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {PLANS.silver.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-carely-green shrink-0 mt-0.5" />
                  <span className="text-carely-gray">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full border-carely-silver text-carely-gray hover:bg-carely-silver hover:text-white font-bold rounded-full py-3"
              onClick={() => handleBuy('silver')}
            >
              اشتري Silver
            </Button>
          </div>

          {/* GOLD */}
          <div className="carely-card-featured carely-top-accent-gold p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-carely-gold text-white px-4 py-1 text-sm font-bold shadow-md">
                ⭐ الأكثر شراءً
              </Badge>
            </div>

            <div className="mb-4 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{PLANS.gold.icon}</span>
                <div>
                  <h3 className="text-xl font-extrabold text-carely-dark">
                    {PLANS.gold.displayName}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-carely-gray mt-2">
                للعيلة اللي تحب الحماية الكاملة
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-carely-green">
                  {PLANS.gold.priceTnd}
                </span>
                <span className="text-lg text-carely-gray font-medium">دت</span>
              </div>
              <p className="text-sm text-carely-gray">/ سنة</p>
            </div>

            <div className="mb-5">
              <Badge className="bg-carely-gold/10 text-carely-gold px-3 py-1 text-sm font-bold border border-carely-gold/20">
                {PLANS.gold.devices} أجهزة
              </Badge>
            </div>

            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {PLANS.gold.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-carely-green shrink-0 mt-0.5" />
                  <span className="text-carely-gray">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full carely-btn-primary font-bold py-3"
              onClick={() => handleBuy('gold')}
            >
              اشتري Gold
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function QustodioCTA() {
  const { navigate, setSelectedPlan } = useAppStore()

  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-carely-green to-carely-dark" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          ابدأ حماية عيلتك اليوم 🛡️
        </h2>
        <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
          أكثر من 500 عيلة تونسية تثق بـ Carely.tn
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-carely-green hover:bg-gray-100 font-bold rounded-full px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => {
              setSelectedPlan('gold')
              navigate('checkout')
            }}
          >
            اشتري الآن — ابدأ من 89 دت
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 font-bold rounded-full px-8 py-3 text-base"
            onClick={() => navigate('contact')}
          >
            تواصل معانا
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function QustodioAppPage() {
  return (
    <>
      <QustodioHero />
      <FeaturesGrid />
      <FaqAccordion />
      <QustodioCTA />
    </>
  )
}
