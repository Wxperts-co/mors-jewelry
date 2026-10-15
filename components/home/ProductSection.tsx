'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Eye,
  Star,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import rawProductsData from '@/data/tbl_new_product.json';
import { useCart } from '@/context/CartContext';

export interface ProductItem {
  id: string;
  category_id?: string;
  keywords?: string;
  sku?: string;
  title: string;
  alias?: string;
  alt_name?: string;
  size?: string;
  description?: string;
  msrp: string;
  wholesale_cost?: string;
  ground_shipping?: string;
  available?: string;
  thumb_image?: string;
  large_image?: string;
  featured?: string;
  new_arrival?: string;
  best_seller?: string;
  status?: string;
}

type TabType = 'all' | 'featured' | 'best_seller' | 'new_arrival';

export const ProductSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const { addItem } = useCart();

  // Cast imported JSON to typed array
  const products: ProductItem[] = useMemo(() => {
    return (rawProductsData as ProductItem[]).filter(
      (item) => item.status === '1' || item.status === undefined
    );
  }, []);

  // Filter products by tab
  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'featured':
        return products.filter((p) => p.featured === '1');
      case 'best_seller':
        return products.filter((p) => p.best_seller === '1');
      case 'new_arrival':
        return products.filter((p) => p.new_arrival === '1');
      case 'all':
      default:
        return products;
    }
  }, [products, activeTab]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, 12);
  }, [filteredProducts]);

  // Image resolver using available product images
  const getProductImage = (product: ProductItem, index: number) => {
    const idNum = parseInt(product.id, 10);
    const imgNum = !isNaN(idNum) ? ((idNum - 1) % 20) + 1 : (index % 20) + 1;
    return `/products/product${imgNum}.jpg`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const isFav = !prev[id];
      showToast(isFav ? 'Added to your Wishlist' : 'Removed from Wishlist');
      return { ...prev, [id]: isFav };
    });
  };

  const handleAddToCart = (product: ProductItem, e?: React.MouseEvent, qty = 1) => {
    if (e) e.stopPropagation();
    const idNum = parseInt(product.id, 10);
    const imgNum = !isNaN(idNum) ? ((idNum - 1) % 20) + 1 : 1;
    const imgUrl = `/products/product${imgNum}.jpg`;

    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.msrp,
        image: imgUrl,
        category:
          product.category_id === '1'
            ? 'Gold'
            : product.category_id === '2'
            ? 'Diamond'
            : product.category_id === '3'
            ? 'Silver'
            : undefined,
        quantity: qty,
      },
      true
    );
    showToast(`"${product.title.slice(0, 24)}..." added to bag!`);
  };

  const openQuickView = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQty(1);
    setQuickViewProduct(product);
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All Collections', count: products.length },
    {
      key: 'featured',
      label: 'Featured',
      count: products.filter((p) => p.featured === '1').length,
    },
    {
      key: 'best_seller',
      label: 'Best Sellers',
      count: products.filter((p) => p.best_seller === '1').length,
    },
    {
      key: 'new_arrival',
      label: 'New Arrivals',
      count: products.filter((p) => p.new_arrival === '1').length,
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-b from-white via-[#FAF8F5] to-white text-neutral-900 py-8 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-200/60">
      {/* Soft Ambient Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-[#D4AF37]/8 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#00B4D8]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Subtle Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
         

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900"
          >
            <span className="bg-gradient-to-r from-neutral-950 via-[#78590F] to-neutral-900 bg-clip-text text-transparent">
              Masterpiece Creations
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3.5 max-w-2xl text-sm sm:text-base text-neutral-600 font-normal"
          >
            Explore our handcrafted jewels, sculpted with ethical diamonds, pure gold, and sterling silver.
          </motion.p>

        </div>

        {/* Products Grid (Light Cards with Luxury Gold Accents) */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7"
        >
          <AnimatePresence mode="popLayout">
            {displayedProducts.map((product, index) => {
              const imgUrl = getProductImage(product, index);
              const price = parseFloat(product.msrp || '0').toFixed(2);
              const isWishlisted = !!wishlist[product.id];
              const isBestSeller = product.best_seller === '1';
              const isNew = product.new_arrival === '1';
              const isFeatured = product.featured === '1';

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 15 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white border border-neutral-200/80 hover:border-[#D4AF37]/70 p-2 sm:p-3 transition-all duration-400 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.18)] hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Card Gradient Shine on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                  <div>
                    {/* Image Box */}
                    <div className="relative w-full h-40 sm:h-52 lg:h-56 rounded-xl bg-white overflow-hidden flex items-center justify-center">
                     

                      {/* Top Right Floating Actions */}
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 flex flex-col gap-1 sm:gap-1.5">
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-sm ${
                            isWishlisted
                              ? 'bg-rose-500 text-white shadow-rose-500/40 scale-110'
                              : 'bg-white/90 text-neutral-600 hover:text-rose-500 hover:bg-white border border-neutral-200/80'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Heart
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                              isWishlisted ? 'fill-current' : ''
                            }`}
                          />
                        </button>

                        <button
                          onClick={(e) => openQuickView(product, e)}
                          className="p-1.5 rounded-full bg-white/90 text-neutral-600 hover:text-neutral-950 hover:bg-white border border-neutral-200/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-sm hover:scale-110"
                          title="Quick View"
                        >
                          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Product Image Link */}
                      <Link
                        href={`/products/${product.id}`}
                        className="relative w-full h-full transform group-hover:scale-108 transition-transform duration-500 ease-out block"
                      >
                        <Image
                          src={imgUrl}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain"
                        />
                      </Link>
                    </div>

                    {/* Content Section */}
                    <div className="pt-2 pb-1 space-y-0.5 sm:space-y-1">
                      {/* Title Link */}
                      <Link href={`/products/${product.id}`} className="block">
                        <h3
                          className="text-xs sm:text-sm font-bold text-neutral-800 line-clamp-1 group-hover:text-[#996515] transition-colors cursor-pointer"
                          title={product.title}
                        >
                          {product.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="pt-1 sm:pt-1.5">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl bg-neutral-900 hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black font-semibold text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* See All Products CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14 text-center"
        >
          <Link
            href="#"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-neutral-900 border-2 border-[#D4AF37] text-neutral-900 hover:text-white font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)] cursor-pointer group"
          >
            <span>See All Products</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Quick View Modal (Light & Crisp Dialog) */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl rounded-3xl bg-white border border-neutral-200/90 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.25)] z-10 overflow-hidden text-neutral-900"
            >
              {/* Close button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                {/* Product Image */}
                <div className="relative w-full h-72 sm:h-84 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={getProductImage(
                      quickViewProduct,
                      parseInt(quickViewProduct.id || '1', 10) - 1
                    )}
                    alt={quickViewProduct.title}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col space-y-4 text-left">
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                    {quickViewProduct.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      In Stock & Ready to Ship
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 leading-relaxed max-h-24 overflow-y-auto">
                    {quickViewProduct.description ||
                      'Crafted with the highest quality standards, this bespoke jewelry piece radiates unmatched brilliance and timeless elegance.'}
                  </p>

                  {/* Quantity & Action */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 px-3 py-1.5">
                      <button
                        onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                        className="text-neutral-500 hover:text-neutral-900 px-2 py-0.5 text-base font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-bold text-neutral-900">
                        {selectedQty}
                      </span>
                      <button
                        onClick={() => setSelectedQty((q) => q + 1)}
                        className="text-neutral-500 hover:text-neutral-900 px-2 py-0.5 text-base font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        handleAddToCart(quickViewProduct, undefined, selectedQty);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-neutral-900 hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </button>
                  </div>

                  {/* Guarantees */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-200 text-[11px] text-neutral-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>Certified Pure</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>Insured Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>30-Day Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-900 border border-[#D4AF37]/50 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#996515] flex items-center justify-center text-black font-bold">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
