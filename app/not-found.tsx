'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Home, Gem, Search } from 'lucide-react';

export default function NotFound() {
  const quickLinks = [
    { label: 'DIAMOND COLLECTION', href: '/diamond' },
    { label: 'FINE GOLD', href: '/gold' },
    { label: 'STERLING SILVER', href: '/silver' },
    { label: 'ALL PRODUCTS', href: '/products' },
  ];

  return (
    <div className="fixed inset-0 z-[999] min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#08080A] via-[#0E0E12] to-[#08080A] text-neutral-100 px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#00B4D8]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#B8860B]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center z-10">
        {/* Top Gold Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F3E5AB] animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#F3E5AB] uppercase">
            Page Not Found
          </span>
        </motion.div>

        {/* 3D Metallic 404 Heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: 'spring' }}
          className="relative select-none"
        >
          <h1 className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter bg-gradient-to-b from-[#FFF5D0] via-[#D4AF37] to-[#8C6210] bg-clip-text text-transparent [filter:drop-shadow(0_4px_24px_rgba(212,175,55,0.35))]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <Gem className="w-64 h-64 text-[#D4AF37]" />
          </div>
        </motion.div>

        {/* Subtitle and description */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3 mt-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Treasured Piece Not Found
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-light max-w-md mx-auto leading-relaxed">
            The page or exquisite jewel you are seeking seems to have moved or does not exist in our current showcase.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C472] to-[#C59B27] hover:from-[#E8C472] hover:to-[#D4AF37] text-black font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-[#D4AF37]/60 text-neutral-200 hover:text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
