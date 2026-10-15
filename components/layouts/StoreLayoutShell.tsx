'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Topbar } from '@/components/layouts/Topbar';
import { Navbar } from '@/components/layouts/Navbar';
import { Footer } from '@/components/layouts/Footer';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function StoreLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main className="flex-1 min-h-screen flex flex-col">{children}</main>;
  }

  return (
    <CartProvider>
      <Topbar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
