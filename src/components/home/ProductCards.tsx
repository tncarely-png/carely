'use client'

import { useAppStore, useAuthStore } from '@/store'
import { PLANS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function ProductCards() {
  const { navigate, setSelectedPlan } = useAppStore()

  const user = useAuthStore((s) => s.user)

  const handleBuy = (plan: 'silver' | 'gold') => {
    setSelectedPlan(plan)
    if (!user) {
      navigate('login')
    } else {
      navigate('checkout')
    }
  }

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            اختار الباقة المناسبة لعيلتك
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            كل الباقات تشمل سنة كاملة من الحماية
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* SILVER CARD */}
          <div className="carely-card carely-top-accent p-6 flex flex-col">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{PLANS.silver.icon}</span>
                <div>
                  <h3 className="text-xl font-extrabold text-carely-dark">
                    {PLANS.silver.name}
                  </h3>
                  <p className="text-sm text-carely-gray font-medium">
                    {PLANS.silver.nameAr}
                  </p>
                </div>
              </div>
              <p className="text-sm text-carely-gray mt-2">
                مناسبة للعيلة الصغيرة
              </p>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-carely-green">
                  {PLANS.silver.priceTnd}
                </span>
                <span className="text-lg text-carely-gray font-medium">دت</span>
              </div>
              <p className="text-sm text-carely-gray">/ سنة</p>
            </div>

            {/* Devices Badge */}
            <div className="mb-5">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 px-3 py-1 text-sm font-bold"
              >
                {PLANS.silver.devices} أجهزة
              </Badge>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {PLANS.silver.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-carely-green shrink-0 mt-0.5" />
                  <span className="text-carely-gray">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant="outline"
              className="w-full border-carely-silver text-carely-gray hover:bg-carely-silver hover:text-white font-bold rounded-full py-3"
              onClick={() => handleBuy('silver')}
            >
              اشتري Silver
            </Button>
          </div>

          {/* GOLD CARD */}
          <div className="carely-card-featured carely-top-accent-gold p-6 flex flex-col relative">
            {/* Top Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-carely-gold text-white px-4 py-1 text-sm font-bold shadow-md">
                ⭐ الأكثر شراءً
              </Badge>
            </div>

            {/* Header */}
            <div className="mb-4 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{PLANS.gold.icon}</span>
                <div>
                  <h3 className="text-xl font-extrabold text-carely-dark">
                    {PLANS.gold.name}
                  </h3>
                  <p className="text-sm text-carely-gray font-medium">
                    {PLANS.gold.nameAr}
                  </p>
                </div>
              </div>
              <p className="text-sm text-carely-gray mt-2">
                للعيلة اللي تحب الحماية الكاملة
              </p>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-carely-green">
                  {PLANS.gold.priceTnd}
                </span>
                <span className="text-lg text-carely-gray font-medium">دت</span>
              </div>
              <p className="text-sm text-carely-gray">/ سنة</p>
            </div>

            {/* Devices Badge */}
            <div className="mb-5">
              <Badge className="bg-carely-gold/10 text-carely-gold px-3 py-1 text-sm font-bold border border-carely-gold/20">
                {PLANS.gold.devices} أجهزة
              </Badge>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {PLANS.gold.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-carely-green shrink-0 mt-0.5" />
                  <span className="text-carely-gray">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
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
