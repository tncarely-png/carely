'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PLANS, SUBSCRIPTION_STATUS } from '@/lib/constants';

interface SubRow {
  id: string;
  plan: string;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const statusFilters = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'نشطة' },
  { id: 'expired', label: 'منتهية' },
  { id: 'pending', label: 'معلقة' },
] as const;

const planFilters = [
  { id: 'all', label: 'الكل' },
  { id: 'silver', label: '🥈 Silver' },
  { id: 'gold', label: '🥇 Gold' },
] as const;

export default function AdminSubscriptions() {
  const { navigate, setSelectedSubscriptionId } = useAppStore();
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (planFilter !== 'all') params.set('plan', planFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/subscriptions?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const data = await res.json();
      setSubs(Array.isArray(data) ? data : []);
    } catch {
      setError('حدث خطأ أثناء تحميل الاشتراكات');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, planFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchSubs, 300);
    return () => clearTimeout(debounce);
  }, [fetchSubs]);

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getDaysBadge = (days: number | null, status: string) => {
    if (status === 'expired' || (days !== null && days <= 0)) {
      return <Badge className="bg-red-100 text-red-700">منتهي</Badge>;
    }
    if (days === null) return <span className="text-carely-gray/40 text-sm">—</span>;
    if (days <= 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 font-bold">
          {days} يوم
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700">
        {days} يوم
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <Card className="carely-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carely-gray/40" />
              <Input
                placeholder="بحث باسم الزبون أو الإيميل"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 text-right rounded-xl border-carely-green/20 focus:border-carely-green"
              />
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-carely-gray/50 font-medium ml-1">الحالة:</span>
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
              </div>
              <div className="w-px bg-carely-green/10 hidden sm:block" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-carely-gray/50 font-medium ml-1">الباقة:</span>
                {planFilters.map((f) => (
                  <Button
                    key={f.id}
                    size="sm"
                    variant={planFilter === f.id ? 'default' : 'outline'}
                    onClick={() => setPlanFilter(f.id)}
                    className={`text-xs rounded-full ${
                      planFilter === f.id
                        ? 'bg-carely-green text-white hover:bg-carely-green/90'
                        : 'carely-btn-outline'
                    }`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-carely-gray/60">
          {loading ? 'جارٍ البحث...' : `${subs.length} اشتراك`}
        </p>
        {!loading && (
          <Button size="sm" variant="ghost" onClick={fetchSubs} className="text-carely-green">
            <RefreshCw className="w-3.5 h-3.5 ml-1" />
            تحديث
          </Button>
        )}
      </div>

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
            <p className="text-red-500 mb-3">{error}</p>
            <Button onClick={fetchSubs} variant="outline" className="carely-btn-outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : subs.length === 0 ? (
        <Card className="carely-card">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-carely-gray/30 mx-auto mb-3" />
            <p className="text-carely-gray/60">لا توجد اشتراكات</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="carely-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto carely-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="bg-carely-mint/50 hover:bg-carely-mint/50">
                    <TableHead className="font-bold text-carely-dark">الزبون</TableHead>
                    <TableHead className="font-bold text-carely-dark">الإيميل</TableHead>
                    <TableHead className="font-bold text-carely-dark">الباقة</TableHead>
                    <TableHead className="font-bold text-carely-dark">الحالة</TableHead>
                    <TableHead className="font-bold text-carely-dark">بداية</TableHead>
                    <TableHead className="font-bold text-carely-dark">انتهاء</TableHead>
                    <TableHead className="font-bold text-carely-dark">أيام متبقية</TableHead>
                    <TableHead className="font-bold text-carely-dark">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((sub) => {
                    const days = getDaysRemaining(sub.expiresAt);
                    return (
                      <TableRow
                        key={sub.id}
                        className="hover:bg-carely-mint/30 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedSubscriptionId(sub.id);
                          navigate('admin-subscription-detail');
                        }}
                      >
                        <TableCell className="font-semibold text-carely-dark">{sub.user?.name || '—'}</TableCell>
                        <TableCell className="text-sm text-carely-gray">{sub.user?.email || '—'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={sub.plan === 'gold' ? 'border-carely-gold text-carely-gold' : 'border-carely-silver text-carely-silver'}
                          >
                            {PLANS[sub.plan as keyof typeof PLANS]?.icon}{' '}
                            {PLANS[sub.plan as keyof typeof PLANS]?.nameAr || sub.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={SUBSCRIPTION_STATUS[sub.status as keyof typeof SUBSCRIPTION_STATUS]?.color || 'bg-gray-100 text-gray-800'}>
                            {SUBSCRIPTION_STATUS[sub.status as keyof typeof SUBSCRIPTION_STATUS]?.label || sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-carely-gray">
                          {sub.startsAt ? new Date(sub.startsAt).toLocaleDateString('ar-TN') : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-carely-gray">
                          {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('ar-TN') : '—'}
                        </TableCell>
                        <TableCell>{getDaysBadge(days, sub.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs carely-btn-outline py-1 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubscriptionId(sub.id);
                              navigate('admin-subscription-detail');
                            }}
                          >
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
