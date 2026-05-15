/**
 * Send transactional email via Resend REST API (Edge / Workers compatible).
 * Without a verified domain, use onboarding@resend.dev as From (Resend default).
 */

import { getWorkerEnvVar, getWorkerEnvVarAsync } from "@/lib/cf-env";

const RESEND_API = "https://api.resend.com/emails";

function pickEnv(
  cfEnv: Record<string, unknown> | undefined,
  key: string
): string | undefined {
  if (!cfEnv) return undefined;
  const v = cfEnv[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function defaultResendFrom(
  cfEnv?: Record<string, unknown>
): string {
  return (
    pickEnv(cfEnv, "RESEND_FROM_EMAIL")?.trim() ||
    getWorkerEnvVar("RESEND_FROM_EMAIL")?.trim() ||
    "Carely <onboarding@resend.dev>"
  );
}

function mapResendErrorBody(status: number, body: string): string {
  try {
    const j = JSON.parse(body) as { message?: string };
    const msg = (j.message || "").toLowerCase();
    if (status === 403 && msg.includes("verify")) {
      return "تأكد من إعداد النطاق في Resend، أو أرسل لبريد موثّق في لوحة Resend.";
    }
    if (msg.includes("only send testing emails to your own email")) {
      return "وضع الاختبار في Resend: أرسل الكود فقط لبريدك المسجّل في Resend، أو فعّل نطاقاً.";
    }
  } catch {
    /* use generic */
  }
  if (status === 401 || status === 403) {
    return "مفتاح Resend غير صالح أو مرفوض. تحقق من RESEND_API_KEY في Cloudflare.";
  }
  if (status === 422) {
    return "عنوان المرسل أو المستلم غير مقبول لدى Resend.";
  }
  return "تعذر إرسال البريد. حاول لاحقاً.";
}

export async function sendOtpEmail(params: {
  to: string;
  code: string;
  subject?: string;
  /** Worker `env` from `getCfContextAsync()` — required for RESEND_API_KEY on Cloudflare. */
  cfEnv?: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = await getWorkerEnvVarAsync("RESEND_API_KEY", params.cfEnv);
  if (!key) {
    console.error("[resend-mail] RESEND_API_KEY is not set (cfEnv / async env / process.env)");
    return {
      ok: false,
      error:
        "RESEND_API_KEY missing. In Cloudflare add it as a Secret (not a plain Variable): Workers/Pages → Settings → Variables and secrets → type Secret → name RESEND_API_KEY → Production → redeploy.",
    };
  }

  const from =
    (await getWorkerEnvVarAsync("RESEND_FROM_EMAIL", params.cfEnv))?.trim() ||
    defaultResendFrom(params.cfEnv);
  const subject = params.subject ?? "كود الدخول — Carely.tn";

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject,
      html: `
        <div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto;">
          <p style="margin:0 0 12px;">رمز التحقق الخاص بك:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 0 0 16px;">${params.code}</p>
          <p style="color:#666; font-size: 14px; margin:0;">صالح لمدة 10 دقائق. لا تشارك هذا الرمز مع أحد.</p>
        </div>
      `.trim(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[resend-mail] API error:", res.status, text);
    return { ok: false, error: mapResendErrorBody(res.status, text) };
  }

  return { ok: true };
}
