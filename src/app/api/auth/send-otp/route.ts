import { NextRequest, NextResponse } from 'next/server';
import {
  sendSmsOTP,
  normalizePhone,
  generateOTP,
  otpStore,
  sendCooldowns,
  cleanupExpired,
  OTP_TTL_MS,
  COOLDOWN_MS,
} from '@/lib/sms';

// POST /api/auth/send-otp — Send OTP via SMS to phone number
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف لازم' },
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

    // Rate limit: check cooldown
    const lastSent = sendCooldowns.get(normalizedPhone) || 0;
    const now = Date.now();
    if (now - lastSent < COOLDOWN_MS) {
      const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
      return NextResponse.json(
        { success: false, error: `استنى ${remainingSec} ثانية قبل ما ترسل كود جديد`, cooldown: remainingSec },
        { status: 429 }
      );
    }

    // Send real SMS via RapidAPI
    const smsResult = await sendSmsOTP(normalizedPhone);

    // Always generate a local OTP as verification code
    // If SMS API returned a code, use that one (it's the actual code sent to the phone)
    // Otherwise, generate our own (for fallback scenarios)
    const otpCode = smsResult.otpCode || generateOTP();

    // Store OTP
    otpStore.set(normalizedPhone, {
      code: otpCode,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      sentAt: now,
    });

    // Set cooldown
    sendCooldowns.set(normalizedPhone, now);
    cleanupExpired();

    if (smsResult.success) {
      return NextResponse.json({
        success: true,
        message: 'تم إرسال كود التفعيل على هاتفك ✅',
        phone: normalizedPhone,
      });
    } else {
      // SMS failed — still store OTP but inform user
      return NextResponse.json({
        success: false,
        error: smsResult.message,
        phone: normalizedPhone,
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'حصل مشكل في المخدم. جرب مرة أخرى.' },
      { status: 500 }
    );
  }
}

// GET /api/auth/send-otp?phone=... — Debug: get stored OTP code
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');
  if (!phone) {
    return NextResponse.json({ success: false, error: 'Phone required' }, { status: 400 });
  }
  const normalizedPhone = normalizePhone(phone) || phone;
  const otp = otpStore.get(normalizedPhone);
  if (!otp || Date.now() > otp.expiresAt) {
    return NextResponse.json({ success: false, error: 'No active OTP' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    code: otp.code,
    expiresInSeconds: Math.ceil((otp.expiresAt - Date.now()) / 1000),
    attemptsRemaining: 5 - otp.attempts,
  });
}
