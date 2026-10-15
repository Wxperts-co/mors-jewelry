import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductsPage } from '@/components/pages/ProductsPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const formatted = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${formatted} Jewelry & Luxury Creations | Mor's Jewelry`,
    description: `Explore our handcrafted fine ${formatted} collection, certified materials, and bespoke jewelry creations.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF8]" />}>
      <ProductsPage initialCategory={category} />
    </Suspense>
  );
}
