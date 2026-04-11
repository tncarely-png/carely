'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  Award,
  Crown,
  Key,
  ClipboardList,
  AlertTriangle,
  Eye,
  MessageCircle,
  RefreshCw,
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
import { PLANS, SUBSCRIPTION_STATUS, ORDER_STATUS, getWhatsAppLink } from '@/lib/constants';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  silverActive: number;
  goldActive: number;
  availableLicenses: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  plan: string;
  amountTnd: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ExpiringSub {
  id: string;
  plan: string;
  expiresAt: string;
  daysRemaining: number;
  user: {
    id: string;
    name: string;
    phone: string | null;
  };
}

function StatCard({ emoji, label, value, subValue, className }: {
  emoji: string;
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}) {
  return (
    <Card className={`carely-card ${className || ''}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-carely-mint flex items-center justify-center text-2xl shrink-0">
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-carely-gray/60 font-medium">{label}</p>
          <p className="text-xl font-bold text-carely-dark">{value}</p>
          {subValue && <p className="text-xs text-carely-gray/50">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
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
      const [statsRes, ordersRes, subsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/orders?status=paid&limit=10'),
        fetch('/api/subscriptions?status=active&limit=50'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setRecentOrders(Array.isArray(data) ? data.slice(0, 10) : []);
      }

      if (subsRes.ok) {
        const data = await subsRes.json();
        const subs = Array.isArray(data) ? data : [];
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiring = subs
          .filter((s: { expiresAt: string | null }) => {
            if (!s.expiresAt) return false;
            const expDate = new Date(s.expiresAt);
            return expDate > now && expDate <= thirtyDaysFromNow;
          })
          .map((s: { id: string; plan: string; expiresAt: string; user: { id: string; name: string; phone: string | null } }) => ({
            id: s.id,
            plan: s.plan,
            expiresAt: s.expiresAt,
            daysRemaining: Math.ceil((new Date(s.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            user: s.user,
          }))
          .sort((a: ExpiringSub, b: ExpiringSub) => a.daysRemaining - b.daysRemaining);
        setExpiringSubs(expiring);
      }
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
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-carely-gray mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline" className="carely-btn-outline">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* First Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard emoji="👥" label="إجمالي الزبائن" value={stats?.totalUsers ?? 0} />
        <StatCard emoji="✅" label="اشتراكات نشطة" value={stats?.activeSubscriptions ?? 0} />
        <StatCard emoji="⏳" label="اشتراكات منتهية" value={stats?.expiredSubscriptions ?? 0} />
        <StatCard
          emoji="💰"
          label="إجمالي الإيرادات"
          value={`${(stats?.totalRevenue ?? 0).toFixed(0)}`}
          subValue="دت"
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard emoji="🥈" label="Silver نشط" value={stats?.silverActive ?? 0} />
        <StatCard emoji="🥇" label="Gold نشط" value={stats?.goldActive ?? 0} />
        <StatCard emoji="🔑" label="كودات متاحة" value={stats?.availableLicenses ?? 0} />
        <StatCard emoji="📋" label="طلبات معلقة" value={stats?.pendingOrders ?? 0} />
      </div>

      {/* Recent Orders */}
      <Card className="carely-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-carely-dark flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-carely-green" />
              آخر الطلبات
            </h3>
            <Button
              variant="ghost"
              onClick={() => navigate('admin-orders')}
              className="text-carely-green text-sm font-semibold"
            >
              عرض الكل
            </Button>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto carely-scroll rounded-xl border border-carely-green/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-carely-mint/50 hover:bg-carely-mint/50">
                  <TableHead className="font-bold text-carely-dark">اسم الزبون</TableHead>
                  <TableHead className="font-bold text-carely-dark">الباقة</TableHead>
                  <TableHead className="font-bold text-carely-dark">المبلغ</TableHead>
                  <TableHead className="font-bold text-carely-dark">الحالة</TableHead>
                  <TableHead className="font-bold text-carely-dark">التاريخ</TableHead>
                  <TableHead className="font-bold text-carely-dark">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-carely-gray/60">
                      لا توجد طلبات بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-carely-mint/30 transition-colors">
                      <TableCell className="font-semibold text-carely-dark">{order.user?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={order.plan === 'gold' ? 'border-carely-gold text-carely-gold' : 'border-carely-silver text-carely-silver'}>
                          {PLANS[order.plan as keyof typeof PLANS]?.icon} {PLANS[order.plan as keyof typeof PLANS]?.nameAr || order.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">{order.amountTnd.toFixed(2)} دت</TableCell>
                      <TableCell>
                        <Badge className={(ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color) || 'bg-gray-100 text-gray-800'}>
                          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-carely-gray text-sm">
                        {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs carely-btn-outline py-1 px-3"
                          onClick={() => navigate('admin-orders')}
                        >
                          <Eye className="w-3 h-3 ml-1" />
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Alert */}
      <Card className="carely-card border-yellow-300 border-2">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-carely-dark">اشتراكات تنتهي قريباً</h3>
          </div>

          {expiringSubs.length === 0 ? (
            <p className="text-carely-gray/60 text-center py-6">لا توجد اشتراكات تنتهي خلال 30 يوم</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto carely-scroll">
              {expiringSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-bold text-carely-dark truncate">{sub.user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={sub.plan === 'gold' ? 'border-carely-gold text-carely-gold' : 'border-carely-silver text-carely-silver'}>
                          {PLANS[sub.plan as keyof typeof PLANS]?.icon} {PLANS[sub.plan as keyof typeof PLANS]?.nameAr || sub.plan}
                        </Badge>
                        <span className={`text-sm font-bold ${sub.daysRemaining <= 7 ? 'text-red-500' : 'text-yellow-600'}`}>
                          ينتهي في {sub.daysRemaining} يوم
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-carely-green carely-btn-outline py-1 px-3"
                      onClick={() => {
                        setSelectedUserId(sub.user.id);
                        navigate('admin-user-detail');
                      }}
                    >
                      <Eye className="w-3 h-3 ml-1" />
                      عرض
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-full"
                      onClick={() => {
                        const msg = `مرحبا ${sub.user.name}، اشتراكك في Carely (${PLANS[sub.plan as keyof typeof PLANS]?.nameAr}) ينتهي خلال ${sub.daysRemaining} يوم. هل تريد التجديد؟`;
                        window.open(getWhatsAppLink(msg), '_blank');
                      }}
                    >
                      <MessageCircle className="w-3 h-3 ml-1" />
                      تواصل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
