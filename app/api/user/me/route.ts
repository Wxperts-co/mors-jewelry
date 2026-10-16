import { NextResponse } from "next/server";
import { getCurrentUser, signUserToken, USER_COOKIE_NAME } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userPayload.id).select("-password").lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userEmail = (user.email || "").trim().toLowerCase();
    const userIdStr = (user as any)._id.toString();
    const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Fetch orders matching customer user ID or customer email (case-insensitive)
    const orders = await Order.find({
      $or: [
        { userId: userIdStr },
        { customerEmail: userEmail },
        { customerEmail: { $regex: new RegExp(`^${escapedEmail}$`, "i") } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        createdAt: (user as any).createdAt,
      },
      orders: orders.map((o: any) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        item: o.item,
        totalAmount: o.totalAmount,
        status: o.status,
        deliveryMethod: o.deliveryMethod || "shipping",
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("User me fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, address } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      userPayload.id,
      {
        $set: {
          name: name.trim(),
          phone: typeof phone === "string" ? phone.trim() : "",
          address: typeof address === "string" ? address.trim() : "",
        },
      },
      { new: true, returnDocument: 'after', strict: false } as any
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const u = updatedUser as any;
    const userData = {
      id: u._id.toString(),
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      address: u.address || "",
      createdAt: u.createdAt,
    };

    // Re-sign token with updated data
    const token = signUserToken({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account details updated successfully.",
      user: userData,
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update account details." },
      { status: 500 }
    );
  }
}
