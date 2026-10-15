'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Eye,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Home,
} from 'lucide-react';
import { ProductItem } from '@/components/home/ProductSection';
import { useCart } from '@/context/CartContext';

export interface CategoryTabItem {
  key: string;
  label: string;
  category_id?: string;
}

export type CategoryTab = string;

interface ProductsPageProps {
  initialCategory?: string;
}

// In-memory cache across tab switches and route changes to eliminate tab vanishing / blinking
let cachedTabs: CategoryTabItem[] = [
  { key: 'all', label: 'All Products' },
  { key: 'gold', label: 'Gold', category_id: '1' },
  { key: 'diamond', label: 'Diamond', category_id: '2' },
  { key: 'silver', label: 'Silver', category_id: '3' },
];
const cachedProductsByCategory: Record<string, ProductItem[]> = {};

export const ProductsPage: React.FC<ProductsPageProps> = ({ initialCategory }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pathCategory = pathname?.startsWith('/products/category/')
    ? decodeURIComponent(pathname.replace('/products/category/', '').split('/')[0] || '').toLowerCase()
    : undefined;

  const currentCategory = (initialCategory || pathCategory || searchParams.get('category') || 'all').toLowerCase();

  const [activeTab, setActiveTab] = useState<CategoryTab>(currentCategory);
  const [tabs, setTabs] = useState<CategoryTabItem[]>(cachedTabs);
  const [products, setProducts] = useState<ProductItem[]>(cachedProductsByCategory[currentCategory] || []);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedProductsByCategory[currentCategory]);
  const [visibleCount, setVisibleCount] = useState<number>(16);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const { addItem } = useCart();

  // Synchronize activeTab whenever URL or category route changes
  useEffect(() => {
    setActiveTab(currentCategory);
    setVisibleCount(16);
  }, [currentCategory]);

  // Support browser Back/Forward navigation without page unmounting
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const cat = path.startsWith('/products/category/')
        ? decodeURIComponent(path.replace('/products/category/', '').split('/')[0] || '').toLowerCase()
        : 'all';
      setActiveTab(cat);
      setVisibleCount(16);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    setVisibleCount(16);
    const newUrl = tabKey === 'all' ? '/products' : `/products/category/${encodeURIComponent(tabKey)}`;
    if (typeof window !== 'undefined') {
      window.history.pushState({ category: tabKey }, '', newUrl);
    }
  };

  // 1. Fetch categories dynamically from the DB and keep cachedTabs updated
  useEffect(() => {
    let isMounted = true;
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const freshTabs = [
            { key: 'all', label: 'All Products' },
            ...data.categories.map((c: any) => ({
              key: (c.slug || c.alias || c.name || '').toLowerCase(),
              label: c.name || c.category_name,
              category_id: c.category_id ? String(c.category_id) : undefined,
            })),
          ];
          cachedTabs = freshTabs;
          setTabs(freshTabs);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch categories from db:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch products dynamically from the DB with instant memory cache
  useEffect(() => {
    let isMounted = true;

    // If already in memory cache, display immediately with zero layout shift
    if (cachedProductsByCategory[activeTab]) {
      setProducts(cachedProductsByCategory[activeTab]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const url =
      activeTab === 'all'
        ? '/api/products'
        : `/api/products?category=${encodeURIComponent(activeTab)}`;

    fetch(url, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.products)) {
          cachedProductsByCategory[activeTab] = data.products;
          setProducts(data.products);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch products from db:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const displayedProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  // Image resolver
  const getProductImage = (product: ProductItem, index: number) => {
    if (product.thumb_image && product.thumb_image.trim()) {
      return product.thumb_image;
    }
    if (product.large_image && product.large_image.trim()) {
      return product.large_image;
    }
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
    const imgUrl =
      product.thumb_image?.trim() ||
      product.large_image?.trim() ||
      `/products/product${imgNum}.jpg`;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFBF8] via-white to-[#FAF8F5] text-neutral-900 pb-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 sm:right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900/95 text-white shadow-2xl border border-[#D4AF37]/50 backdrop-blur-md text-xs sm:text-sm font-semibold"
          >
            <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center text-black shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header & Breadcrumb */}
      <section className="relative w-full bg-gradient-to-b from-[#F7F4EC] to-white border-b border-neutral-200/80 pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gold Halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-neutral-500 mb-4 sm:mb-4">
            <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            {activeTab === 'all' ? (
              <span className="text-neutral-900 font-bold">All Products</span>
            ) : (
              <>
                <Link href="/products" className="hover:text-neutral-900 transition-colors">
                  All Products
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-900 font-bold capitalize">
                  {tabs.find((t) => t.key === activeTab)?.label || activeTab}
                </span>
              </>
            )}
          </nav>

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-4xl font-black tracking-tight text-neutral-900">
                <span className="bg-gradient-to-r from-neutral-950 via-[#78590F] to-neutral-900 bg-clip-text text-transparent">
                  Complete Jewelry Catalog
                </span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 max-w-3xl">
                Discover our curated collection of fine gold, certified diamonds, sterling silver, and bespoke jewelry creations.
              </p>
            </div>

            <div className="text-xs sm:text-sm font-semibold text-neutral-500 shrink-0">
              Showing <span className="font-bold text-neutral-900">{displayedProducts.length}</span> of{' '}
              <span className="font-bold text-neutral-900">{products.length}</span> items
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Category Tabs: All products, Diamond, Gold, Silver */}
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-8 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-md scale-105 border border-neutral-900'
                    : 'bg-white border border-neutral-200/90 text-neutral-700 hover:border-[#D4AF37] hover:text-[#996515] hover:bg-neutral-50 shadow-2xs'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-neutral-200/80 p-2 sm:p-3 space-y-3 animate-pulse shadow-xs"
              >
                <div className="w-full aspect-square rounded-xl bg-neutral-100" />
                <div className="space-y-1.5 py-1">
                  <div className="h-3.5 bg-neutral-100 rounded-md w-3/4" />
                  <div className="h-3 bg-neutral-100/70 rounded-md w-1/2" />
                </div>
                <div className="h-8 bg-neutral-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
            {displayedProducts.map((product, index) => {
              const imgUrl = getProductImage(product, index);
              const price = parseFloat(product.msrp || '0').toFixed(2);
              const isWishlisted = !!wishlist[product.id];

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: (index % 12) * 0.03 }}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white border border-neutral-200/80 hover:border-[#D4AF37]/70 p-2 sm:p-3 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.18)] hover:-translate-y-1 overflow-hidden"
                >
                  {/* Subtle top gold hover sheen */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div>
                    {/* Image Container */}
                    <div className="relative w-full aspect-square rounded-xl bg-neutral-50 overflow-hidden flex items-center justify-center">
                      {/* Action buttons (Wishlist + Quick View) */}
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 flex flex-col gap-1 sm:gap-1.5">
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-xs ${
                            isWishlisted
                              ? 'bg-rose-500 text-white scale-110'
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
                          className="p-1.5 rounded-full bg-white/90 text-neutral-600 hover:text-neutral-950 hover:bg-white border border-neutral-200/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-xs hover:scale-110"
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
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain p-2"
                        />
                      </Link>
                    </div>

                    {/* Content Section */}
                    <div className="pt-2.5 pb-1 space-y-0.5 sm:space-y-1">
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

                  {/* Add to Bag Button */}
                  <div className="pt-1.5">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl bg-neutral-900 hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black font-semibold text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 shadow-xs hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF3E0] border border-[#D4AF37]/30 flex items-center justify-center text-[#996515] mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
              No creations found in this collection
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-sm">
              Explore our other categories to discover more fine jewelry.
            </p>
            <button
              onClick={() => handleTabClick('all')}
              className="mt-6 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-[#855B0D] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < products.length && (
          <div className="mt-12 sm:mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-neutral-900 border-2 border-[#D4AF37] text-neutral-900 hover:text-white font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)] cursor-pointer group"
            >
              <span>Load More Creations</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
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
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden z-10 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
                {/* Image Gallery Column */}
                <div className="relative aspect-square rounded-2xl bg-[#F9F8F5] border border-neutral-200/80 overflow-hidden flex items-center justify-center">
                  <Image
                    src={getProductImage(
                      quickViewProduct,
                      parseInt(quickViewProduct.id, 10) || 1
                    )}
                    alt={quickViewProduct.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain p-4"
                  />
                </div>

                {/* Info Column */}
                <div className="flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40 uppercase tracking-wider">
                        Fine Jewelry
                      </span>
                      {quickViewProduct.sku && (
                        <span className="text-xs text-neutral-400 font-mono">
                          SKU: {quickViewProduct.sku}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
                      {quickViewProduct.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        In Stock & Ready to Ship
                      </span>
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                      {quickViewProduct.description ||
                        'Crafted with master jeweler precision. Certified authenticity and premium materials.'}
                    </p>

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-neutral-100 text-center">
                      <div className="p-2 rounded-xl bg-neutral-50 flex flex-col items-center">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37] mb-1" />
                        <span className="text-[10px] font-bold text-neutral-700">
                          Certified Gold
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 flex flex-col items-center">
                        <Truck className="w-4 h-4 text-[#D4AF37] mb-1" />
                        <span className="text-[10px] font-bold text-neutral-700">
                          Fast Shipping
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 flex flex-col items-center">
                        <RotateCcw className="w-4 h-4 text-[#D4AF37] mb-1" />
                        <span className="text-[10px] font-bold text-neutral-700">
                          30-Day Care
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        handleAddToCart(quickViewProduct, undefined, selectedQty);
                        setQuickViewProduct(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </button>

                    <Link
                      href={`/products/${quickViewProduct.id}`}
                      className="w-full flex items-center justify-center py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
