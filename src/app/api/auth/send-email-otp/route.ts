import { NextResponse } from "next/server";

/** Legacy email OTP — replaced by Clerk. */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "تسجيل الدخول عبر OTP لم يعد متاحاً. استخدم Clerk من /sign-in",
      errorEn: "Email OTP is deprecated. Sign in at /sign-in",
    },
    { status: 410 }
  );
}
