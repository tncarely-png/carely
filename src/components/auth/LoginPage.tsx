'use client';

import { useState } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useAppStore((s) => s.navigate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('لازم تدخل الإيميل وكلمة السر');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        navigate('admin');
      } else {
        navigate('dashboard');
      }
    } else {
      setError('الإيميل أو كلمة السر غالطة');
    }
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

        {/* Login Card */}
        <Card className="carely-card p-6">
          <CardContent className="p-0">
            <h2 className="text-xl font-bold text-carely-dark mb-6 text-center">
              تسجيل الدخول
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-carely-dark font-semibold">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 text-base"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-carely-dark font-semibold">
                  كلمة السر
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 text-base"
                  dir="ltr"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => alert('تواصل معانا على واتساب لإعادة تعيين كلمة السر')}
                  className="text-sm text-carely-green hover:underline font-medium"
                >
                  نسيت كلمة السر؟
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="carely-btn-primary w-full h-12 text-base disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري التسجيل...
                  </span>
                ) : (
                  'سجل دخول'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-carely-gray">
                ما عندكش حساب؟{' '}
                <button
                  onClick={() => navigate('register')}
                  className="text-carely-green font-bold hover:underline"
                >
                  سجل الآن
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
