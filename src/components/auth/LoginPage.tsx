'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Loader2, ArrowLeft, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const hasTriggered = useRef(false);

  const { sendOtp, verifyOtp, otpLogin } = useAuthStore((s) => s);
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

    const result = await sendOtp(digits);

    if (result.success) {
      setConfirmedPhone('+216 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8));
      setStep('otp');
      setCooldown(60);
      setOtp('');
    } else {
      if (result.cooldown) {
        setCooldown(result.cooldown);
      }
      setError(result.error || 'حصل مشكل في إرسال الكود. جرب مرة أخرى.');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    const digits = phone.replace(/[^\d]/g, '');
    const result = await sendOtp(digits);

    if (result.success) {
      setCooldown(60);
    } else {
      if (result.cooldown) {
        setCooldown(result.cooldown);
      }
      if (result.error && !result.error.includes('استنى')) {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleOtpComplete = useCallback(async (code: string) => {
    if (loading || hasTriggered.current) return;
    hasTriggered.current = true;
    setLoading(true);
    setError('');

    const digits = phone.replace(/[^\d]/g, '');

    // Step 1: Verify OTP
    const verifyResult = await verifyOtp(digits, code);

    if (!verifyResult.success) {
      setError(verifyResult.error || 'حصل مشكل في التحقق.');
      setOtp('');
      hasTriggered.current = false;
      setLoading(false);
      return;
    }

    // Step 2: Login
    const loginSuccess = await otpLogin(digits);

    if (loginSuccess) {
      const { useAuthStore: authStore } = await import('@/store');
      const user = authStore.getState().user;
      navigate(user?.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      const authStore = useAuthStore.getState();
      if (authStore.lastError?.includes('ما لقينا') || authStore.lastError?.includes('newUser')) {
        setError('');
        navigate('register');
      } else {
        setError(authStore.lastError || 'حصل مشكل. جرب مرة أخرى.');
        setOtp('');
        hasTriggered.current = false;
      }
    }
    setLoading(false);
  }, [loading, sendOtp, verifyOtp, otpLogin, phone, navigate]);

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
                <p className="text-base font-bold text-carely-green text-center mb-6" dir="ltr">{confirmedPhone}</p>

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
          <a href="/terms" className="text-carely-green hover:underline">شروط الاستخدام</a>
          {' '}و{' '}
          <a href="/privacy" className="text-carely-green hover:underline">سياسة الخصوصية</a>
        </p>
      </div>
    </div>
  );
}
