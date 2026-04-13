'use client'

import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'

export default function FinalCTA() {
  const { navigate } = useAppStore()

  return (
    <section className="relative overflow-hidden blur-contained py-16 md:py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-carely-green to-carely-dark" />

      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          اكتشف تطبيقاتنا اليوم 🛍️
        </h2>
        <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
          حسابات آمنة، دفع بالدينار، دعم واتساب
        </p>
        <Button
          size="lg"
          className="bg-white text-carely-green hover:bg-gray-100 font-bold rounded-full px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          onClick={() => navigate('home')}
        >
          شوف التطبيقات
        </Button>
      </div>
    </section>
  )
}
