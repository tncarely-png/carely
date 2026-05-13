'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export type FaqAccordionScope = 'store' | 'product'

const STORE_FAQS = [
  {
    q: 'شنو هو متجر Carely؟',
    a: 'Carely.tn هو متجر تونسي: نبيعو حسابات واشتراكات رسمية لتطبيقات مدفوعة بالدينار التونسي، مع تفعيل ودعم مباشر على واتساب. تختار المنتج، تدفع بالطريقة اللي تناسبك، ونكمّل معاك لحد ما تستعمل الخدمة.',
  },
  {
    q: 'كيفاش نكمّل بعد ما ندفع؟',
    a: 'بعد تأكيد الدفع، يوصلك التفعيل أو بيانات الدخول حسب المنتج (غالبًا على الإيميل أو عبر واتساب). التفاصيل الدقيقة تلقاها في صفحة كل منتج.',
  },
  {
    q: 'شنو طرق الدفع المتوفرة؟',
    a: 'نقبل فلوسي، D17، كارت بنكي، تحويل بنكي، وحتى دفع عند الاستلام حسب العرض. كل الطرق متاحة قدر الإمكان.',
  },
  {
    q: 'هل نقدر نستعمل طرق دفع تونسية؟',
    a: 'أكيد! الدفع بالدينار التونسي هو أساس متجرنا.',
  },
  {
    q: 'إذا مشات في الخدمة، كيفاش نتواصل؟',
    a: 'تقدر تتواصل معانا على واتساب، على الإيميل contact@carely.tn، أو من خلال صفحة "تواصل معانا" في الموقع. دعمنا بالتونسي 100%.',
  },
]

const PRODUCT_FAQS = [
  {
    q: 'شنو هو QStudio؟',
    a: 'QStudio هو تطبيق حماية أطفال متقدّم — تلقى تفاصيلو الكاملة وشرح المميزات في نفس الصفحة. Carely.tn تبيعو بالدينار التونسي مع تفعيل ودعم.',
  },
  {
    q: 'كيفاش نفعّل الاشتراك بعد الدفع؟',
    a: 'بعد الدفع، يوصلك كود التفعيل أو بيانات الدخول على إيميلك أو عبر واتساب. تتبع التعليمات اللي نبعثهالك مع المنتج — العملية عادة ما تستغرق دقائق.',
  },
  {
    q: 'شنو الفرق بين Silver و Gold؟',
    a: 'Silver (390 دت): فلترة المواقع، حدود زمنية للشاشة والتطبيقات، تقارير، إيقاف الإنترنت مؤقتاً، تتبع الموقع — حتى 5 أجهزة. Gold (590 دت): كل مزايا Silver بالإضافة إلى تنبيهات أذكى، مراقبة أعمق للشبكات الاجتماعية والرسائل، رؤية أوضح للتطبيقات، روتينات متقدمة، ودعم VIP — حتى 10 أجهزة.',
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

interface FaqAccordionProps {
  /** `store`: أسئلة عن متجر Carely فقط. `product`: صفحة QStudio. */
  scope?: FaqAccordionScope
}

export default function FaqAccordion({ scope = 'store' }: FaqAccordionProps) {
  const faqs = scope === 'product' ? PRODUCT_FAQS : STORE_FAQS

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            أسئلة شايعة
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            لقيت الجواب اللي تبحث عليه
          </p>
        </div>

        <div className="carely-card p-4 sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
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
