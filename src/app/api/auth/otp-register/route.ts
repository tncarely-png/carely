import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhone } from '@/lib/sms';

// POST /api/auth/otp-register — Register new user after OTP verification
export async function POST(request: NextRequest) {
  try {
    const { name, phone, address, wilaya } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف لازمين' },
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

    const user = await db.user.create({
      data: {
        name: name.trim(),
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
