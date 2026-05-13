import { NextRequest, NextResponse } from "next/server";
import {
  getOtpMailContextAsync,
  publicErrorMessage,
} from "@/lib/cf-context";
import {
  normalizeEmail,
  randomOtpCode,
  hashOtp,
  putChallenge,
  checkSendRateLimit,
} from "@/lib/email-otp-kv";
import { sendOtpEmail } from "@/lib/resend-mail";

/**
 * POST /api/auth/send-email-otp
 * Body: { email: string }
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

    let ctx: Awaited<ReturnType<typeof getOtpMailContextAsync>>;
    try {
      ctx = await getOtpMailContextAsync();
    } catch (e) {
      console.error("[send-email-otp] context", requestId, e);
      const { ar, en, status } = publicErrorMessage(e);
      return NextResponse.json(
        { success: false, error: ar, errorEn: en, step: "context", requestId },
        { status }
      );
    }

    const { kv, env } = ctx;

    let allowed: boolean;
    try {
      allowed = await checkSendRateLimit(kv, emailNorm);
    } catch (e) {
      console.error("[send-email-otp] rate-limit", requestId, e);
      return NextResponse.json(
        {
          success: false,
          error: "تعذر الوصول إلى Cloudflare KV لحفظ محاولات الإرسال.",
          errorEn: "Cloudflare KV failed during rate-limit check.",
          hintAr:
            "اربط مساحة KV باسم المتغير carely-kv في مشروع Workers أو Pages (الإعدادات → Bindings). مفتاح Resend لا يغني عن هذا الربط.",
          hintEn:
            "Attach a KV namespace to this deployment with binding name `carely-kv` (same as wrangler.toml). RESEND_API_KEY does not replace KV.",
          step: "rate-limit",
          requestId,
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
      await putChallenge(kv, "customer", emailNorm, codeHash);
    } catch (e) {
      console.error("[send-email-otp] kv-put", requestId, e);
      return NextResponse.json(
        {
          success: false,
          error: "تعذر حفظ كود التحقق في Cloudflare KV.",
          errorEn: "Cloudflare KV failed while saving OTP challenge.",
          hintAr:
            "تحقق من ربط carely-kv وأن نفس مساحة KV مفعّلة على البيئة المنشورة (Workers أو Pages → Bindings).",
          hintEn:
            "Verify KV binding `carely-kv` exists on the deployed Worker/Pages project and matches wrangler.toml.",
          step: "kv-put",
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
        cfEnv: env as Record<string, unknown>,
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
