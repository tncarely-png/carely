/**
 * Email OTP on D1 — same behaviour as email-otp-kv but no KV binding required.
 */
import { eq } from "drizzle-orm";
import type { AppDB } from "@/db";
import { otpChallenge, otpRegisterPending, otpSendRateLimit } from "@/db/schema";
import {
  challengeKey,
  hashOtp,
  sendRateLimitKey,
  type OtpKind,
} from "@/lib/email-otp-kv";

const CHALLENGE_TTL_MS = 600_000;
const RATE_LIMIT_MS = 55_000;

/** Returns false if rate-limited (too soon). */
export async function checkSendRateLimitDb(db: AppDB, emailNorm: string): Promise<boolean> {
  const key = sendRateLimitKey(emailNorm);
  const now = Date.now();
  const row = await db.select().from(otpSendRateLimit).where(eq(otpSendRateLimit.rateKey, key)).get();
  if (row && row.expiresAt > now) return false;
  if (row) {
    await db.delete(otpSendRateLimit).where(eq(otpSendRateLimit.rateKey, key));
  }
  await db.insert(otpSendRateLimit).values({
    rateKey: key,
    expiresAt: now + RATE_LIMIT_MS,
  });
  return true;
}

export async function putChallengeDb(
  db: AppDB,
  kind: OtpKind,
  emailNorm: string,
  codeHash: string
): Promise<void> {
  const id = challengeKey(kind, emailNorm);
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  await db.delete(otpChallenge).where(eq(otpChallenge.id, id));
  await db.insert(otpChallenge).values({ id, codeHash, attempts: 0, expiresAt });
}

/** Returns true and deletes the challenge on success. */
export async function verifyAndConsumeChallengeDb(
  db: AppDB,
  kind: OtpKind,
  emailNorm: string,
  code: string
): Promise<boolean> {
  const id = challengeKey(kind, emailNorm);
  const now = Date.now();
  const row = await db.select().from(otpChallenge).where(eq(otpChallenge.id, id)).get();
  if (!row || row.expiresAt < now) {
    if (row) await db.delete(otpChallenge).where(eq(otpChallenge.id, id));
    return false;
  }

  if (row.attempts >= 5) {
    await db.delete(otpChallenge).where(eq(otpChallenge.id, id));
    return false;
  }

  const h = await hashOtp(emailNorm, code);
  if (h !== row.codeHash) {
    await db
      .update(otpChallenge)
      .set({ attempts: row.attempts + 1, expiresAt: Date.now() + CHALLENGE_TTL_MS })
      .where(eq(otpChallenge.id, id));
    return false;
  }

  await db.delete(otpChallenge).where(eq(otpChallenge.id, id));
  return true;
}

export async function setRegisterPendingDb(db: AppDB, emailNorm: string): Promise<void> {
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  await db.delete(otpRegisterPending).where(eq(otpRegisterPending.emailNorm, emailNorm));
  await db.insert(otpRegisterPending).values({ emailNorm, expiresAt });
}

export async function hasRegisterPendingDb(db: AppDB, emailNorm: string): Promise<boolean> {
  const now = Date.now();
  const row = await db.select().from(otpRegisterPending).where(eq(otpRegisterPending.emailNorm, emailNorm)).get();
  if (!row) return false;
  if (row.expiresAt < now) {
    await db.delete(otpRegisterPending).where(eq(otpRegisterPending.emailNorm, emailNorm));
    return false;
  }
  return true;
}

export async function clearRegisterPendingDb(db: AppDB, emailNorm: string): Promise<void> {
  await db.delete(otpRegisterPending).where(eq(otpRegisterPending.emailNorm, emailNorm));
}
