'use client'

import { getWhatsAppLink } from '@/lib/constants'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppFAB() {
  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      className="fixed bottom-20 md:bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
    >
      <MessageCircle className="size-7 text-white" fill="white" />
    </a>
  )
}
