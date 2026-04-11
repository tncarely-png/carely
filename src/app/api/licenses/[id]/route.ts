import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/licenses/[id] — single license
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const license = await db.license.findUnique({
      where: { id },
      include: {
        subscriptions: {
          select: {
            id: true,
            status: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License not found' },
        { status: 404 }
      );
    }

    const { subscriptions: subs, ...rest } = license;
    const assignedSub = subs.find(() => true);
    const formatted = {
      ...rest,
      assignedUserName: assignedSub?.user?.name || null,
      assignedUserEmail: assignedSub?.user?.email || null,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('GET /api/licenses/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch license' },
      { status: 500 }
    );
  }
}

// PUT /api/licenses/[id] — update license
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.license.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'License not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.qustodioEmail !== undefined) updateData.qustodioEmail = body.qustodioEmail;
    if (body.qustodioPassword !== undefined) updateData.qustodioPassword = body.qustodioPassword;
    if (body.plan !== undefined) {
      if (!['silver', 'gold'].includes(body.plan)) {
        return NextResponse.json(
          { success: false, error: 'plan must be silver or gold' },
          { status: 400 }
        );
      }
      updateData.plan = body.plan;
    }
    if (body.isAssigned !== undefined) updateData.isAssigned = Boolean(body.isAssigned);
    if (body.assignedToUser !== undefined) updateData.assignedToUser = body.assignedToUser || null;
    if (body.assignedAt !== undefined) updateData.assignedAt = body.assignedAt ? new Date(body.assignedAt) : null;
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    if (body.purchasedFrom !== undefined) updateData.purchasedFrom = body.purchasedFrom || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    // Check for duplicate email if changing it
    if (body.qustodioEmail && body.qustodioEmail !== existing.qustodioEmail) {
      const duplicate = await db.license.findUnique({
        where: { qustodioEmail: body.qustodioEmail },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'A license with this qustodioEmail already exists' },
          { status: 409 }
        );
      }
    }

    const license = await db.license.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: license });
  } catch (error) {
    console.error('PUT /api/licenses/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update license' },
      { status: 500 }
    );
  }
}

// DELETE /api/licenses/[id] — delete license (only if not assigned)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const license = await db.license.findUnique({ where: { id } });
    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License not found' },
        { status: 404 }
      );
    }

    if (license.isAssigned) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete an assigned license' },
        { status: 400 }
      );
    }

    await db.license.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('DELETE /api/licenses/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete license' },
      { status: 500 }
    );
  }
}
