'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Agent {
  key: string;
  name: string;
  phone: string;
  title: string;
  emoji: string;
  active: boolean;
}

const AGENT_DATA = {
  maram: { name: 'Maram', phone: '+21652013035', title: 'الوكيلة الأولى', emoji: '👩' },
  chafik: { name: 'Chafik', phone: '+21650496159', title: 'الوكيل الثاني', emoji: '👨' },
} as const;

type AgentKey = keyof typeof AGENT_DATA;

export default function SuperAdminWhatsApp() {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveAgent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/whatsapp-agent');
      if (!res.ok) throw new Error('فشل تحميل بيانات الوكلاء');
      const data = await res.json();
      setActiveAgent(data);
    } catch {
      setError('حدث خطأ أثناء تحميل بيانات الوكلاء');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveAgent();
  }, [fetchActiveAgent]);

  const handleSwitchAgent = async (agentKey: AgentKey) => {
    if (activeAgent?.key === agentKey) return;
    setSwitching(agentKey);
    try {
      const res = await fetch('/api/whatsapp-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAgent({ ...data, active: true });
      }
    } catch {
      // silent
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <Button onClick={fetchActiveAgent} className="sa-btn-primary">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const renderAgentCard = (key: AgentKey) => {
    const data = AGENT_DATA[key];
    const isActive = activeAgent?.key === key;
    const isSwitching = switching === key;

    return (
      <div
        key={key}
        className="sa-card p-8 transition-all duration-300"
        style={{
          border: isActive ? '2px solid #000000' : '1px solid #e5e5e5',
          boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-5">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
              style={{
                background: isActive ? '#000000' : '#f0f0f0',
              }}
            >
              {data.emoji}
            </div>
            {/* Status dot */}
            <div
              className="absolute bottom-1 left-1 w-5 h-5 rounded-full border-2"
              style={{
                borderColor: '#ffffff',
                background: isActive ? '#22c55e' : '#d1d5db',
              }}
            />
          </div>

          {/* Info */}
          <h3 className="text-xl font-extrabold mb-1" style={{ color: '#000000' }}>
            {data.name}
          </h3>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>
            {data.title}
          </p>
          <p className="font-bold text-sm mb-4" style={{ color: '#000000' }} dir="ltr">
            📱 {data.phone}
          </p>

          {/* Status Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
            style={{
              background: isActive ? '#000000' : '#f5f5f5',
              color: isActive ? '#ffffff' : '#888888',
            }}
          >
            <span style={{ fontSize: 10 }}>
              {isActive ? '●' : '○'}
            </span>
            {isActive ? 'مفعل' : 'معطل'}
          </div>

          {/* Action Button */}
          {isActive ? (
            <p className="text-sm font-bold" style={{ color: '#888888' }}>
              الوكيل النشط حالياً
            </p>
          ) : (
            <Button
              onClick={() => handleSwitchAgent(key)}
              disabled={!!isSwitching}
              className="sa-btn-primary"
            >
              {isSwitching ? 'جاري التفعيل...' : 'تفعيل'}
            </Button>
          )}

          {/* WhatsApp Link */}
          <a
            href={`https://wa.me/${data.phone.replace('+', '')}`}
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
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div
        className="sa-card p-5 flex items-start gap-4"
        style={{ border: '1px solid #e5e5e5' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f0f0f0' }}>
          <MessageCircle className="w-5 h-5" style={{ color: '#000000' }} />
        </div>
        <div>
          <h3 className="font-bold mb-1" style={{ color: '#000000' }}>
            إدارة وكلاء الواتساب
          </h3>
          <p className="text-sm" style={{ color: '#888888' }}>
            يمكنك تفعيل وكيل واحد فقط في كل مرة. الوكيل النشط سيظهر في زر واتساب في الموقع.
          </p>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderAgentCard('maram')}
        {renderAgentCard('chafik')}
      </div>
    </div>
  );
}
