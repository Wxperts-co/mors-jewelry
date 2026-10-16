import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { User } from "@/models/User";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Retrieve all administrators and registered customer users
export async function GET(req: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const [admins, users] = await Promise.all([
      Admin.find().select("-password").sort({ createdAt: -1 }).lean(),
      User.find().select("-password").sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      admins: admins.map((a: any) => ({
        id: a._id.toString(),
        name: a.name || "Administrator",
        email: a.email,
        role: a.role || "admin",
        createdAt: new Date(a.createdAt).toLocaleDateString(),
      })),
      users: users.map((u: any) => ({
        id: u._id.toString(),
        name: u.name || "Customer",
        email: u.email,
        phone: u.phone || "-",
        address: u.address || "-",
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
      })),
    });
  } catch (error: any) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST: Create a new administrator account
export async function POST(req: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, email, password, role = "admin" } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: trimmedEmail }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, message: `An administrator with email "${trimmedEmail}" already exists.` },
        { status: 400 }
      );
    }

    const trimmedName = name && typeof name === "string" && name.trim() ? name.trim() : trimmedEmail.split("@")[0] || "Admin";

    const newAdmin = await Admin.create({
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      role: role === "superadmin" ? "superadmin" : "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Administrator account created successfully.",
      admin: {
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: new Date(newAdmin.createdAt).toLocaleDateString(),
      },
    });
  } catch (error: any) {
    console.error("Admin user create error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create administrator account." },
      { status: 500 }
    );
  }
}

// PUT: Update administrator account
export async function PUT(req: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, name, role } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Admin ID is required." }, { status: 400 });
    }

    const updateFields: any = {};
    if (name) updateFields.name = name.trim();
    if (role) updateFields.role = role === "superadmin" ? "superadmin" : "admin";

    const updated = await Admin.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select("-password");
    if (!updated) {
      return NextResponse.json({ success: false, message: "Administrator not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Administrator updated successfully.",
      admin: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        role: updated.role,
        createdAt: new Date(updated.createdAt).toLocaleDateString(),
      },
    });
  } catch (error: any) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update administrator." },
      { status: 500 }
    );
  }
}

// DELETE: Remove administrator account
export async function DELETE(req: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id) {
      return NextResponse.json({ success: false, message: "Account ID is required." }, { status: 400 });
    }

    if (type === "customer" || type === "user") {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return NextResponse.json({ success: false, message: "Customer account not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Customer account removed successfully." });
    }

    if (id === currentAdmin.id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own active administrator account." },
        { status: 400 }
      );
    }

    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Administrator not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Administrator account removed successfully." });
  } catch (error: any) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete administrator." },
      { status: 500 }
    );
  }
}
