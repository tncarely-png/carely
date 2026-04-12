'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { WILAYAS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Save, Smartphone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    wilaya: user?.wilaya || '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!form.name.trim()) {
      setErrorMsg('الاسم لازم');
      return;
    }

    setLoading(true);
    const success = await updateProfile({
      name: form.name,
      phone: form.phone,
      address: form.address,
      wilaya: form.wilaya,
    });
    setLoading(false);

    if (success) {
      setSuccessMsg('تم تحديث البيانات بنجاح ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg('حصل مشكل. جرب مرة أخرى');
    }
  };

  if (!user) {
    return (
      <div className="space-y-6" dir="rtl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-extrabold text-carely-dark">حسابي</h1>

      {/* Account Info Summary */}
      <Card className="carely-card bg-gradient-to-l from-carely-light to-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-carely-green flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-carely-dark truncate">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-carely-gray">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span dir="ltr">{user.phone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Edit Form */}
      <Card className="carely-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-carely-dark">👤 البيانات الشخصية</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">الاسم الكامل</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-11"
              />
            </div>

            {/* Phone (display only - changed via OTP) */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">رقم الهاتف</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+216 XX XXX XXX"
                className="w-full h-11"
                dir="ltr"
              />
              <p className="text-xs text-carely-gray">رقم الهاتف هو وسيلة الدخول لحسابك</p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">العنوان</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full min-h-[80px]"
                rows={2}
                placeholder="شارع الحبيب بورقيبة، تونس العاصمة"
              />
            </div>

            {/* Wilaya */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">الولاية</Label>
              <Select
                value={form.wilaya}
                onValueChange={(val) => setForm((p) => ({ ...p, wilaya: val }))}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="اختار الولاية" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto carely-scroll">
                  {WILAYAS.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Messages */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm text-center font-medium">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="carely-btn-primary h-11 text-base disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="carely-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-carely-dark flex items-center gap-2">
            <Shield className="h-5 w-5 text-carely-green" />
            الأمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-carely-mint">
              <div className="w-10 h-10 rounded-full bg-carely-green/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-carely-green" />
              </div>
              <div>
                <p className="text-sm font-bold text-carely-dark">الدخول برمز OTP</p>
                <p className="text-xs text-carely-gray">حسابك محمي برمز تفعيل يوصلك على هاتفك</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
              <div className="text-green-600 text-lg">✅</div>
              <p className="text-sm text-carely-gray">
                ما عندكش كلمة سر — الدخول يكون فقط بالهاتف والرمز
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
