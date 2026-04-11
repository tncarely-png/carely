/**
 * Server-side Firebase token verification.
 * 
 * Uses the Google Identity Toolkit REST API to verify Firebase ID tokens.
 * This is a lightweight alternative to the full Firebase Admin SDK that works
 * without service account credentials — it only needs the Firebase API key.
 * 
 * To upgrade to the full Admin SDK (more secure, recommended for production):
 * 1. Go to Firebase Console → Project Settings → Service Accounts
 * 2. Click "Generate New Private Key" → download JSON
 * 3. Add to .env.local:
 *    FIREBASE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com
 *    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----"
 * 4. Install: bun add firebase-admin
 * 5. Uncomment the Admin SDK code below
 */

const FIREBASE_API_KEY = "AIzaSyANmsIKeIS2zHbbNuwn8L3ZgZxbanNYDUk";

interface FirebaseVerifiedUser {
  uid: string;
  phoneNumber: string;
}

/**
 * Verify a Firebase ID token server-side using Google Identity Toolkit API.
 * Returns the user's UID and phone number, or null if verification fails.
 * 
 * Security: The client cannot fake an idToken — Google validates it cryptographically.
 */
export async function verifyIdToken(idToken: string): Promise<FirebaseVerifiedUser | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) {
      console.error("[firebase-admin] Token verification failed:", res.status);
      return null;
    }

    const data = await res.json();
    const users = data.users;

    if (!users || users.length === 0) {
      console.error("[firebase-admin] No users returned from token verification");
      return null;
    }

    const user = users[0];
    if (!user.phoneNumber) {
      console.error("[firebase-admin] Firebase user has no phone number");
      return null;
    }

    return {
      uid: user.localId,
      phoneNumber: user.phoneNumber,
    };
  } catch (err) {
    console.error("[firebase-admin] verifyIdToken error:", err);
    return null;
  }
}

/**
 * Normalize a phone number for database lookup.
 * Handles various formats and returns a consistent display format.
 */
export function normalizePhoneForDb(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");

  // 8 digits starting with 2/5/9 → Tunisian local → add +216
  if (cleaned.length === 8 && /^[259]/.test(cleaned)) {
    return "+216 " + cleaned.slice(0, 2) + " " + cleaned.slice(2, 5) + " " + cleaned.slice(5, 8);
  }
  // 10 digits starting with 216
  if (cleaned.length === 10 && cleaned.startsWith("216")) {
    const local = cleaned.slice(3);
    return "+216 " + local.slice(0, 2) + " " + local.slice(2, 5) + " " + local.slice(5, 8);
  }
  // +216XXXXXXXX (12 digits with +)
  if (cleaned.startsWith("216") && cleaned.length === 12) {
    const local = cleaned.slice(3);
    return "+216 " + local.slice(0, 2) + " " + local.slice(2, 5) + " " + local.slice(5, 8);
  }
  // Already +216 XX XXX XXXX (with spaces)
  if (phone.startsWith("+216")) return phone;

  return phone;
}

/**
 * Extract raw digits from a phone number for comparison.
 * "+216 26 107 128" → "26107128"
 */
export function extractDigits(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}
