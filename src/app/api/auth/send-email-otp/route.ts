import { NextRequest, NextResponse } from "next/server";
import { getCfContextAsync } from "@/lib/cf-context";
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
  try {
    const body = await request.json();
    const raw = typeof body.email === "string" ? body.email : "";
    const emailNorm = normalizeEmail(raw);

    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json(
        { success: false, error: "أدخل بريداً إلكترونياً صحيحاً" },
        { status: 400 }
      );
    }

    const { kv, env } = await getCfContextAsync();

    const allowed = await checkSendRateLimit(kv, emailNorm);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "انتظر قليلاً قبل طلب كود جديد" },
        { status: 429 }
      );
    }

    const code = randomOtpCode();
    const codeHash = await hashOtp(emailNorm, code);
    await putChallenge(kv, "customer", emailNorm, codeHash);

    const sent = await sendOtpEmail({
      to: emailNorm,
      code,
      cfEnv: env as Record<string, unknown>,
    });
    if (!sent.ok) {
      return NextResponse.json({ success: false, error: sent.error }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[send-email-otp]", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("CF context not available")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "إرسال الكود يحتاج Cloudflare (KV). محلياً: شغّل `bun run preview` بعد build، أو انشر على Cloudflare. أمر `next dev` وحده لا يدعم الـ API.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: "حصل مشكل في المخدم. راجع السجلات." },
      { status: 500 }
    );
  }
}
