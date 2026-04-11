import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/subscriptions — list subscriptions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (plan) where.plan = plan;

    const subscriptions = await db.subscription.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        license: {
          select: { id: true, qustodioEmail: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions — create a new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, devicesCount, licenseId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (plan && !['silver', 'gold'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'plan must be silver or gold' },
        { status: 400 }
      );
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        plan: plan || 'silver',
        devicesCount: devicesCount || 5,
        licenseId: licenseId || null,
        status: 'pending',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: subscription }, { status: 201 });
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
