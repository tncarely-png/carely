'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

type Step = 'email' | 'otp';

export default function SuperAdminLoginPage() {
  const { navigate } = useAppStore();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        const slot = document.querySelector('[data-slot="input-otp-slot"]') as HTMLElement;
        slot?.focus();
      }, 100);
    }
  }, [step]);

  const sendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'تعذر إرسال الكود');
        setLoading(false);
        return;
      }
      setStep('otp');
      setCooldown(60);
      setOtp('');
    } catch {
      setError('ما نقدرش نتواصل مع المخدم');
    }
    setLoading(false);
  };

  const verifyComplete = useCallback(
    async (code: string) => {
      if (loading || code.length !== 6) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/superadmin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'فشل تسجيل الدخول');
          setOtp('');
          setLoading(false);
          return;
        }
        sessionStorage.setItem('superadmin_token', data.token);
        sessionStorage.setItem('superadmin_email', data.email);
        navigate('superadmin');
      } catch {
        setError('ما نقدرش نتواصل مع المخدم');
        setOtp('');
      }
      setLoading(false);
    },
    [email, loading, navigate]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#f5f5f5' }}
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#000000' }}
          >
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#000000' }}>
            SuperAdmin
          </h1>
          <p className="text-sm" style={{ color: '#888888' }}>
            لوحة التحكم الرئيسية — Carely.tn
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {step === 'email' && (
            <div className="space-y-5">
              <div className="flex justify-center mb-2">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: '#f4f4f4' }}
                >
                  <Mail className="w-7 h-7" style={{ color: '#000' }} />
                </div>
              </div>
              <p className="text-sm text-center" style={{ color: '#888888' }}>
                أدخل البريد المصرّح به لإرسال كود الدخول
              </p>
              <div>
                <Label
                  htmlFor="sa-email"
                  className="block text-sm font-bold mb-2"
                  style={{ color: '#000000' }}
                >
                  البريد الإلكتروني
                </Label>
                <Input
                  id="sa-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="admin@carely.tn"
                  required
                  className="h-12 text-base rounded-xl"
                  style={{
                    border: '1px solid #e0e0e0',
                    background: '#fafafa',
                  }}
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
              {error && (
                <div
                  className="p-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  }}
                >
                  {error}
                </div>
              )}
              <Button
                type="button"
                onClick={sendCode}
                disabled={loading || !email.trim()}
                className="sa-btn-primary w-full h-12 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري الإرسال...
                  </span>
                ) : (
                  'إرسال كود الدخول'
                )}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-5">
              <p className="text-sm text-center font-medium" style={{ color: '#000' }} dir="ltr">
                {email.trim()}
              </p>
              <Label className="block text-sm font-bold" style={{ color: '#000000' }}>
                كود التحقق (6 أرقام)
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={verifyComplete}
                  disabled={loading}
                  containerClassName="gap-1 justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-11 rounded-lg" />
                    <InputOTPSlot index={1} className="h-12 w-11 rounded-lg" />
                    <InputOTPSlot index={2} className="h-12 w-11 rounded-lg" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="h-12 w-11 rounded-lg" />
                    <InputOTPSlot index={4} className="h-12 w-11 rounded-lg" />
                    <InputOTPSlot index={5} className="h-12 w-11 rounded-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {loading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && (
                <div
                  className="p-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  }}
                >
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError('');
                  }}
                  className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  رجوع
                </button>
                {cooldown > 0 ? (
                  <span className="text-muted-foreground">
                    إعادة الإرسال خلال <strong>{cooldown}</strong> ث
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={loading}
                    className="font-bold text-black hover:underline"
                  >
                    إعادة إرسال الكود
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="text-sm font-semibold hover:underline"
              style={{ color: '#888888' }}
            >
              ← العودة للموقع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
