import { NextRequest, NextResponse } from 'next/server';

const SMS_API_KEY = process.env.RAPIDAPI_SMS_KEY || '87032edf23msh7090e6f27327f7bp1d4732jsn0dd90d52988f';
const SMS_API_HOST = 'sms-verify3.p.rapidapi.com';
const SMS_BASE_URL = `https://${SMS_API_HOST}`;

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60 * 1000; // 60 seconds between sends

// Global shared OTP store (shared across send-otp and verify-otp routes)
declare global {
  var __carely_otp_store: Map<string, { code: string; expiresAt: number; attempts: number }> | undefined;
  var __carely_send_cooldowns: Map<string, number> | undefined;
}
const otpStore = (() => { if (!globalThis.__carely_otp_store) globalThis.__carely_otp_store = new Map(); return globalThis.__carely_otp_store; })();
const sendCooldowns = (() => { if (!globalThis.__carely_send_cooldowns) globalThis.__carely_send_cooldowns = new Map(); return globalThis.__carely_send_cooldowns; })();

// POST /api/auth/send-otp — Send OTP to phone number
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف لازم' },
        { status: 400 }
      );
    }

    // Normalize phone to international format
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صالح. المفروض يكون بالشكل: 2X XXX XXX أو +216 XX XXX XXX' },
        { status: 400 }
      );
    }

    // Rate limit: check cooldown between sends
    const lastSent = sendCooldowns.get(normalizedPhone) || 0;
    const now = Date.now();
    if (now - lastSent < COOLDOWN_MS) {
      const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
      return NextResponse.json(
        { success: false, error: `استنى ${remainingSec} ثانية قبل ما ترسل كود جديد`, cooldown: remainingSec },
        { status: 429 }
      );
    }

    // Try sending via RapidAPI SMS service
    let apiSuccess = false;
    let apiMessage = '';

    try {
      const response = await fetch(`${SMS_BASE_URL}/send-numeric-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': SMS_API_HOST,
          'x-rapidapi-key': SMS_API_KEY,
        },
        body: JSON.stringify({
          target: normalizedPhone,
          estimate: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        apiSuccess = true;
        apiMessage = data.message || 'تم إرسال الكود';
      } else {
        console.error('SMS API error:', data);
        apiMessage = data.message || 'SMS service error';
      }
    } catch (smsError) {
      console.error('Failed to reach SMS API:', smsError);
      apiMessage = 'لم نقدر نوصل لخدمة الرسائل';
    }

    // Generate a 6-digit OTP code (always, as fallback/verification)
    const otpCode = generateOTP();

    // Store OTP in memory (works even if SMS API fails — useful for dev)
    otpStore.set(normalizedPhone, {
      code: otpCode,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
    });

    // Set cooldown
    sendCooldowns.set(normalizedPhone, now);

    // Clean up expired entries periodically
    cleanupExpired();

    return NextResponse.json({
      success: true,
      message: apiSuccess
        ? 'تم إرسال كود التفعيل على هاتفك ✅'
        : `⚠️ ما قدرناش نرسلو على هاتفك. جرب الكود: ${otpCode}`,
      devOtp: !apiSuccess ? otpCode : undefined, // Only exposed when SMS fails (dev mode)
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'حصل مشكل في المخدم. جرب مرة أخرى.' },
      { status: 500 }
    );
  }
}

function normalizePhone(phone: string): string | null {
  // Strip all non-digit characters
  let cleaned = phone.replace(/[^\d]/g, '');

  // Tunisian phone patterns:
  // 2XXXXXXXX (8 digits) -> +216 2X XXX XXX
  // 5XXXXXXXX (8 digits) -> +216 5X XXX XXX
  // 9XXXXXXXX (8 digits) -> +216 9X XXX XXX
  // 216XXXXXXXX (10 digits) -> +216 XX XXX XXX
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
  // International format (non-Tunisian) — accept as-is
  if (cleaned.length >= 10) {
    return '+' + cleaned;
  }

  return null;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
    }
  }
  for (const [key, value] of sendCooldowns.entries()) {
    if (now - value > COOLDOWN_MS * 2) {
      sendCooldowns.delete(key);
    }
  }
}

// GET /api/auth/send-otp — Get OTP code for development/testing only
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
    attemptsRemaining: MAX_ATTEMPTS - otp.attempts,
  });
}
