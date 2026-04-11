import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/licenses — list all licenses with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');
    const isAssigned = searchParams.get('isAssigned');

    const where: Record<string, unknown> = {};
    if (plan) where.plan = plan;
    if (isAssigned !== null && isAssigned !== undefined) {
      where.isAssigned = isAssigned === 'true';
    }

    const licenses = await db.license.findMany({
      where,
      include: {
        subscriptions: {
          select: {
            id: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Flatten assigned user name from the first active subscription if exists
    const formattedLicenses = licenses.map((lic) => {
      const assignedSub = lic.subscriptions.find(() => true);
      const { subscriptions: _subs, ...rest } = lic;
      return {
        ...rest,
        assignedUserName: assignedSub?.user?.name || null,
        assignedUserEmail: assignedSub?.user?.email || null,
      };
    });

    return NextResponse.json({ success: true, data: formattedLicenses });
  } catch (error) {
    console.error('GET /api/licenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}

// POST /api/licenses — create a new license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qustodioEmail, qustodioPassword, plan, expiresAt, purchasedFrom, notes } = body;

    if (!qustodioEmail || !qustodioPassword) {
      return NextResponse.json(
        { success: false, error: 'qustodioEmail and qustodioPassword are required' },
        { status: 400 }
      );
    }

    if (plan && !['silver', 'gold'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'plan must be silver or gold' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await db.license.findUnique({ where: { qustodioEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A license with this qustodioEmail already exists' },
        { status: 409 }
      );
    }

    const license = await db.license.create({
      data: {
        qustodioEmail,
        qustodioPassword,
        plan: plan || 'silver',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        purchasedFrom: purchasedFrom || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: license }, { status: 201 });
  } catch (error) {
    console.error('POST /api/licenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create license' },
      { status: 500 }
    );
  }
}
