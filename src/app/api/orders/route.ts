import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, paymentMethod, receiptData, customerName, customerPhone } = body;

    if (!plan || !paymentMethod) {
      return NextResponse.json(
        { error: "plan and paymentMethod are required" },
        { status: 400 }
      );
    }

    const planData = plan === "gold"
      ? { priceTnd: 149, devicesCount: 10 }
      : { priceTnd: 89, devicesCount: 5 };

    const order = await db.order.create({
      data: {
        userId: "guest",
        plan,
        amountTnd: planData.priceTnd,
        paymentMethod,
        receiptUrl: receiptData || null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, order });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
