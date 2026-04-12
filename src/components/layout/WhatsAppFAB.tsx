'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

interface WhatsAppAgent {
  name: string
  phone: string
  key: string
}

const DEFAULT_AGENT: WhatsAppAgent = {
  name: 'Maram',
  phone: '21652013035',
  key: 'maram',
}

export default function WhatsAppFAB() {
  const [agent, setAgent] = useState<WhatsAppAgent>(DEFAULT_AGENT)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Fetch active agent on mount
    fetch('/api/whatsapp-agent')
      .then((res) => res.json())
      .then((data) => {
        if (data.phone) {
          setAgent({
            name: data.name,
            phone: data.phone.replace('+', ''),
            key: data.key || 'maram',
          })
        }
      })
      .catch(() => {
        // Keep default agent on error
      })

    // Show tooltip for 3 seconds on mount
    const timer = setTimeout(() => setShowTooltip(true), 2000)
    const hideTimer = setTimeout(() => setShowTooltip(false), 6000)
    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  const waLink = `https://wa.me/${agent.phone}?text=${encodeURIComponent('مرحبا Carely.tn، أريد الاستفسار عن الاشتراك')}`

  return (
    <div className="fixed bottom-20 md:bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {/* Tooltip with agent name */}
      {showTooltip && (
        <div className="bg-white text-carely-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          💬 {agent.name}
        </div>
      )}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا على واتساب"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="size-7 text-white" fill="white" />
      </a>
    </div>
  )
}
