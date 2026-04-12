'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  User,
  FileText,
  CreditCard,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface UserData {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  wilaya: string | null;
  role: string;
  createdAt: string;
  subscription: {
    id: string;
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
  } | null;
  orders: {
    id: string;
    plan: string;
    amountTnd: number;
    paymentMethod: string;
    paymentRef: string | null;
    status: string;
    createdAt: string;
  }[];
  license: {
    id: string;
    qustodioEmail: string;
    qustodioPassword: string;
    plan: string;
    isAssigned: boolean;
    expiresAt: string | null;
  } | null;
}

interface AvailableLicense {
  id: string;
  qustodioEmail: string;
  plan: string;
  expiresAt: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className="text-xs text-carely-green hover:bg-carely-mint h-7 w-7 p-0"
      title="نسخ"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
}

export default function AdminUserDetail() {
  const { selectedUserId, navigate, setSelectedSubscriptionId } = useAppStore();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Qustodio password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Notes editing
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Assign license dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableLicenses, setAvailableLicenses] = useState<AvailableLicense[]>([]);
  const [selectedLicenseId, setSelectedLicenseId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status change
  const [newStatus, setNewStatus] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}`);
      if (!res.ok) throw new Error('فشل تحميل بيانات الزبون');
      const data = await res.json();
      setUser(data);
      setNotes(data.subscription?.notes || '');
      if (data.subscription) {
        setNewStatus(data.subscription.status);
      }
    } catch {
      setError('حدث خطأ أثناء تحميل بيانات الزبون');
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchAvailableLicenses = async () => {
    if (!user?.subscription) return;
    try {
      const plan = user.subscription.plan;
      const res = await fetch(`/api/licenses?plan=${plan}&isAssigned=false`);
      if (res.ok) {
        const data = await res.json();
        setAvailableLicenses(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    }
  };

  const openAssignDialog = () => {
    setSelectedLicenseId('');
    fetchAvailableLicenses();
    setAssignDialogOpen(true);
  };

  const handleAssignLicense = async () => {
    if (!selectedLicenseId || !user?.subscription) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/licenses/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseId: selectedLicenseId,
          userId: user.id,
          subscriptionId: user.subscription.id,
        }),
      });
      if (res.ok) {
        setAssignDialogOpen(false);
        fetchUser();
      }
    } catch {
      // silent
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!user?.subscription) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/subscriptions/${user.subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setUser({ ...user, subscription: { ...user.subscription, notes } });
      }
    } catch {
      // silent
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusChange = async () => {
    if (!user?.subscription || !newStatus) return;
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/subscriptions/${user.subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchUser();
      }
    } catch {
      // silent
    } finally {
      setChangingStatus(false);
    }
  };

  const handleRenew = () => {
    if (user?.subscription) {
      setSelectedSubscriptionId(user.subscription.id);
      navigate('admin-subscription-detail');
    }
  };

  const handleWhatsApp = () => {
    if (!user) return;
    const msg = `مرحبا ${user.name}، نتصل من Carely.tn بخصوص اشتراكك.`;
    window.open(getWhatsAppLink(msg), '_blank');
  };

  // Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-carely-gray mb-4">{error || 'لم يتم العثور على الزبون'}</p>
        <Button onClick={() => navigate('admin-users')} variant="outline" className="carely-btn-outline">
          الرجوع للقائمة
        </Button>
      </div>
    );
  }

  const sub = user.subscription;
  const daysRemaining = sub?.expiresAt
    ? Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('admin-users')}
        className="text-carely-green -mr-2"
      >
        <ArrowRight className="w-4 h-4 ml-1" />
        الرجوع لقائمة الزبائن
      </Button>

      {/* Section 1: User Info */}
      <Card className="carely-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-carely-dark">
            <User className="w-5 h-5 text-carely-green" />
            معلومات الزبون
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-carely-gray/60">الاسم</Label>
              <p className="font-semibold text-carely-dark">{user.name}</p>
            </div>
            <div>
              <Label className="text-xs text-carely-gray/60">الهاتف</Label>
              <p className="font-semibold text-carely-dark" dir="ltr">{user.phone || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-carely-gray/60">العنوان</Label>
              <p className="font-semibold text-carely-dark">{user.address || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-carely-gray/60">الولاية</Label>
              <p className="font-semibold text-carely-dark">{user.wilaya || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-carely-gray/60">تاريخ التسجيل</Label>
              <p className="font-semibold text-carely-dark">
                {new Date(user.createdAt).toLocaleDateString('ar-TN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Subscription Info */}
      <Card className="carely-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-carely-dark">
            <FileText className="w-5 h-5 text-carely-green" />
            بيانات الاشتراك
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {sub ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-carely-gray/60">الباقة</Label>
                <Badge
                  variant="outline"
                  className={`mt-1 ${sub.plan === 'gold' ? 'border-carely-gold text-carely-gold' : 'border-carely-silver text-carely-silver'}`}
                >
                  {PLANS[sub.plan as keyof typeof PLANS]?.icon}{' '}
                  {PLANS[sub.plan as keyof typeof PLANS]?.nameAr || sub.plan}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60">الحالة</Label>
                <Badge
                  className={`mt-1 ${SUBSCRIPTION_STATUS[sub.status as keyof typeof SUBSCRIPTION_STATUS]?.color || 'bg-gray-100 text-gray-800'}`}
                >
                  {SUBSCRIPTION_STATUS[sub.status as keyof typeof SUBSCRIPTION_STATUS]?.label || sub.status}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60">بداية الاشتراك</Label>
                <p className="font-semibold text-carely-dark">
                  {sub.startsAt ? new Date(sub.startsAt).toLocaleDateString('ar-TN') : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60">انتهاء الاشتراك</Label>
                <p className="font-semibold text-carely-dark">
                  {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('ar-TN') : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60">الأيام المتبقية</Label>
                <p className={`font-bold text-lg ${daysRemaining !== null && daysRemaining <= 30 ? 'text-red-500' : daysRemaining !== null ? 'text-green-600' : 'text-carely-gray'}`}>
                  {daysRemaining !== null ? `${daysRemaining} يوم` : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-carely-gray/60">عدد الأجهزة</Label>
                <p className="font-semibold text-carely-dark">{sub.devicesCount}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-carely-gray/60">لا يوجد اشتراك لهذا الزبون</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Qustodio Data (SENSITIVE) */}
      {sub && (sub.qustodioEmail || sub.qustodioPassword || sub.activationCode) && (
        <Card className="carely-card border-red-300 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              🔐 بيانات حساب Qustodio
            </CardTitle>
            <p className="text-xs text-red-400">معلومات حساسة — لا تشاركها مع أي شخص</p>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {sub.qustodioEmail && (
              <div>
                <Label className="text-xs text-carely-gray/60">إيميل Qustodio</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={sub.qustodioEmail}
                    readOnly
                    className="bg-gray-50 font-mono text-sm rounded-lg"
                  />
                  <CopyButton text={sub.qustodioEmail} />
                </div>
              </div>
            )}
            {sub.qustodioPassword && (
              <div>
                <Label className="text-xs text-carely-gray/60">كلمة مرور Qustodio</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={sub.qustodioPassword}
                      readOnly
                      className="bg-gray-50 font-mono text-sm rounded-lg pl-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-carely-gray/50 hover:text-carely-gray"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <CopyButton text={sub.qustodioPassword} />
                </div>
              </div>
            )}
            {sub.activationCode && (
              <div>
                <Label className="text-xs text-carely-gray/60">كود التفعيل</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={sub.activationCode}
                    readOnly
                    className="bg-gray-50 font-mono text-sm rounded-lg"
                  />
                  <CopyButton text={sub.activationCode} />
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <Separator />
            <div>
              <Label className="text-xs text-carely-gray/60">ملاحظات الأدمن</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات خاصة هنا..."
                className="mt-1 min-h-[80px] rounded-lg border-carely-green/20 focus:border-carely-green"
              />
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="mt-2 bg-carely-green hover:bg-carely-green/90 text-white rounded-full text-xs"
              >
                <Save className="w-3 h-3 ml-1" />
                {savingNotes ? 'جارٍ الحفظ...' : 'حفظ الملاحظات'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Orders History */}
      <Card className="carely-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-carely-dark">
            <CreditCard className="w-5 h-5 text-carely-green" />
            سجل الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {user.orders.length === 0 ? (
            <p className="text-center text-carely-gray/60 py-6">لا توجد طلبات</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto carely-scroll rounded-xl border border-carely-green/10">
              <Table>
                <TableHeader>
                  <TableRow className="bg-carely-mint/50 hover:bg-carely-mint/50">
                    <TableHead className="font-bold text-carely-dark">الباقة</TableHead>
                    <TableHead className="font-bold text-carely-dark">المبلغ</TableHead>
                    <TableHead className="font-bold text-carely-dark">طريقة الدفع</TableHead>
                    <TableHead className="font-bold text-carely-dark">الحالة</TableHead>
                    <TableHead className="font-bold text-carely-dark">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-carely-mint/30">
                      <TableCell>
                        <Badge variant="outline" className={order.plan === 'gold' ? 'border-carely-gold text-carely-gold' : 'border-carely-silver text-carely-silver'}>
                          {PLANS[order.plan as keyof typeof PLANS]?.icon} {PLANS[order.plan as keyof typeof PLANS]?.nameAr || order.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">{order.amountTnd.toFixed(2)} دت</TableCell>
                      <TableCell className="text-sm text-carely-gray">{order.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className={ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || 'bg-gray-100 text-gray-800'}>
                          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-carely-gray">
                        {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Admin Actions */}
      <Card className="carely-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-carely-dark">
            <ShieldCheck className="w-5 h-5 text-carely-green" />
            إجراءات الأدمن
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={openAssignDialog}
              className="bg-carely-green hover:bg-carely-green/90 text-white rounded-full"
            >
              <BadgeCheck className="w-4 h-4 ml-1" />
              تعيين اشتراك جديد
            </Button>

            {sub && (
              <div className="flex items-center gap-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-40 rounded-lg text-sm">
                    <SelectValue placeholder="تغيير الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUBSCRIPTION_STATUS).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleStatusChange}
                  disabled={changingStatus || newStatus === sub.status}
                  variant="outline"
                  className="carely-btn-outline rounded-full text-xs"
                >
                  <RefreshCw className={`w-3 h-3 ml-1 ${changingStatus ? 'animate-spin' : ''}`} />
                  تغيير الحالة
                </Button>
              </div>
            )}

            {sub && (
              <Button
                variant="outline"
                className="carely-btn-outline rounded-full"
                onClick={handleRenew}
              >
                <RefreshCw className="w-4 h-4 ml-1" />
                تجديد الاشتراك
              </Button>
            )}

            <Button
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600 rounded-full"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-4 h-4 ml-1" />
              تواصل على واتساب
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assign License Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-carely-dark">تعيين اشتراك جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-carely-gray">
              اختر كود متاح للاقة <strong>{sub?.plan === 'gold' ? 'Gold' : 'Silver'}</strong> لتعيينه لـ <strong>{user.name}</strong>
            </p>
            {availableLicenses.length === 0 ? (
              <p className="text-sm text-red-500 text-center py-4">
                لا توجد كودات متاحة لهذه الباقة. أضف كودات جديدة من صفحة الكودات.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto carely-scroll">
                {availableLicenses.map((lic) => (
                  <button
                    key={lic.id}
                    onClick={() => setSelectedLicenseId(lic.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      selectedLicenseId === lic.id
                        ? 'border-carely-green bg-carely-mint'
                        : 'border-gray-200 hover:border-carely-green/50'
                    }`}
                  >
                    <div className="text-right">
                      <p className="text-sm font-semibold text-carely-dark">{lic.qustodioEmail}</p>
                      <p className="text-xs text-carely-gray/60">
                        ينتهي: {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString('ar-TN') : 'غير محدد'}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedLicenseId === lic.id
                          ? 'border-carely-green bg-carely-green'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedLicenseId === lic.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              className="carely-btn-outline rounded-full"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAssignLicense}
              disabled={assigning || !selectedLicenseId}
              className="bg-carely-green hover:bg-carely-green/90 text-white rounded-full"
            >
              {assigning ? 'جارٍ التعيين...' : 'تعيين'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
