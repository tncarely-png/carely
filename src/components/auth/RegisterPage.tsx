'use client';

import { useState } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { WILAYAS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    wilaya: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const register = useAuthStore((s) => s.register);
  const navigate = useAppStore((s) => s.navigate);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'الاسم لازم';
    if (!form.email.trim()) errs.email = 'الإيميل لازم';
    if (!form.password) errs.password = 'كلمة السر لازم';
    else if (form.password.length < 8) errs.password = 'كلمة السر لازم تكون 8 حروف على الأقل';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'كلمات السر ما تطابقوش';
    if (!form.phone.trim()) errs.phone = 'رقم الهاتف لازم';
    if (!form.address.trim()) errs.address = 'العنوان لازم';
    if (!form.wilaya) errs.wilaya = 'الولاية لازم';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const success = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      wilaya: form.wilaya,
    });
    setLoading(false);

    if (success) {
      navigate('dashboard');
    } else {
      setApiError('حصل مشكل أثناء التسجيل. جرب مرة أخرى أو تواصل معانا');
    }
  };

  return (
    <div className="min-h-screen bg-carely-mint flex items-center justify-center p-4 py-8" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-3">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-carely-dark">Carely.tn</h1>
        </div>

        {/* Register Card */}
        <Card className="carely-card p-6">
          <CardContent className="p-0">
            <h2 className="text-xl font-bold text-carely-dark mb-6 text-center">
              إنشاء حساب جديد
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-carely-dark font-semibold">
                  الاسم الكامل
                </Label>
                <Input
                  id="name"
                  placeholder="محمد بن علي"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full h-11"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-carely-dark font-semibold">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full h-11"
                  dir="ltr"
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-carely-dark font-semibold">
                  كلمة السر
                </Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="8 حروف على الأقل"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full h-11"
                  dir="ltr"
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-carely-dark font-semibold">
                  تأكيد كلمة السر
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="أعد كتابة كلمة السر"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full h-11"
                  dir="ltr"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-carely-dark font-semibold">
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  placeholder="2X XXX XXX"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full h-11"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-carely-dark font-semibold">
                  العنوان الكامل
                </Label>
                <Textarea
                  id="address"
                  placeholder="شارع الحبيب بورقيبة، تونس العاصمة"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full min-h-[80px]"
                  rows={2}
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
              </div>

              {/* Wilaya */}
              <div className="space-y-2">
                <Label className="text-carely-dark font-semibold">
                  الولاية
                </Label>
                <Select
                  value={form.wilaya}
                  onValueChange={(val) => updateField('wilaya', val)}
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
                {errors.wilaya && <p className="text-red-500 text-xs">{errors.wilaya}</p>}
              </div>

              {/* API Error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="carely-btn-primary w-full h-12 text-base disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري التسجيل...
                  </span>
                ) : (
                  'إنشاء حساب'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-carely-gray">
                عندك حساب؟{' '}
                <button
                  onClick={() => navigate('login')}
                  className="text-carely-green font-bold hover:underline"
                >
                  سجل دخول
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
