'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { PLANS, PAYMENT_METHODS, ORDER_STATUS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/constants';

interface Order {
  id: string;
  plan: string;
  amountTnd: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  paymentRef: string | null;
}

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    const info = ORDER_STATUS[status as keyof typeof ORDER_STATUS];
    if (info) return <Badge className={info.color}>{info.label}</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  };

  const getPaymentMethodName = (method: string) => {
    const pm = PAYMENT_METHODS.find((p) => p.id === method);
    return pm ? `${pm.icon} ${pm.nameAr}` : method;
  };

  const getPlanName = (plan: string) => {
    const p = PLANS[plan as keyof typeof PLANS];
    return p ? `${p.icon} ${p.nameAr}` : plan;
  };

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-extrabold text-carely-dark">سجل الدفع</h1>

      {orders.length === 0 ? (
        <Card className="carely-card">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-carely-dark mb-2">ما عندكش طلبات بعد</h3>
            <p className="text-carely-gray mb-6">اشتري باقتك الأولى وابدأ بحماية عائلتك!</p>
            <Button asChild className="carely-btn-primary">
              <a href={getWhatsAppLink('مرحبا، أريد شراء اشتراك Carely')} target="_blank" rel="noopener noreferrer">
                <ShoppingBag className="h-5 w-5 ml-2" />
                تواصل معانا لطلب باقة
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="carely-card overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-carely-dark">
                  كل طلباتك ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-carely-light bg-carely-mint/50">
                        <th className="text-right text-xs font-bold text-carely-dark p-3">رقم الطلب</th>
                        <th className="text-right text-xs font-bold text-carely-dark p-3">الباقة</th>
                        <th className="text-right text-xs font-bold text-carely-dark p-3">المبلغ</th>
                        <th className="text-right text-xs font-bold text-carely-dark p-3">طريقة الدفع</th>
                        <th className="text-right text-xs font-bold text-carely-dark p-3">الحالة</th>
                        <th className="text-right text-xs font-bold text-carely-dark p-3">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-carely-light/50 hover:bg-carely-mint/30 transition-colors">
                          <td className="p-3 text-sm font-mono text-carely-gray" dir="ltr">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="p-3 text-sm font-semibold text-carely-dark">
                            {getPlanName(order.plan)}
                          </td>
                          <td className="p-3 text-sm font-bold text-carely-green">
                            {order.amountTnd} دت
                          </td>
                          <td className="p-3 text-sm text-carely-gray">
                            {getPaymentMethodName(order.paymentMethod)}
                          </td>
                          <td className="p-3">{getStatusBadge(order.status)}</td>
                          <td className="p-3 text-xs text-carely-gray">
                            {new Date(order.createdAt).toLocaleDateString('ar-TN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="carely-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-carely-gray" dir="ltr">
                      #{order.id.slice(0, 8)}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-carely-dark">{getPlanName(order.plan)}</span>
                    <span className="font-bold text-carely-green">{order.amountTnd} دت</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-carely-gray">
                    <span>{getPaymentMethodName(order.paymentMethod)}</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
