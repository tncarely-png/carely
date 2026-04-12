'use client';

import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";

// ── Module-level state ──
let confirmationResult: ConfirmationResult | null = null;

// ── Extend Window for recaptchaVerifier ──
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// ── Error code → Arabic message mapping ──
const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/invalid-phone-number': 'رقم الهاتف غير صالح',
  'auth/too-many-requests': 'محاولات كثيرة. حاول بعد شوية',
  'auth/invalid-verification-code': 'الكود غالط. حاول مرة أخرى',
  'auth/code-expired': 'الكود انتهى. أرسل كود جديد',
  'auth/captcha-check-failed': 'أعد تحميل الصفحة وحاول مرة أخرى',
  'auth/quota-exceeded': 'تجاوزنا الحد اليومي. جرب غدًا',
  'auth/missing-phone-number': 'أدخل رقم الهاتف',
  'auth/unauthorized-domain': 'الموقع غير مسجل في Firebase',
};

/**
 * Normalize a Tunisian phone number to E.164 format (+216XXXXXXXX).
 * Handles: "26107128", "21626107128", "0021626107128"
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');

  // 8 digits starting with 2/5/9 → Tunisian local
  if (cleaned.length === 8 && /^[259]/.test(cleaned)) {
    return '+216' + cleaned;
  }
  // 10 digits starting with 216 → +216XXXXXXXX
  if (cleaned.length === 10 && cleaned.startsWith('216')) {
    return '+216' + cleaned.slice(3);
  }
  // 12 digits starting with 00216 → +216XXXXXXXX
  if (cleaned.length === 12 && cleaned.startsWith('00216')) {
    return '+216' + cleaned.slice(5);
  }
  // Already has +
  if (cleaned.startsWith('216') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  // Already E.164
  if (cleaned.startsWith('+216')) {
    return '+' + cleaned.replace('+', '');
  }

  return phone;
}

/**
 * Initialize invisible reCAPTCHA verifier.
 * Stores it on window.recaptchaVerifier.
 * Checks if already initialized to avoid double init.
 */
export function initRecaptcha(containerId: string = 'recaptcha-container'): void {
  // Avoid double init
  if (window.recaptchaVerifier) {
    return;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved — SMS will be sent automatically
    },
    'expired-callback': () => {
      // Token expired — user needs to redo verification
      resetRecaptcha();
    },
  });
}

/**
 * Send OTP to a phone number via Firebase Phone Auth.
 * Requires initRecaptcha() to have been called first.
 * On error: calls resetRecaptcha() then returns Arabic error message.
 */
export async function sendFirebaseOTP(phoneE164: string): Promise<ConfirmationResult | string> {
  try {
    if (!window.recaptchaVerifier) {
      return 'مشكلة في التحقق الأمني. أعد تحميل الصفحة.';
    }

    confirmationResult = await signInWithPhoneNumber(auth, phoneE164, window.recaptchaVerifier);
    return confirmationResult;
  } catch (err: unknown) {
    const fbErr = err as { code?: string; message?: string };
    console.error('sendFirebaseOTP error:', fbErr.code, fbErr.message);

    // Reset reCAPTCHA on error so user can retry
    resetRecaptcha();

    // Handle error code -39 (reCAPTCHA init failure)
    if (fbErr.message?.includes('-39') || fbErr.code?.includes('-39')) {
      return 'مشكلة في تحميل التحقق الأمني. أعد تحميل الصفحة.';
    }

    // Map known error codes to Arabic
    for (const [code, message] of Object.entries(FIREBASE_ERROR_MAP)) {
      if (fbErr.code === code) {
        return message;
      }
    }

    return fbErr.message || 'حصل مشكل في إرسال الكود. حاول مرة أخرى.';
  }
}

/**
 * Verify an OTP code using the stored confirmationResult.
 * On success: calls credential.user.getIdToken() and returns the token.
 */
export async function verifyFirebaseOTP(code: string): Promise<string> {
  if (!confirmationResult) {
    throw new Error('لا يوجد طلب تحقق جاري. أعد إرسال الكود.');
  }

  const result = await confirmationResult.confirm(code);
  const idToken = await result.user.getIdToken();
  return idToken;
}

/**
 * Reset the reCAPTCHA verifier.
 * Call on: error, resend, unmount, back button.
 */
export function resetRecaptcha(): void {
  try {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
  } catch {
    /* ignore clear errors */
  }
  window.recaptchaVerifier = undefined;
  confirmationResult = null;

  // Also clear the div innerHTML manually — prevents "already rendered" error
  const container = document.getElementById('recaptcha-container');
  if (container) container.innerHTML = '';
}
