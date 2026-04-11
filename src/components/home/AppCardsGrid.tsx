'use client'

import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Shield, ChevronLeft } from 'lucide-react'

interface AppCard {
  emoji: string
  name: string
  description: string
  price: string
  action: 'discover' | 'coming-soon'
  route?: string
}

const APPS: AppCard[] = [
  {
    emoji: '🛡️',
    name: 'Qustodio',
    description: 'حماية أطفالك على النت',
    price: 'من 89 دت / سنة',
    action: 'discover',
    route: 'qustodio-app',
  },
  {
    emoji: '🔜',
    name: 'تطبيق جديد قريبًا',
    description: 'نحضرو لكم أحسن التطبيقات',
    price: '',
    action: 'coming-soon',
  },
]

export default function AppCardsGrid() {
  const { navigate } = useAppStore()

  return (
    <section id="app-cards-section" className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            تطبيقاتنا
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            اختار التطبيق المناسب لعيلتك
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {APPS.map((app) => (
            <div
              key={app.name}
              className={`carely-card p-6 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                app.action === 'coming-soon' ? 'opacity-60 grayscale' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-carely-mint flex items-center justify-center text-3xl">
                  {app.emoji}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-carely-dark">
                    {app.name}
                  </h3>
                  <p className="text-sm text-carely-gray">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* Price */}
              {app.price && (
                <div className="mb-5">
                  <span className="text-2xl font-extrabold text-carely-green">
                    {app.price}
                  </span>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* CTA */}
              {app.action === 'discover' ? (
                <Button
                  className="w-full carely-btn-primary font-bold py-3 rounded-full"
                  onClick={() => app.route && navigate(app.route as any)}
                >
                  <span>اكتشف</span>
                  <ChevronLeft className="size-4 mr-1" />
                </Button>
              ) : (
                <Button
                  className="w-full bg-gray-200 text-gray-500 font-bold py-3 rounded-full cursor-not-allowed"
                  disabled
                >
                  قريبًا...
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
