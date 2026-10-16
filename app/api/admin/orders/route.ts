import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Retrieve all orders
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1, _id: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders: orders.map((o: any) => ({
        id: o.orderNumber || o._id.toString().slice(-6).toUpperCase(),
        _id: o._id.toString(),
        orderNumber: o.orderNumber,
        customer: o.customerName,
        customerName: o.customerName,
        email: o.customerEmail,
        customerEmail: o.customerEmail,
        phone: o.phone || "",
        deliveryMethod: o.deliveryMethod || "shipping",
        shippingAddress: o.shippingAddress || null,
        items: o.items || [],
        item: o.item || "Jewelry Item",
        amount: `$${Number(o.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawAmount: o.totalAmount || 0,
        subtotal: o.subtotal || 0,
        shippingCost: o.shippingCost || 0,
        tax: o.tax || 0,
        totalAmount: o.totalAmount || 0,
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
        createdAt: o.createdAt,
        status: o.status || "Processing",
        notes: o.notes || "",
      })),
    });
  } catch (error: any) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

// PUT: Update order status
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, orderNumber, status } = body;

    const query: any = {};
    if (orderNumber) query.orderNumber = orderNumber;
    else if (id) query.$or = [{ orderNumber: id }, { _id: id }];
    else {
      return NextResponse.json({ success: false, message: "Order ID or order number is required." }, { status: 400 });
    }

    const updated = await Order.findOneAndUpdate(query, { $set: { status } }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: updated,
    });
  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update order." },
      { status: 500 }
    );
  }
}

// DELETE: Remove an order
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Order ID is required." }, { status: 400 });
    }

    const deleted = await Order.findOneAndDelete({
      $or: [{ orderNumber: id }, { _id: id }],
    });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order deleted successfully." });
  } catch (error: any) {
    console.error("Admin order delete error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete order." },
      { status: 500 }
    );
  }
}
