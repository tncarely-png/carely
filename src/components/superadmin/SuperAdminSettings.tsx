'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface SiteSetting {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'url';
}

const SITE_SETTINGS: SiteSetting[] = [
  { key: 'store_name', label: 'اسم المتجر', value: '', type: 'text' },
  { key: 'store_tagline', label: 'شعار المتجر', value: '', type: 'text' },
  { key: 'whatsapp_number', label: 'رقم واتساب (بدون +)', value: '', type: 'text' },
  { key: 'contact_email', label: 'البريد الإلكتروني', value: '', type: 'text' },
  { key: 'flouci_number', label: 'رقم Flouci', value: '', type: 'text' },
  { key: 'silver_price', label: 'سعر Silver (دت)', value: '', type: 'number' },
  { key: 'gold_price', label: 'سعر Gold (دت)', value: '', type: 'number' },
];

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // WhatsApp agent
  const [activeAgent, setActiveAgent] = useState<string>('maram');
  const [switchingAgent, setSwitchingAgent] = useState(false);

  useEffect(() => {
    loadSettings();
    loadActiveAgent();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const promises = SITE_SETTINGS.map(async (s) => {
        const res = await fetch(`/api/settings?key=${s.key}`);
        if (res.ok) {
          const data = await res.json();
          return { key: s.key, value: data.value || '' };
        }
        return { key: s.key, value: '' };
      });
      const results = await Promise.all(promises);
      const map = new Map<string, string>();
      results.forEach((r) => map.set(r.key, r.value));
      setSettings(map);
    } catch {
      setError('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveAgent = async () => {
    try {
      const res = await fetch('/api/whatsapp-agent');
      if (res.ok) {
        const data = await res.json();
        setActiveAgent(data.key || 'maram');
      }
    } catch {
      // silent
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const promises = SITE_SETTINGS.map((s) => {
        const value = settings.get(s.key) || '';
        return fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: s.key, value }),
        });
      });
      await Promise.all(promises);
      setSuccess('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleAgentSwitch = async (agent: string) => {
    if (activeAgent === agent) return;
    setSwitchingAgent(true);
    try {
      const res = await fetch('/api/whatsapp-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent }),
      });
      if (res.ok) {
        setActiveAgent(agent);
      }
    } catch {
      // silent
    } finally {
      setSwitchingAgent(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Site Settings */}
      <div className="sa-card p-6">
        <h3 className="text-lg font-extrabold mb-6" style={{ color: '#000000' }}>
          ⚙️ إعدادات الموقع
        </h3>

        {error && (
          <div
            className="p-3 rounded-xl text-sm font-semibold mb-4"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 rounded-xl text-sm font-semibold mb-4"
            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
          >
            {success}
          </div>
        )}

        <div className="space-y-4">
          {SITE_SETTINGS.map((s) => (
            <div key={s.key}>
              <Label
                className="block text-sm font-bold mb-2"
                style={{ color: '#000000' }}
              >
                {s.label}
              </Label>
              <Input
                value={settings.get(s.key) || ''}
                onChange={(e) => {
                  setSettings((prev) => {
                    const next = new Map(prev);
                    next.set(s.key, e.target.value);
                    return next;
                  });
                }}
                type={s.type}
                dir={s.type === 'url' ? 'ltr' : 'rtl'}
                placeholder={s.label}
                className="rounded-xl h-11"
                style={{ border: '1px solid #e0e0e0' }}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="sa-btn-primary"
          >
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>

      {/* WhatsApp Agent Quick Toggle */}
      <div className="sa-card p-6">
        <h3 className="text-lg font-extrabold mb-6" style={{ color: '#000000' }}>
          💬 وكيل الواتساب السريع
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'maram', name: 'Maram 👩', phone: '+21652013035' },
            { key: 'chafik', name: 'Chafik 👨', phone: '+21650496159' },
          ].map((agent) => (
            <button
              key={agent.key}
              onClick={() => handleAgentSwitch(agent.key)}
              disabled={switchingAgent}
              className="p-4 rounded-xl text-right transition-all"
              style={{
                background: activeAgent === agent.key ? '#000000' : '#f5f5f5',
                color: activeAgent === agent.key ? '#ffffff' : '#666666',
                border: activeAgent === agent.key ? '2px solid #000000' : '1px solid #e5e5e5',
              }}
            >
              <p className="font-bold text-base">{agent.name}</p>
              <p className="text-sm mt-1" dir="ltr">{agent.phone}</p>
              {activeAgent === agent.key && (
                <p className="text-xs mt-2 font-bold">● مفعل</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
