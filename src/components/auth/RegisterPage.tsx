'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { WILAYAS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Loader2, ArrowLeft, ShieldCheck, RefreshCw, Check } from 'lucide-react';
import {
  sendPhoneOTP,
  verifyPhoneOTP,
  resetRecaptcha,
  type ConfirmationResult,
} from '@/lib/firebase-auth';

type Step = 'info' | 'otp' | 'success';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('info');
  const [form, setForm] = useState({ name: '', phone: '', address: '', wilaya: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const hasTriggered = useRef(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const { firebaseRegister } = useAuthStore((s) => s);
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

  useEffect(() => {
    return () => { resetRecaptcha(); };
  }, []);

  const formatPhoneDisplay = (p: string) => {
    const digits = p.replace(/[^\d]/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + ' ' + digits.slice(2);
    return digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8);
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, phone: formatPhoneDisplay(value.replace(/[^\d]/g, '').slice(0, 8)) }));
    if (errors.phone) setErrors((prev) => { const n = { ...prev }; delete n.phone; return n; });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateInfo = () => {
    const errs: Record<string, string> = {};
    const digits = form.phone.replace(/[^\d]/g, '');
    if (!form.name.trim()) errs.name = 'الاسم لازم';
    if (digits.length !== 8) errs.phone = 'رقم الهاتف لازم يكون 8 أرقام';
    else if (!/^[259]/.test(digits)) errs.phone = 'رقم الهاتف لازم يبدا بـ 2 أو 5 أو 9';
    return errs;
  };

  const handleSendOtp = async () => {
    setError('');
    const errs = validateInfo();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);

    try {
      const digits = form.phone.replace(/[^\d]/g, '');
      const fullNumber = '+216' + digits;
      const confirmationResult = await sendPhoneOTP(fullNumber);
      confirmationRef.current = confirmationResult;
      setConfirmedPhone('+216 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8));
      setStep('otp');
      setCooldown(60);
      setOtp('');
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      console.error('Firebase OTP error:', firebaseErr.code, firebaseErr.message);

      switch (firebaseErr.code) {
        case 'auth/invalid-phone-number':
          setError('رقم الهاتف غير صالح.');
          break;
        case 'auth/too-many-requests':
          setError('محاولات كثيرة. استنى شوية.');
          break;
        case 'auth/captcha-check-failed':
          setError('تحقق الأمان فشل. حاول تحمّل الصفحة مرة أخرى.');
          break;
        case 'auth/unauthorized-domain':
          setError('الموقع غير مسجل في Firebase. لازم تضيف الدومين في Firebase Console.');
          break;
        default:
          setError(firebaseErr.message || 'حصل مشكل في إرسال الكود. جرب مرة أخرى.');
      }
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const digits = form.phone.replace(/[^\d]/g, '');
      const fullNumber = '+216' + digits;
      const confirmationResult = await sendPhoneOTP(fullNumber);
      confirmationRef.current = confirmationResult;
      setCooldown(60);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code !== 'auth/too-many-requests') {
        setError('حصل مشكل في إعادة الإرسال.');
      }
    }
    setLoading(false);
  };

  const handleOtpComplete = useCallback(async (code: string) => {
    if (loading || hasTriggered.current || !confirmationRef.current) return;
    hasTriggered.current = true;
    setLoading(true);
    setError('');

    try {
      const result = await verifyPhoneOTP(confirmationRef.current, code);

      const success = await firebaseRegister({
        idToken: result.idToken,
        name: form.name,
        phone: form.phone.replace(/[^\d]/g, ''),
        address: form.address,
        wilaya: form.wilaya,
      });

      if (success) {
        setStep('success');
        setTimeout(() => navigate('dashboard'), 1500);
      } else {
        const authStore = useAuthStore.getState();
        if (authStore.lastError?.includes('بهاد الرقم فعلا')) {
          setError('عندك حساب بهاد الرقم فعلا. سجل دخول.');
        } else {
          setError(authStore.lastError || 'حصل مشكل أثناء التسجيل.');
        }
        setOtp('');
        hasTriggered.current = false;
      }
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === 'auth/invalid-verification-code') {
        setError('الكود غالط. جرب مرة أخرى.');
      } else if (firebaseErr.code === 'auth/code-expired') {
        setError('الكود انتهى. أرسل كود جديد.');
      } else {
        setError('حصل مشكل في التحقق. جرب مرة أخرى.');
      }
      setOtp('');
      hasTriggered.current = false;
    }
    setLoading(false);
  }, [loading, firebaseRegister, form, navigate]);

  return (
    <div className="min-h-screen bg-carely-mint flex items-center justify-center p-4 py-8" dir="rtl">
      {/* reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-3">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-carely-dark">Carely.tn</h1>
        </div>

        <Card className="carely-card p-6">
          <CardContent className="p-0">

            {/* STEP 1: Info */}
            {step === 'info' && (
              <>
                <h2 className="text-xl font-bold text-carely-dark mb-2 text-center">إنشاء حساب جديد</h2>
                <p className="text-sm text-carely-gray text-center mb-6">أدخل معلوماتك ونرسلك كود تفعيل على هاتفك</p>

                <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-carely-dark font-semibold">الاسم الكامل</Label>
                    <Input placeholder="محمد بن علي" value={form.name}
                      onChange={(e) => updateField('name', e.target.value)} className="w-full h-11" autoFocus />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-carely-dark font-semibold">رقم الهاتف</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-carely-mint rounded-xl px-4 h-11 border border-carely-light shrink-0">
                        <span className="text-lg">🇹🇳</span>
                        <span className="text-sm font-bold text-carely-dark">+216</span>
                      </div>
                      <Input placeholder="2X XXX XXX" value={form.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="flex-1 h-11 tracking-widest text-center font-bold"
                        dir="ltr" inputMode="numeric" maxLength={11} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-carely-dark font-semibold">
                      العنوان <span className="text-carely-gray font-normal">(اختياري)</span>
                    </Label>
                    <Textarea placeholder="شارع الحبيب بورقيبة، تونس العاصمة" value={form.address}
                      onChange={(e) => updateField('address', e.target.value)} className="w-full min-h-[70px]" rows={2} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-carely-dark font-semibold">
                      الولاية <span className="text-carely-gray font-normal">(اختياري)</span>
                    </Label>
                    <Select value={form.wilaya} onValueChange={(val) => updateField('wilaya', val)}>
                      <SelectTrigger className="w-full h-11"><SelectValue placeholder="اختار الولاية" /></SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto carely-scroll">
                        {WILAYAS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">{error}</div>}

                  <Button type="submit" disabled={loading} className="carely-btn-primary w-full h-12 text-base disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />جاري الإرسال...</span>
                    ) : (
                      <><ShieldCheck className="w-5 h-5 ml-2" />إرسال كود التفعيل</>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-carely-gray">
                    عندك حساب؟{' '}
                    <button onClick={() => navigate('login')} className="text-carely-green font-bold hover:underline">سجل دخول</button>
                  </p>
                </div>
              </>
            )}

            {/* STEP 2: OTP */}
            {step === 'otp' && (
              <>
                <h2 className="text-xl font-bold text-carely-dark mb-2 text-center">تأكيد رقم الهاتف</h2>
                <p className="text-sm text-carely-gray text-center mb-1">أدخل كود الـ 6 أرقام اللي وصلك على</p>
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
                  {otp.length < 6 ? `${6 - otp.length} أرقام باقية...` : 'جاري التحقق والتسجيل...'}
                </p>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium mb-4">{error}</div>}
                {loading && <div className="flex justify-center mb-4"><Loader2 className="h-6 w-6 animate-spin text-carely-green" /></div>}

                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => { resetRecaptcha(); setStep('info'); setOtp(''); setError(''); }}
                    className="flex items-center gap-1 text-sm text-carely-gray hover:text-carely-dark transition-colors" disabled={loading}>
                    <ArrowLeft className="w-4 h-4" />رجوع للمعلومات
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

            {/* STEP 3: Success */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-carely-dark mb-2">تم إنشاء حسابك بنجاح! 🎉</h2>
                <p className="text-carely-gray mb-6">أهلا بيك في Carely.tn</p>
                <Loader2 className="h-5 w-5 animate-spin text-carely-green mx-auto" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
