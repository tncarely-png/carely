import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Get or create the reCAPTCHA verifier.
 * Uses a VISIBLE widget to avoid error -39 (invisible reCAPTCHA fails in iframe/sandbox).
 * The container must exist in the DOM and be visible.
 */
export function getRecaptchaVerifier(
  containerId: string = "recaptcha-container"
): RecaptchaVerifier {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`reCAPTCHA container #${containerId} not found`);
  }

  // Make sure container is visible (display:none breaks reCAPTCHA)
  container.style.display = "block";
  container.style.minHeight = "78px";

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "normal",
    callback: () => {
      // reCAPTCHA solved
    },
    "expired-callback": () => {
      cleanRecaptcha();
    },
  });

  return recaptchaVerifier;
}

/**
 * Clean up the reCAPTCHA verifier entirely.
 * Call this before creating a new one or on unmount.
 */
export function cleanRecaptcha() {
  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
    }
  } catch {
    /* ignore */
  }
  recaptchaVerifier = null;

  const container = document.getElementById("recaptcha-container");
  if (container) container.innerHTML = "";
}

/**
 * Send OTP to a phone number via Firebase Phone Auth.
 * Creates a fresh reCAPTCHA verifier each time for reliability.
 */
export async function sendPhoneOTP(
  fullPhoneNumber: string,
  containerId: string = "recaptcha-container"
): Promise<ConfirmationResult> {
  // Always start fresh
  cleanRecaptcha();

  const verifier = getRecaptchaVerifier(containerId);

  // Render the visible widget — this returns a promise
  try {
    await verifier.render();
  } catch (renderErr) {
    console.error("reCAPTCHA render failed:", renderErr);
    cleanRecaptcha();
    throw Object.assign(new Error("تحقق الأمان فشل في التحميل. حمّل الصفحة من جديد."), {
      code: "auth/recaptcha-render-failed",
    });
  }

  // Now send the OTP — reCAPTCHA is visible and ready
  const result = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
  return result;
}

/**
 * Verify an OTP code using a previously obtained ConfirmationResult.
 */
export async function verifyPhoneOTP(
  confResult: ConfirmationResult,
  code: string
): Promise<{ uid: string; phoneNumber: string; idToken: string }> {
  const result = await confResult.confirm(code);
  const idToken = await result.user.getIdToken();
  return {
    uid: result.user.uid,
    phoneNumber: result.user.phoneNumber || "",
    idToken,
  };
}

/**
 * Sign out the current Firebase user.
 */
export async function signOutFirebase() {
  await auth.signOut();
  cleanRecaptcha();
}
