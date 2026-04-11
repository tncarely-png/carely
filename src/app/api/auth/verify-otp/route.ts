import { NextRequest, NextResponse } from 'next/server';

const MAX_ATTEMPTS = 5;

// Global shared OTP store (shared with send-otp/route.ts via globalThis)
declare global {
  var __carely_otp_store: Map<string, { code: string; expiresAt: number; attempts: number }> | undefined;
}

function getStore(): Map<string, { code: string; expiresAt: number; attempts: number }> {
  if (!globalThis.__carely_otp_store) {
    globalThis.__carely_otp_store = new Map();
  }
  return globalThis.__carely_otp_store;
}

function normalizePhone(phone: string): string | null {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length === 8 && /^[259]/.test(cleaned)) {
    return '+216 ' + cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 5) + ' ' + cleaned.slice(5, 8);
  }
  if (cleaned.length === 10 && cleaned.startsWith('216')) {
    const local = cleaned.slice(3);
    return '+216 ' + local.slice(0, 2) + ' ' + local.slice(2, 5) + ' ' + local.slice(5, 8);
  }
  if (cleaned.startsWith('+216') && cleaned.length === 13) {
    const local = cleaned.slice(4);
    return '+216 ' + local.slice(0, 2) + ' ' + local.slice(2, 5) + ' ' + local.slice(5, 8);
  }
  if (cleaned.length >= 10) return '+' + cleaned;
  return null;
}

// POST /api/auth/verify-otp — Verify OTP code
export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف والكود لازمين' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      );
    }

    const store = getStore();
    const otpEntry = store.get(normalizedPhone);

    if (!otpEntry) {
      return NextResponse.json(
        { success: false, error: 'ما عندكش كود تفعيل. أرسل كود جديد.' },
        { status: 404 }
      );
    }

    // Check expiration
    if (Date.now() > otpEntry.expiresAt) {
      store.delete(normalizedPhone);
      return NextResponse.json(
        { success: false, error: 'الكود انتهى. أرسل كود جديد.' },
        { status: 410 }
      );
    }

    // Check attempts
    if (otpEntry.attempts >= MAX_ATTEMPTS) {
      store.delete(normalizedPhone);
      return NextResponse.json(
        { success: false, error: 'حابات كثيرة. أرسل كود جديد.' },
        { status: 429 }
      );
    }

    // Increment attempts
    otpEntry.attempts++;

    // Verify code
    if (code !== otpEntry.code) {
      const remaining = MAX_ATTEMPTS - otpEntry.attempts;
      return NextResponse.json(
        { success: false, error: `الكود غالط. عندك ${remaining} محاولات بعد.`, attemptsRemaining: remaining },
        { status: 400 }
      );
    }

    // Success — remove OTP
    store.delete(normalizedPhone);

    return NextResponse.json({
      success: true,
      message: 'تم التحقق بنجاح ✅',
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'حصل مشكل في المخدم. جرب مرة أخرى.' },
      { status: 500 }
    );
  }
}
