'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const CategorySection = () => {
  const categories = [
    {
      id: 'diamond',
      name: 'DIAMOND',
      href: '#',
      image: '/category/diamond.png',
      theme: {
        titleGradient: 'from-[#034078] via-[#0077B6] to-[#48CAE4]',
        textFilter:
          '[filter:drop-shadow(0_1px_0_#ffffff)_drop-shadow(0_2px_0_#90E0EF)_drop-shadow(0_4px_0_#0096C7)_drop-shadow(0_8px_16px_rgba(0,119,182,0.35))]',
        ambientGlow: 'bg-[#00B4D8]/15 group-hover:bg-[#00B4D8]/30',
        sparkleColor: 'text-[#00B4D8]',
        imageGlow: 'drop-shadow-[0_15px_30px_rgba(0,180,216,0.4)]',
      },
    },
    {
      id: 'gold',
      name: 'GOLD',
      href: '#',
      image: '/category/gold.png',
      theme: {
        titleGradient: 'from-[#6E4B02] via-[#C99A2C] to-[#FFE685]',
        textFilter:
          '[filter:drop-shadow(0_1px_0_#ffffff)_drop-shadow(0_2px_0_#FFE685)_drop-shadow(0_4px_0_#C99A2C)_drop-shadow(0_8px_16px_rgba(201,154,44,0.4))]',
        ambientGlow: 'bg-[#D4AF37]/15 group-hover:bg-[#D4AF37]/35',
        sparkleColor: 'text-[#D4AF37]',
        imageGlow: 'drop-shadow-[0_15px_30px_rgba(212,175,55,0.45)]',
      },
    },
    {
      id: 'silver',
      name: 'SILVER',
      href: '#',
      image: '/category/silver.png',
      theme: {
        titleGradient: 'from-[#1E293B] via-[#64748B] to-[#CBD5E1]',
        textFilter:
          '[filter:drop-shadow(0_1px_0_#ffffff)_drop-shadow(0_2px_0_#E2E8F0)_drop-shadow(0_4px_0_#94A3B8)_drop-shadow(0_8px_16px_rgba(51,65,85,0.35))]',
        ambientGlow: 'bg-[#94A3B8]/15 group-hover:bg-[#94A3B8]/30',
        sparkleColor: 'text-[#64748B]',
        imageGlow: 'drop-shadow-[0_15px_30px_rgba(100,116,139,0.4)]',
      },
    },
  ];

  return (
    <section className="relative w-full bg-white text-neutral-900 pt-16 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative max-w-6xl mx-auto">
        
        {/* Mobile View: 3 Square Cards (md:hidden) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:hidden">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                href={cat.href}
                className="relative aspect-square flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl bg-gradient-to-b from-white to-[#F9F8F5] border border-neutral-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] active:scale-95 transition-all text-center group overflow-hidden"
              >
                {/* Soft background aura glow */}
                <div
                  className={`absolute w-20 h-20 rounded-full ${cat.theme.ambientGlow} blur-xl pointer-events-none`}
                />

                {/* Category Image */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-0.5 flex items-center justify-center">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={80}
                    height={80}
                    className={`w-full h-full object-contain ${cat.theme.imageGlow} transition-transform group-hover:scale-105`}
                  />
                </div>

                {/* Category Name */}
                <span
                  className={`text-xs sm:text-sm font-black tracking-wide uppercase bg-gradient-to-b ${cat.theme.titleGradient} bg-clip-text text-transparent`}
                >
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop / Tablet View: 3D Pure Text with Slide-Out Images (hidden md:grid) */}
        <div className="hidden md:grid md:grid-cols-3 gap-12 sm:gap-16 items-center justify-items-center [perspective:1000px]">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
              className="w-full flex justify-center [transform-style:preserve-3d]"
            >
              <Link
                href={cat.href}
                className="group relative flex flex-col items-center justify-center py-12 px-6 cursor-pointer select-none [transform-style:preserve-3d]"
              >
                {/* Ambient Halo Aura Behind Text */}
                <div
                  className={`absolute w-48 h-28 rounded-full ${cat.theme.ambientGlow} blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none`}
                />

                {/* 3D Text & Slide-Out Image Container */}
                <div className="relative flex flex-col items-center justify-center">
                  
                  {/* Category Image that slides from behind the text to above on hover */}
                  <div className="absolute -top-6 z-0 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform translate-y-6 opacity-0 scale-75 group-hover:-translate-y-20 sm:group-hover:-translate-y-24 group-hover:opacity-100 group-hover:scale-110">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={160}
                      height={160}
                      className={`w-24 h-24 sm:w-32 sm:h-32 object-contain ${cat.theme.imageGlow} transition-transform duration-500 group-hover:rotate-6`}
                    />
                  </div>

                  {/* The Front 3D Solid Metallic Text */}
                  <h2
                    className={`relative z-10 text-3xl sm:text-4xl lg:text-5xl font-black tracking-[0.08em] uppercase bg-gradient-to-b ${cat.theme.titleGradient} bg-clip-text text-transparent ${cat.theme.textFilter} transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300`}
                  >
                    {cat.name}
                  </h2>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
