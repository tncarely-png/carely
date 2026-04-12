'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store';

export default function SuperAdminLoginPage() {
  const { navigate } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/superadmin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'فشل تسجيل الدخول');
        setLoading(false);
        return;
      }

      // Store session token in sessionStorage
      sessionStorage.setItem('superadmin_token', data.token);
      sessionStorage.setItem('superadmin_email', data.email);
      navigate('superadmin');
    } catch {
      setError('ما نقدرش نتواصل مع المخدم');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#f5f5f5' }}
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#000000' }}
          >
            <span className="text-3xl">🛡️</span>
          </div>
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{ color: '#000000' }}
          >
            SuperAdmin
          </h1>
          <p className="text-sm" style={{ color: '#888888' }}>
            لوحة التحكم الرئيسية — Carely.tn
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@carely.tn"
                required
                className="h-12 text-base rounded-xl"
                style={{
                  border: '1px solid #e0e0e0',
                  background: '#fafafa',
                }}
                dir="ltr"
              />
            </div>

            <div>
              <Label
                htmlFor="sa-password"
                className="block text-sm font-bold mb-2"
                style={{ color: '#000000' }}
              >
                كلمة المرور
              </Label>
              <Input
                id="sa-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 text-base rounded-xl"
                style={{
                  border: '1px solid #e0e0e0',
                  background: '#fafafa',
                }}
                dir="ltr"
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
              type="submit"
              disabled={loading}
              className="sa-btn-primary w-full h-12 text-base"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
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
