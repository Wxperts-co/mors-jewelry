'use client';

import React, { useState } from 'react';
import { UserAuthForm } from './UserAuthForm';
import { UserDashboard } from './UserDashboard';
import { UserJwtPayload } from '@/lib/auth';

interface AccountClientWrapperProps {
  initialUser: UserJwtPayload | null;
  initialOrders?: any[];
}

export const AccountClientWrapper: React.FC<AccountClientWrapperProps> = ({ initialUser, initialOrders }) => {
  const [user, setUser] = useState<UserJwtPayload | null>(initialUser);

  return (
    <div
      className={`min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative transition-colors duration-300 overflow-hidden w-full max-w-full ${
        user
          ? 'bg-gradient-to-b from-[#FCFBF8] via-white to-[#FAF8F5] text-neutral-900'
          : 'bg-gradient-to-b from-[#070707] via-[#0b0b0e] to-[#070707] text-white'
      }`}
    >
      {/* Decorative ambient gold glow */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-full h-[400px] rounded-full pointer-events-none ${
          user ? 'bg-[#D4AF37]/10 blur-[130px]' : 'bg-[#D4AF37]/5 blur-[140px]'
        }`}
      />

      <div className="relative z-10 w-full max-w-full">
        {user ? (
          <UserDashboard
            initialUser={user}
            initialOrders={initialOrders}
            onLogout={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
          />
        ) : (
          <UserAuthForm
            onAuthSuccess={(loggedInUser) => setUser(loggedInUser)}
          />
        )}
      </div>
    </div>
  );
};
