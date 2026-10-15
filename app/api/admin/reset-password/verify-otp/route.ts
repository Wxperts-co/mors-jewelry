import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { PasswordResetOtp } from "@/models/PasswordResetOtp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword, confirmPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, OTP verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New passwords do not match." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.toString().trim();

    await connectDB();

    // Verify OTP
    const validOtpRecord = await PasswordResetOtp.findOne({
      email: normalizedEmail,
      otp: normalizedOtp,
      expiresAt: { $gt: new Date() },
    });

    if (!validOtpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP verification code." },
        { status: 400 }
      );
    }

    // Find and update Admin
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Administrator account not found." },
        { status: 404 }
      );
    }

    admin.password = newPassword;
    await admin.save();

    // Remove used OTP
    await PasswordResetOtp.deleteMany({ email: normalizedEmail });

    return NextResponse.json({
      success: true,
      message: "Password verified and successfully reset! You may now sign in with your new password.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify code and reset password." },
      { status: 500 }
    );
  }
}
