'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Mail, ClipboardList, ShoppingBag, RefreshCw, AlertTriangle } from 'lucide-react';
import { PLANS, SUBSCRIPTION_STATUS } from '@/lib/constants';

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

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const openWhatsAppPopup = useAppStore((s) => s.openWhatsAppPopup);
  const setSelectedPlan = useAppStore((s) => s.setSelectedPlan);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSub = useCallback(async () => {
    if (!user?.id) return;
    setError(false);
    try {
      const res = await fetch(`/api/subscriptions?userId=${user.id}`);
      const data = await res.json();
      if (data.subscriptions && data.subscriptions.length > 0) {
        setSubscription(data.subscriptions[0]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSub();
  }, [fetchSub]);

  const getDaysRemaining = () => {
    if (!subscription?.expiresAt) return 0;
    const exp = new Date(subscription.expiresAt);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgressValue = () => {
    if (!subscription?.startsAt || !subscription?.expiresAt) return 0;
    const start = new Date(subscription.startsAt).getTime();
    const end = new Date(subscription.expiresAt).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const planData = subscription ? PLANS[subscription.plan as keyof typeof PLANS] : null;
  const statusInfo = subscription
    ? SUBSCRIPTION_STATUS[subscription.status as keyof typeof SUBSCRIPTION_STATUS]
    : null;

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl md:text-3xl font-extrabold text-carely-dark">
          أهلا، {user?.name}! 👋
        </h1>
        <Card className="carely-card">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-carely-dark mb-2">حصل مشكال في تحميل البيانات</h3>
            <p className="text-carely-gray mb-6">تأكد من اتصالك بالإنترنت وجرب مرة أخرى</p>
            <Button
              className="carely-btn-primary text-base"
              onClick={fetchSub}
            >
              <RefreshCw className="h-5 w-5 ml-2" />
              أعد المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-carely-dark">
          أهلا، {user?.name}! 👋
        </h1>
        <p className="text-carely-gray mt-1">هاهي لوحة التحكم بتاعك</p>
      </div>

      {/* Subscription Status Card */}
      <Card className="carely-card overflow-hidden">
        {!subscription ? (
          /* No Subscription */
          <CardContent className="p-6 md:p-8 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-carely-dark mb-2">ما عندكش اشتراك بعد</h3>
            <p className="text-carely-gray mb-6">ابدأ بحماية عائلتك الرقمية مع Carely.tn</p>
            <Button
              className="carely-btn-primary text-base"
              onClick={() => navigate('pricing')}
            >
              <ShoppingBag className="h-5 w-5 ml-2" />
              اشتري باقتك الأولى
            </Button>
          </CardContent>
        ) : subscription.status === 'active' ? (
          /* Active */
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{planData?.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-carely-dark">
                    {planData?.nameAr || subscription.plan}
                  </h3>
                  <Badge className={`mt-1 ${statusInfo?.color}`}>
                    اشتراكك نشط ✅
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-carely-mint rounded-xl p-3 text-center">
                <p className="text-xs text-carely-gray">الأجهزة</p>
                <p className="text-lg font-bold text-carely-dark">{subscription.devicesCount}</p>
              </div>
              <div className="bg-carely-mint rounded-xl p-3 text-center">
                <p className="text-xs text-carely-gray">تاريخ الانتهاء</p>
                <p className="text-sm font-bold text-carely-dark">
                  {subscription.expiresAt
                    ? new Date(subscription.expiresAt).toLocaleDateString('ar-TN')
                    : '—'}
                </p>
              </div>
              <div className="bg-carely-mint rounded-xl p-3 text-center">
                <p className="text-xs text-carely-gray">الأيام المتبقية</p>
                <p className="text-lg font-bold text-carely-green">{getDaysRemaining()} يوم</p>
              </div>
              <div className="bg-carely-mint rounded-xl p-3 text-center">
                <p className="text-xs text-carely-gray">المدة</p>
                <p className="text-sm font-bold text-carely-dark">12 شهر</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs text-carely-gray mb-1">
                <span>بداية الاشتراك</span>
                <span>{getDaysRemaining()} يوم متبقي</span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
            </div>
          </CardContent>
        ) : subscription.status === 'expired' ? (
          /* Expired */
          <CardContent className="p-6 md:p-8 text-center">
            <div className="bg-red-50 rounded-2xl p-4 mb-4">
              <span className="text-3xl">❌</span>
              <h3 className="text-xl font-bold text-red-700 mt-2">اشتراكك انتهى</h3>
              <p className="text-red-600 text-sm mt-1">اشتراكك {planData?.nameAr} خلص. جدده الآن!</p>
            </div>
            <Button
              className="carely-btn-primary text-base"
              onClick={() => {
                if (subscription.plan) {
                  setSelectedPlan(subscription.plan as 'silver' | 'gold');
                }
                navigate('checkout');
              }}
            >
              جدد اشتراكك الآن
            </Button>
          </CardContent>
        ) : (
          /* Pending */
          <CardContent className="p-6 md:p-8 text-center">
            <div className="bg-yellow-50 rounded-2xl p-4 mb-4">
              <span className="text-3xl">⏳</span>
              <h3 className="text-xl font-bold text-yellow-700 mt-2">في انتظار تفعيل اشتراكك</h3>
              <p className="text-yellow-600 text-sm mt-1">
                فريقنا راح يفعّل اشتراكك في أقرب وقت
              </p>
            </div>
            <Button className="carely-btn-primary text-base" onClick={() => openWhatsAppPopup('مرحبا، أنا في انتظار تفعيل اشتراكي')}>
                <MessageCircle className="h-5 w-5 ml-2" />
                تواصل معانا على واتساب
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-carely-dark mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className="carely-card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('dashboard-subscription')}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-carely-light flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-carely-green" />
              </div>
              <div>
                <p className="font-bold text-carely-dark">📧 بيانات الدخول</p>
                <p className="text-xs text-carely-gray">Qustodio Email و Password</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="carely-card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('dashboard-orders')}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-carely-light flex items-center justify-center shrink-0">
                <ClipboardList className="h-6 w-6 text-carely-green" />
              </div>
              <div>
                <p className="font-bold text-carely-dark">📋 سجل الدفع</p>
                <p className="text-xs text-carely-gray">كل طلباتك في مكان واحد</p>
              </div>
            </CardContent>
          </Card>

          <Card className="carely-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openWhatsAppPopup()}>
            <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-carely-dark">💬 تواصل معانا</p>
                  <p className="text-xs text-carely-gray">عبر واتساب مباشرة</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
