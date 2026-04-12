import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          select: {
            id: true,
            status: true,
            startsAt: true,
            expiresAt: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[orders GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, paymentMethod, receiptData } = body;

    // Validate required fields
    if (!userId || !plan || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "البيانات غير مكتملة" },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود. سجل دخول من جديد." },
        { status: 404 }
      );
    }

    // Get plan pricing from constants
    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig) {
      return NextResponse.json(
        { success: false, error: "الباقة غير صحيحة" },
        { status: 400 }
      );
    }

    const amountTnd = planConfig.priceTnd;
    const devicesCount = planConfig.devices;

    // Create the order linked to the real user
    const order = await db.order.create({
      data: {
        userId: user.id,
        plan,
        amountTnd,
        paymentMethod,
        receiptUrl: receiptData || null, // base64 receipt image
        status: "pending",
      },
    });

    // Create a pending subscription linked to this order
    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        plan,
        status: "pending",
        devicesCount,
        orderId: order.id,
      },
    });

    // Link subscription to order
    await db.order.update({
      where: { id: order.id },
      data: { subscriptionId: subscription.id },
    });

    console.log("[orders POST] Order created:", order.id, "for user:", user.id, "plan:", plan, "amount:", amountTnd);

    return NextResponse.json({ success: true, order, subscription });
  } catch (error) {
    console.error("[orders POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "حصل مشكل أثناء إرسال الطلب. جرب مرة أخرى." },
      { status: 500 }
    );
  }
}
