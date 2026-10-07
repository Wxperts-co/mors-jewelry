'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const leftNavLinks = [
    { label: 'PRODUCTS', href: '#' },
    { label: 'GOLD', href: '#' },
    { label: 'DIAMOND', href: '#' },
  ];

  const rightNavLinks = [
    { label: 'SILVER', href: '#' },
    { label: 'CONTACT US', href: '#' },
  ];

  const allLinks = [...leftNavLinks, ...rightNavLinks];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
      className="sticky top-0 z-50 w-full bg-[#070707]/95 backdrop-blur-xl border-b border-[#D4AF37]/25 shadow-[0_15px_35px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.06)_inset]"
    >
      {/* Subtle Top Gold Highlight Shimmer */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          
          {/* Left Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 flex-1 justify-start">
            {leftNavLinks.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  className="group relative block text-xs lg:text-sm font-bold tracking-[0.22em] text-neutral-100 hover:text-[#F3D382] transition-colors duration-300 py-1.5 px-2 rounded-md hover:bg-white/[0.03]"
                >
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* 3D Underline / Glow Effect */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] transition-all duration-300 group-hover:w-4/5 shadow-[0_2px_8px_rgba(212,175,55,0.8)]" />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Center Brand Logo */}
          <div className="flex-shrink-0 flex items-center justify-center py-1">
            <Link href="/" className="block">
              <div className="relative">
                <Image
                  src="/logo/logo.png"
                  alt="Mor's Jewelry & Repair"
                  width={260}
                  height={90}
                  priority
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
                />
              </div>
            </Link>
          </div>

          {/* Right Navigation & Action Icons (Desktop) */}
          <div className="hidden md:flex items-center flex-1 justify-end space-x-6 lg:space-x-8">
            <nav className="flex items-center space-x-6 lg:space-x-8">
              {rightNavLinks.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + (idx + 3) * 0.1 }}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className="group relative block text-xs lg:text-sm font-bold tracking-[0.22em] text-neutral-100 hover:text-[#F3D382] transition-colors duration-300 py-1.5 px-2 rounded-md hover:bg-white/[0.03]"
                  >
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* 3D Underline / Glow Effect */}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] transition-all duration-300 group-hover:w-4/5 shadow-[0_2px_8px_rgba(212,175,55,0.8)]" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* User & Cart Icons */}
            <div className="flex items-center space-x-3.5 pl-3 border-l border-neutral-800">
              {/* User Account */}
              <motion.div whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.93 }}>
                <Link
                  href="#"
                  aria-label="User Account"
                  className="group flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700/80 text-neutral-200 hover:text-[#F3D382] hover:border-[#D4AF37] hover:bg-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all"
                >
                  <User className="w-5 h-5 text-neutral-200 group-hover:text-[#F3D382] transition-colors stroke-[2]" />
                </Link>
              </motion.div>

              {/* Shopping Cart */}
              <motion.div whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.93 }}>
                <Link
                  href="#"
                  aria-label="Shopping Cart"
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700/80 text-neutral-200 hover:text-[#F3D382] hover:border-[#D4AF37] hover:bg-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all"
                >
                  <ShoppingBag className="w-5 h-5 text-neutral-200 group-hover:text-[#F3D382] transition-colors stroke-[2]" />
                  {/* Cart Item Badge */}
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-extrabold text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.9)]">
                    0
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Mobile Right Section (Icons + Menu Button) */}
          <div className="flex md:hidden items-center space-x-2.5">
            {/* Mobile User Icon */}
            <Link
              href="#"
              aria-label="User Account"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-[#F3D382] transition-colors"
            >
              <User className="w-4.5 h-4.5 text-neutral-200 stroke-[2]" />
            </Link>

            {/* Mobile Cart Icon */}
            <Link
              href="#"
              aria-label="Shopping Cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-[#F3D382] transition-colors"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-neutral-200 stroke-[2]" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 text-[9px] font-extrabold text-black bg-[#F3D382] rounded-full">
                0
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg bg-neutral-900 border border-[#D4AF37]/50 text-[#F3D382] hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#F3D382] stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 text-[#F3D382] stroke-[2.5]" />
              )}
            </motion.button>
          </div>

        </div>
      </div>

      {/* 3D Animated Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, rotateX: -15 }}
            animate={{ opacity: 1, height: 'auto', rotateX: 0 }}
            exit={{ opacity: 0, height: 0, rotateX: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="md:hidden bg-[#0a0a0c]/98 border-t border-[#D4AF37]/20 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2 sm:px-6">
              {allLinks.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-bold tracking-[0.2em] text-neutral-200 hover:text-[#F3D382] hover:bg-white/[0.04] border border-transparent hover:border-[#D4AF37]/30 transition-all shadow-sm"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
