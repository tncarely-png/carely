'use client';

import { useAppStore, useAuthStore } from '@/store';
import { getWhatsAppLink } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, LayoutDashboard } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const navigate = useAppStore((s) => s.navigate);
  const selectedPlan = useAppStore((s) => s.selectedPlan);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4" dir="rtl">
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Animated Checkmark */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-carely-green flex items-center justify-center animate-bounce-once">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-carely-green/20 animate-ping" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-carely-dark">
          شكرًا! طلبك وصلنا ✅
        </h1>
        <p className="text-carely-gray text-base leading-relaxed">
          راح يتواصل معاك فريقنا على واتساب في أقل من ساعة لتفعيل اشتراكك
        </p>

        {/* Order Details Card */}
        <Card className="carely-card carely-top-accent text-right">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-carely-dark text-sm">تفاصيل الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-carely-gray">العميل</span>
                <span className="font-semibold text-carely-dark">{user?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carely-gray">الباقة</span>
                <span className="font-semibold text-carely-dark">
                  {selectedPlan ? { silver: '🥈 كيرلي سيلفر', gold: '🥇 كيرلي ڨولد' }[selectedPlan] : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-carely-gray">الحالة</span>
                <span className="font-semibold text-yellow-600">⏳ في الانتظار</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="carely-btn-primary h-12 text-base">
            <a href={getWhatsAppLink('مرحبا، أنا بعثت طلب اشتراك و حاب نعرف الحالة')} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 ml-2" />
              تواصل معانا على واتساب
            </a>
          </Button>
          <Button
            className="carely-btn-outline h-12 text-base"
            onClick={() => navigate('dashboard')}
          >
            <LayoutDashboard className="h-5 w-5 ml-2" />
            روح للداشبورد
          </Button>
        </div>
      </div>

      {/* Custom animation style */}
      <style jsx>{`
        @keyframes bounce-once {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
