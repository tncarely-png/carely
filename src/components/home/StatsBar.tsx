'use client'

import { Shield, MessageCircle, Banknote, Clock } from 'lucide-react'

const STATS = [
  {
    icon: Shield,
    emoji: '🛡️',
    value: 'تطبيق واحد موثوق',
    label: 'حسابات أصلية ومضمونة',
  },
  {
    icon: MessageCircle,
    emoji: '💬',
    value: 'دعم واتساب',
    label: '24/7 متاحين لكم',
  },
  {
    icon: Banknote,
    emoji: '💵',
    value: 'دفع بالدينار',
    label: 'التونسي فقط',
  },
  {
    icon: Clock,
    emoji: '⚡',
    value: 'تسليم سريع',
    label: 'في أقل من 24 ساعة',
  },
]

export default function StatsBar() {
  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="carely-card p-5 flex items-center gap-4 text-center sm:text-right"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-carely-mint flex items-center justify-center text-xl">
                  {stat.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-extrabold text-carely-dark leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-carely-gray font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
