'use client'

import {
  Lock,
  Clock,
  MapPin,
  Smartphone,
  MessageSquare,
  BarChart3,
  Moon,
  AlertTriangle,
  Tv,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Lock,
    emoji: '🔒',
    title: 'حجب المواقع',
    desc: 'احجب أي موقع ما تحبش ولدك يشوفو',
  },
  {
    icon: Clock,
    emoji: '⏱️',
    title: 'وقت الشاشة',
    desc: 'حدد متى وقداش يتفرج',
  },
  {
    icon: MapPin,
    emoji: '📍',
    title: 'تتبع الموقع',
    desc: 'اعرف وينو في أي وقت',
  },
  {
    icon: Smartphone,
    emoji: '📱',
    title: 'مراقبة التطبيقات',
    desc: 'شوف كل تطبيق يفتحو',
  },
  {
    icon: MessageSquare,
    emoji: '💬',
    title: 'رسائل واتساب',
    desc: 'تنبيه عند أي محادثة مريبة (Gold فقط)',
    highlight: true,
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'تقارير تفصيلية',
    desc: 'ملخص يومي وأسبوعي',
  },
  {
    icon: Moon,
    emoji: '🌙',
    title: 'روتين النوم',
    desc: 'أوقف النت تلقائيًا وقت النوم',
  },
  {
    icon: AlertTriangle,
    emoji: '🚨',
    title: 'تنبيهات فورية',
    desc: 'تنبيه لهاتفك في الحين',
  },
  {
    icon: Tv,
    emoji: '📺',
    title: 'يوتيوب',
    desc: 'شوف كل فيديو شافه ولدك',
  },
]

export default function FeaturesGrid() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            شنو يقدر يعمل Qustodio؟
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            كل أدوات الحماية اللي تحتاجها في مكان واحد
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`carely-card p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  feature.highlight ? 'border-carely-gold/30 bg-carely-gold/5' : ''
                }`}
              >
                <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                  feature.highlight ? 'bg-carely-gold/10' : 'bg-carely-mint'
                }`}>
                  {feature.emoji}
                </div>
                <div>
                  <h3 className="text-base font-bold text-carely-dark mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-carely-gray leading-relaxed">
                    {feature.desc}
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
