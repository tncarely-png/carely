'use client'

import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function ContactPage() {
  const { navigate, openWhatsAppPopup } = useAppStore()

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            تواصل معانا 💬
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            نحن هنا لمساعدتك — اختر الطريقة المناسبة
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {/* WhatsApp Card */}
          <div
            className="carely-card p-6 text-center cursor-pointer group"
            onClick={() => openWhatsAppPopup()}
          >
            <div className="w-14 h-14 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="size-7 text-[#25D366]" />
            </div>
            <h3 className="text-lg font-extrabold text-carely-dark mb-2">واتساب</h3>
            <p className="text-sm text-carely-gray mb-4">
              أسرع طريقة للتواصل معنا — رد في أقل من ساعة
            </p>
            <Button className="carely-btn-primary text-sm group-hover:shadow-lg">
              تواصل على واتساب
            </Button>
          </div>

          {/* Email Card */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="carely-card p-6 text-center group"
          >
            <div className="w-14 h-14 bg-carely-mint rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="size-7 text-carely-green" />
            </div>
            <h3 className="text-lg font-extrabold text-carely-dark mb-2">البريد الإلكتروني</h3>
            <p className="text-sm text-carely-gray mb-4">
              {CONTACT_EMAIL}
            </p>
            <span className="inline-block text-sm font-bold text-carely-green group-hover:underline">
              أرسل إيميل ←
            </span>
          </a>
        </div>

        {/* Info Section */}
        <div className="carely-card p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-carely-mint rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="size-5 text-carely-green" />
              </div>
              <div>
                <p className="font-bold text-carely-dark text-sm mb-1">الموقع</p>
                <p className="text-sm text-carely-gray">📍 ولاية الكاف، تونس 🇹🇳</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-carely-mint rounded-xl flex items-center justify-center shrink-0">
                <Clock className="size-5 text-carely-green" />
              </div>
              <div>
                <p className="font-bold text-carely-dark text-sm mb-1">أوقات الدعم</p>
                <p className="text-sm text-carely-gray">كل يوم — 9 صباحاً إلى 9 مساءً</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-carely-mint rounded-xl flex items-center justify-center shrink-0">
                <MessageCircle className="size-5 text-carely-green" />
              </div>
              <div>
                <p className="font-bold text-carely-dark text-sm mb-1">رد سريع</p>
                <p className="text-sm text-carely-gray">جواب في أقل من ساعة على واتساب</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('home')}
            className="carely-btn-outline inline-flex items-center gap-2 text-sm"
          >
            → العودة للرئيسية
          </button>
        </div>
      </div>
    </section>
  )
}
