import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhone } from '@/lib/sms';

// POST /api/auth/otp-login — Login with phone after OTP verification
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف لازم' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: phone.replace(/[^\d]/g, '') },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ما لقينا حساب بهاد الرقم. سجل حساب جديد.', isNewUser: true },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('OTP Login error:', error);
    return NextResponse.json(
      { success: false, error: 'حصل مشكل في المخدم. جرب مرة أخرى.' },
      { status: 500 }
    );
  }
}
