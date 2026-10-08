import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductsPage } from '@/components/pages/ProductsPage';

export const metadata: Metadata = {
  title: "All Fine Jewelry & Watch Products | Mor's Jewelry & Repair",
  description:
    "Explore our complete catalog of handcrafted fine gold, certified diamonds, sterling silver, and bespoke jewelry creations in Stonecrest, GA.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF8]" />}>
      <ProductsPage />
    </Suspense>
  );
}
