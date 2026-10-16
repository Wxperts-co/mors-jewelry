import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signUserToken, USER_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const errors: Record<string, string> = {};

    if (!email || typeof email !== "string" || !email.trim()) {
      errors.email = "Email address is required.";
    }

    if (!password || typeof password !== "string") {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, message: "Please enter your email and password." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          errors: { email: "No account found with this email." },
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          errors: { password: "Incorrect password." },
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone || "",
    };

    const token = signUserToken(userPayload);

    const response = NextResponse.json({
      success: true,
      message: "Welcome back!",
      user: userPayload,
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60, // 14 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("User login error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
