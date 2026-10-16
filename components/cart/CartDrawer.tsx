'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    subtotal,
  } = useCart();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            aria-label="Close cart backdrop"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Slider from Right Side */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-full sm:w-screen max-w-full sm:max-w-md pointer-events-auto bg-[#0E0E0E] text-neutral-100 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-l border-[#D4AF37]/30 flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#BA8C37]/20 to-[#F3D382]/10 border border-[#D4AF37]/40 text-[#F3D382]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                        <span>Your Shopping Bag</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F3D382] border border-[#D4AF37]/40">
                          {totalCount} {totalCount === 1 ? 'item' : 'items'}
                        </span>
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={closeCart}
                    aria-label="Close cart"
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

               
              </div>

              {/* Items List / Empty State (Scrollable Area) */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 divide-y divide-neutral-800/60 scrollbar-thin scrollbar-thumb-neutral-800">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-2">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-800 border border-[#D4AF37]/30 flex items-center justify-center text-[#F3D382] mb-4 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">
                      Your Bag is Currently Empty
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-xs mb-6">
                      Explore our handcrafted fine gold, certified diamonds, and bespoke jewelry
                      creations.
                    </p>
                    <div className="flex flex-col w-full gap-2.5 max-w-xs">
                      <Link
                        href="/products/category/gold"
                        onClick={closeCart}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 shadow-md transition-all text-center"
                      >
                        Explore Gold Collection
                      </Link>
                      <Link
                        href="/products/category/diamond"
                        onClick={closeCart}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-[#D4AF37]/50 transition-all text-center"
                      >
                        Shop Certified Diamonds
                      </Link>
                      <Link
                        href="/products"
                        onClick={closeCart}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors text-center"
                      >
                        View All Collections
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-1">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="pt-4 first:pt-0 flex gap-3.5 group"
                        >
                          {/* Product Thumbnail */}
                          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 group-hover:border-[#D4AF37]/50 transition-colors shrink-0 flex items-center justify-center">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="88px"
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback image if missing
                                const target = e.currentTarget as unknown as HTMLImageElement;
                                target.src = '/products/product1.jpg';
                              }}
                            />
                          </div>

                          {/* Product Info & Controls */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={`/products/${item.id}`}
                                  onClick={closeCart}
                                  className="text-sm font-semibold text-neutral-100 hover:text-[#F3D382] transition-colors line-clamp-1"
                                >
                                  {item.title}
                                </Link>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  aria-label={`Remove ${item.title}`}
                                  className="text-neutral-500 hover:text-red-400 transition-colors p-1 -mr-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {item.category && (
                                <span className="inline-block mt-0.5 text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                                  {item.category}
                                </span>
                              )}

                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-sm font-bold text-white">
                                  ${item.price.toFixed(2)}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="text-[11px] text-neutral-400">
                                    (${ (item.price * item.quantity).toFixed(2) } total)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/40">
                              <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-900/90 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  aria-label="Decrease quantity"
                                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-white select-none">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  aria-label="Increase quantity"
                                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-xs font-bold text-[#F3D382]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer (when items exist) */}
              {items.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-neutral-800/90 bg-neutral-950/95 space-y-4">
                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs text-neutral-300">
                    <div className="flex justify-between items-center text-sm font-bold text-white">
                      <span>Subtotal</span>
                      <span className="text-base text-[#F3D382]">
                        ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                  </div>


                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="group relative w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={closeCart}
                        className="text-xs text-neutral-400 hover:text-white transition-colors"
                      >
                        Continue Shopping
                      </button>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        Clear Bag
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
