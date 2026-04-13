'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  RefreshCw,
  AlertTriangle,
  Palette,
  Type,
  Layout,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store';

interface LandingSetting {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea';
  group: string;
}

const LANDING_SETTINGS: LandingSetting[] = [
  // Hero Section
  { key: 'hero_title', label: 'العنوان الرئيسي', value: '', type: 'text', group: 'hero' },
  { key: 'hero_subtitle', label: 'العنوان الفرعي', value: '', type: 'text', group: 'hero' },
  { key: 'hero_description', label: 'الوصف الأول', value: '', type: 'textarea', group: 'hero' },
  { key: 'hero_subdescription', label: 'الوصف الثاني', value: '', type: 'textarea', group: 'hero' },
  { key: 'cta_primary_text', label: 'نص الزر الرئيسي', value: '', type: 'text', group: 'hero' },
  { key: 'cta_secondary_text', label: 'نص الزر الثانوي', value: '', type: 'text', group: 'hero' },
  // Store Info
  { key: 'store_name', label: 'اسم المتجر', value: '', type: 'text', group: 'store' },
  { key: 'store_tagline', label: 'شعار المتجر', value: '', type: 'textarea', group: 'store' },
  { key: 'whatsapp_number', label: 'رقم واتساب (بدون +)', value: '', type: 'text', group: 'store' },
  { key: 'contact_email', label: 'البريد الإلكتروني', value: '', type: 'text', group: 'store' },
  // Pricing
  { key: 'silver_price', label: 'سعر Silver (دت)', value: '', type: 'text', group: 'pricing' },
  { key: 'gold_price', label: 'سعر Gold (دت)', value: '', type: 'text', group: 'pricing' },
];

export default function SuperAdminLandingPage() {
  const [settings, setSettings] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const promises = LANDING_SETTINGS.map(async (s) => {
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

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const promises = LANDING_SETTINGS.map((s) => {
        const value = settings.get(s.key) || '';
        return fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: s.key, value }),
        });
      });
      await Promise.all(promises);
      setSuccess('تم حفظ إعدادات الصفحة الرئيسية بنجاح ✅');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const heroSettings = LANDING_SETTINGS.filter(s => s.group === 'hero');
  const storeSettings = LANDING_SETTINGS.filter(s => s.group === 'store');
  const pricingSettings = LANDING_SETTINGS.filter(s => s.group === 'pricing');

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
    <div className="space-y-6">
      {/* Success / Error Messages */}
      {success && (
        <div
          className="p-4 rounded-xl text-sm font-semibold"
          style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
        >
          {success}
        </div>
      )}
      {error && (
        <div
          className="p-4 rounded-xl text-sm font-semibold"
          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
        >
          {error}
        </div>
      )}

      {/* Preview Banner */}
      <div
        className="sa-card p-5 flex items-center justify-between"
        style={{ border: '1px solid #e5e5e5' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0f0f0' }}>
            <Eye className="w-5 h-5" style={{ color: '#000000' }} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: '#000000' }}>
              معاينة مباشرة
            </h3>
            <p className="text-sm" style={{ color: '#888888' }}>
              التغييرات تظهر مباشرة في الصفحة الرئيسية بعد الحفظ
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            useAppStore.getState().navigate('home');
          }}
          variant="outline"
          className="rounded-xl"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Eye className="w-4 h-4 ml-2" />
          عرض الصفحة
        </Button>
      </div>

      {/* Tabs for sections */}
      <Tabs defaultValue="hero" dir="rtl">
        <TabsList className="mb-6">
          <TabsTrigger value="hero" className="text-sm font-bold">
            <Layout className="w-4 h-4 ml-1" />
            القسم الرئيسي
          </TabsTrigger>
          <TabsTrigger value="store" className="text-sm font-bold">
            <Type className="w-4 h-4 ml-1" />
            معلومات المتجر
          </TabsTrigger>
          <TabsTrigger value="pricing" className="text-sm font-bold">
            <Palette className="w-4 h-4 ml-1" />
            الأسعار
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <div className="sa-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-5 h-5" style={{ color: '#000000' }} />
              <h3 className="text-lg font-extrabold" style={{ color: '#000000' }}>
                🏠 قسم البطل (Hero)
              </h3>
            </div>

            {heroSettings.map((s) => (
              <div key={s.key}>
                <Label
                  className="block text-sm font-bold mb-2"
                  style={{ color: '#000000' }}
                >
                  {s.label}
                </Label>
                {s.type === 'textarea' ? (
                  <Textarea
                    value={settings.get(s.key) || ''}
                    onChange={(e) => {
                      setSettings((prev) => {
                        const next = new Map(prev);
                        next.set(s.key, e.target.value);
                        return next;
                      });
                    }}
                    placeholder={s.label}
                    rows={3}
                    className="rounded-xl resize-none"
                    style={{ border: '1px solid #e0e0e0' }}
                  />
                ) : (
                  <Input
                    value={settings.get(s.key) || ''}
                    onChange={(e) => {
                      setSettings((prev) => {
                        const next = new Map(prev);
                        next.set(s.key, e.target.value);
                        return next;
                      });
                    }}
                    placeholder={s.label}
                    className="rounded-xl h-11"
                    style={{ border: '1px solid #e0e0e0' }}
                  />
                )}
              </div>
            ))}

            {/* Live Mini Preview */}
            <div
              className="rounded-xl p-6 text-center mt-4"
              style={{ background: 'linear-gradient(135deg, #f0faf5 0%, #d4f0e3 50%, #f0faf5 100%)' }}
            >
              <p className="text-3xl mb-1">🛍️</p>
              <h4 className="text-xl font-extrabold mb-1" style={{ color: '#094825' }}>
                {settings.get('hero_title') || 'عنوان رئيسي'}
              </h4>
              <p className="text-base font-bold mb-2" style={{ color: '#1a8449' }}>
                {settings.get('hero_subtitle') || 'عنوان فرعي'}
              </p>
              <p className="text-sm mb-3" style={{ color: '#4b5563' }}>
                {settings.get('hero_description') || 'وصف'}
              </p>
              <div className="flex justify-center gap-3">
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold text-white"
                  style={{ background: '#1a8449' }}
                >
                  {settings.get('cta_primary_text') || 'زر رئيسي'}
                </span>
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{ border: '2px solid #1a8449', color: '#1a8449' }}
                >
                  {settings.get('cta_secondary_text') || 'زر ثانوي'}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Store Settings */}
        <TabsContent value="store">
          <div className="sa-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-5 h-5" style={{ color: '#000000' }} />
              <h3 className="text-lg font-extrabold" style={{ color: '#000000' }}>
                🏪 معلومات المتجر
              </h3>
            </div>

            {storeSettings.map((s) => (
              <div key={s.key}>
                <Label
                  className="block text-sm font-bold mb-2"
                  style={{ color: '#000000' }}
                >
                  {s.label}
                </Label>
                {s.type === 'textarea' ? (
                  <Textarea
                    value={settings.get(s.key) || ''}
                    onChange={(e) => {
                      setSettings((prev) => {
                        const next = new Map(prev);
                        next.set(s.key, e.target.value);
                        return next;
                      });
                    }}
                    placeholder={s.label}
                    rows={3}
                    className="rounded-xl resize-none"
                    style={{ border: '1px solid #e0e0e0' }}
                  />
                ) : (
                  <Input
                    value={settings.get(s.key) || ''}
                    onChange={(e) => {
                      setSettings((prev) => {
                        const next = new Map(prev);
                        next.set(s.key, e.target.value);
                        return next;
                      });
                    }}
                    placeholder={s.label}
                    dir={s.key.includes('email') || s.key.includes('number') ? 'ltr' : 'rtl'}
                    className="rounded-xl h-11"
                    style={{ border: '1px solid #e0e0e0' }}
                  />
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing">
          <div className="sa-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5" style={{ color: '#000000' }} />
              <h3 className="text-lg font-extrabold" style={{ color: '#000000' }}>
                💰 الأسعار
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pricingSettings.map((s) => (
                <div key={s.key}>
                  <Label
                    className="block text-sm font-bold mb-2"
                    style={{ color: '#000000' }}
                  >
                    {s.icon} {s.label}
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
                    type="number"
                    dir="ltr"
                    placeholder={s.label}
                    className="rounded-xl h-11"
                    style={{ border: '1px solid #e0e0e0' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-4" style={{ borderTop: '1px solid #e5e5e5' }}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="sa-btn-primary px-8"
        >
          <Save className="w-4 h-4 ml-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
        </Button>
      </div>
    </div>
  );
}
