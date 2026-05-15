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
  /** Raw D1 binding — use for DDL / exec when Drizzle batch helpers differ by runtime */
  d1: D1Database;
  kv: KVNamespace;
  r2: R2Bucket;
  env: CfBindings & Record<string, unknown>;
}

function toCfContext(ctx: { env: unknown }): CfContext {
  const env = ctx.env as unknown as CfBindings;
  const d1 = env["carely-db"];
  if (!d1) {
    throw new Error(
      "Missing D1 binding 'carely-db'. In Cloudflare dashboard attach D1 database carely-db and redeploy."
    );
  }
  return {
    db: getDb(d1),
    d1,
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

export function publicErrorMessage(e: unknown): { ar: string; en: string; status: number } {
  const msg = e instanceof Error ? e.message : String(e);
  if (
    msg.includes("CF context not available") ||
    msg.includes("getCloudflareContext") ||
    msg.toLowerCase().includes("opennext")
  ) {
    return {
      ar: "الخدمة غير جاهزة في البيئة الحالية. للتجربة المحلية استخدم `bun run preview`، أو جرّب الموقع المنشور على Cloudflare (ليس `next dev` وحدَه).",
      en: "Cloudflare context unavailable. Use deployed site or `bun run preview`, not plain `next dev`.",
      status: 503,
    };
  }
  if (msg.includes("carely-db") || msg.includes("D1 binding")) {
    return {
      ar: "الربط مع قاعدة D1 ناقص (carely-db). أضف قاعدة carely-db في إعدادات Worker/Pages ثم أعد النشر.",
      en: "D1 binding 'carely-db' is missing. Attach the carely-db database in Cloudflare and redeploy.",
      status: 500,
    };
  }
  if (msg.includes("carely-kv") || msg.includes("KV binding")) {
    return {
      ar: "الربط مع Cloudflare KV ناقص (carely-kv). راجع إعدادات المشروع و wrangler.",
      en: "KV binding 'carely-kv' is missing. Check Wrangler / Cloudflare bindings and redeploy.",
      status: 500,
    };
  }
  return {
    ar: "حصل مشكل في المخدم. جرّب مرة أخرى أو راسل الدعم مع وقت الطلب.",
    en: "Server error. Check Cloudflare/Resend logs or try again.",
    status: 500,
  };
}

