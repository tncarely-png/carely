'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { isAdmin } from '@/lib/auth-user';
import { WILAYAS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Loader2, ArrowLeft, Mail, ShieldCheck, RefreshCw, UserPlus } from 'lucide-react';

type Step = 'email' | 'otp' | 'profile';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [confirmedEmail, setConfirmedEmail] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    wilaya: '',
    address: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const hasTriggered = useRef(false);
  const pendingEmailRef = useRef<string>('');

  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useAppStore((s) => s.navigate);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'otp') {
      hasTriggered.current = false;
      setTimeout(() => {
        const slot = document.querySelector('[data-slot="input-otp-slot"]') as HTMLElement;
        slot?.focus();
      }, 100);
    }
  }, [step]);

  const updateProfileField = (field: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const formatPhoneDisplay = (p: string) => {
    const digits = p.replace(/[^\d]/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + ' ' + digits.slice(2);
    return digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8);
  };

  const handlePhoneChange = (value: string) => {
    updateProfileField('phone', formatPhoneDisplay(value.replace(/[^\d]/g, '').slice(0, 8)));
  };

  const handleSendOtp = async () => {
    const em = email.trim();
    if (!isValidEmail(em)) {
      setError('أدخل بريداً إلكترونياً صحيحاً');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'تعذر إرسال الكود');
        setLoading(false);
        return;
      }

      pendingEmailRef.current = em.toLowerCase();
      setConfirmedEmail(em);
      setStep('otp');
      setCooldown(60);
      setOtp('');
    } catch {
      setError('ما نقدرش نتواصل مع المخدم');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    const em = pendingEmailRef.current || email.trim();

    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'تعذر إرسال الكود');
      } else {
        setCooldown(60);
        setOtp('');
        setError('');
      }
    } catch {
      setError('ما نقدرش نتواصل مع المخدم');
    }
    setLoading(false);
  };

  const handleOtpComplete = useCallback(
    async (code: string) => {
      if (loading || hasTriggered.current) return;
      hasTriggered.current = true;
      setLoading(true);
      setError('');

      try {
        const em = pendingEmailRef.current || email.trim();
        const res = await fetch('/api/auth/otp-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: em,
            code,
            action: 'login',
          }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.user);
          const pendingRedirect = useAppStore.getState().pendingRedirect;
          if (pendingRedirect) {
            useAppStore.getState().setPendingRedirect(null);
            navigate(pendingRedirect);
          } else {
            const logged = useAuthStore.getState().user;
            navigate(logged && isAdmin(logged) ? 'admin' : 'dashboard');
          }
        } else if (data.isNewUser) {
          setStep('profile');
          setProfileForm({ name: '', phone: '', wilaya: '', address: '' });
          setProfileErrors({});
        } else {
          setError(data.error || 'حصل مشكل. جرب مرة أخرى.');
          setOtp('');
          hasTriggered.current = false;
        }
      } catch {
        setError('حصل مشكل في التحقق. جرب مرة أخرى.');
        setOtp('');
        hasTriggered.current = false;
      }
      setLoading(false);
    },
    [loading, setUser, navigate, email]
  );

  const handleProfileSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!profileForm.name.trim()) errs.name = 'الاسم لازم';
    const phoneDigits = profileForm.phone.replace(/[^\d]/g, '');
    if (phoneDigits.length !== 8 || !/^[259]/.test(phoneDigits)) {
      errs.phone = 'رقم هاتف تونسي صحيح (8 أرقام)';
    }
    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const em = pendingEmailRef.current || email.trim();
      const res = await fetch('/api/auth/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: em,
          action: 'register',
          name: profileForm.name.trim(),
          phone: profileForm.phone,
          wilaya: profileForm.wilaya || undefined,
          address: profileForm.address || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        const pendingRedirect = useAppStore.getState().pendingRedirect;
        if (pendingRedirect) {
          useAppStore.getState().setPendingRedirect(null);
          navigate(pendingRedirect);
        } else {
          const logged = useAuthStore.getState().user;
          navigate(logged && isAdmin(logged) ? 'admin' : 'dashboard');
        }
      } else {
        setError(data.error || 'حصل مشكل أثناء التسجيل. جرب مرة أخرى.');
        setLoading(false);
      }
    } catch {
      setError('ما نقدرش نتواصل مع المخدم. جرب مرة أخرى.');
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-carely-mint flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-3">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-carely-dark">Carely.tn</h1>
          <p className="text-sm text-carely-gray mt-1">حماية العائلة الرقمية في تونس</p>
        </div>

        <Card className="carely-card p-5 sm:p-6">
          <CardContent className="p-0">
            {step === 'email' && (
              <>
                <h2 className="text-xl font-bold text-carely-dark mb-2 text-center">
                  تسجيل الدخول
                </h2>
                <p className="text-sm text-carely-gray text-center mb-6">
                  أدخل بريدك الإلكتروني ونرسلك كود التحقق
                </p>

                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-carely-light flex items-center justify-center">
                    <Mail className="w-10 h-10 text-carely-green" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-carely-dark font-semibold">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="h-12 text-base"
                      dir="ltr"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleSendOtp}
                    disabled={loading || !isValidEmail(email)}
                    className="carely-btn-primary w-full h-12 text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري الإرسال...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 ml-2" />
                        إرسال كود التحقق
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-carely-gray/60 mt-6">
                  بالدخول، أنت توافق على{' '}
                  <a href="/terms" className="text-carely-green hover:underline">
                    شروط الاستخدام
                  </a>{' '}
                  و{' '}
                  <a href="/privacy" className="text-carely-green hover:underline">
                    سياسة الخصوصية
                  </a>
                </p>
              </>
            )}

            {step === 'otp' && (
              <>
                <h2 className="text-xl font-bold text-carely-dark mb-2 text-center">
                  تأكيد البريد
                </h2>
                <p className="text-sm text-carely-gray text-center mb-4">
                  أدخل كود الـ 6 أرقام المرسل إلى
                </p>
                <p
                  className="text-base font-bold text-carely-green text-center mb-6 break-all"
                  dir="ltr"
                >
                  {confirmedEmail}
                </p>

                <div className="flex justify-center mb-6">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleOtpComplete}
                    maxLength={6}
                    containerClassName="gap-2 justify-center"
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator className="w-4" />
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={3}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p className="text-xs text-carely-gray text-center mb-4">
                  {otp.length < 6
                    ? `${6 - otp.length} أرقام باقية...`
                    : loading
                      ? 'جاري التحقق...'
                      : 'جاري التحقق...'}
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium mb-4">
                    {error}
                  </div>
                )}
                {loading && (
                  <div className="flex justify-center mb-4">
                    <Loader2 className="h-6 w-6 animate-spin text-carely-green" />
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handleBackToEmail}
                    className="flex items-center gap-1 text-sm text-carely-gray hover:text-carely-dark transition-colors"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    تعديل البريد
                  </button>
                  {cooldown > 0 ? (
                    <span className="text-sm text-carely-gray">
                      أعد الإرسال بعد{' '}
                      <span className="font-bold text-carely-dark">{cooldown}</span> ثانية
                    </span>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="flex items-center gap-1 text-sm text-carely-green font-bold hover:underline"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      إعادة إرسال الكود
                    </button>
                  )}
                </div>
              </>
            )}

            {step === 'profile' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-carely-light flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-carely-green" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-carely-dark mb-2 text-center">
                  أكمل بروفايلك
                </h2>
                <p className="text-sm text-carely-gray text-center mb-6">
                  مرحبا بيك في Carely.tn! أدخل معلوماتك الأساسية
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="profile-name"
                      className="text-carely-dark font-semibold"
                    >
                      الاسم الكامل *
                    </Label>
                    <Input
                      id="profile-name"
                      placeholder="محمد بن علي"
                      value={profileForm.name}
                      onChange={(e) => updateProfileField('name', e.target.value)}
                      className="w-full h-11"
                      autoFocus
                    />
                    {profileErrors.name && (
                      <p className="text-red-500 text-xs">{profileErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-phone" className="text-carely-dark font-semibold">
                      رقم الهاتف التونسي *
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-carely-mint rounded-xl px-3 h-11 border border-carely-light shrink-0">
                        <span className="text-lg">🇹🇳</span>
                        <span className="text-xs font-bold text-carely-dark">+216</span>
                      </div>
                      <Input
                        id="profile-phone"
                        placeholder="2X XXX XXX"
                        value={profileForm.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="flex-1 h-11 text-center font-bold tracking-widest"
                        dir="ltr"
                        inputMode="numeric"
                        maxLength={11}
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="text-red-500 text-xs">{profileErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-carely-dark font-semibold">
                      الولاية{' '}
                      <span className="text-carely-gray font-normal">(اختياري)</span>
                    </Label>
                    <Select
                      value={profileForm.wilaya}
                      onValueChange={(val) => updateProfileField('wilaya', val)}
                    >
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="اختار الولاية" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto carely-scroll">
                        {WILAYAS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-carely-dark font-semibold">
                      العنوان{' '}
                      <span className="text-carely-gray font-normal">(اختياري)</span>
                    </Label>
                    <Textarea
                      placeholder="شارع الحبيب بورقيبة، تونس العاصمة"
                      value={profileForm.address}
                      onChange={(e) => updateProfileField('address', e.target.value)}
                      className="w-full min-h-[70px]"
                      rows={2}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleProfileSubmit}
                    disabled={
                      loading || !profileForm.name.trim() || profileForm.phone.replace(/\D/g, '').length !== 8
                    }
                    className="carely-btn-primary w-full h-12 text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري التسجيل...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 ml-2" />
                        إنشاء الحساب والمتابعة
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
