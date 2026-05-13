'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Single support agent — matches `whatsapp_agents` seed */
const CHAFIK = {
  name: 'Chafik',
  phone: '+21650496159',
  title: 'الدعم',
  emoji: '👨',
} as const;

interface ActiveRow {
  id: string;
  name: string;
  phone: string;
  gender: string | null;
  isActive: boolean;
  title: string | null;
  emoji: string | null;
}

export default function SuperAdminWhatsApp() {
  const [activeAgent, setActiveAgent] = useState<ActiveRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveAgent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/whatsapp-agent');
      if (!res.ok) throw new Error('فشل تحميل بيانات الوكيل');
      const data = await res.json();
      setActiveAgent(data.activeAgent ?? null);
    } catch {
      setError('حدث خطأ أثناء تحميل بيانات الوكيل');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveAgent();
  }, [fetchActiveAgent]);

  const handleEnsureChafikActive = async () => {
    if (activeAgent?.isActive && activeAgent.name.toLowerCase() === 'chafik') return;
    setSwitching(true);
    try {
      const res = await fetch('/api/whatsapp-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'chafik' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.agent) setActiveAgent(data.agent);
        else await fetchActiveAgent();
      }
    } catch {
      // silent
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div
          className="animate-pulse rounded-2xl p-8"
          style={{ background: '#ffffff', border: '1px solid #e5e5e5', height: 280 }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#888888' }} />
        <p className="mb-4" style={{ color: '#666666' }}>{error}</p>
        <Button onClick={fetchActiveAgent} className="sa-btn-primary">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const isChafikActive =
    activeAgent?.name?.toLowerCase() === 'chafik' && activeAgent.isActive;

  return (
    <div className="space-y-6">
      <div
        className="sa-card p-5 flex items-start gap-4"
        style={{ border: '1px solid #e5e5e5' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f0f0f0' }}>
          <MessageCircle className="w-5 h-5" style={{ color: '#000000' }} />
        </div>
        <div>
          <h3 className="font-bold mb-1" style={{ color: '#000000' }}>
            وكيل الواتساب
          </h3>
          <p className="text-sm" style={{ color: '#888888' }}>
            وكيل واحد للدعم: Chafik. حالة «متاح» تظهر في الموقع عندما يكون مفعّلاً.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 max-w-md mx-auto gap-6">
        <div
          className="sa-card p-8 transition-all duration-300"
          style={{
            border: isChafikActive ? '2px solid #000000' : '1px solid #e5e5e5',
            boxShadow: isChafikActive ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                style={{
                  background: isChafikActive ? '#000000' : '#f0f0f0',
                }}
              >
                {CHAFIK.emoji}
              </div>
              <div
                className="absolute bottom-1 left-1 w-5 h-5 rounded-full border-2"
                style={{
                  borderColor: '#ffffff',
                  background: isChafikActive ? '#22c55e' : '#d1d5db',
                }}
              />
            </div>

            <h3 className="text-xl font-extrabold mb-1" style={{ color: '#000000' }}>
              {CHAFIK.name}
            </h3>
            <p className="text-sm mb-1" style={{ color: '#888888' }}>
              {CHAFIK.title}
            </p>
            <p className="font-bold text-sm mb-4" style={{ color: '#000000' }} dir="ltr">
              📱 {CHAFIK.phone}
            </p>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
              style={{
                background: isChafikActive ? '#000000' : '#f5f5f5',
                color: isChafikActive ? '#ffffff' : '#888888',
              }}
            >
              <span style={{ fontSize: 10 }}>{isChafikActive ? '●' : '○'}</span>
              {isChafikActive ? 'متاح — مفعّل' : 'غير متاح'}
            </div>

            {isChafikActive ? (
              <p className="text-sm font-bold" style={{ color: '#888888' }}>
                الوكيل النشط حالياً
              </p>
            ) : (
              <Button
                onClick={handleEnsureChafikActive}
                disabled={switching}
                className="sa-btn-primary"
              >
                {switching ? 'جاري التفعيل...' : 'تفعيل Chafik'}
              </Button>
            )}

            <a
              href={`https://wa.me/${CHAFIK.phone.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-sm font-semibold transition-all"
              style={{ color: '#888888' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#888888';
              }}
            >
              <MessageCircle className="w-4 h-4" />
              فتح واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
