'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ChevronRight, Clock } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export const Footer = () => {
  const [currentYear, setCurrentYear] = React.useState(2026);
  const siteConfig = useSiteConfig();

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <footer className="relative bg-[#060608] text-neutral-100 overflow-hidden border-t border-[#D4AF37]/30">
      {/* 3D Top Gold Glow Bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#E8C472] to-transparent shadow-[0_0_12px_rgba(212,175,55,0.6)]" />

      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#D4AF37]/5 blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-5 sm:pb-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-12"
        >
          {/* Column 1: Brand & About */}
          <motion.div variants={itemVariants} className="space-y-2.5 sm:space-y-5">
            <Link href="/" className="inline-block [perspective:1000px]">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateX: 6,
                  rotateY: -6,
                  filter: 'drop-shadow(0 10px 20px rgba(212, 175, 55, 0.4))',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Image
                  src="/logo/logo.png"
                  alt={siteConfig.storeName}
                  width={180}
                  height={65}
                  className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
                />
              </motion.div>
            </Link>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal max-w-md">
              Your trusted jewelry destination since 2005. Fine gold, certified diamonds, custom designs, and master repair services.
            </p>
          </motion.div>

          {/* Combined 2-Column on Mobile: Collections & Services */}
          <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-1 lg:col-span-2 md:contents">
            
            {/* Column 2: Jewelry Collections */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-tr from-[#BA8C37] to-[#F3D382] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                Collections
              </h3>
              <ul className="space-y-1.5 sm:space-y-3 text-xs sm:text-sm">
                {[
                  { label: 'All Products', href: '/products' },
                  { label: 'Gold Jewelry', href: '#' },
                  { label: 'Diamonds', href: '#' },
                  { label: 'Sterling Silver', href: '#' },
                  { label: 'Custom Design', href: '#' },
                ].map((link) => (
                  <motion.li key={link.label} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Link href={link.href} className="text-neutral-300 hover:text-[#F3D382] font-medium transition-colors flex items-center gap-1.5 group">
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                      <span>{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Column 3: Services & Support */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-tr from-[#BA8C37] to-[#F3D382] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                Services & Care
              </h3>
              <ul className="space-y-1.5 sm:space-y-3 text-xs sm:text-sm">
                {[
                  { label: 'Jewelry Repair', href: '#' },
                  { label: 'Watch Repair', href: '#' },
                  { label: 'Ring Resizing', href: '#' },
                  { label: 'Free Cleaning', href: '#' },
                  { label: 'Contact Us', href: '#' },
                ].map((link) => (
                  <motion.li key={link.label} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Link href={link.href} className="text-neutral-300 hover:text-[#F3D382] font-medium transition-colors flex items-center gap-1.5 group">
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                      <span>{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

          </div>

          {/* Column 4: Store Information */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-tr from-[#BA8C37] to-[#F3D382] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              Visit Our Store
            </h3>
            <div className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm">
              <motion.a
                href={siteConfig.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 3 }}
                className="flex items-start gap-2 group cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5C16C] mt-0.5 shrink-0 stroke-[2.2] group-hover:scale-110 transition-transform" />
                <span className="text-neutral-300 group-hover:text-[#F3D382] group-hover:underline underline-offset-4 font-medium leading-snug transition-colors">
                  {siteConfig.address}
                </span>
              </motion.a>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5C16C] shrink-0 stroke-[2.2]" />
                <div className="space-x-2 text-neutral-300 font-medium">
                  <a href={`tel:${siteConfig.phone}`} className="hover:text-[#F3D382] transition-colors">{siteConfig.phoneDisplay}</a>
                  <span className="text-neutral-600">|</span>
                  <a href={`tel:${siteConfig.mobile}`} className="hover:text-[#F3D382] transition-colors">{siteConfig.mobileDisplay}</a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5C16C] shrink-0 stroke-[2.2]" />
                <a href={`mailto:${siteConfig.email}`} className="text-neutral-300 hover:text-[#F3D382] font-medium transition-colors truncate">
                  {siteConfig.email}
                </a>
              </div>

              {/* Store Hours / Timing */}
              <div className="flex items-start gap-2 pt-0.5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5C16C] mt-0.5 shrink-0 stroke-[2.2]" />
                <div className="text-neutral-300 font-medium leading-snug space-y-0.5 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Mon – Sat:</span>
                    <span className="text-white font-semibold">{siteConfig.hours.weekdays}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Sunday:</span>
                    <span className="text-white font-semibold">{siteConfig.hours.sunday}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-4 sm:pt-6 mt-5 sm:mt-6 border-t border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-neutral-300">
          <p className="font-semibold text-center md:text-left text-neutral-300 text-[11px] sm:text-sm">
            © {currentYear} Mor&apos;s Jewelry & Repair. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-300">
            <span className="hover:text-[#F3D382] transition-colors cursor-default">WEBSITE DEV</span>
            <span className="text-neutral-600">|</span>
            <span className="hover:text-[#F3D382] transition-colors cursor-default">HOSTING</span>
            <span className="text-neutral-600">|</span>
            <span className="hover:text-[#F3D382] transition-colors cursor-default">SEO</span>
            <span className="text-neutral-600">|</span>
            <span className="hover:text-[#F3D382] transition-colors cursor-default">MARKETING</span>
            
            <a
              href="https://wxperts.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center transition-transform hover:scale-105 ml-1"
            >
              <Image
                src="/logo/wxperts.webp"
                alt="Powered by Wxperts.co"
                width={110}
                height={28}
                className="h-5 sm:h-7 w-auto object-contain rounded-xs shadow-sm"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
