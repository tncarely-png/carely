'use client';

import { useEffect } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/constants';

const SUPPORT_PHONE_DISPLAY = '+216 50 496 159';

export function WhatsAppSupportPopup({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="إغلاق نافذة الدعم"
      />

      <div
        className="relative mx-4 mb-6 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl sm:mb-0"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-support-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-carely-green px-6 py-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <MessageCircle className="h-7 w-7" fill="currentColor" />
          </div>
          <h2 id="whatsapp-support-title" className="text-xl font-extrabold">
            دعم العملاء على واتساب
          </h2>
          <p className="mt-2 text-sm text-green-50">
            اضغط على الزر وتواصل معنا مباشرة
          </p>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-carely-mint px-4 py-3 text-carely-dark">
            <Phone className="h-4 w-4 text-carely-green" />
            <span className="font-bold" dir="ltr">{SUPPORT_PHONE_DISPLAY}</span>
          </div>

          <a
            href={getWhatsAppLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 font-extrabold text-white shadow-md transition-all hover:bg-[#20BA5A] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-5 w-5" />
            فتح واتساب
          </a>

          <p className="mt-3 text-center text-xs text-carely-gray">
            سيتم فتح محادثة مباشرة مع دعم Carely
          </p>
        </div>
      </div>
    </div>
  );
}
