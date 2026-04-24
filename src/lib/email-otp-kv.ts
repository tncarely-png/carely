/**
 * Email OTP storage (Cloudflare KV). Edge-safe, no Node APIs.
 */

import type { KVNamespace } from "@cloudflare/workers-types";
import { getWorkerEnvVar } from "@/lib/cf-env";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function otpPepper(): string {
  return (
    getWorkerEnvVar("OTP_PEPPER") ||
    getWorkerEnvVar("RESEND_API_KEY") ||
    "carely-dev-otp-pepper"
  );
}

export async function hashOtp(emailNorm: string, code: string): Promise<string> {
  const msg = `${emailNorm}:${code}:${otpPepper()}`;
  const data = new TextEncoder().encode(msg);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomOtpCode(): string {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(100000 + (a[0]! % 900000));
}

export type OtpKind = "customer" | "superadmin";

export function challengeKey(kind: OtpKind, emailNorm: string): string {
  return `ch:otp:${kind}:${emailNorm}`;
}

export function regPendingKey(emailNorm: string): string {
  return `ch:reg-pending:${emailNorm}`;
}

export function sendRateLimitKey(emailNorm: string): string {
  return `ch:otp-send-rl:${emailNorm}`;
}

interface ChallengePayload {
  h: string;
  attempts: number;
}

const CHALLENGE_TTL_SEC = 600;
const RATE_LIMIT_TTL_SEC = 55;

export async function putChallenge(
  kv: KVNamespace,
  kind: OtpKind,
  emailNorm: string,
  codeHash: string
): Promise<void> {
  const key = challengeKey(kind, emailNorm);
  await kv.put(key, JSON.stringify({ h: codeHash, attempts: 0 } satisfies ChallengePayload), {
    expirationTtl: CHALLENGE_TTL_SEC,
  });
}

/**
 * Returns true and deletes the challenge on success.
 */
export async function verifyAndConsumeChallenge(
  kv: KVNamespace,
  kind: OtpKind,
  emailNorm: string,
  code: string
): Promise<boolean> {
  const key = challengeKey(kind, emailNorm);
  const raw = await kv.get(key);
  if (!raw) return false;

  let payload: ChallengePayload;
  try {
    payload = JSON.parse(raw) as ChallengePayload;
  } catch {
    return false;
  }

  if (payload.attempts >= 5) {
    await kv.delete(key);
    return false;
  }

  const h = await hashOtp(emailNorm, code);
  if (h !== payload.h) {
    await kv.put(
      key,
      JSON.stringify({ h: payload.h, attempts: payload.attempts + 1 } satisfies ChallengePayload),
      { expirationTtl: CHALLENGE_TTL_SEC }
    );
    return false;
  }

  await kv.delete(key);
  return true;
}

export async function setRegisterPending(kv: KVNamespace, emailNorm: string): Promise<void> {
  await kv.put(regPendingKey(emailNorm), "1", { expirationTtl: CHALLENGE_TTL_SEC });
}

export async function hasRegisterPending(kv: KVNamespace, emailNorm: string): Promise<boolean> {
  const v = await kv.get(regPendingKey(emailNorm));
  return v === "1";
}

export async function clearRegisterPending(kv: KVNamespace, emailNorm: string): Promise<void> {
  await kv.delete(regPendingKey(emailNorm));
}

/** Returns false if rate-limited (too soon). */
export async function checkSendRateLimit(kv: KVNamespace, emailNorm: string): Promise<boolean> {
  const key = sendRateLimitKey(emailNorm);
  const existing = await kv.get(key);
  if (existing) return false;
  await kv.put(key, "1", { expirationTtl: RATE_LIMIT_TTL_SEC });
  return true;
}
