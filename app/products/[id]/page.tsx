import React, { Suspense } from 'react';
import { ProductDetailsPage } from '@/components/pages/ProductDetailsPage';
import rawProductsData from '@/data/tbl_new_product.json';

export async function generateStaticParams() {
  return rawProductsData.map((product) => ({
    id: String(product.id),
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductDetailsPage productId={id} />
    </Suspense>
  );
}
