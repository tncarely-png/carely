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
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Zap,
  Store,
  HeartHandshake,
} from 'lucide-react'

type FeatureItem = {
  icon: typeof Lock
  emoji: string
  title: string
  desc: string
  highlight?: boolean
}

/** QStudio capabilities — shown only on the product page */
const PRODUCT_FEATURES: FeatureItem[] = [
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

/** متجر Carely — landing / features page (بدون ذكر منتج معيّن) */
const STORE_FEATURES: FeatureItem[] = [
  {
    icon: Store,
    emoji: '🛍️',
    title: 'متجر واحد للعيلة',
    desc: 'لقى التطبيقات المدفوعة اللي تحبّها عيلتك، بعرض واضح وأسعار بالدينار',
  },
  {
    icon: ShieldCheck,
    emoji: '✅',
    title: 'حسابات رسمية',
    desc: 'اشتراكات أصلية — ما فيش حسابات مشبوهة ولا وسطاء عشوائيين',
  },
  {
    icon: CreditCard,
    emoji: '💳',
    title: 'دفع بالدينار التونسي',
    desc: 'فلوسي، حوالة بنكية، CCP وطرق تونسية أخرى تناسبك',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'تسليم وتفعيل سريع',
    desc: 'بعد تأكيد الدفع، نكمّل معاك في أقرب وقت ممكن',
  },
  {
    icon: MessageCircle,
    emoji: '💬',
    title: 'دعم على الواتساب',
    desc: 'نجاوبك بالتونسي ونوضّحلك الخطوات من غير تعقيد',
    highlight: true,
  },
  {
    icon: HeartHandshake,
    emoji: '🤝',
    title: 'معاك من الأول للآخر',
    desc: 'من اختيار المنتج لحد ما تستعمل الخدمة براحتك',
  },
]

export type FeaturesGridScope = 'store' | 'product'

interface FeaturesGridProps {
  /** `store`: متجر Carely. `product`: صفحة QStudio فقط. */
  scope?: FeaturesGridScope
}

export default function FeaturesGrid({ scope = 'store' }: FeaturesGridProps) {
  const title =
    scope === 'product'
      ? 'شنو يقدر يعمل QStudio؟'
      : 'مميزات تسوّق مع Carely'
  const subtitle =
    scope === 'product'
      ? 'كل أدوات الحماية اللي تحتاجها في مكان واحد'
      : 'حسابات رسمية، دفع بالدينار، ودعم بالتونسي — نجمع لك التطبيقات اللي تحبّها العيلة في متجر واحد'

  const features = scope === 'product' ? PRODUCT_FEATURES : STORE_FEATURES

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            {title}
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`carely-card p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                feature.highlight ? 'border-carely-gold/30 bg-carely-gold/5' : ''
              }`}
            >
              <div
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                  feature.highlight ? 'bg-carely-gold/10' : 'bg-carely-mint'
                }`}
              >
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
          ))}
        </div>
      </div>
    </section>
  )
}
