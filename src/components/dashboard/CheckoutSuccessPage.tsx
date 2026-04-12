'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { PLANS, PAYMENT_METHODS, WHATSAPP_NUMBER } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, LayoutDashboard } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const navigate = useAppStore((s) => s.navigate);
  const selectedPlanKey = useAppStore((s) => s.selectedPlan);
  const selectedPaymentMethod = useAppStore((s) => s.selectedPaymentMethod);
  const selectedPlanName = useAppStore((s) => s.selectedPlanName);

  // If user lands here directly without going through checkout, redirect
  useEffect(() => {
    if (!selectedPlanKey) {
      navigate('checkout');
    }
  }, [selectedPlanKey, navigate]);

  const plan = selectedPlanKey ? PLANS[selectedPlanKey] : null;
  const pm = PAYMENT_METHODS.find((p) => p.id === selectedPaymentMethod);

  const displayName = selectedPlanName || plan?.displayName || '—';

  const waMessage = `مرحبا، عندي طلب في الانتظار`;

  if (!selectedPlanKey) return null;

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4" dir="rtl">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Hourglass icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-carely-green flex items-center justify-center">
            <Clock className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-carely-dark">
          طلبك وصلنا! ✅
        </h1>
        <p className="text-carely-gray text-base leading-relaxed">
          راح نراجع وصل الدفع بتاعك ونسلمك الحساب في أقل من 24 ساعة. نتواصل معاك على الواتساب
          على الرقم اللي عطيتنا
        </p>

        {/* Order Summary Card */}
        <Card className="carely-card carely-top-accent text-right">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-carely-dark text-sm">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-carely-gray">الباقة</span>
                <span className="font-semibold text-carely-dark">
                  {plan ? `${plan.icon} ${displayName}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-carely-gray">المبلغ</span>
                <span className="font-semibold text-carely-green">
                  {plan ? `${plan.priceTnd} دت` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-carely-gray">طريقة الدفع</span>
                <span className="font-semibold text-carely-dark">{pm?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carely-gray">الحالة</span>
                <span className="font-semibold text-yellow-600">في الانتظار ⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp CTA */}
        <Button asChild className="carely-btn-primary h-12 text-base w-full">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-5 w-5 ml-2" />
            📲 تابع طلبك على واتساب
          </a>
        </Button>

        {/* Dashboard link */}
        <Button
          className="carely-btn-outline h-11 text-sm w-full"
          onClick={() => navigate('dashboard')}
        >
          <LayoutDashboard className="h-4 w-4 ml-1" />
          روح للداشبورد
        </Button>

        <p className="text-xs text-carely-gray">
          أي سؤال؟ تواصل معانا في أي وقت على واتساب 💬
        </p>
      </div>
    </div>
  );
}
