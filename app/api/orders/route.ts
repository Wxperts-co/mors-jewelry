import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userPayload = await getCurrentUser();
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      userId = userPayload?.id || "",
      phone = "",
      deliveryMethod = "shipping",
      shippingAddress,
      items = [],
      subtotal = 0,
      shippingCost = 0,
      tax = 0,
      totalAmount = 0,
      notes = "",
    } = body;

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { success: false, message: "Customer full name is required." },
        { status: 400 }
      );
    }

    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.trim()) {
      return NextResponse.json(
        { success: false, message: "Customer email address is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart cannot be empty when placing an order." },
        { status: 400 }
      );
    }

    // Generate unique luxury order number
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `MORS-${uniqueNumber}`;

    // Item summary string
    const itemSummary = items
      .map((i: any) => `${i.title} × ${i.quantity || 1}`)
      .join(", ");

    const newOrder = await Order.create({
      orderNumber,
      userId: userId ? String(userId) : "",
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      phone: phone.trim(),
      deliveryMethod,
      shippingAddress: deliveryMethod === "shipping" ? shippingAddress : undefined,
      items: items.map((i: any) => ({
        id: String(i.id || ""),
        title: i.title || "",
        price: i.price || 0,
        quantity: Number(i.quantity || 1),
        image: i.image || "",
        category: i.category || "",
      })),
      item: itemSummary || "Fine Jewelry Item",
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(shippingCost) || 0,
      tax: Number(tax) || 0,
      totalAmount: Number(totalAmount) || 0,
      notes: notes.trim(),
      status: "Processing",
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order: {
        id: newOrder._id.toString(),
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        customerEmail: newOrder.customerEmail,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Order placement error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process and place order." },
      { status: 500 }
    );
  }
}
