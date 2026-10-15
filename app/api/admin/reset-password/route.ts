import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword, confirmPassword } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "No administrator found with this email." },
        { status: 404 }
      );
    }

    // Update password (pre-save hook hashes with bcrypt automatically)
    admin.password = newPassword;
    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset. You may now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while resetting password." },
      { status: 500 }
    );
  }
}
