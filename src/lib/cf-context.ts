/**
 * Cloudflare context accessor for API routes.
 * Provides typed access to D1, KV, and R2 bindings.
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import type { KVNamespace, R2Bucket } from "@cloudflare/workers-types";

interface CfBindings {
  "carely-db": D1Database;
  "carely-kv": KVNamespace;
  "carely-uploads": R2Bucket;
}

interface CfContext {
  db: ReturnType<typeof getDb>;
  kv: KVNamespace;
  r2: R2Bucket;
  env: CfBindings & Record<string, unknown>;
}

export function getCfContext(): CfContext {
  try {
    const ctx = getCloudflareContext({ async: false });
    const env = ctx.env as unknown as CfBindings;

    return {
      db: getDb(env["carely-db"]),
      kv: env["carely-kv"],
      r2: env["carely-uploads"],
      env: ctx.env as CfContext["env"],
    };
  } catch {
    throw new Error(
      "CF context not available. Use 'bun run preview' for local development, not 'bun run dev'."
    );
  }
}
