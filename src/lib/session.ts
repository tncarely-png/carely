/**
 * KV-based session management for Cloudflare Workers.
 * Replaces in-memory session stores with persistent KV storage.
 */
import { getCfContext } from "./cf-context";
import { cookies } from "next/headers";

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

interface SessionData {
  userId: string;
  role: string;
  email?: string;
}

export async function createSession(userId: string, role: string, email?: string): Promise<string> {
  const { kv } = getCfContext();
  const sessionId = crypto.randomUUID();

  await kv.put(
    `session:${sessionId}`,
    JSON.stringify({ userId, role, email } satisfies SessionData),
    { expirationTtl: SESSION_TTL }
  );

  return sessionId;
}

export async function getSession(): Promise<SessionData | null> {
  const { kv } = getCfContext();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) return null;

  const raw = await kv.get(`session:${sessionId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function getSessionFromHeader(request: Request): Promise<SessionData | null> {
  const { kv } = getCfContext();
  const authHeader = request.headers.get("Authorization");
  const sessionId = authHeader?.replace("Bearer ", "");

  if (!sessionId) return null;

  const raw = await kv.get(`session:${sessionId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { kv } = getCfContext();
  await kv.delete(`session:${sessionId}`);
}

/**
 * SuperAdmin session management — stored in KV with 24h TTL.
 */
const SUPERADMIN_SESSION_TTL = 60 * 60 * 24; // 24 hours

export async function createSuperAdminSession(email: string): Promise<string> {
  const { kv } = getCfContext();
  const token = `superadmin-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  await kv.put(
    `superadmin:${token}`,
    JSON.stringify({ email, createdAt: Date.now() }),
    { expirationTtl: SUPERADMIN_SESSION_TTL }
  );

  return token;
}

export async function validateSuperAdminSession(token: string): Promise<{ email: string } | null> {
  const { kv } = getCfContext();
  const raw = await kv.get(`superadmin:${token}`);

  if (!raw) return null;

  const session = JSON.parse(raw);

  // Check TTL (KV handles auto-expiry, but double-check)
  if (Date.now() - session.createdAt > SUPERADMIN_SESSION_TTL * 1000) {
    await kv.delete(`superadmin:${token}`);
    return null;
  }

  return { email: session.email };
}
