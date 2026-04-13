'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

export default function SuperAdminPinGate() {
  const navigate = useAppStore((s) => s.navigate);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/superadmin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'PIN غير صحيح');
        setLoading(false);
        setPin('');
        inputRef.current?.focus();
        return;
      }

      // Grant access — mark session so they don't need PIN again for 24h
      sessionStorage.setItem('sa_pin_ok', '1');
      navigate('superadmin-login');
    } catch {
      setError('ما نقدرش نتواصل مع المخدم');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 bg-black flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-black">رمز الدخول</h1>
          <p className="text-sm text-gray-500 mt-1">أدخل رمز PIN للوصول لوحة التحكم</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="sa-pin" className="block text-sm font-bold mb-2 text-black">
                رمز PIN
              </label>
              <input
                ref={inputRef}
                id="sa-pin"
                type="password"
                inputMode="numeric"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••••"
                required
                className="w-full h-14 text-2xl text-center tracking-[0.5em] font-mono font-bold rounded-xl border-2 border-gray-200 focus:border-black focus:outline-none transition-colors px-4"
                dir="ltr"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full h-12 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('home')}
              className="text-sm font-semibold text-gray-400 hover:text-black transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للموقع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
