'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Save,
  Trash2,
  AlertTriangle,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useAppStore } from '@/store';
import { PLANS, SUBSCRIPTION_STATUS } from '@/lib/constants';

interface SubscriptionData {
  id: string;
  userId: string;
  plan: string;
  status: string;
  qustodioEmail: string | null;
  qustodioPassword: string | null;
  activationCode: string | null;
  devicesCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  autoRenew: boolean;
  notes: string | null;
  licenseId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function AdminSubscriptionDetail() {
  const { selectedSubscriptionId, navigate, setSelectedUserId } = useAppStore();
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    plan: '',
    status: '',
    qustodioEmail: '',
    qustodioPassword: '',
    activationCode: '',
    devicesCount: 5,
    startsAt: '',
    expiresAt: '',
    autoRenew: false,
    notes: '',
  });

  const fetchSub = useCallback(async () => {
    if (!selectedSubscriptionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${selectedSubscriptionId}`);
      if (!res.ok) throw new Error('فشل تحميل الاشتراك');
      const data = await res.json();
      setSub(data);
      setForm({
        plan: data.plan || 'silver',
        status: data.status || 'pending',
        qustodioEmail: data.qustodioEmail || '',
        qustodioPassword: data.qustodioPassword || '',
        activationCode: data.activationCode || '',
        devicesCount: data.devicesCount || 5,
        startsAt: data.startsAt ? data.startsAt.split('T')[0] : '',
        expiresAt: data.expiresAt ? data.expiresAt.split('T')[0] : '',
        autoRenew: data.autoRenew || false,
        notes: data.notes || '',
      });
    } catch {
      setError('حدث خطأ أثناء تحميل الاشتراك');
    } finally {
      setLoading(false);
    }
  }, [selectedSubscriptionId]);

  useEffect(() => {
    fetchSub();
  }, [fetchSub]);

  const handleSave = async () => {
    if (!selectedSubscriptionId) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        plan: form.plan,
        status: form.status,
        qustodioEmail: form.qustodioEmail || null,
        qustodioPassword: form.qustodioPassword || null,
        activationCode: form.activationCode || null,
        devicesCount: form.devicesCount,
        autoRenew: form.autoRenew,
        notes: form.notes || null,
      };
      if (form.startsAt) payload.startsAt = new Date(form.startsAt).toISOString();
      if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

      const res = await fetch(`/api/subscriptions/${selectedSubscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchSub();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubscriptionId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/subscriptions/${selectedSubscriptionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        navigate('admin-subscriptions');
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-carely-gray mb-4">{error || 'لم يتم العثور على الاشتراك'}</p>
        <Button onClick={() => navigate('admin-subscriptions')} variant="outline" className="carely-btn-outline">
          الرجوع للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('admin-subscriptions')}
        className="text-carely-green -mr-2"
      >
        <ArrowRight className="w-4 h-4 ml-1" />
        الرجوع لقائمة الاشتراكات
      </Button>

      {/* User Info Summary */}
      <Card className="carely-card bg-carely-mint/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-carely-green/20 flex items-center justify-center">
                <User className="w-5 h-5 text-carely-green" />
              </div>
              <div>
                <p className="font-bold text-carely-dark">{sub.user?.name}</p>
                <p className="text-sm text-carely-gray">{sub.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="carely-btn-outline text-xs rounded-full"
                onClick={() => {
                  setSelectedUserId(sub.userId);
                  navigate('admin-user-detail');
                }}
              >
                عرض الزبون
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="carely-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-carely-dark">تعديل الاشتراك</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
          {/* Plan & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-carely-dark mb-2 block">نوع الباقة</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">🥈 Silver — 89 دت</SelectItem>
                  <SelectItem value="gold">🥇 Gold — 149 دت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-carely-dark mb-2 block">الحالة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBSCRIPTION_STATUS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Qustodio Data */}
          <div className="space-y-4">
            <h4 className="font-bold text-carely-dark text-sm">🔐 بيانات Qustodio</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-carely-gray/60 mb-1.5 block">إيميل Qustodio</Label>
                <Input
                  value={form.qustodioEmail}
                  onChange={(e) => setForm({ ...form, qustodioEmail: e.target.value })}
                  placeholder="qustodio@example.com"
                  className="rounded-lg border-carely-green/20 focus:border-carely-green"
                />
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60 mb-1.5 block">كلمة مرور Qustodio</Label>
                <Input
                  value={form.qustodioPassword}
                  onChange={(e) => setForm({ ...form, qustodioPassword: e.target.value })}
                  placeholder="كلمة المرور"
                  className="rounded-lg border-carely-green/20 focus:border-carely-green"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-carely-gray/60 mb-1.5 block">كود التفعيل</Label>
                <Input
                  value={form.activationCode}
                  onChange={(e) => setForm({ ...form, activationCode: e.target.value })}
                  placeholder="كود التفعيل"
                  className="rounded-lg border-carely-green/20 focus:border-carely-green"
                />
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60 mb-1.5 block">عدد الأجهزة</Label>
                <Input
                  type="number"
                  value={form.devicesCount}
                  onChange={(e) => setForm({ ...form, devicesCount: parseInt(e.target.value) || 5 })}
                  className="rounded-lg border-carely-green/20 focus:border-carely-green"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h4 className="font-bold text-carely-dark text-sm">📅 التواريخ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-carely-gray/60 mb-1.5 block">تاريخ البداية</Label>
                <Input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="rounded-lg border-carely-green/20 focus:border-carely-green"
                />
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60 mb-1.5 block">تاريخ الانتهاء</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="rounded-lg border-carely-green/20 focus:border-carely-green"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Auto Renew */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-carely-dark">التجديد التلقائي</Label>
              <p className="text-xs text-carely-gray/60 mt-0.5">تفعيل التجديد التلقائي عند انتهاء الاشتراك</p>
            </div>
            <Switch
              checked={form.autoRenew}
              onCheckedChange={(v) => setForm({ ...form, autoRenew: v })}
            />
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label className="text-xs text-carely-gray/60 mb-1.5 block">ملاحظات</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="ملاحظات إضافية..."
              className="min-h-[80px] rounded-lg border-carely-green/20 focus:border-carely-green"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-carely-green hover:bg-carely-green/90 text-white rounded-full"
            >
              {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
              {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('admin-subscriptions')}
              className="carely-btn-outline rounded-full"
            >
              إلغاء
            </Button>
            <div className="flex-1" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 rounded-full">
                  <Trash2 className="w-4 h-4 ml-1" />
                  حذف الاشتراك
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-carely-dark">هل أنت متأكد من الحذف؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف هذا الاشتراك نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="carely-btn-outline rounded-full">إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full"
                  >
                    {deleting ? 'جارٍ الحذف...' : 'نعم، احذف'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
