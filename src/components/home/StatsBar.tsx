'use client'

import { Globe, Star, Zap, Flag } from 'lucide-react'

const STATS = [
  {
    icon: Globe,
    emoji: '🌍',
    value: '9 مليون+',
    label: 'عيلة تستخدم Qustodio',
  },
  {
    icon: Star,
    emoji: '⭐',
    value: '4.3',
    label: 'تقييم التطبيق',
  },
  {
    icon: Zap,
    emoji: '⚡',
    value: 'تفعيل فوري',
    label: 'بعد الدفع',
  },
  {
    icon: Flag,
    emoji: '🇹🇳',
    value: 'دعم بالتونسي',
    label: '100%',
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
                  <p className="text-lg sm:text-xl font-extrabold text-carely-dark leading-tight">
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
