'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Plus,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { PLANS } from '@/lib/constants';

interface License {
  id: string;
  qustodioEmail: string;
  qustodioPassword: string;
  plan: string;
  isAssigned: boolean;
  assignedToUser: string | null;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
}

export default function SuperAdminLicenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPlan, setFormPlan] = useState('silver');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/licenses');
      if (!res.ok) throw new Error('فشل تحميل التراخيص');
      const data = await res.json();
      setLicenses(Array.isArray(data) ? data : []);
    } catch {
      setError('حدث خطأ أثناء تحميل التراخيص');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const handleAddLicense = async () => {
    if (!formEmail || !formPassword) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qustodioEmail: formEmail,
          qustodioPassword: formPassword,
          plan: formPlan,
          notes: formNotes || null,
        }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setFormEmail('');
        setFormPassword('');
        setFormPlan('silver');
        setFormNotes('');
        fetchLicenses();
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        <Button onClick={fetchLicenses} className="sa-btn-primary">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#888888' }}>
          {licenses.length} ترخيص
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="sa-btn-primary">
              <Plus className="w-4 h-4 ml-2" />
              إضافة ترخيص
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة ترخيص جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  البريد Qustodio
                </Label>
                <Input
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@qustodio.com"
                  dir="ltr"
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  كلمة المرور
                </Label>
                <Input
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  type="text"
                  placeholder="كلمة المرور"
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  الباقة
                </Label>
                <div className="flex gap-3">
                  {(['silver', 'gold'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFormPlan(p)}
                      className="flex-1 p-3 rounded-xl text-center font-bold transition-all"
                      style={{
                        background: formPlan === p ? '#000000' : '#f5f5f5',
                        color: formPlan === p ? '#ffffff' : '#666666',
                      }}
                    >
                      {PLANS[p].icon} {PLANS[p].nameAr}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  ملاحظات (اختياري)
                </Label>
                <Input
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات..."
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
              <Button
                onClick={handleAddLicense}
                disabled={submitting || !formEmail || !formPassword}
                className="sa-btn-primary w-full"
              >
                {submitting ? 'جاري الإضافة...' : 'إضافة الترخيص'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="sa-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#f5f5f5' }}>
                <TableHead className="font-bold" style={{ color: '#000000' }}>البريد</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>كلمة المرور</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الباقة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>الحالة</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>ينتهي في</TableHead>
                <TableHead className="font-bold" style={{ color: '#000000' }}>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8" style={{ color: '#888888' }}>
                    لا توجد تراخيص
                  </TableCell>
                </TableRow>
              ) : (
                licenses.map((lic) => (
                  <TableRow key={lic.id} className="transition-colors">
                    <TableCell className="font-semibold" style={{ color: '#000000' }} dir="ltr">
                      {lic.qustodioEmail}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePassword(lic.id)}
                        className="font-mono text-sm px-2 py-1 rounded"
                        style={{ background: '#f5f5f5', color: '#000000' }}
                        dir="ltr"
                      >
                        {showPasswords.has(lic.id) ? lic.qustodioPassword : '••••••••'}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {PLANS[lic.plan as keyof typeof PLANS]?.icon}{' '}
                        {PLANS[lic.plan as keyof typeof PLANS]?.nameAr || lic.plan}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={lic.isAssigned ? 'sa-badge-active' : 'sa-badge-inactive'}>
                        {lic.isAssigned ? 'مُسند ✓' : 'متاح'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#888888' }}>
                      {lic.expiresAt
                        ? new Date(lic.expiresAt).toLocaleDateString('ar-TN')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#888888' }}>
                      {lic.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
