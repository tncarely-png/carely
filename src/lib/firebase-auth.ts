import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  type ApplicationVerifier,
} from "firebase/auth";
import { auth } from "./firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize a fresh invisible reCAPTCHA verifier in the given container.
 * Explicitly awaits render() to ensure the widget is ready before use.
 */
export async function initRecaptcha(
  containerId: string = "recaptcha-container"
): Promise<ApplicationVerifier> {
  // Clean up any previous verifier
  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
  } catch {
    recaptchaVerifier = null;
  }

  // Ensure the container element exists
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error("reCAPTCHA container element not found in DOM");
  }

  // Create a new invisible verifier
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved — Firebase will automatically proceed
    },
    "expired-callback": () => {
      // Token expired, reset so next attempt gets a fresh one
      try {
        recaptchaVerifier?.clear();
      } catch {
        /* ignore */
      }
      recaptchaVerifier = null;
    },
  });

  // Explicitly render and wait — this loads grecaptcha + creates the widget
  await recaptchaVerifier.render();

  return recaptchaVerifier;
}

/**
 * Reset the reCAPTCHA verifier (call before re-sending or when navigating away).
 */
export function resetRecaptcha() {
  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
    }
  } catch {
    /* ignore */
  }
  recaptchaVerifier = null;

  // Also clear the container DOM
  const container = document.getElementById("recaptcha-container");
  if (container) container.innerHTML = "";
}

/**
 * Send OTP to a phone number via Firebase Phone Auth.
 * Creates a fresh invisible reCAPTCHA verifier each time.
 */
export async function sendPhoneOTP(
  fullPhoneNumber: string,
  containerId: string = "recaptcha-container"
): Promise<ConfirmationResult> {
  const verifier = await initRecaptcha(containerId);
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
  resetRecaptcha();
}
