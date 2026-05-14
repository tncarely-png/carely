/**
 * Email OTP on D1 — same behaviour as email-otp-kv but no KV binding required.
 *
 * Creates OTP tables on first use if Wrangler migrations were never applied (idempotent).
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

const OTP_D1_DDL = [
  `CREATE TABLE IF NOT EXISTS otp_send_rate_limit (
    rate_key TEXT PRIMARY KEY NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS otp_challenge (
    id TEXT PRIMARY KEY NOT NULL,
    code_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS otp_register_pending (
    email_norm TEXT PRIMARY KEY NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
];

let otpSchemaEnsured = false;

async function ensureOtpD1Schema(db: AppDB): Promise<void> {
  if (otpSchemaEnsured) return;
  try {
    for (const sql of OTP_D1_DDL) {
      await db.run(sql);
    }
    otpSchemaEnsured = true;
  } catch {
    otpSchemaEnsured = false;
    throw;
  }
}

/** Returns false if rate-limited (too soon). */export async function checkSendRateLimitDb(db: AppDB, emailNorm: string): Promise<boolean> {
  await ensureOtpD1Schema(db);
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
  await ensureOtpD1Schema(db);
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
  await ensureOtpD1Schema(db);
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
  await ensureOtpD1Schema(db);
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  await db.delete(otpRegisterPending).where(eq(otpRegisterPending.emailNorm, emailNorm));
  await db.insert(otpRegisterPending).values({ emailNorm, expiresAt });
}

export async function hasRegisterPendingDb(db: AppDB, emailNorm: string): Promise<boolean> {
  await ensureOtpD1Schema(db);
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
  await ensureOtpD1Schema(db);
  await db.delete(otpRegisterPending).where(eq(otpRegisterPending.emailNorm, emailNorm));
}
