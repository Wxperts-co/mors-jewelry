import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { signAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Field validations
    const errors: Record<string, string> = {};

    if (!email || typeof email !== "string" || !email.trim()) {
      errors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (!password || typeof password !== "string") {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, message: "Validation failed." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();

    // Check if any admin exists in the database. If not, auto-seed default admin.
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultEmail = (
        process.env.ADMIN_DEFAULT_EMAIL || "admin@morsjewelry.com"
      ).toLowerCase();
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@12345";

      await Admin.create({
        name: "Super Admin",
        email: defaultEmail,
        password: defaultPassword,
        role: "superadmin",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          errors: { email: "No administrator found with this email." },
          message: "Invalid credentials.",
        },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          errors: { password: "The password you entered is incorrect." },
          message: "Invalid credentials.",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
