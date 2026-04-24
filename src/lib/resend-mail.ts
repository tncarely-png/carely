/**
 * Send transactional email via Resend REST API (Edge / Workers compatible).
 * Without a verified domain, use onboarding@resend.dev as From (Resend default).
 */

const RESEND_API = "https://api.resend.com/emails";

export function defaultResendFrom(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Carely <onboarding@resend.dev>";
}

export async function sendOtpEmail(params: {
  to: string;
  code: string;
  subject?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[resend-mail] RESEND_API_KEY is not set");
    return { ok: false, error: "Email service not configured" };
  }

  const from = defaultResendFrom();
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
    return { ok: false, error: "تعذر إرسال البريد. حاول لاحقاً." };
  }

  return { ok: true };
}
