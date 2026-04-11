'use client';

import { useState } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { PLANS, PAYMENT_METHODS, WILAYAS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, Check } from 'lucide-react';

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const selectedPlan = useAppStore((s) => s.selectedPlan);
  const navigate = useAppStore((s) => s.navigate);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = selectedPlan ? PLANS[selectedPlan] : null;

  // Fallback if no plan selected
  const activePlan = plan || PLANS.silver;
  const activePlanKey = selectedPlan || 'silver';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user?.id) {
      setError('لازم تكون مسجل');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: activePlanKey,
          paymentMethod,
          paymentRef: paymentRef.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        navigate('checkout-success');
      } else {
        setError('حصل مشكل أثناء إرسال الطلب. جرب مرة أخرى');
      }
    } catch {
      setError('حصل مشكل في الاتصال. تحقق من النت و جرب مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-carely-gray">لازم تسجل أول باش تقدر تشتري</p>
        <Button className="carely-btn-primary mt-4" onClick={() => navigate('login')}>
          سجل دخول
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-extrabold text-carely-dark">إتمام الشراء</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary (Left) */}
        <Card className="carely-card carely-top-accent">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-carely-dark">ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-carely-light flex items-center justify-center text-3xl">
                {activePlan.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-carely-dark">{activePlan.nameAr}</h3>
                <p className="text-sm text-carely-gray">{activePlan.duration}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-carely-gray">عدد الأجهزة</span>
                <span className="font-bold text-carely-dark">{activePlan.devicesCount} أجهزة</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carely-gray">المدة</span>
                <span className="font-bold text-carely-dark">12 شهر</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-bold text-carely-dark">المبلغ الإجمالي</span>
              <span className="text-2xl font-extrabold text-carely-green">{activePlan.priceTnd} دت</span>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-bold text-carely-dark mb-2">المميزات:</p>
              <ul className="space-y-1.5">
                {activePlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-carely-gray">
                    <Check className="h-4 w-4 text-carely-green shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form (Right) */}
        <Card className="carely-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-carely-dark">طرق الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Customer Info */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-carely-dark">بياناتك</p>
                <div className="space-y-2">
                  <Label className="text-xs text-carely-gray">الاسم</Label>
                  <Input value={user.name} readOnly className="bg-gray-50 h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-carely-gray">البريد الإلكتروني</Label>
                  <Input value={user.email} readOnly className="bg-gray-50 h-10" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-carely-gray">الهاتف</Label>
                  <Input value={user.phone || ''} readOnly className="bg-gray-50 h-10" dir="ltr" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-carely-gray">العنوان</Label>
                    <Input value={user.address || ''} readOnly className="bg-gray-50 h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-carely-gray">الولاية</Label>
                    <Input value={user.wilaya || ''} readOnly className="bg-gray-50 h-10" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-carely-dark">اختر طريقة الدفع</p>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === pm.id
                          ? 'border-carely-green bg-carely-mint'
                          : 'border-gray-100 hover:border-carely-light'
                      }`}
                    >
                      <RadioGroupItem value={pm.id} id={`pay-${pm.id}`} />
                      <span className="text-xl">{pm.icon}</span>
                      <span className="font-semibold text-sm text-carely-dark">{pm.nameAr}</span>
                      <span className="text-xs text-carely-gray mr-auto">{pm.name}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Reference (for transfer/cash) */}
              {(paymentMethod === 'transfer' || paymentMethod === 'cash') && (
                <div className="space-y-2">
                  <Label className="text-sm text-carely-dark font-semibold">
                    {paymentMethod === 'transfer' ? 'رقم الحوالة' : 'رقم الإيصال'} (اختياري)
                  </Label>
                  <Input
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="أدخل رقم المرجع..."
                    className="w-full h-10"
                    dir="ltr"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                  {error}
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
                    جاري الإرسال...
                  </span>
                ) : (
                  `تأكيد الطلب — ${activePlan.priceTnd} دت`
                )}
              </Button>

              {/* Trust note */}
              <div className="flex items-center justify-center gap-2 text-xs text-carely-gray">
                <Shield className="h-4 w-4 text-carely-green" />
                🔒 دفعك آمن ومشفر 100%
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
