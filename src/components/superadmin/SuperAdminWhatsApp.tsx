'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AGENTS = [
  {
    key: 'maram',
    name: 'Maram',
    phone: '+21652013035',
    title: 'الوكيلة الأولى',
    emoji: '👩',
  },
  {
    key: 'chafik',
    name: 'Chafik',
    phone: '+21650496159',
    title: 'الدعم',
    emoji: '👨',
  },
] as const;

interface AgentRow {
  id: string;
  name: string;
  phone: string;
  gender: string | null;
  isActive: boolean;
  title: string | null;
  emoji: string | null;
}

export default function SuperAdminWhatsApp() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/whatsapp-agent');
      if (!res.ok) throw new Error('فشل تحميل بيانات الوكلاء');
      const data = await res.json();
      setAgents(data.agents ?? []);
    } catch {
      setError('حدث خطأ أثناء تحميل بيانات الوكلاء');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleActivate = async (key: string) => {
    const row = agents.find((a) => a.name.toLowerCase() === key);
    if (row?.isActive) return;
    setSwitching(key);
    try {
      const res = await fetch('/api/whatsapp-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: key }),
      });
      if (res.ok) await fetchAgents();
    } catch {
      // silent
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl p-8"
            style={{ background: '#ffffff', border: '1px solid #e5e5e5', height: 280 }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#888888' }} />
        <p className="mb-4" style={{ color: '#666666' }}>{error}</p>
        <Button onClick={fetchAgents} className="sa-btn-primary">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

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
            وكلاء الواتساب
          </h3>
          <p className="text-sm" style={{ color: '#888888' }}>
            وكيل واحد نشط في كل مرة. Maram هي الافتراضية؛ يمكنك التبديل إلى Chafik.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {AGENTS.map((def) => {
          const row = agents.find((a) => a.name.toLowerCase() === def.key);
          const isActive = row?.isActive ?? def.key === 'maram';
          return (
            <div
              key={def.key}
              className="sa-card p-8 transition-all duration-300"
              style={{
                border: isActive ? '2px solid #000000' : '1px solid #e5e5e5',
                boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                    style={{ background: isActive ? '#000000' : '#f0f0f0' }}
                  >
                    {def.emoji}
                  </div>
                  <div
                    className="absolute bottom-1 left-1 w-5 h-5 rounded-full border-2"
                    style={{
                      borderColor: '#ffffff',
                      background: isActive ? '#22c55e' : '#d1d5db',
                    }}
                  />
                </div>

                <h3 className="text-xl font-extrabold mb-1" style={{ color: '#000000' }}>
                  {def.name}
                </h3>
                <p className="text-sm mb-1" style={{ color: '#888888' }}>
                  {def.title}
                </p>
                <p className="font-bold text-sm mb-4" style={{ color: '#000000' }} dir="ltr">
                  📱 {row?.phone ?? def.phone}
                </p>

                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
                  style={{
                    background: isActive ? '#000000' : '#f5f5f5',
                    color: isActive ? '#ffffff' : '#888888',
                  }}
                >
                  <span style={{ fontSize: 10 }}>{isActive ? '●' : '○'}</span>
                  {isActive ? 'متاح — مفعّل' : 'غير متاح'}
                </div>

                {isActive ? (
                  <p className="text-sm font-bold" style={{ color: '#888888' }}>
                    الوكيل النشط حالياً
                  </p>
                ) : (
                  <Button
                    onClick={() => handleActivate(def.key)}
                    disabled={switching === def.key}
                    className="sa-btn-primary"
                  >
                    {switching === def.key ? 'جاري التفعيل...' : `تفعيل ${def.name}`}
                  </Button>
                )}

                <a
                  href={`https://wa.me/${(row?.phone ?? def.phone).replace('+', '')}`}
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
          );
        })}
      </div>
    </div>
  );
}
