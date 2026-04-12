'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppStore } from '@/store';

export default function AdminLicenseNew() {
  const { navigate } = useAppStore();

  const [form, setForm] = useState({
    qustodioEmail: '',
    qustodioPassword: '',
    plan: 'silver',
    expiresAt: '',
    purchasedFrom: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    // Validate
    if (!form.qustodioEmail.trim()) {
      setError('إيميل Qustodio مطلوب');
      return;
    }
    if (!form.qustodioPassword.trim()) {
      setError('كلمة مرور Qustodio مطلوبة');
      return;
    }
    if (!form.expiresAt) {
      setError('تاريخ انتهاء الكود مطلوب');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qustodioEmail: form.qustodioEmail.trim(),
          qustodioPassword: form.qustodioPassword.trim(),
          plan: form.plan,
          expiresAt: new Date(form.expiresAt).toISOString(),
          purchasedFrom: form.purchasedFrom.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل إضافة الكود');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('admin-licenses');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الكود');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-carely-dark mb-2">تم إضافة الكود بنجاح!</h2>
        <p className="text-carely-gray/60">جارٍ التحويل لقائمة الكودات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('admin-licenses')}
        className="text-carely-green -mr-2"
      >
        <ArrowRight className="w-4 h-4 ml-1" />
        الرجوع لقائمة الكودات
      </Button>

      {/* Form */}
      <Card className="carely-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-carely-dark">🔑 إضافة كود جديد</CardTitle>
          <p className="text-sm text-carely-gray/60">أضف كود اشتراك Qustodio جديد إلى المخزون</p>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-5">
          {/* Qustodio Email */}
          <div>
            <Label className="text-sm font-medium text-carely-dark mb-2 block">إيميل Qustodio</Label>
            <Input
              type="email"
              value={form.qustodioEmail}
              onChange={(e) => handleChange('qustodioEmail', e.target.value)}
              placeholder="qustodio@example.com"
              className="rounded-lg border-carely-green/20 focus:border-carely-green"
              dir="ltr"
            />
          </div>

          {/* Qustodio Password */}
          <div>
            <Label className="text-sm font-medium text-carely-dark mb-2 block">كلمة مرور Qustodio</Label>
            <Input
              value={form.qustodioPassword}
              onChange={(e) => handleChange('qustodioPassword', e.target.value)}
              placeholder="كلمة مرور الحساب"
              className="rounded-lg border-carely-green/20 focus:border-carely-green"
              dir="ltr"
            />
          </div>

          {/* Plan */}
          <div>
            <Label className="text-sm font-medium text-carely-dark mb-3 block">نوع الباقة</Label>
            <RadioGroup
              value={form.plan}
              onValueChange={(v) => handleChange('plan', v)}
              className="flex gap-4"
              dir="ltr"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="silver" id="silver" />
                <Label htmlFor="silver" className="cursor-pointer text-sm">
                  🥈 Silver
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="gold" id="gold" />
                <Label htmlFor="gold" className="cursor-pointer text-sm">
                  🥇 Gold
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Expiry Date */}
          <div>
            <Label className="text-sm font-medium text-carely-dark mb-2 block">تاريخ انتهاء الكود</Label>
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) => handleChange('expiresAt', e.target.value)}
              className="rounded-lg border-carely-green/20 focus:border-carely-green"
            />
          </div>

          {/* Purchase Source */}
          <div>
            <Label className="text-sm font-medium text-carely-dark mb-2 block">مصدر الشراء</Label>
            <Input
              value={form.purchasedFrom}
              onChange={(e) => handleChange('purchasedFrom', e.target.value)}
              placeholder="مثال: Qustodio Official, Reseller..."
              className="rounded-lg border-carely-green/20 focus:border-carely-green"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium text-carely-dark mb-2 block">ملاحظات</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="ملاحظات إضافية..."
              className="min-h-[80px] rounded-lg border-carely-green/20 focus:border-carely-green"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-carely-green hover:bg-carely-green/90 text-white rounded-full"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-1" />
              )}
              {saving ? 'جارٍ الحفظ...' : 'حفظ الكود'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('admin-licenses')}
              className="carely-btn-outline rounded-full"
            >
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
