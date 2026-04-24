/**
 * Read vars set as Worker secrets (wrangler) or [vars] — they live on `env`, not always on `process.env`.
 */
import { getCfContext } from "@/lib/cf-context";

export function getWorkerEnvVar(key: string): string | undefined {
  try {
    const { env } = getCfContext();
    const v = (env as Record<string, unknown>)[key];
    if (typeof v === "string" && v.length > 0) return v;
  } catch {
    /* not running inside Cloudflare request context */
  }
  const p = process.env[key];
  return typeof p === "string" && p.length > 0 ? p : undefined;
}
