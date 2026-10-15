import React from "react";
import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminClientWrapper } from "@/components/admin/AdminClientWrapper";

export const metadata: Metadata = {
  title: "Admin Portal | Mor's Jewelry & Repair",
  description: "Secure administrator dashboard for Mor's Jewelry.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const initialAdmin = await getCurrentAdmin();

  return <AdminClientWrapper initialAdmin={initialAdmin} />;
}
