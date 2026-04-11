import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth/otp-login — Login with phone number after OTP verification
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف لازم' },
        { status: 400 }
      );
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      );
    }

    // Find user by phone
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

function normalizePhone(phone: string): string | null {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length === 8 && /^[259]/.test(cleaned)) {
    return '+216 ' + cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 5) + ' ' + cleaned.slice(5, 8);
  }
  if (cleaned.length === 10 && cleaned.startsWith('216')) {
    const local = cleaned.slice(3);
    return '+216 ' + local.slice(0, 2) + ' ' + local.slice(2, 5) + ' ' + local.slice(5, 8);
  }
  if (cleaned.startsWith('+216') && cleaned.length === 13) {
    const local = cleaned.slice(4);
    return '+216 ' + local.slice(0, 2) + ' ' + local.slice(2, 5) + ' ' + local.slice(5, 8);
  }
  if (cleaned.length >= 10) return '+' + cleaned;
  return null;
}
