/**
 * Server-side SMS sending via RapidAPI SMS-Verify3.
 * No reCAPTCHA needed — pure server-to-server HTTP call.
 */

const SMS_API_KEY = process.env.RAPIDAPI_SMS_KEY || '87032edf23msh7090e6f27327f7bp1d4732jsn0dd90d52988f';
const SMS_API_HOST = 'sms-verify3.p.rapidapi.com';
const SMS_BASE_URL = `https://${SMS_API_HOST}`;

export interface SendSmsResult {
  success: boolean;
  message: string;
  otpCode?: string; // Returned by SMS-Verify3 API (for verification)
}

/**
 * Send a numeric verification SMS to a phone number via RapidAPI SMS-Verify3.
 * The API sends a real SMS AND returns the code for server-side verification.
 */
export async function sendSmsOTP(fullPhoneNumber: string): Promise<SendSmsResult> {
  try {
    const response = await fetch(`${SMS_BASE_URL}/send-numeric-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': SMS_API_HOST,
        'x-rapidapi-key': SMS_API_KEY,
      },
      body: JSON.stringify({
        target: fullPhoneNumber,
        estimate: true,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'تم إرسال كود التفعيل على هاتفك ✅',
        otpCode: data.verify_code || data.code || data.otp,
      };
    } else {
      console.error('SMS API error:', response.status, data);
      return {
        success: false,
        message: data.message || `خطأ في خدمة الرسائل (${response.status})`,
      };
    }
  } catch (err) {
    console.error('Failed to reach SMS API:', err);
    return {
      success: false,
      message: 'لم نقدر نوصل لخدمة الرسائل. جرب مرة أخرى.',
    };
  }
}

// ── OTP Store (in-memory, shared across routes) ──

export interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
}

declare global {
  var __carely_otp_store: Map<string, OtpEntry> | undefined;
  var __carely_send_cooldowns: Map<string, number> | undefined;
}

export const otpStore: Map<string, OtpEntry> = (() => {
  if (!globalThis.__carely_otp_store) globalThis.__carely_otp_store = new Map();
  return globalThis.__carely_otp_store;
})();

export const sendCooldowns: Map<string, number> = (() => {
  if (!globalThis.__carely_send_cooldowns) globalThis.__carely_send_cooldowns = new Map();
  return globalThis.__carely_send_cooldowns;
})();

export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_ATTEMPTS = 5;
export const COOLDOWN_MS = 60 * 1000; // 60 seconds between sends

/**
 * Clean up expired OTP entries.
 */
export function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) otpStore.delete(key);
  }
  for (const [key, ts] of sendCooldowns.entries()) {
    if (now - ts > COOLDOWN_MS * 2) sendCooldowns.delete(key);
  }
}

/**
 * Normalize a Tunisian phone number to international format.
 */
export function normalizePhone(phone: string): string | null {
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

/**
 * Generate a random 6-digit OTP code.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
