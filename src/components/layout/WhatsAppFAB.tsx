'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useAppStore } from '@/store'

export default function WhatsAppFAB() {
  const openWhatsAppPopup = useAppStore((s) => s.openWhatsAppPopup)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Show tooltip for 3 seconds on mount
    const timer = setTimeout(() => setShowTooltip(true), 2000)
    const hideTimer = setTimeout(() => setShowTooltip(false), 6000)
    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  return (
    <div className="fixed bottom-20 md:bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-white text-carely-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          💬 تواصل معانا
        </div>
      )}
      <button
        onClick={() => openWhatsAppPopup()}
        aria-label="تواصل معنا على واتساب"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="size-7 text-white" fill="white" />
      </button>
    </div>
  )
}
