'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Users, RefreshCw, Filter } from 'lucide-react';
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

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  wilaya: string | null;
  role: string;
  createdAt: string;
  subscription: {
    id: string;
    plan: string;
    status: string;
    startsAt: string | null;
    expiresAt: string | null;
  } | null;
}

const filterOptions = [
  { id: 'all', label: 'كل الزبائن' },
  { id: 'silver', label: '🥈 Silver فقط' },
  { id: 'gold', label: '🥇 Gold فقط' },
  { id: 'none', label: 'بدون اشتراك' },
] as const;

export default function AdminUsers() {
  const { navigate, setSelectedUserId } = useAppStore();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/admin/users?';
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (filter === 'silver' || filter === 'gold') params.set('plan', filter);
      url += params.toString();

      const res = await fetch(url);
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const data = await res.json();
      let filtered = Array.isArray(data) ? data : [];

      // Client-side filter for "none" (no subscription)
      if (filter === 'none') {
        filtered = filtered.filter((u: UserRow) => !u.subscription);
      }

      setUsers(filtered);
    } catch {
      setError('حدث خطأ أثناء تحميل الزبائن');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <Card className="carely-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carely-gray/40" />
              <Input
                placeholder="بحث باسم أو إيميل أو هاتف"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 text-right rounded-xl border-carely-green/20 focus:border-carely-green"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-carely-gray/40 shrink-0" />
              {filterOptions.map((opt) => (
                <Button
                  key={opt.id}
                  size="sm"
                  variant={filter === opt.id ? 'default' : 'outline'}
                  onClick={() => setFilter(opt.id)}
                  className={`text-xs rounded-full ${
                    filter === opt.id
                      ? 'bg-carely-green text-white hover:bg-carely-green/90'
                      : 'carely-btn-outline'
                  }`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-carely-gray/60">
          {loading ? 'جارٍ البحث...' : `${users.length} زبون`}
        </p>
        {!loading && (
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchUsers}
            className="text-carely-green"
          >
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
            <Button onClick={fetchUsers} variant="outline" className="carely-btn-outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card className="carely-card">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-carely-gray/30 mx-auto mb-3" />
            <p className="text-carely-gray/60">لا يوجد زبائن مطابقين للبحث</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="carely-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto carely-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="bg-carely-mint/50 hover:bg-carely-mint/50">
                    <TableHead className="font-bold text-carely-dark">الاسم</TableHead>
                    <TableHead className="font-bold text-carely-dark">الإيميل</TableHead>
                    <TableHead className="font-bold text-carely-dark">الهاتف</TableHead>
                    <TableHead className="font-bold text-carely-dark">الولاية</TableHead>
                    <TableHead className="font-bold text-carely-dark">الباقة</TableHead>
                    <TableHead className="font-bold text-carely-dark">الحالة</TableHead>
                    <TableHead className="font-bold text-carely-dark">تاريخ التسجيل</TableHead>
                    <TableHead className="font-bold text-carely-dark">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-carely-mint/30 transition-colors">
                      <TableCell className="font-semibold text-carely-dark">{user.name}</TableCell>
                      <TableCell className="text-sm text-carely-gray">{user.email}</TableCell>
                      <TableCell className="text-sm text-carely-gray">{user.phone || '—'}</TableCell>
                      <TableCell className="text-sm text-carely-gray">{user.wilaya || '—'}</TableCell>
                      <TableCell>
                        {user.subscription ? (
                          <Badge
                            variant="outline"
                            className={
                              user.subscription.plan === 'gold'
                                ? 'border-carely-gold text-carely-gold'
                                : 'border-carely-silver text-carely-silver'
                            }
                          >
                            {PLANS[user.subscription.plan as keyof typeof PLANS]?.icon}{' '}
                            {PLANS[user.subscription.plan as keyof typeof PLANS]?.nameAr || user.subscription.plan}
                          </Badge>
                        ) : (
                          <span className="text-carely-gray/40 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.subscription ? (
                          <Badge className={SUBSCRIPTION_STATUS[user.subscription.status as keyof typeof SUBSCRIPTION_STATUS]?.color || 'bg-gray-100 text-gray-800'}>
                            {SUBSCRIPTION_STATUS[user.subscription.status as keyof typeof SUBSCRIPTION_STATUS]?.label || user.subscription.status}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500">بدون اشتراك</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-carely-gray">
                        {new Date(user.createdAt).toLocaleDateString('ar-TN')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs carely-btn-outline py-1 px-3"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            navigate('admin-user-detail');
                          }}
                        >
                          <Eye className="w-3 h-3 ml-1" />
                          عرض التفاصيل
                        </Button>
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
