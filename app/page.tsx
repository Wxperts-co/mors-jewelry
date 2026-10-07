import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { ProductSection } from '@/components/home/ProductSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { GallerySection } from '@/components/home/GallerySection';

export default function HomePage() {
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

