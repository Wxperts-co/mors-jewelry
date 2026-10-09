import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { ProductSection } from '@/components/home/ProductSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { GallerySection } from '@/components/home/GallerySection';
import { getStoreConfigByHostname } from '@/config/siteConfig';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const config = getStoreConfigByHostname(host);

  const title = `${config.storeName} | ${config.address}`;
  const description = `Exquisite fine jewelry, certified diamonds, gold, silver, and master repair services at ${config.address}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: config.storeName,
      type: "website",
      images: [
        {
          url: "/logo/logo.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo/logo.png"],
    },
  };
}

function HomeContent() {
  return (
    <main>
      <HeroSection />
      <CategorySection />
      <ProductSection />
      <ServicesSection />
      <GallerySection />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <HomeContent />
    </Suspense>
  );
}

