import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { PasswordResetOtp } from "@/models/PasswordResetOtp";
import { sendPasswordResetOtpEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    await connectDB();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "No registered administrator found with this email." },
        { status: 404 }
      );
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs for this email
    await PasswordResetOtp.deleteMany({ email: normalizedEmail });

    // Store new OTP in database
    await PasswordResetOtp.create({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    console.log(`\n=================================================`);
    console.log(`[MORS JEWELRY ADMIN] Generated OTP for ${normalizedEmail}: ${otp}`);
    console.log(`=================================================\n`);

    // Send real email via SMTP / Nodemailer
    const mailResult = await sendPasswordResetOtpEmail({
      to: normalizedEmail,
      otp,
      adminName: admin.name || "Administrator",
    });

    if (!mailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            mailResult.error ||
            "Unable to deliver OTP email. Please ensure SMTP credentials are configured.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code (OTP) has been sent to ${normalizedEmail}. Please check your email inbox to verify.`,
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process OTP request. Please try again." },
      { status: 500 }
    );
  }
}


