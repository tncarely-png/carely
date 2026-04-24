/**
 * Cloudflare context accessor for API routes.
 * Provides typed access to D1, KV, and R2 bindings.
 *
 * In OpenNext on Cloudflare, `getCloudflareContext({ async: true })` is required in many
 * API routes (Node.js runtime, catch-all / dynamic routes) or secrets won’t be available.
 * Sync `getCfContext()` may still work after an async call in the same request (global ALS).
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import type { KVNamespace, R2Bucket } from "@cloudflare/workers-types";

interface CfBindings {
  "carely-db": D1Database;
  "carely-kv": KVNamespace;
  "carely-uploads": R2Bucket;
}

export interface CfContext {
  db: ReturnType<typeof getDb>;
  kv: KVNamespace;
  r2: R2Bucket;
  env: CfBindings & Record<string, unknown>;
}

function toCfContext(ctx: { env: unknown }): CfContext {
  const env = ctx.env as unknown as CfBindings;
  return {
    db: getDb(env["carely-db"]),
    kv: env["carely-kv"],
    r2: env["carely-uploads"],
    env: ctx.env as CfContext["env"],
  };
}

export function getCfContext(): CfContext {
  try {
    const ctx = getCloudflareContext({ async: false });
    return toCfContext(ctx);
  } catch {
    throw new Error(
      "CF context not available. Use 'bun run preview' for local development, not 'bun run dev'."
    );
  }
}

/** Prefer this in Route Handlers so bindings + `env.RESEND_API_KEY` resolve on Workers. */
export async function getCfContextAsync(): Promise<CfContext> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return toCfContext(ctx);
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    throw new Error(
      m.includes("not available") || m.includes("getCloudflareContext")
        ? "CF context not available. For local dev use OpenNext preview, or deploy to Cloudflare."
        : m
    );
  }
}
