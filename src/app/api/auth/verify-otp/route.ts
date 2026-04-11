import { NextRequest, NextResponse } from 'next/server';
import {
  normalizePhone,
  otpStore,
  MAX_ATTEMPTS,
} from '@/lib/sms';

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

    const otpEntry = otpStore.get(normalizedPhone);

    if (!otpEntry) {
      return NextResponse.json(
        { success: false, error: 'ما عندكش كود تفعيل. أرسل كود جديد.' },
        { status: 404 }
      );
    }

    // Check expiration
    if (Date.now() > otpEntry.expiresAt) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json(
        { success: false, error: 'الكود انتهى. أرسل كود جديد.' },
        { status: 410 }
      );
    }

    // Check attempts
    if (otpEntry.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json(
        { success: false, error: 'محاولات كثيرة. أرسل كود جديد.' },
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
    otpStore.delete(normalizedPhone);

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
