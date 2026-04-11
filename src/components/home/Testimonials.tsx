'use client'

import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'أم بتول',
    location: 'تونس العاصمة',
    text: 'من بعد Carely، بات عندي راحة بال على أولادي',
    initial: 'ب',
    color: 'bg-emerald-500',
  },
  {
    name: 'سيد نجيب',
    location: 'صفاقس',
    text: 'ولدي كان يقضي ساعات على النت، الآن كل شيء تحت السيطرة',
    initial: 'ن',
    color: 'bg-blue-500',
  },
  {
    name: 'أم سارة',
    location: 'سوسة',
    text: 'خدمة ممتازة وتفعيل سريع، ننصح بيه لكل عيلة',
    initial: 'س',
    color: 'bg-amber-500',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            شنو قالو الوالدين التونسيين
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="carely-card p-6 flex flex-col">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 text-carely-gold"
                    fill="#d4a017"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base text-carely-gray leading-relaxed mb-6 flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-carely-light">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-bold text-carely-dark">{t.name}</p>
                  <p className="text-xs text-carely-gray">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
