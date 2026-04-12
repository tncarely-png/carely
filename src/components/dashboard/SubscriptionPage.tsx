'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { PLANS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Copy, ExternalLink, Check } from 'lucide-react';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  qustodioEmail: string | null;
  qustodioPassword: string | null;
  activationCode: string | null;
  devicesCount: number;
  startsAt: string | null;
  expiresAt: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      title={copied ? 'تم النسخ! ✓' : 'نسخ'}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-600" />
          <span className="text-green-600">تم النسخ! ✓</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-carely-gray" />
          <span className="text-carely-gray hover:text-carely-green">نسخ</span>
        </>
      )}
    </button>
  );
}

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchSub() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/subscriptions?userId=${user.id}`);
        const data = await res.json();
        if (data.subscriptions && data.subscriptions.length > 0) {
          setSubscription(data.subscriptions[0]);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchSub();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  const planData = subscription
    ? PLANS[subscription.plan as keyof typeof PLANS]
    : null;

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-extrabold text-carely-dark">اشتراكي</h1>

      {!subscription ? (
        <Card className="carely-card">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-carely-dark mb-2">ما عندكش اشتراك</h3>
            <p className="text-carely-gray">اشتري باقة Carely وابدأ بحماية عائلتك</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Qustodio Credentials Card */}
          <Card className="carely-card carely-top-accent">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-carely-dark">
                🔑 بيانات حساب Qustodio بتاعك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Qustodio Email */}
              <div className="bg-carely-mint rounded-xl p-4">
                <p className="text-xs text-carely-gray mb-1 font-semibold">Qustodio Email</p>
                <div className="flex items-center justify-between gap-2">
                  <Input
                    readOnly
                    value={subscription.qustodioEmail || 'لم يتم تفعيله بعد'}
                    className="bg-white font-mono text-sm h-10"
                    dir="ltr"
                  />
                  {subscription.qustodioEmail && <CopyButton text={subscription.qustodioEmail} />}
                </div>
              </div>

              {/* Qustodio Password */}
              <div className="bg-carely-mint rounded-xl p-4">
                <p className="text-xs text-carely-gray mb-1 font-semibold">Qustodio Password</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      readOnly
                      type={showPassword ? 'text' : 'password'}
                      value={subscription.qustodioPassword || 'لم يتم تفعيله بعد'}
                      className="bg-white font-mono text-sm h-10 pl-10"
                      dir="ltr"
                    />
                    {subscription.qustodioPassword && (
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-carely-gray hover:text-carely-dark"
                        type="button"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  {subscription.qustodioPassword && <CopyButton text={subscription.qustodioPassword} />}
                </div>
              </div>

              {/* Activation Code */}
              {subscription.activationCode && (
                <div className="bg-carely-mint rounded-xl p-4">
                  <p className="text-xs text-carely-gray mb-1 font-semibold">كود التفعيل</p>
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      readOnly
                      value={subscription.activationCode}
                      className="bg-white font-mono text-sm h-10"
                      dir="ltr"
                    />
                    <CopyButton text={subscription.activationCode} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="carely-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-carely-dark">
                📱 كيف تفعّل Qustodio؟
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {[
                  'انسخ البريد الإلكتروني وكلمة السر من فوق',
                  'روح على https://family.qustodio.com وسجّل دخول بالبيانات',
                  'نزّل تطبيق Qustodio Kids على أجهزة الأولاد',
                  'تابع وحكم في كل حاجة من Dashboard',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-carely-green text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-carely-gray leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>

              <Button asChild className="carely-btn-primary mt-6">
                <a href="https://family.qustodio.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 ml-2" />
                  افتح Qustodio Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Plan Details Card */}
          {planData && (
            <Card className="carely-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-carely-dark flex items-center gap-2">
                  <span className="text-2xl">{planData.icon}</span>
                  تفاصيل الباقة — {planData.nameAr}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-carely-mint rounded-xl p-3 text-center">
                    <p className="text-xs text-carely-gray">المبلغ</p>
                    <p className="text-lg font-bold text-carely-dark">{planData.priceTnd} دت</p>
                  </div>
                  <div className="bg-carely-mint rounded-xl p-3 text-center">
                    <p className="text-xs text-carely-gray">الأجهزة</p>
                    <p className="text-lg font-bold text-carely-dark">{planData.devicesCount}</p>
                  </div>
                  <div className="bg-carely-mint rounded-xl p-3 text-center">
                    <p className="text-xs text-carely-gray">المدة</p>
                    <p className="text-sm font-bold text-carely-dark">12 شهر</p>
                  </div>
                </div>

                <p className="text-sm font-bold text-carely-dark mb-2">المميزات:</p>
                <ul className="space-y-1.5">
                  {planData.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-carely-gray">
                      <span className="text-carely-green text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-carely-gray">الحالة:</span>
                  <Badge className={
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : subscription.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {subscription.status === 'active' ? 'نشط ✅' :
                     subscription.status === 'pending' ? 'في الانتظار ⏳' :
                     subscription.status === 'expired' ? 'منتهي ❌' : subscription.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
