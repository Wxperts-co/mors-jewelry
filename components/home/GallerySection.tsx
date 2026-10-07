'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const galleryImages = [
  { id: 1, src: '/gallery/galleryimage1.png', alt: "Mor's Fine Jewelry 1" },
  { id: 2, src: '/gallery/galleryimage2.png', alt: "Mor's Fine Jewelry 2" },
  { id: 3, src: '/gallery/galleryimage3.png', alt: "Mor's Fine Jewelry 3" },
  { id: 4, src: '/gallery/galleryimage4.png', alt: "Mor's Fine Jewelry 4" },
  { id: 5, src: '/gallery/galleryimage5.png', alt: "Mor's Fine Jewelry 5" },
  { id: 6, src: '/gallery/galleryimage6.png', alt: "Mor's Fine Jewelry 6" },
  { id: 7, src: '/gallery/galleryimage7.png', alt: "Mor's Fine Jewelry 7" },
  { id: 8, src: '/gallery/galleryimage8.png', alt: "Mor's Fine Jewelry 8" },
  { id: 9, src: '/gallery/galleryimage9.png', alt: "Mor's Fine Jewelry 9" },
  { id: 10, src: '/gallery/galleryimage10.png', alt: "Mor's Fine Jewelry 10" },
  { id: 11, src: '/gallery/galleryimage11.png', alt: "Mor's Fine Jewelry 11" },
  { id: 12, src: '/gallery/galleryimage12.png', alt: "Mor's Fine Jewelry 12" },
];

export const GallerySection = () => {
  // Triple the list to enable seamless infinite wrap
  const extendedImages = [...galleryImages, ...galleryImages, ...galleryImages];
  const initialIndex = galleryImages.length; // Start in middle set

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [itemsVisible, setItemsVisible] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive items count calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsVisible(2);
      } else if (width < 1024) {
        setItemsVisible(3.5);
      } else if (width < 1280) {
        setItemsVisible(5);
      } else {
        setItemsVisible(6);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slideNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const slidePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  const modalPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev > 0 ? prev - 1 : galleryImages.length - 1) : null
    );
  }, []);

  const modalNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev < galleryImages.length - 1 ? prev + 1 : 0) : null
    );
  }, []);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        modalPrev();
      } else if (e.key === 'ArrowRight') {
        modalNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, modalPrev, modalNext]);

  // Seamless boundary wrap when transition ends
  const handleTransitionEnd = () => {
    if (currentIndex >= galleryImages.length * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - galleryImages.length);
    } else if (currentIndex < galleryImages.length) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + galleryImages.length);
    }
  };

  // Autoplay timer sliding 1 by 1
  useEffect(() => {
    if (isPaused || selectedImageIndex !== null) return;

    autoPlayRef.current = setInterval(() => {
      slideNext();
    }, 2800);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slideNext, isPaused, selectedImageIndex]);

  return (
    <section className="relative w-full bg-gradient-to-b from-[#FCFBF8]/80 via-white/70 to-[#FAF8F5]/80 backdrop-blur-2xl text-neutral-900 py-6 sm:py-10 overflow-hidden border-t border-white/60">
      {/* Ambient Glassmorphism Light Orbs */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-[#FAF3E0]/70 rounded-full blur-[90px] pointer-events-none" />

      {/* Full-Width Slider Viewport with Left/Right End Controls */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left End Navigation Button */}
        <button
          onClick={slidePrev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-white/95 hover:border-[#D4AF37] hover:scale-105 active:scale-95 text-neutral-800 hover:text-neutral-950 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right End Navigation Button */}
        <button
          onClick={slideNext}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-white/95 hover:border-[#D4AF37] hover:scale-105 active:scale-95 text-neutral-800 hover:text-neutral-950 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Sliding Track */}
        <div
          className="flex items-center"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)`,
            transition: isTransitioning
              ? 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)'
              : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedImages.map((img, idx) => (
            <div
              key={`${img.id}-${idx}`}
              className="px-1.5 sm:px-2 select-none shrink-0 cursor-pointer"
              style={{ width: `${100 / itemsVisible}%` }}
              onClick={() => setSelectedImageIndex(img.id - 1)}
            >
              <div className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_6px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(212,175,55,0.22)] hover:border-[#D4AF37] hover:bg-white/80 transition-all duration-300">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reduced-Size Lightbox Image Modal with Left/Right Navigation */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedImageIndex(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md sm:max-w-lg w-full aspect-square max-h-[75vh] rounded-3xl overflow-hidden bg-neutral-950 border border-white/20 shadow-2xl flex items-center justify-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                aria-label="Close modal"
                className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-30 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-[#E8C472] flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Modal Left Navigation Button */}
              <button
                onClick={modalPrev}
                aria-label="Previous image"
                className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-[#E8C472] flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Modal Right Navigation Button */}
              <button
                onClick={modalNext}
                aria-label="Next image"
                className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-[#E8C472] flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Active Image */}
              <div className="relative w-full h-full p-3 sm:p-4 flex items-center justify-center">
                <Image
                  key={galleryImages[selectedImageIndex].src}
                  src={galleryImages[selectedImageIndex].src}
                  alt={galleryImages[selectedImageIndex].alt}
                  fill
                  priority
                  sizes="(max-width: 640px) 90vw, 500px"
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};
