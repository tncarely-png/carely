'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Eye,
  CheckCircle2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLANS, ORDER_STATUS } from '@/lib/constants';

interface Order {
  id: string;
  plan: string;
  amountTnd: number;
  paymentMethod: string;
  receiptUrl: string | null;
  status: string;
  createdAt: string;
  paidAt: string | null;
  user: { name: string; phone: string };
}

const STATUS_FILTERS = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'في الانتظار' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'failed', label: 'فشل' },
  { value: 'refunded', label: 'مسترجع' },
];

export default function SuperAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل الطلبات');
      const data = await res.json();
      setOrders(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      setError('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmPayment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: 'paid', paidAt: new Date().toISOString() }
              : o
          )
        );
      }
    } catch {
      // silent
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#888888' }} />
        <p className="mb-4" style={{ color: '#666666' }}>{error}</p>
        <Button onClick={fetchOrders} className="sa-btn-primary">
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
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: '#888888' }} />
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
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
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#888888' }} />
            <Input
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 rounded-xl"
              style={{ border: '1px solid #e0e0e0' }}
            />
          </div>
          <Button onClick={fetchOrders} variant="outline" className="rounded-xl" style={{ border: '1px solid #e0e0e0' }}>
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
                <TableHead className="font-bold" style={{ color: '#000000' }}>الزبون</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الباقة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>المبلغ</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>طريقة الدفع</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الوصل</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الحالة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>التاريخ</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8" style={{ color: '#888888' }}>
                    لا توجد طلبات
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id} className="transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-bold" style={{ color: '#000000' }}>{order.user?.name || '—'}</p>
                        <p className="text-xs" style={{ color: '#888888' }} dir="ltr">{order.user?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {PLANS[order.plan as keyof typeof PLANS]?.icon}{' '}
                        {PLANS[order.plan as keyof typeof PLANS]?.nameAr || order.plan}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold">{order.amountTnd.toFixed(2)} دت</TableCell>
                    <TableCell className="text-sm" style={{ color: '#888888' }}>{order.paymentMethod}</TableCell>
                    <TableCell>
                      {order.receiptUrl ? (
                        <button
                          onClick={() => setViewingReceipt(order.receiptUrl)}
                          className="w-10 h-10 rounded-lg overflow-hidden border"
                          style={{ borderColor: '#e0e0e0' }}
                        >
                          <img
                            src={order.receiptUrl}
                            alt="وصل"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <span style={{ color: '#888888' }}>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={(ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color) || 'bg-gray-100 text-gray-800'}>
                        {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#888888' }}>
                      {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                    </TableCell>
                    <TableCell>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          className="sa-btn-primary py-1 px-3 text-xs"
                          onClick={() => handleConfirmPayment(order.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          تأكيد الدفع
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Receipt Viewer Dialog */}
      <Dialog open={!!viewingReceipt} onOpenChange={() => setViewingReceipt(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>صورة الوصل</DialogTitle>
          </DialogHeader>
          {viewingReceipt && (
            <div className="flex justify-center">
              <img
                src={viewingReceipt}
                alt="وصل"
                className="max-w-full rounded-xl"
                style={{ maxHeight: '60vh', objectFit: 'contain' }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
