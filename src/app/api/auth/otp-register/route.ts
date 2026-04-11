import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth/otp-register — Register new user with phone after OTP verification
export async function POST(request: NextRequest) {
  try {
    const { name, phone, address, wilaya } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف لازمين' },
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

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: phone.replace(/[^\d]/g, '') },
        ],
      },
    });

    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser;
      return NextResponse.json(
        { success: false, error: 'عندك حساب بهاد الرقم فعلا. سجل دخول.', user: userWithoutPassword, isExistingUser: true },
        { status: 409 }
      );
    }

    // Create new user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: `${normalizedPhone.replace(/[^a-z0-9]/gi, '').toLowerCase()}@carely.local`,
        password: 'otp-auth',
        phone: normalizedPhone,
        address: address?.trim() || null,
        wilaya: wilaya?.trim() || null,
        role: 'customer',
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('OTP Register error:', error);
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
