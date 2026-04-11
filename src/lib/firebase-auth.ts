import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  type ApplicationVerifier,
} from "firebase/auth";
import { auth } from "./firebase";

let recaptchaVerifier: ApplicationVerifier | null = null;

/**
 * Render a visible reCAPTCHA widget in the given container.
 * Returns the verifier instance.
 */
export function renderRecaptcha(containerId: string = "recaptcha-container"): ApplicationVerifier {
  // Clear any existing
  const existingEl = document.getElementById(containerId);
  if (existingEl) existingEl.innerHTML = "";

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "normal",
    callback: () => {
      // reCAPTCHA solved successfully
    },
    "expired-callback": () => {
      // Reset reCAPTCHA on expiry
      recaptchaVerifier = null;
    },
  });

  // Render the widget (visible)
  (recaptchaVerifier as RecaptchaVerifier).render();

  return recaptchaVerifier;
}

/**
 * Reset the reCAPTCHA verifier
 */
export function resetRecaptcha() {
  if (recaptchaVerifier) {
    try { (recaptchaVerifier as RecaptchaVerifier).clear(); } catch {}
    recaptchaVerifier = null;
  }
}

/**
 * Send OTP to a phone number via Firebase Phone Auth.
 * Uses a visible reCAPTCHA widget that the user must solve first.
 */
export async function sendPhoneOTP(
  fullPhoneNumber: string,
  containerId: string = "recaptcha-container"
): Promise<ConfirmationResult> {
  // Create a fresh verifier each time
  const existingEl = document.getElementById(containerId);
  if (existingEl) existingEl.innerHTML = "";

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      recaptchaVerifier = null;
    },
  });

  const result = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
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
 * Sign out the current Firebase user
 */
export async function signOutFirebase() {
  await auth.signOut();
  resetRecaptcha();
}
