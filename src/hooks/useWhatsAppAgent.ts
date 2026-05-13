'use client'

import { useState, useEffect } from 'react'

interface WhatsAppAgent {
  name: string
  phone: string
  key: string
}

const DEFAULT_AGENT: WhatsAppAgent = {
  name: 'Chafik',
  phone: '+21650496159',
  key: 'chafik',
}

/**
 * Hook to fetch the currently active WhatsApp agent.
 * Returns the agent info and a helper function to generate WhatsApp links.
 * Falls back to Chafik if the API fails.
 */
export function useWhatsAppAgent() {
  const [agent, setAgent] = useState<WhatsAppAgent>(DEFAULT_AGENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/whatsapp-agent')
      .then((res) => res.json())
      .then((data) => {
        if (data.activeAgent?.phone) {
          setAgent({
            name: data.activeAgent.name,
            phone: data.activeAgent.phone,
            key: (data.activeAgent.name || 'Chafik').toLowerCase(),
          })
        }
      })
      .catch(() => {
        // Keep default
      })
      .finally(() => setLoading(false))
  }, [])

  /**
   * Generate a WhatsApp link with pre-filled message
   */
  const getLink = (message?: string) => {
    const phone = agent.phone.replace('+', '')
    const msg = message || 'مرحبا Carely.tn، أريد الاستفسار عن الاشتراك'
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  return { agent, loading, getLink }
}
