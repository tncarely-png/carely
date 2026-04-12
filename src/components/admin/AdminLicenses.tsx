'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  RefreshCw,
  AlertTriangle,
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
import { PLANS } from '@/lib/constants';

interface LicenseRow {
  id: string;
  qustodioEmail: string;
  qustodioPassword: string;
  plan: string;
  isAssigned: boolean;
  assignedToUser: string | null;
  assignedAt: string | null;
  expiresAt: string | null;
  purchasedFrom: string | null;
  createdAt: string;
}

const licenseStatusMap: Record<string, { label: string; color: string }> = {
  available: { label: 'متاح', color: 'bg-green-100 text-green-700' },
  used: { label: 'مستخدم', color: 'bg-blue-100 text-blue-700' },
  expired: { label: 'منتهي', color: 'bg-red-100 text-red-700' },
};

function getLicenseStatus(lic: LicenseRow): string {
  if (lic.expiresAt && new Date(lic.expiresAt) < new Date()) return 'expired';
  if (lic.isAssigned) return 'used';
  return 'available';
}

export default function AdminLicenses() {
  const { navigate } = useAppStore();
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState('all');

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (planFilter !== 'all') params.set('plan', planFilter);
      const res = await fetch(`/api/licenses?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const data = await res.json();
      setLicenses(Array.isArray(data) ? data : []);
    } catch {
      setError('حدث خطأ أثناء تحميل الكودات');
    } finally {
      setLoading(false);
    }
  }, [planFilter]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  // Stats
  const silverAvailable = licenses.filter((l) => l.plan === 'silver' && getLicenseStatus(l) === 'available').length;
  const goldAvailable = licenses.filter((l) => l.plan === 'gold' && getLicenseStatus(l) === 'available').length;
  const usedCount = licenses.filter((l) => getLicenseStatus(l) === 'used').length;

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const expiringThisMonth = licenses.filter((l) => {
    if (!l.expiresAt) return false;
    const exp = new Date(l.expiresAt);
    return exp >= now && exp <= endOfMonth && getLicenseStatus(l) !== 'expired';
  }).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="carely-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
              🥈
            </div>
            <div>
              <p className="text-xs text-carely-gray/60">Silver متاح</p>
              <p className="text-lg font-bold text-carely-silver">{silverAvailable}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="carely-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl shrink-0">
              🥇
            </div>
            <div>
              <p className="text-xs text-carely-gray/60">Gold متاح</p>
              <p className="text-lg font-bold text-carely-gold">{goldAvailable}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="carely-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
              🔗
            </div>
            <div>
              <p className="text-xs text-carely-gray/60">كودات مستخدمة</p>
              <p className="text-lg font-bold text-blue-600">{usedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="carely-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl shrink-0">
              ⏰
            </div>
            <div>
              <p className="text-xs text-carely-gray/60">تنتهي هذا الشهر</p>
              <p className="text-lg font-bold text-red-500">{expiringThisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="carely-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={planFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setPlanFilter('all')}
                className={`text-xs rounded-full ${planFilter === 'all' ? 'bg-carely-green text-white hover:bg-carely-green/90' : 'carely-btn-outline'}`}
              >
                الكل
              </Button>
              <Button
                size="sm"
                variant={planFilter === 'silver' ? 'default' : 'outline'}
                onClick={() => setPlanFilter('silver')}
                className={`text-xs rounded-full ${planFilter === 'silver' ? 'bg-carely-green text-white hover:bg-carely-green/90' : 'carely-btn-outline'}`}
              >
                🥈 Silver
              </Button>
              <Button
                size="sm"
                variant={planFilter === 'gold' ? 'default' : 'outline'}
                onClick={() => setPlanFilter('gold')}
                className={`text-xs rounded-full ${planFilter === 'gold' ? 'bg-carely-green text-white hover:bg-carely-green/90' : 'carely-btn-outline'}`}
              >
                🥇 Gold
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {!loading && (
                <Button size="sm" variant="ghost" onClick={fetchLicenses} className="text-carely-green">
                  <RefreshCw className="w-3.5 h-3.5 ml-1" />
                  تحديث
                </Button>
              )}
              <Button
                onClick={() => navigate('admin-license-new')}
                className="bg-carely-green hover:bg-carely-green/90 text-white rounded-full text-sm"
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة كود جديد
              </Button>
            </div>
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
            <Button onClick={fetchLicenses} variant="outline" className="carely-btn-outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : licenses.length === 0 ? (
        <Card className="carely-card">
          <CardContent className="p-12 text-center">
            <Key className="w-12 h-12 text-carely-gray/30 mx-auto mb-3" />
            <p className="text-carely-gray/60">لا توجد كودات</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="carely-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto carely-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="bg-carely-mint/50 hover:bg-carely-mint/50">
                    <TableHead className="font-bold text-carely-dark">إيميل Qustodio</TableHead>
                    <TableHead className="font-bold text-carely-dark">كلمة المرور</TableHead>
                    <TableHead className="font-bold text-carely-dark">الباقة</TableHead>
                    <TableHead className="font-bold text-carely-dark">الحالة</TableHead>
                    <TableHead className="font-bold text-carely-dark">مخصص لـ</TableHead>
                    <TableHead className="font-bold text-carely-dark">تاريخ الانتهاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((lic) => {
                    const status = getLicenseStatus(lic);
                    const statusInfo = licenseStatusMap[status];
                    return (
                      <TableRow key={lic.id} className="hover:bg-carely-mint/30 transition-colors">
                        <TableCell className="font-mono text-sm text-carely-dark">{lic.qustodioEmail}</TableCell>
                        <TableCell className="font-mono text-sm text-carely-gray">••••••••</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={lic.plan === 'gold' ? 'border-carely-gold text-carely-gold' : 'border-carely-silver text-carely-silver'}
                          >
                            {PLANS[lic.plan as keyof typeof PLANS]?.icon}{' '}
                            {PLANS[lic.plan as keyof typeof PLANS]?.nameAr || lic.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
                            {statusInfo?.label || status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-carely-gray">{lic.assignedToUser || '—'}</TableCell>
                        <TableCell className="text-sm text-carely-gray">
                          {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString('ar-TN') : '—'}
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
