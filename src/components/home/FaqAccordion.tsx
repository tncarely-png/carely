'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS = [
  {
    q: 'شنو هو Carely.tn؟',
    a: 'Carely.tn هي منصة تونسية تبيع اشتراكات Qustodio (أفضل تطبيق حماية أطفال في العالم) بالدينار التونسي. نشتريك، نفعّلك، ونواصل معاك على طول.',
  },
  {
    q: 'كيفاش نفعّل الاشتراك بعد الدفع؟',
    a: 'بعد الدفع، يوصلك كود التفعيل على إيميلك مباشرة. تدخل على تطبيق Qustodio وتدخل الكود — العملية تستغرف دقيقتين فقط.',
  },
  {
    q: 'شنو الفرق بين Silver و Gold؟',
    a: 'باقة Silver تشمل حجب المواقع، وقت الشاشة، وتقارير أسبوعية لـ 5 أجهزة. باقة Gold تضيف مراقبة واتساب، تتبع الموقع، تقارير يومية مفصلة، ودعم VIP لـ 10 أجهزة.',
  },
  {
    q: 'هل نقدر نستعمل طرق دفع تونسية؟',
    a: 'أكيد! نقبل فلوسي، D17، كارت بنكي، تحويل بنكي، وحتى دفع عند الاستلام. كل الطرق متاحة.',
  },
  {
    q: 'إذا مشات في الخدمة، كيفاش نتواصل؟',
    a: 'تقدر تتواصل معانا على واتساب، على الإيميل contact@carely.tn، أو من خلال صفحة "تواصل معانا" في الموقع. دعمنا بالتونسي 100%.',
  },
]

export default function FaqAccordion() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            أسئلة شايعة
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            لقيت الجواب اللي تبحث عليه
          </p>
        </div>

        {/* Accordion */}
        <div className="carely-card p-4 sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-carely-light"
              >
                <AccordionTrigger className="text-base font-bold text-carely-dark hover:text-carely-green hover:no-underline text-right">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-carely-gray leading-relaxed text-right">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
