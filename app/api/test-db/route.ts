import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      success: true,
      message: "Successfully connected to MongoDB!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to connect to MongoDB";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
