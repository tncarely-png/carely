'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  RefreshCw,
  Eye,
  CheckCircle2,
 DollarSign,
  AlertTriangle,
  Image,
 Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/store';
import { PLANS, ORDER_STATUS } from '@/lib/constants';

interface OrderRow {
  id: string;
  userId: string;
  plan: string;
  amountTnd: number;
  paymentMethod: string;
  paymentRef: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const statusFilters = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'معلق' },
  { id: 'paid', label: 'مدفوع' },
  { id: 'failed', label: 'فشل' },
] as const;

export default function AdminOrders() {
  const { navigate, setSelectedUserId } = useAppStore();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Revenue calculations
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amountTnd, 0);
  const silverRevenue = orders
    .filter((o) => o.status === 'paid' && o.plan === 'silver')
    .reduce((sum, o) => sum + o.amountTnd, 0);
  const goldRevenue = orders
    .filter((o) => o.status === 'paid' && o.plan === 'gold')
    .reduce((sum, o) => sum + o.amountTnd, 0);

  const handleConfirmPayment = async (orderId: string) => {
    setConfirmingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch {
      // silent
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="carely-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0">
              💰
            </div>
            <div>
              <p className="text-xs text-carely-gray/60 font-medium">إجمالي المبيعات</p>
              <p className="text-xl font-bold text-carely-dark">{totalRevenue.toFixed(2)} دت</p>
            </div>
          </CardContent>
        </Card>
        <Card className="carely-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">
              🥈
            </div>
            <div>
              <p className="text-xs text-carely-gray/60 font-medium">Silver</p>
              <p className="text-xl font-bold text-carely-silver">{silverRevenue.toFixed(2)} دت</p>
            </div>
          </CardContent>
        </Card>
        <Card className="carely-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl shrink-0">
              🥇
            </div>
            <div>
              <p className="text-xs text-carely-gray/60 font-medium">Gold</p>
              <p className="text-xl font-bold text-carely-gold">{goldRevenue.toFixed(2)} دت</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="carely-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={statusFilter === f.id ? 'default' : 'outline'}
                onClick={() => setStatusFilter(f.id)}
                className={`text-xs rounded-full ${
                  statusFilter === f.id
                    ? 'bg-carely-green text-white hover:bg-carely-green/90'
                    : 'carely-btn-outline'
                }`}
              >
                {f.label}
              </Button>
            ))}
            <div className="flex-1" />
            {!loading && (
              <Button size="sm" variant="ghost" onClick={fetchOrders} className="text-carely-green">
                <RefreshCw className="w-3.5 h-3.5 ml-1" />
                تحديث
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <Card className="carely-card">
          <CardContent className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="carely-card">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-500 mb-3">{error}</p>
            <Button onClick={fetchOrders} variant="outline" className="carely-btn-outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="carely-card">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-carely-gray/30 mx-auto mb-3" />
            <p className="text-carely-gray/60">لا توجد طلبات</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="carely-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto carely-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="bg-carely-mint/50 hover:bg-carely-mint/50">
                    <TableHead className="font-bold text-carely-dark">#</TableHead>
                    <TableHead className="font-bold text-carely-dark">الزبون</TableHead>
                    <TableHead className="font-bold text-carely-dark">الباقة</TableHead>
                    <TableHead className="font-bold text-carely-dark">المبلغ</TableHead>
                    <TableHead className="font-bold text-carely-dark">طريقة الدفع</TableHead>
                    <TableHead className="font-bold text-carely-dark">مرجع الدفع</TableHead>
                    <TableHead className="font-bold text-carely-dark">الحالة</TableHead>
                    <TableHead className="font-bold text-carely-dark">التاريخ</TableHead>
                    <TableHead className="font-bold text-carely-dark">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow key={order.id} className="hover:bg-carely-mint/30 transition-colors">
                      <TableCell className="text-sm text-carely-gray/60">{idx + 1}</TableCell>
                      <TableCell className="font-semibold text-carely-dark">{order.user?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={order.plan === 'gold' ? 'border-carely-gold text-carely-gold' : 'border-carely-silver text-carely-silver'}
                        >
                          {PLANS[order.plan as keyof typeof PLANS]?.icon}{' '}
                          {PLANS[order.plan as keyof typeof PLANS]?.nameAr || order.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">{order.amountTnd.toFixed(2)} دت</TableCell>
                      <TableCell className="text-sm text-carely-gray">{order.paymentMethod}</TableCell>
                      <TableCell className="text-sm text-carely-gray font-mono">{order.paymentRef || '—'}</TableCell>
                      <TableCell>
                        <Badge className={ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || 'bg-gray-100 text-gray-800'}>
                          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-carely-gray">
                        {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={confirmingId === order.id}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-full"
                            >
                              {confirmingId === order.id ? (
                                <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 ml-1" />
                              )}
                              تأكيد الدفع
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs carely-btn-outline py-1 px-3"
                            onClick={() => {
                              setSelectedUserId(order.userId);
                              navigate('admin-user-detail');
                            }}
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            عرض الزبون
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
