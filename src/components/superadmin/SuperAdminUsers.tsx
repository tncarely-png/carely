'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PLANS, SUBSCRIPTION_STATUS } from '@/lib/constants';

interface UserSubscription {
  id: string;
  plan: string;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  wilaya: string | null;
  role: string;
  createdAt: string;
  subscriptions: UserSubscription[];
}

const STATUS_FILTERS = [
  { value: 'all', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'expired', label: 'منتهي' },
  { value: 'pending', label: 'معلق' },
  { value: 'none', label: 'بدون اشتراك' },
];

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('فشل تحميل المستخدمين');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || data.users || []);
    } catch {
      setError('حدث خطأ أثناء تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      // silent
    }
  };

  const getLatestSubscription = (user: User): UserSubscription | null => {
    if (!user.subscriptions || user.subscriptions.length === 0) return null;
    return user.subscriptions[0]; // Already ordered by desc createdAt in the API
  };

  const filtered = users.filter((u) => {
    // Search filter
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'all') return true;

    const latestSub = getLatestSubscription(u);
    if (statusFilter === 'none') return !latestSub;

    if (!latestSub) return false;

    return latestSub.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#888888' }} />
        <p className="mb-4" style={{ color: '#666666' }}>{error}</p>
        <Button onClick={fetchUsers} className="sa-btn-primary">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm" style={{ color: '#888888' }}>
            {filtered.length} مستخدم
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: '#888888' }} />
            <div className="flex flex-wrap gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: statusFilter === f.value ? '#000000' : '#f5f5f5',
                    color: statusFilter === f.value ? '#ffffff' : '#666666',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#888888' }} />
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 rounded-xl"
              style={{ border: '1px solid #e0e0e0' }}
            />
          </div>
          <Button onClick={fetchUsers} variant="outline" className="rounded-xl" style={{ border: '1px solid #e0e0e0' }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#f5f5f5' }}>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الاسم</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الهاتف</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الولاية</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الباقة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الحالة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>تاريخ التسجيل</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8" style={{ color: '#888888' }}>
                    لا يوجد مستخدمون
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => {
                  const latestSub = getLatestSubscription(user);
                  return (
                    <TableRow key={user.id} className="transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                            style={{ background: '#000000' }}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <p className="font-bold" style={{ color: '#000000' }}>{user.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: '#000000' }} dir="ltr">
                        {user.phone}
                      </TableCell>
                      <TableCell style={{ color: '#888888' }}>{user.wilaya || '—'}</TableCell>
                      <TableCell>
                        {latestSub ? (
                          <span className="text-sm">
                            {PLANS[latestSub.plan as keyof typeof PLANS]?.icon}{' '}
                            {PLANS[latestSub.plan as keyof typeof PLANS]?.nameAr || latestSub.plan}
                          </span>
                        ) : (
                          <span style={{ color: '#888888' }}>—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {latestSub ? (
                          <Badge className={(SUBSCRIPTION_STATUS[latestSub.status as keyof typeof SUBSCRIPTION_STATUS]?.color) || 'bg-gray-100 text-gray-800'}>
                            {SUBSCRIPTION_STATUS[latestSub.status as keyof typeof SUBSCRIPTION_STATUS]?.label || latestSub.status}
                          </Badge>
                        ) : (
                          <span style={{ color: '#888888' }}>—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm" style={{ color: '#888888' }}>
                        {new Date(user.createdAt).toLocaleDateString('ar-TN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-8 px-2" style={{ border: '1px solid #e0e0e0' }}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8 px-2" style={{ border: '1px solid #fecaca', color: '#dc2626' }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف <strong>{user.name}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user.id)}
                                  style={{ background: '#dc2626', color: '#ffffff' }}
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
