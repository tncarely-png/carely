import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type ApplicationVerifier,
} from "firebase/auth";
import { auth } from "./firebase";

let recaptchaVerifier: ApplicationVerifier | null = null;

/**
 * Initialize the invisible reCAPTCHA verifier.
 * Must be called once on the login/register page before sending OTP.
 * @param containerId - ID of a hidden div element to render reCAPTCHA into
 */
export function initRecaptcha(containerId: string = "recaptcha-container"): ApplicationVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved — auto submit
      },
      "expired-callback": () => {
        // Reset reCAPTCHA on expiry
        recaptchaVerifier = null;
      },
    });
  }
  return recaptchaVerifier;
}

/**
 * Reset the reCAPTCHA verifier (needed when switching phone numbers)
 */
export function resetRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}

/**
 * Send OTP to a phone number via Firebase Phone Auth.
 * Returns a ConfirmationResult that can be used to verify the code.
 */
export async function sendPhoneOTP(
  fullPhoneNumber: string,
  containerId: string = "recaptcha-container"
): Promise<ConfirmationResult> {
  const verifier = initRecaptcha(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
  return confirmationResult;
}

/**
 * Verify an OTP code using a previously obtained ConfirmationResult.
 * Returns the Firebase ID token after successful verification.
 */
export async function verifyPhoneOTP(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<{ uid: string; phoneNumber: string; idToken: string }> {
  const result = await confirmationResult.confirm(code);
  const idToken = await result.user.getIdToken();
  return {
    uid: result.user.uid,
    phoneNumber: result.user.phoneNumber || "",
    idToken,
  };
}

/**
 * Sign out the current Firebase user (clears local state)
 */
export async function signOutFirebase() {
  await auth.signOut();
  resetRecaptcha();
}
