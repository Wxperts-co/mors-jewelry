'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Share2,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ArrowLeft,
  Phone,
} from 'lucide-react';
import rawProductsData from '@/data/tbl_new_product.json';
import { ProductItem } from '@/components/home/ProductSection';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useCart } from '@/context/CartContext';

interface ProductDetailsPageProps {
  productId: string;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId }) => {
  const siteConfig = useSiteConfig();
  const { addItem } = useCart();
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'care'>('details');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dbProduct, setDbProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/products?id=${encodeURIComponent(productId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && data?.product) {
          setDbProduct(data.product);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch product details from db:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const products: ProductItem[] = useMemo(() => {
    return rawProductsData as ProductItem[];
  }, []);

  // Find product by id or fallback to first
  const product = useMemo(() => {
    if (dbProduct) return dbProduct;
    return (
      products.find((p) => p.id === productId || p.alias === productId) ||
      products[0]
    );
  }, [products, productId, dbProduct]);

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  const getProductImage = (p: ProductItem) => {
    const customImg = p.thumb_image?.trim() || p.large_image?.trim();
    if (
      customImg &&
      (customImg.startsWith('/uploads/') ||
        customImg.startsWith('http://') ||
        customImg.startsWith('https://') ||
        customImg.startsWith('data:'))
    ) {
      return customImg;
    }
    const idNum = parseInt(p.id, 10);
    const imgNum = !isNaN(idNum) ? ((idNum - 1) % 20) + 1 : 1;
    return `/products/product${imgNum}.jpg`;
  };

  const mainImage = getProductImage(product);
  const price = parseFloat(product.msrp || '0').toFixed(2);
  const originalPrice = (parseFloat(price) * 1.25).toFixed(2);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.msrp,
        image: mainImage,
        category:
          product.category_id === '1'
            ? 'Gold'
            : product.category_id === '2'
            ? 'Diamond'
            : product.category_id === '3'
            ? 'Silver'
            : undefined,
        quantity: selectedQty,
      },
      true
    );
    showToast(`Added ${selectedQty} × "${product.title}" to your bag!`);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast(!isWishlisted ? 'Saved to your Wishlist!' : 'Removed from Wishlist');
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} at Mor's Jewelry`,
          url: window.location.href,
        });
      } catch {
        // Fallback
      }
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-white via-[#FAF8F5] to-white text-neutral-900 pb-28 sm:pb-20">
      {/* Soft Ambient Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#D4AF37]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-10 z-10">
        
        {/* Breadcrumbs & Back Link */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-8 text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Link href="/" className="hover:text-neutral-900 transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <Link href="/products" className="hover:text-neutral-900 transition-colors shrink-0">
              Products
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="text-neutral-900 font-bold truncate max-w-[140px] sm:max-w-xs">
              {product.title}
            </span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-950 font-bold transition-colors shrink-0 text-[11px] sm:text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Showcase</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* Left Column: Product Gallery (Slightly reduced for desktop elegance) */}
          <div className="w-full lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full aspect-square rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-3 sm:p-6 lg:p-8 flex items-center justify-center overflow-hidden group max-h-[440px] sm:max-h-[480px] mx-auto"
            >
              {/* Wishlist & Share buttons */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={toggleWishlist}
                  className={`p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                      : 'bg-white/90 text-neutral-600 hover:text-rose-500 hover:bg-white border border-neutral-200'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 sm:p-2.5 rounded-full bg-white/90 text-neutral-600 hover:text-neutral-950 hover:bg-white border border-neutral-200 backdrop-blur-md shadow-sm transition-all cursor-pointer hover:scale-105"
                  title="Share Piece"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Main Product Image */}
              <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out">
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Information & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:col-span-7 flex flex-col space-y-3.5 sm:space-y-6"
          >
            {/* Title */}
            <h1 className="text-xl sm:text-3xl lg:text-3xl font-extrabold text-neutral-900 leading-snug">
              {product.title}
            </h1>

            {/* Stock / Availability Section */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                In Stock & Available
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                • 100% Certified Authentic
              </span>
            </div>

            {/* Description Preview */}
            <p className="text-xs sm:text-base text-neutral-600 leading-relaxed">
              {product.description ||
                'Crafted with exquisite artistry and master craftsmanship. Each piece radiates timeless brilliance, forged with pure precious metals and ethically sourced stones.'}
            </p>

            {/* Desktop Quantity Selector & Add to Bag (Also visible on tablet/desktop) */}
            <div className="flex items-stretch sm:items-center gap-2 sm:gap-3 pt-1">
              <div className="flex items-center justify-between border-2 border-neutral-200 rounded-xl sm:rounded-2xl bg-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm">
                <button
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="text-neutral-500 hover:text-neutral-900 px-1.5 text-base sm:text-lg font-bold cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="px-2.5 sm:px-4 text-sm sm:text-base font-bold text-neutral-900">
                  {selectedQty}
                </span>
                <button
                  onClick={() => setSelectedQty((q) => q + 1)}
                  className="text-neutral-500 hover:text-neutral-900 px-1.5 text-base sm:text-lg font-bold cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-neutral-950 hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>
            </div>

            {/* Call / Direct Inquiry */}
            <a
              href={`tel:${siteConfig.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border border-neutral-200 hover:border-[#D4AF37] text-neutral-800 hover:text-[#996515] bg-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#A17416]" />
              <span>Questions? Call {siteConfig.phoneDisplay}</span>
            </a>

            {/* Assurance Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-neutral-200/80">
              <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-xl bg-white border border-neutral-200/60 shadow-xs">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#A17416] mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-neutral-900">Certified</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500">100% Authentic</span>
              </div>

              <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-xl bg-white border border-neutral-200/60 shadow-xs">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#A17416] mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-neutral-900">Shipping</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500">Fast & Insured</span>
              </div>

              <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-xl bg-white border border-neutral-200/60 shadow-xs">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#A17416] mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-neutral-900">Guarantee</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500">30-Day Returns</span>
              </div>
            </div>

            {/* Interactive Details / Shipping / Care Tabs */}
            <div className="pt-2 sm:pt-4">
              <div className="flex border-b border-neutral-200 gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
                {[
                  { id: 'details', label: 'Specifications' },
                  { id: 'shipping', label: 'Shipping & Delivery' },
                  { id: 'care', label: 'Jewelry Care' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#996515] text-[#996515]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 sm:pt-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {activeTab === 'details' && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-700">Product Code</span>
                      <span>#{product.id}</span>
                    </div>
                    {product.size && (
                      <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="font-semibold text-neutral-700">Available Size</span>
                        <span>{product.size}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-700">Material Standard</span>
                      <span>Fine Gold, Sterling Silver & Natural Diamond</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-neutral-700">Custom Sizing</span>
                      <span>Complimentary with purchase</span>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <p>Orders are dispatched with tamper-evident packaging and full transit insurance.</p>
                    <ul className="list-disc list-inside space-y-1 pt-1 text-neutral-500">
                      <li>Standard Ground Shipping: 3-5 business days</li>
                      <li>2-Day Express Delivery available at checkout</li>
                      <li>Complimentary in-store pickup at Stonecrest, GA gallery</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <p>To preserve your jewelry&apos;s luster, avoid direct contact with harsh chemicals and perfumes.</p>
                    <p>We provide lifetime complimentary cleaning and prong inspections at Mor&apos;s Jewelry.</p>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </div>

        {/* Related Creations Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-neutral-200/80">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8C6210] uppercase tracking-[0.2em]">
                  Recommended For You
                </span>
                <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 mt-0.5">
                  Complementary Creations
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-bold text-[#996515] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((rel) => {
                const relImg = getProductImage(rel);
                const relPrice = parseFloat(rel.msrp || '0').toFixed(2);
                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="group relative flex flex-col justify-between rounded-2xl bg-white border border-neutral-200/80 hover:border-[#D4AF37]/70 p-2 sm:p-3 transition-all duration-300 shadow-sm hover:shadow-[0_12px_28px_rgba(212,175,55,0.15)] hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="relative w-full h-36 sm:h-48 rounded-xl bg-white overflow-hidden flex items-center justify-center">
                      <Image
                        src={relImg}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-400"
                      />
                    </div>
                    <div className="pt-2 pb-0.5">
                      <h3 className="text-xs sm:text-sm font-bold text-neutral-800 line-clamp-1 group-hover:text-[#996515] transition-colors">
                        {rel.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Bottom Action Bar for Ergonomic Shopping */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 p-3 z-40 flex items-center justify-between gap-3 shadow-[0_-8px_25px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Status</span>
          <span className="text-xs font-bold text-emerald-700 leading-tight">
            In Stock
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 px-2 py-1">
            <button
              onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
              className="text-neutral-500 hover:text-neutral-900 px-1 text-sm font-bold cursor-pointer"
            >
              -
            </button>
            <span className="px-2 text-xs font-bold text-neutral-900">{selectedQty}</span>
            <button
              onClick={() => setSelectedQty((q) => q + 1)}
              className="text-neutral-500 hover:text-neutral-900 px-1 text-sm font-bold cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-[#D4AF37]/50 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#996515] flex items-center justify-center text-black font-bold">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
