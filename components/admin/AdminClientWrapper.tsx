'use client';

import React, { useState } from 'react';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminJwtPayload } from '@/lib/auth';

interface AdminClientWrapperProps {
  initialAdmin: AdminJwtPayload | null;
}

export const AdminClientWrapper: React.FC<AdminClientWrapperProps> = ({ initialAdmin }) => {
  const [admin, setAdmin] = useState<AdminJwtPayload | null>(initialAdmin);

  if (admin) {
    return <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-[#070707]">
      {/* Decorative luxury background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-[130px] pointer-events-none" />

      <AdminLoginForm onLoginSuccess={(loggedInAdmin) => setAdmin(loggedInAdmin)} />
    </div>
  );
};
