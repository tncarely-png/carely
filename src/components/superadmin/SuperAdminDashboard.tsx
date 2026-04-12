'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Key,
  RefreshCw,
  AlertTriangle,
  Eye,
  MessageCircle,
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
import { PLANS, ORDER_STATUS, SUBSCRIPTION_STATUS } from '@/lib/constants';

interface Stats {
  totalUsers: number;
  activeSubs: number;
  pendingOrders: number;
  availableLicenses: number;
}

interface RecentOrder {
  id: string;
  plan: string;
  amountTnd: number;
  status: string;
  createdAt: string;
  user: { name: string };
}

interface ExpiringSub {
  id: string;
  plan: string;
  expiresAt: string;
  daysRemaining: number;
  user: { id: string; name: string; phone: string | null };
}

function StatCard({ emoji, label, value }: {
  emoji: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="sa-card p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: '#f0f0f0' }}
      >
        {emoji}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium" style={{ color: '#888888' }}>{label}</p>
        <p className="text-2xl font-extrabold" style={{ color: '#000000' }}>{value}</p>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { navigate, setSelectedUserId } = useAppStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [expiringSubs, setExpiringSubs] = useState<ExpiringSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/superadmin-stats');
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const data = await res.json();

      setStats({
        totalUsers: data.totalUsers,
        activeSubs: data.activeSubs,
        pendingOrders: data.pendingOrders,
        availableLicenses: data.availableLicenses,
      });
      setRecentOrders((data.recentOrders || []).slice(0, 10));
      setExpiringSubs(data.expiringSubs || []);
    } catch {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#888888' }} />
        <p className="mb-4" style={{ color: '#666666' }}>{error}</p>
        <Button onClick={fetchData} variant="outline" className="sa-btn-primary">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard emoji="👥" label="المستخدمون" value={stats?.totalUsers ?? 0} />
        <StatCard emoji="✅" label="اشتراكات نشطة" value={stats?.activeSubs ?? 0} />
        <StatCard emoji="📋" label="طلبات معلقة" value={stats?.pendingOrders ?? 0} />
        <StatCard emoji="🔑" label="تراخيص متاحة" value={stats?.availableLicenses ?? 0} />
      </div>

      {/* Recent Orders */}
      <div className="sa-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold flex items-center gap-2" style={{ color: '#000000' }}>
            <Clock className="w-5 h-5" style={{ color: '#888888' }} />
            آخر الطلبات
          </h3>
          <Button
            variant="ghost"
            onClick={() => navigate('superadmin-orders')}
            className="text-sm font-bold"
            style={{ color: '#000000' }}
          >
            عرض الكل
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e5e5e5' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#f5f5f5' }}>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الزبون</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الباقة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>المبلغ</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الحالة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8" style={{ color: '#888888' }}>
                    لا توجد طلبات بعد
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id} className="transition-colors" style={{ cursor: 'pointer' }}>
                    <TableCell className="font-semibold" style={{ color: '#000000' }}>
                      {order.user?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {PLANS[order.plan as keyof typeof PLANS]?.icon}{' '}
                        {PLANS[order.plan as keyof typeof PLANS]?.nameAr || order.plan}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold">{order.amountTnd.toFixed(2)} دت</TableCell>
                    <TableCell>
                      <Badge
                        className={(ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color) || 'bg-gray-100 text-gray-800'}
                      >
                        {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#888888' }}>
                      {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Expiring Subscriptions */}
      <div className="sa-card p-6" style={{ border: '2px solid #fbbf24' }}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5" style={{ color: '#d97706' }} />
          <h3 className="text-lg font-extrabold" style={{ color: '#000000' }}>
            اشتراكات تنتهي قريباً
          </h3>
        </div>

        {expiringSubs.length === 0 ? (
          <p className="text-center py-6" style={{ color: '#888888' }}>
            لا توجد اشتراكات تنتهي خلال 30 يوم
          </p>
        ) : (
          <div className="space-y-3">
            {expiringSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <div className="min-w-0">
                  <p className="font-bold truncate" style={{ color: '#000000' }}>{sub.user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">
                      {PLANS[sub.plan as keyof typeof PLANS]?.icon}{' '}
                      {PLANS[sub.plan as keyof typeof PLANS]?.nameAr || sub.plan}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: sub.daysRemaining <= 7 ? '#dc2626' : '#d97706' }}
                    >
                      ينتهي في {sub.daysRemaining} يوم
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="sa-btn-primary py-1 px-3 text-xs"
                    onClick={() => {
                      setSelectedUserId(sub.user.id);
                      navigate('superadmin-users');
                    }}
                  >
                    <Eye className="w-3 h-3 ml-1" />
                    عرض
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
