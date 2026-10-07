'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Smartphone, Mail } from 'lucide-react';

export const Topbar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-40 w-full bg-gradient-to-r from-[#BA8C37] via-[#E5C16C] to-[#B3832B] text-neutral-950 text-[11px] sm:text-xs font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] border-b border-[#9c6f21]/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="flex flex-row items-center justify-between gap-x-3 sm:gap-x-4">
          
          {/* Left Side: Address (Icon only on mobile, full address on desktop) */}
          <div className="flex items-center justify-start">
            <motion.a
              href="https://maps.app.goo.gl/Hd7zPdp71V3kA7Se6"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Store Address"
              className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 rounded-full bg-black/10 hover:bg-black/15 transition-colors shadow-sm font-medium text-neutral-950"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-950 shrink-0 stroke-[2.2]" />
              <span className="hidden sm:inline font-bold">2929 Turner Hill Rd, Stonecrest, GA 30038</span>
            </motion.a>
          </div>

          {/* Right Side: Contact Information (Icons only on mobile, full text on desktop) */}
          <div className="flex items-center justify-end gap-x-2 sm:gap-x-3 lg:gap-x-4">
            {/* Phone */}
            <motion.a
              href="tel:4702781018"
              aria-label="Call Store (470) 278-1018"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 rounded-full bg-black/10 hover:bg-black/15 transition-colors shadow-sm text-neutral-950"
            >
              <Phone className="w-3.5 h-3.5 text-neutral-950 shrink-0 stroke-[2.2]" />
              <span className="hidden sm:inline">(470) 278-1018</span>
            </motion.a>

            {/* Mobile */}
            <motion.a
              href="tel:6783891831"
              aria-label="Call Mobile (678) 389-1831"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 rounded-full bg-black/10 hover:bg-black/15 transition-colors shadow-sm text-neutral-950"
            >
              <Smartphone className="w-3.5 h-3.5 text-neutral-950 shrink-0 stroke-[2.2]" />
              <span className="hidden sm:inline">(678) 389-1831</span>
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:morsjewelry@gmail.com"
              aria-label="Email morsjewelry@gmail.com"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1 rounded-full bg-black/10 hover:bg-black/15 transition-colors shadow-sm text-neutral-950"
            >
              <Mail className="w-3.5 h-3.5 text-neutral-950 shrink-0 stroke-[2.2]" />
              <span className="hidden sm:inline">morsjewelry@gmail.com</span>
            </motion.a>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
