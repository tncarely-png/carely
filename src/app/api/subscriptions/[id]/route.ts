import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/subscriptions/[id] — single subscription with user info
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, address: true, wilaya: true },
        },
        license: {
          select: { id: true, qustodioEmail: true, plan: true },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    console.error('GET /api/subscriptions/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions/[id] — update subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.subscription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.plan !== undefined) {
      if (!['silver', 'gold'].includes(body.plan)) {
        return NextResponse.json(
          { success: false, error: 'plan must be silver or gold' },
          { status: 400 }
        );
      }
      updateData.plan = body.plan;
    }

    if (body.status !== undefined) {
      const validStatuses = ['active', 'expired', 'pending', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status value' },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.qustodioEmail !== undefined) updateData.qustodioEmail = body.qustodioEmail || null;
    if (body.qustodioPassword !== undefined) updateData.qustodioPassword = body.qustodioPassword || null;
    if (body.activationCode !== undefined) updateData.activationCode = body.activationCode || null;
    if (body.startsAt !== undefined) updateData.startsAt = body.startsAt ? new Date(body.startsAt) : null;
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.autoRenew !== undefined) updateData.autoRenew = Boolean(body.autoRenew);

    const subscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        license: {
          select: { id: true, qustodioEmail: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    console.error('PUT /api/subscriptions/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
