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
import { getWorkerEnvVar } from "@/lib/cf-env";

function superadminEmail(): string {
  return normalizeEmail(
    getWorkerEnvVar("SUPERADMIN_EMAIL") || "admin@carely.tn"
  );
}

/**
 * POST /api/superadmin-send-otp
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emailNorm = normalizeEmail(typeof body.email === "string" ? body.email : "");

    if (emailNorm !== superadminEmail()) {
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    const { kv, env } = await getCfContextAsync();

    const allowed = await checkSendRateLimit(kv, `sa:${emailNorm}`);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "انتظر قليلاً قبل طلب كود جديد" },
        { status: 429 }
      );
    }

    const code = randomOtpCode();
    const codeHash = await hashOtp(emailNorm, code);
    await putChallenge(kv, "superadmin", emailNorm, codeHash);

    const sent = await sendOtpEmail({
      to: emailNorm,
      code,
      subject: "كود الدخول — SuperAdmin Carely",
      cfEnv: env as Record<string, unknown>,
    });
    if (!sent.ok) {
      return NextResponse.json({ success: false, error: sent.error }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[superadmin-send-otp]", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("CF context not available")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "يحتاج Cloudflare (KV). محلياً: `bun run preview` أو النشر على Cloudflare — ليس `next dev` وحدَه.",
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
