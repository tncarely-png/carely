'use client'

import { ShoppingCart, CreditCard, Mail, ArrowLeft } from 'lucide-react'

const STEPS = [
  {
    number: 1,
    icon: ShoppingCart,
    emoji: '🛒',
    title: 'اختار باقتك',
    desc: 'Silver أو Gold — كلو يتفعل في دقائق',
  },
  {
    number: 2,
    icon: CreditCard,
    emoji: '💳',
    title: 'ادفع بأمان',
    desc: 'فلوسي، D17، أو كارت بنكي',
  },
  {
    number: 3,
    icon: Mail,
    emoji: '📧',
    title: 'فعّل التطبيق',
    desc: 'يوصلك كود التفعيل على إيميلك مباشرة',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            3 خطوات وأولادك محميين 🛡️
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-4 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-20 right-[20%] left-[20%] h-0.5 bg-carely-light" />

          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative z-10 mb-5">
                  <div className="w-16 h-16 rounded-full bg-carely-green text-white flex items-center justify-center text-2xl font-extrabold shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div className="carely-card p-6 w-full max-w-xs">
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
                  <div className="hidden md:flex absolute top-20 -left-5 translate-x-[-50%] z-20 text-carely-green">
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
