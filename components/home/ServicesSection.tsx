'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const ServicesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const services = [
    {
      id: 'custom-design',
      number: '01',
      title: 'Custom Jewelry & 3D Design',
      tag: 'Bespoke Creation',
      turnaround: 'From Sketch to Casting',
      image: '/services/custom-design.jpg',
    },
    {
      id: 'watch-repair',
      number: '02',
      title: 'Watch Battery & Movement Service',
      tag: 'Same-Day Service',
      turnaround: 'While You Wait',
      image: '/services/watch-repair.jpg',
    },
    {
      id: 'ring-resizing',
      number: '03',
      title: 'Ring Resizing & Laser Soldering',
      tag: 'Precision Repair',
      turnaround: 'Fast In-Store Turnaround',
      image: '/services/ring-resizing.jpg',
    },
    {
      id: 'jewelry-cleaning',
      number: '04',
      title: 'Ultrasonic Spa & Inspection',
      tag: 'Complimentary',
      turnaround: 'Instant In-Store',
      image: '/services/jewelry-cleaning.jpg',
    },
  ];

  const currentService = services[activeIndex];

  return (
    <section className="relative w-full bg-gradient-to-b from-white via-[#FCFBF8] to-white text-neutral-900 py-8 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-200/60">
      {/* Soft Ambient Gold Glows */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#FAF3E0] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-4xl font-extrabold tracking-tight text-neutral-900"
          >
            <span className="bg-gradient-to-r from-neutral-950 via-[#78590F] to-neutral-900 bg-clip-text text-transparent">
              Precision Jewelry & Watch Repair
            </span>
          </motion.h2>
        </div>

        {/* Unique Non-Card Atelier Showcase Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Left Column: Interactive Typographic Service Selector */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-3 sm:space-y-4">
            
            {/* Mobile View Quick Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:hidden gap-2 pb-1">
              {services.map((srv, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={srv.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-[#FAF3E0] border-[#D4AF37] text-neutral-900 shadow-sm'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${isActive ? 'text-[#996515]' : 'text-neutral-400'}`}>
                      {srv.number}
                    </span>
                    <span className="text-xs font-bold line-clamp-1 mt-0.5">
                      {srv.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Vertical Interactive Rows */}
            <div className="hidden lg:flex flex-col space-y-2.5">
              {services.map((srv, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div
                    key={srv.id}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative p-4.5 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FAF3E0]/90 to-white border-[#D4AF37]/60 shadow-[0_6px_20px_rgba(212,175,55,0.12)] translate-x-1'
                        : 'bg-white/70 hover:bg-neutral-50 border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-sm font-extrabold transition-colors font-mono ${
                            isActive ? 'text-[#996515]' : 'text-neutral-400 group-hover:text-neutral-600'
                          }`}
                        >
                          {srv.number}
                        </span>
                        <div>
                          <h3
                            className={`text-base font-bold transition-colors ${
                              isActive ? 'text-neutral-950' : 'text-neutral-700 group-hover:text-neutral-900'
                            }`}
                          >
                            {srv.title}
                          </h3>
                          <span className="text-xs text-neutral-500 font-medium">
                            {srv.turnaround}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#996515] text-white rotate-0'
                            : 'bg-neutral-100 text-neutral-400 -rotate-45 group-hover:bg-neutral-200 group-hover:text-neutral-700'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Visual Showcase Stage scaled proportionally */}
          <div className="lg:col-span-6 relative w-full h-full min-h-[260px] sm:min-h-[300px] lg:min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-neutral-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentService.id}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={currentService.image}
                  alt={currentService.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};
