'use client'

import { useState, useEffect } from 'react'

interface WhatsAppAgent {
  name: string
  phone: string
  key: string
}

const DEFAULT_AGENT: WhatsAppAgent = {
  name: 'Maram',
  phone: '+21652013035',
  key: 'maram',
}

/**
 * Hook to fetch the currently active WhatsApp agent.
 * Returns the agent info and a helper function to generate WhatsApp links.
 * Falls back to Maram if the API fails.
 */
export function useWhatsAppAgent() {
  const [agent, setAgent] = useState<WhatsAppAgent>(DEFAULT_AGENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/whatsapp-agent')
      .then((res) => res.json())
      .then((data) => {
        if (data.phone) {
          setAgent({
            name: data.name,
            phone: data.phone,
            key: data.key || 'maram',
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
