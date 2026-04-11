'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Loader2, ArrowLeft, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';

type Step = 'phone' | 'otp';

async function verifyAndLogin(
  phone: string,
  otp: string,
  otpLoginFn: (phone: string) => Promise<boolean>,
  navigateFn: (page: 'admin' | 'dashboard' | 'register') => void,
  setErrorFn: (msg: string) => void,
  setLoadingFn: (loading: boolean) => void,
  setOtpFn: (otp: string) => void,
) {
  setLoadingFn(true);
  setErrorFn('');

  try {
    const verifyRes = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.replace(/[^\d]/g, ''), code: otp }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      setErrorFn(verifyData.error || 'الكود غالط. جرب مرة أخرى.');
      setOtpFn('');
      return false;
    }

    const success = await otpLoginFn(phone.replace(/[^\d]/g, ''));

    if (success) {
      const { useAuthStore: authStore } = await import('@/store');
      const user = authStore.getState().user;
      navigateFn(user?.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      setErrorFn('');
      navigateFn('register');
    }

    return true;
  } catch {
    setErrorFn('حصل مشكل. جرب مرة أخرى.');
    setOtpFn('');
    return false;
  } finally {
    setLoadingFn(false);
  }
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [cooldown, setCooldown] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const hasTriggered = useRef(false);

  const otpLogin = useAuthStore((s) => s.otpLogin);
  const navigate = useAppStore((s) => s.navigate);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus OTP
  useEffect(() => {
    if (step === 'otp') {
      hasTriggered.current = false;
      setTimeout(() => {
        const slot = document.querySelector('[data-slot="input-otp-slot"]') as HTMLElement;
        slot?.focus();
      }, 100);
    }
  }, [step]);

  const formatPhoneDisplay = (p: string) => {
    const digits = p.replace(/[^\d]/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + ' ' + digits.slice(2);
    return digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneDisplay(value.replace(/[^\d]/g, '').slice(0, 8)));
    setError('');
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length !== 8) { setError('أدخل رقم هاتف صحيح (8 أرقام)'); return; }
    if (!/^[259]/.test(digits)) { setError('رقم الهاتف لازم يبدا بـ 2 أو 5 أو 9'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || 'حصل مشكل. جرب مرة أخرى.'); setLoading(false); return; }

      setDevOtp(data.devOtp);
      setVerifiedPhone(data.phone);
      setStep('otp');
      setCooldown(60);
      setOtp('');
    } catch {
      setError('ما نقدرش نتواصل مع المخدم.');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/[^\d]/g, '') }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'حصل مشكل.');
      else { setDevOtp(data.devOtp); setCooldown(60); }
    } catch { setError('ما نقدرش نتواصل مع المخدم.'); }
    setLoading(false);
  };

  const handleOtpComplete = (code: string) => {
    if (loading || hasTriggered.current) return;
    hasTriggered.current = true;
    verifyAndLogin(phone, code, otpLogin, navigate, setError, setLoading, setOtp);
  };

  return (
    <div className="min-h-screen bg-carely-mint flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-3">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-carely-dark">Carely.tn</h1>
          <p className="text-sm text-carely-gray mt-1">حماية العائلة الرقمية في تونس</p>
        </div>

        <Card className="carely-card p-6">
          <CardContent className="p-0">

            {/* STEP 1: Phone */}
            {step === 'phone' && (
              <>
                <h2 className="text-xl font-bold text-carely-dark mb-2 text-center">تسجيل الدخول</h2>
                <p className="text-sm text-carely-gray text-center mb-6">
                  أدخل رقم هاتفك التونسي ونرسلك كود تفعيل
                </p>

                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-carely-light flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-carely-green" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-carely-dark font-semibold">رقم الهاتف</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-carely-mint rounded-xl px-4 h-12 border border-carely-light shrink-0">
                        <span className="text-lg">🇹🇳</span>
                        <span className="text-sm font-bold text-carely-dark">+216</span>
                      </div>
                      <Input id="phone" placeholder="2X XXX XXX" value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="flex-1 h-12 text-lg tracking-widest text-center font-bold"
                        dir="ltr" inputMode="numeric" autoFocus maxLength={11} />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">{error}</div>
                  )}

                  <Button onClick={handleSendOtp}
                    disabled={loading || phone.replace(/[^\d]/g, '').length !== 8}
                    className="carely-btn-primary w-full h-12 text-base disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />جاري الإرسال...</span>
                    ) : (
                      <><ShieldCheck className="w-5 h-5 ml-2" />إرسال كود التفعيل</>
                    )}
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-carely-gray">
                    ما عندكش حساب؟{' '}
                    <button onClick={() => navigate('register')} className="text-carely-green font-bold hover:underline">سجل الآن</button>
                  </p>
                </div>
              </>
            )}

            {/* STEP 2: OTP */}
            {step === 'otp' && (
              <>
                <h2 className="text-xl font-bold text-carely-dark mb-2 text-center">تأكيد الرقم</h2>
                <p className="text-sm text-carely-gray text-center mb-4">أدخل كود الـ 6 أرقام اللي وصلك على</p>
                <p className="text-base font-bold text-carely-green text-center mb-6" dir="ltr">{verifiedPhone}</p>

                <div className="flex justify-center mb-6">
                  <InputOTP value={otp} onChange={setOtp} onComplete={handleOtpComplete} maxLength={6}
                    containerClassName="gap-2 justify-center" disabled={loading}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green" />
                    </InputOTPGroup>
                    <InputOTPSeparator className="w-4" />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold rounded-xl border-2 border-carely-light focus:border-carely-green" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p className="text-xs text-carely-gray text-center mb-4">
                  {otp.length < 6 ? `${6 - otp.length} أرقام باقية...` : (loading ? 'جاري التحقق...' : 'جاري التحقق...')}
                </p>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium mb-4">{error}</div>}

                {devOtp && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm text-center font-medium mb-4">
                    🧪 كود التطوير: <span className="font-mono text-lg font-bold tracking-widest" dir="ltr">{devOtp}</span>
                  </div>
                )}

                {loading && <div className="flex justify-center mb-4"><Loader2 className="h-6 w-6 animate-spin text-carely-green" /></div>}

                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                    className="flex items-center gap-1 text-sm text-carely-gray hover:text-carely-dark transition-colors" disabled={loading}>
                    <ArrowLeft className="w-4 h-4" />تعديل الرقم
                  </button>
                  {cooldown > 0 ? (
                    <span className="text-sm text-carely-gray">أعد الإرسال بعد <span className="font-bold text-carely-dark">{cooldown}</span> ثانية</span>
                  ) : (
                    <button onClick={handleResendOtp} disabled={loading}
                      className="flex items-center gap-1 text-sm text-carely-green font-bold hover:underline">
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />إعادة إرسال الكود
                    </button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-carely-gray/60 mt-4">
          بالدخول، أنت توافق على{' '}
          <span className="text-carely-green cursor-pointer hover:underline">شروط الاستخدام</span>
          {' '}و{' '}
          <span className="text-carely-green cursor-pointer hover:underline">سياسة الخصوصية</span>
        </p>
      </div>
    </div>
  );
}
