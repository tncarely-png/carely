import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/licenses/assign — assign a license to a user + subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseId, userId, subscriptionId } = body;

    if (!licenseId || !userId || !subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'licenseId, userId, and subscriptionId are required' },
        { status: 400 }
      );
    }

    // Verify license exists and is not assigned
    const license = await db.license.findUnique({ where: { id: licenseId } });
    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License not found' },
        { status: 404 }
      );
    }
    if (license.isAssigned) {
      return NextResponse.json(
        { success: false, error: 'License is already assigned' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify subscription exists
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    // Update license
    const updatedLicense = await db.license.update({
      where: { id: licenseId },
      data: {
        isAssigned: true,
        assignedToUser: userId,
        assignedAt: now,
      },
    });

    // Update subscription with license credentials and activate
    const updatedSubscription = await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        qustodioEmail: license.qustodioEmail,
        qustodioPassword: license.qustodioPassword,
        status: 'active',
        startsAt: now,
        expiresAt: oneYearLater,
        licenseId: licenseId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        license: updatedLicense,
        subscription: updatedSubscription,
      },
    });
  } catch (error) {
    console.error('POST /api/licenses/assign error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign license' },
      { status: 500 }
    );
  }
}
