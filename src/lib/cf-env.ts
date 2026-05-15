/**
 * Read Worker secrets / vars — they live on `env`, not always on `process.env`.
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCfContext } from "@/lib/cf-context";

function pickString(env: Record<string, unknown> | undefined, key: string): string | undefined {
  if (!env) return undefined;
  const v = env[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** Sync read — may miss vars in async API routes; prefer getWorkerEnvVarAsync. */
export function getWorkerEnvVar(key: string): string | undefined {
  try {
    const { env } = getCfContext();
    const v = pickString(env as Record<string, unknown>, key);
    if (v) return v;
  } catch {
    /* not in CF request context */
  }
  const p = process.env[key];
  return typeof p === "string" && p.length > 0 ? p : undefined;
}

/**
 * Resolves a Worker env var (secrets, [vars], Pages env).
 * Tries: explicit cfEnv → async getCloudflareContext → sync context → process.env
 */
export async function getWorkerEnvVarAsync(
  key: string,
  cfEnv?: Record<string, unknown>
): Promise<string | undefined> {
  const fromArg = pickString(cfEnv, key);
  if (fromArg) return fromArg;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const fromAsync = pickString(ctx.env as Record<string, unknown>, key);
    if (fromAsync) return fromAsync;
  } catch {
    /* fall through */
  }

  return getWorkerEnvVar(key);
}
