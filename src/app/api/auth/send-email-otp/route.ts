import { NextRequest, NextResponse } from "next/server";
import { getCfContextAsync, publicErrorMessage } from "@/lib/cf-context";
import {
  normalizeEmail,
  randomOtpCode,
  hashOtp,
} from "@/lib/email-otp-kv";
import { checkSendRateLimitDb, putChallengeDb } from "@/lib/email-otp-db";
import { sendOtpEmail } from "@/lib/resend-mail";

/**
 * POST /api/auth/send-email-otp
 * Body: { email: string }
 *
 * OTP state lives on D1 (not KV) so login works when KV is unbound on Workers/Pages.
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "طلب غير صالح (JSON)" },
        { status: 400 }
      );
    }
    const raw = typeof body.email === "string" ? body.email : "";
    const emailNorm = normalizeEmail(raw);

    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json(
        { success: false, error: "أدخل بريداً إلكترونياً صحيحاً" },
        { status: 400 }
      );
    }

    let db: Awaited<ReturnType<typeof getCfContextAsync>>["db"];
    let d1: Awaited<ReturnType<typeof getCfContextAsync>>["d1"];
    let env: Record<string, unknown>;
    try {
      const ctx = await getCfContextAsync();
      db = ctx.db;
      d1 = ctx.d1;
      env = ctx.env as Record<string, unknown>;
    } catch (e) {
      console.error("[send-email-otp] context", requestId, e);
      const { ar, en, status } = publicErrorMessage(e);
      return NextResponse.json(
        { success: false, error: ar, errorEn: en, step: "context", requestId },
        { status }
      );
    }

    let allowed: boolean;
    try {
      allowed = await checkSendRateLimitDb(db, d1, emailNorm);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      console.error("[send-email-otp] rate-limit-db", requestId, detail, e);
      return NextResponse.json(
        {
          success: false,
          error: "تعذر تسجيل حد الإرسال. تحقق من ربط قاعدة D1 (carely-db) في Cloudflare.",
          errorEn: "D1 rate-limit failed. Ensure binding carely-db is attached and redeploy.",
          step: "rate-limit",
          requestId,
          ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
        },
        { status: 500 }
      );
    }
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "انتظر قليلاً قبل طلب كود جديد" },
        { status: 429 }
      );
    }

    const code = randomOtpCode();
    let codeHash: string;
    try {
      codeHash = await hashOtp(emailNorm, code);
    } catch (e) {
      console.error("[send-email-otp] hash", requestId, e);
      return NextResponse.json(
        {
          success: false,
          error: "تعذر تجهيز كود التحقق.",
          errorEn: "Failed to hash OTP code.",
          step: "hash",
          requestId,
        },
        { status: 500 }
      );
    }

    try {
      await putChallengeDb(db, d1, "customer", emailNorm, codeHash);
    } catch (e) {
      console.error("[send-email-otp] challenge-db", requestId, e);
      return NextResponse.json(
        {
          success: false,
          error: "تعذر حفظ كود التحقق. تحقق من قاعدة D1 والترحيلات.",
          errorEn: "D1 OTP challenge write failed. Run D1 migrations (0003_otp_d1.sql).",
          step: "challenge",
          requestId,
        },
        { status: 500 }
      );
    }

    let sent: Awaited<ReturnType<typeof sendOtpEmail>>;
    try {
      sent = await sendOtpEmail({
        to: emailNorm,
        code,
        cfEnv: env,
      });
    } catch (e) {
      console.error("[send-email-otp] resend-throw", requestId, e);
      return NextResponse.json(
        {
          success: false,
          error: "تعذر الاتصال بخدمة Resend لإرسال البريد.",
          errorEn: "Resend request threw before returning a response.",
          step: "resend-fetch",
          requestId,
        },
        { status: 502 }
      );
    }
    if (!sent.ok) {
      return NextResponse.json(
        {
          success: false,
          error: sent.error,
          errorEn: "Resend rejected the email request.",
          step: "resend-api",
          requestId,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, requestId });
  } catch (e) {
    console.error("[send-email-otp] unexpected", requestId, e);
    const { ar, en, status } = publicErrorMessage(e);
    const payload: {
      success: false;
      error: string;
      errorEn: string;
      step: "unexpected";
      requestId: string;
      detail?: string;
    } = { success: false, error: ar, errorEn: en, step: "unexpected", requestId };
    if (process.env.NODE_ENV !== "production") {
      payload.detail = e instanceof Error ? e.message : String(e);
    }
    return NextResponse.json(payload, { status });
  }
}
