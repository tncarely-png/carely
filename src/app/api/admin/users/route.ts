import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/users — list all users with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (plan) {
      where.subscriptions = { some: { plan } };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        wilaya: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          select: {
            id: true,
            plan: true,
            status: true,
            startsAt: true,
            expiresAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          select: {
            id: true,
            plan: true,
            amountTnd: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
