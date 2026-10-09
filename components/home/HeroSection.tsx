'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export const HeroSection = () => {
  const siteConfig = useSiteConfig();
  const slides = [
      {
      id: 2,
      image: '/banner/shop.png',
      mobileImage: '/banner/mobile-shop.png',
      alt: "Mor's Jewelry Store & Workshop",
    },
    {
      id: 1,
      image: '/banner/hero.png',
      mobileImage: '/banner/mobile-hero.png',
      alt: "Mor's Jewelry & Repair Fine Jewelry Banner",
    }
  
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance banner every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="group relative w-full h-[50vh] sm:h-[62vh] lg:h-[84vh] min-h-[360px] sm:min-h-[460px] lg:min-h-[560px] max-h-[720px] flex flex-col justify-between overflow-hidden bg-[#070707] text-white py-8 sm:py-12">
      {/* Background Banner Slider with Smooth Crossfade */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Desktop Banner */}
            <div className="hidden sm:block absolute inset-0">
              <Image
                src={slides[currentIndex].image}
                alt={slides[currentIndex].alt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>

            {/* Mobile Banner */}
            <div className="block sm:hidden absolute inset-0">
              <Image
                src={slides[currentIndex].mobileImage}
                alt={slides[currentIndex].alt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Left Arrow */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/80 text-white hover:text-[#F3D382] border border-white/20 hover:border-[#D4AF37]/80 backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {/* Slider Right Arrow */}
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/80 text-white hover:text-[#F3D382] border border-white/20 hover:border-[#D4AF37]/80 backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-110"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

     

      {/* Top Spacer / Layout balancer */}
      <div className="relative z-10 w-full" />

      {/* Center 3D Running Heading */}
      {/* <div className="relative z-10 w-full overflow-hidden py-4 pointer-events-none">
        <motion.div
          initial={{ x: '100vw' }}
          animate={{ x: ['100vw', '-100%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          }}
          className="inline-flex whitespace-nowrap will-change-transform"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold uppercase tracking-[0.14em] text-white [filter:drop-shadow(0_4px_12px_rgba(0,0,0,1))_drop-shadow(0_2px_4px_rgba(0,0,0,0.9))] select-none pr-8">
            <span className="bg-gradient-to-r from-white via-[#FCE39A] to-[#E5BE65] bg-clip-text text-transparent font-black">
              Where Timeless Elegance
            </span>{' '}
            <span className="bg-gradient-to-r from-[#FCE39A] via-[#E5BE65] to-[#BA8C37] bg-clip-text text-transparent font-black">
              Meets Expert Craftsmanship
            </span>
          </h1>
        </motion.div>
      </div> */}

      {/* Bottom Spacer */}
      <div className="relative z-10 w-full" />

      {/* Fixed Compact 3D Floating Action Button on Bottom-Right */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.a
          href={`tel:${siteConfig.phone}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
          whileHover={{
            scale: 1.06,
            y: -2,
            boxShadow: '0 10px 25px rgba(212,175,55,0.5), inset 0 1px 1px rgba(255,255,255,0.8)',
          }}
          whileTap={{ scale: 0.94 }}
          className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#BA8C37] via-[#E8C472] to-[#B3832B] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.7)] transition-all cursor-pointer border border-[#FFF3B0]/60"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black/10 group-hover:bg-black/20 transition-colors shadow-inner">
            <PhoneCall className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          </div>

          {/* Text */}
          <span className="text-xs font-black text-black">
            {siteConfig.phoneDisplay}
          </span>
        </motion.a>
      </div>
    </section>
  );
};
