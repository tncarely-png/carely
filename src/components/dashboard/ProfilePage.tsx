'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { WILAYAS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Save, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    wilaya: user?.wilaya || '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password form
  const [pwForm, setPwForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');



  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!form.name.trim()) {
      setErrorMsg('الاسم لازم');
      return;
    }

    setLoading(true);
    const success = await updateProfile({
      name: form.name,
      phone: form.phone,
      address: form.address,
      wilaya: form.wilaya,
    });
    setLoading(false);

    if (success) {
      setSuccessMsg('تم تحديث البيانات بنجاح ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg('حصل مشكل. جرب مرة أخرى');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!pwForm.oldPassword || !pwForm.newPassword) {
      setPwError('لازم تملا كل الحقول');
      return;
    }

    if (pwForm.newPassword.length < 8) {
      setPwError('كلمة السر الجديدة لازم تكون 8 حروف على الأقل');
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('كلمات السر ما تطابقوش');
      return;
    }

    setPwLoading(true);
    const success = await changePassword(pwForm.oldPassword, pwForm.newPassword);
    setPwLoading(false);

    if (success) {
      setPwSuccess('تم تغيير كلمة السر بنجاح ✅');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } else {
      setPwError('كلمة السر القديمة غالطة أو حصل مشكل');
    }
  };

  if (!user) {
    return (
      <div className="space-y-6" dir="rtl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-extrabold text-carely-dark">حسابي</h1>

      {/* Profile Info */}
      <Card className="carely-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-carely-dark">👤 البيانات الشخصية</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">الاسم الكامل</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-11"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">البريد الإلكتروني</Label>
              <Input
                value={user.email}
                readOnly
                className="w-full h-11 bg-gray-50 cursor-not-allowed"
                dir="ltr"
              />
              <p className="text-xs text-carely-gray">ما يمكنش تعدّل الإيميل</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">رقم الهاتف</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="2X XXX XXX"
                className="w-full h-11"
                dir="ltr"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">العنوان</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full min-h-[80px]"
                rows={2}
              />
            </div>

            {/* Wilaya */}
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">الولاية</Label>
              <Select
                value={form.wilaya}
                onValueChange={(val) => setForm((p) => ({ ...p, wilaya: val }))}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="اختار الولاية" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto carely-scroll">
                  {WILAYAS.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Messages */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm text-center font-medium">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="carely-btn-primary h-11 text-base disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="carely-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-carely-dark flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-carely-green" />
            تغيير كلمة السر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">كلمة السر الحالية</Label>
              <Input
                type="password"
                value={pwForm.oldPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, oldPassword: e.target.value }))}
                className="w-full h-11"
                dir="ltr"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">كلمة السر الجديدة</Label>
              <Input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="8 حروف على الأقل"
                className="w-full h-11"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-carely-dark font-semibold">تأكيد كلمة السر الجديدة</Label>
              <Input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="أعد كتابة كلمة السر"
                className="w-full h-11"
                dir="ltr"
              />
            </div>

            {/* Messages */}
            {pwSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm text-center font-medium">
                {pwSuccess}
              </div>
            )}
            {pwError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                {pwError}
              </div>
            )}

            <Button
              type="submit"
              disabled={pwLoading}
              className="carely-btn-outline h-11 text-base disabled:opacity-60"
            >
              {pwLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التغيير...
                </span>
              ) : (
                'تغيير كلمة السر'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
