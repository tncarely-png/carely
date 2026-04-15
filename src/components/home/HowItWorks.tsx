'use client'

import { Layers, CreditCard, MessageCircle, ArrowLeft } from 'lucide-react'

const STEPS = [
  {
    number: 1,
    icon: Layers,
    emoji: '📦',
    title: 'اختار الباقة',
    desc: 'Silver أو Gold حسب احتياج عيلتك',
  },
  {
    number: 2,
    icon: CreditCard,
    emoji: '💳',
    title: 'ادفع بالدينار',
    desc: 'Flouci، حوال بنكي، أو CCP',
  },
  {
    number: 3,
    icon: MessageCircle,
    emoji: '📸',
    title: 'ابعث الوصل',
    desc: 'ارفع صورة وصل الدفع وانتظر التأكيد',
  },
  {
    number: 4,
    icon: MessageCircle,
    emoji: '💬',
    title: 'استلم حسابك',
    desc: 'نتواصل معاك على واتساب في أقل من 24 ساعة',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            كيفاش يخدم؟
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            4 خطوات بس وتكون جاهز
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative z-10 mb-5">
                  <div className="w-14 h-14 rounded-full bg-carely-green text-white flex items-center justify-center text-xl font-extrabold shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div className="carely-card p-5 w-full max-w-xs">
                  <div className="text-3xl mb-3">{step.emoji}</div>
                  <h3 className="text-lg font-extrabold text-carely-dark mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-carely-gray leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow (between steps, desktop only) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-7 -left-4 translate-x-[-50%] z-20 text-carely-green">
                    <ArrowLeft className="size-5" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
