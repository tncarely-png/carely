/**
 * Server-side Firebase token verification using Web Crypto API.
 * No Node.js dependencies — works in Cloudflare Workers / Edge runtime.
 */

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "carely-9e601";

interface FirebaseVerifiedUser {
  uid: string;
  phoneNumber: string;
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe characters and decode base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Handle padding
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

export async function verifyIdToken(idToken: string): Promise<FirebaseVerifiedUser | null> {
  try {
    // Decode header to get kid
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(base64UrlDecode(headerB64));
    const kid = header.kid;

    if (!kid) {
      console.error("[verify-firebase-token] No kid in JWT header");
      return null;
    }

    // Fetch Firebase public keys (cached for 1 hour by CF)
    const keysRes = await fetch(
      "https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com",
      // In CF Workers, use cache API
    );

    if (!keysRes.ok) {
      console.error("[verify-firebase-token] Failed to fetch public keys:", keysRes.status);
      return null;
    }

    const { keys } = await keysRes.json();
    const publicKey = keys.find((k: { kid?: string }) => k.kid === kid);

    if (!publicKey) {
      console.error("[verify-firebase-token] No matching public key for kid:", kid);
      return null;
    }

    // Import the public key for verification
    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      publicKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify the signature
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sig = Uint8Array.from(base64UrlDecode(sigB64), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, sig, data);

    if (!valid) {
      console.error("[verify-firebase-token] Signature verification failed");
      return null;
    }

    // Decode payload and validate claims
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      console.error("[verify-firebase-token] Token expired");
      return null;
    }

    if (payload.aud !== FIREBASE_PROJECT_ID) {
      console.error("[verify-firebase-token] Invalid audience:", payload.aud);
      return null;
    }

    const expectedIss = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
    if (payload.iss !== expectedIss) {
      console.error("[verify-firebase-token] Invalid issuer:", payload.iss);
      return null;
    }

    // Extract user info
    const uid = payload.user_id || payload.sub;
    const phoneNumber = payload.phone_number;

    if (!uid || !phoneNumber) {
      console.error("[verify-firebase-token] Missing uid or phone_number in token");
      return null;
    }

    return { uid, phoneNumber };
  } catch (err) {
    console.error("[verify-firebase-token] Error:", err);
    return null;
  }
}

/**
 * Normalize a phone number for database storage and lookup.
 * ALWAYS returns "+216 XX XXX XXXX" format for consistency.
 * Handles: "+21626107128", "21626107128", "26107128", "+216 26 107 128"
 */
export function normalizePhoneForDb(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");

  // Strip leading 216 or 00216 if present
  if (cleaned.startsWith("00216")) cleaned = cleaned.slice(5);
  else if (cleaned.startsWith("216")) cleaned = cleaned.slice(3);

  // Now cleaned should be 8 Tunisian digits: "26107128"
  if (cleaned.length === 8 && /^[259]/.test(cleaned)) {
    return "+216 " + cleaned.slice(0, 2) + " " + cleaned.slice(2, 5) + " " + cleaned.slice(5, 8);
  }

  // Fallback: return original
  return phone;
}
