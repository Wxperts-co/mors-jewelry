'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  LogOut,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  Package,
  Pencil,
  MapPin,
  X,
  Heart,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useWishlist, WishlistItem } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface UserDashboardProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  initialOrders?: UserOrder[];
  onLogout: () => void;
}

interface UserOrder {
  id: string;
  orderNumber: string;
  item: string;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
  createdAt: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ initialUser, initialOrders, onLogout }) => {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [orders, setOrders] = useState<UserOrder[]>(initialOrders || []);
  const [loadingOrders, setLoadingOrders] = useState(initialOrders ? false : true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Wishlist and Cart hooks
  const { items: wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  // Auto-scroll to wishlist section if navigated from wishlist icon, keeping URL clean
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldScroll =
        sessionStorage.getItem('scroll_to_wishlist') === 'true' ||
        window.location.hash === '#wishlist';

      if (shouldScroll) {
        sessionStorage.removeItem('scroll_to_wishlist');
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        setTimeout(() => {
          const el = document.getElementById('wishlist');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 250);
      }
    }
  }, []);

  const handleMoveToCart = (item: WishlistItem) => {
    addItem(
      {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity: 1,
      },
      true
    );
    removeFromWishlist(item.id);
    setWishlistToast(`Moved "${item.title}" to your shopping bag!`);
    setTimeout(() => setWishlistToast(null), 3500);
  };

  // Edit details modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: initialUser.name || '',
    phone: initialUser.phone || '',
    address: initialUser.address || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (data.user) {
              setCurrentUser((prev) => ({
                ...prev,
                ...data.user,
              }));
              setEditFormData({
                name: data.user.name || '',
                phone: data.user.phone || '',
                address: data.user.address || '',
              });
            }
            if (Array.isArray(data.orders)) {
              setOrders(data.orders);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };
    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenEditModal = () => {
    setEditFormData({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      address: currentUser.address || '',
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setEditError(data.message || 'Failed to update details. Please try again.');
        return;
      }

      setCurrentUser((prev) => ({
        ...prev,
        name: data.user.name,
        phone: data.user.phone,
        address: data.user.address,
      }));

      setEditFormData({
        name: data.user.name || '',
        phone: data.user.phone || '',
        address: data.user.address || '',
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-change'));
      }

      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update profile error:', err);
      setEditError('A network error occurred while updating details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/user/logout', { method: 'POST' });
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-change'));
        window.location.href = '/';
      }
      onLogout();
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'Processing').toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (s === 'shipped') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (s === 'cancelled') {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-amber-100 text-amber-900 border-amber-300';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 overflow-hidden max-w-full">
      {/* Dashboard Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-8 shadow-[0_12px_35px_rgba(0,0,0,0.05)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#D4AF37]/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative z-10 w-full min-w-0">
          <div className="flex items-center gap-4 min-w-0 w-full">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FAF3E0] to-[#F3D382]/40 border border-[#D4AF37]/60 flex items-center justify-center text-[#8C6210] font-black text-xl sm:text-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)] shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="min-w-0 flex-1">
              
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">
                Welcome back, {currentUser.name || 'Client'}
              </h1>
          
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('wishlist');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="py-2.5 px-3.5 rounded-xl text-xs font-semibold text-[#8C6210] hover:text-[#5c4007] bg-[#FAF3E0] hover:bg-[#F3D382]/30 border border-[#D4AF37]/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistItems.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-[#8C6210]'}`} />
              <span>Wishlist ({wishlistItems.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="py-2.5 px-3.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-red-700 bg-neutral-100 hover:bg-red-50 border border-neutral-200 hover:border-red-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Account Details & Order History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-full">
        {/* Profile Card (Left 1 Col) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] space-y-4 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="border-b border-neutral-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#8C6210]" />
                Account Details
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-neutral-500 font-medium block mb-0.5">Full Name</span>
                <span className="text-neutral-900 font-semibold">{currentUser.name || 'Not provided'}</span>
              </div>

              <div>
                <span className="text-neutral-500 font-medium block mb-0.5">Email Address</span>
                <span className="text-neutral-900 font-semibold flex items-center gap-1.5 break-all">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {currentUser.email}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-medium block mb-0.5">Phone</span>
                <span className="text-neutral-900 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {currentUser.phone || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-medium block mb-0.5">Shipping Address</span>
                <span className="text-neutral-900 font-semibold flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>{currentUser.address || 'Not provided'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-[#8C6210] bg-[#FAF3E0] hover:bg-[#F3D382]/30 border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </motion.div>

        {/* Order History (Right 2 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="md:col-span-2 bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] space-y-4 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#8C6210]" />
              Order History
            </h2>
            <span className="text-xs text-neutral-500 font-mono">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>

          {loadingOrders ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#8C6210]" />
              <span className="text-xs">Loading your orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">No orders placed yet</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Your luxury jewelry purchases and repairs will appear here.
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs text-[#8C6210] hover:underline font-semibold pt-1"
              >
                <span>Browse Handcrafted Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3 overflow-hidden">
              {orders.map((order) => {
                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '';

                return (
                  <div
                    key={order.id || order.orderNumber}
                    className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-neutral-200/90 hover:border-[#D4AF37]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                      <p className="text-neutral-700 line-clamp-1 font-medium">{order.item}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-neutral-200 pt-2 sm:pt-0">
                      <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Total</span>
                      <span className="font-bold text-[#8C6210] text-sm sm:text-base">
                        ${Number(order.totalAmount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Toast Notification for Wishlist */}
      <AnimatePresence>
        {wishlistToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900 text-white shadow-[0_12px_30px_rgba(0,0,0,0.3)] border border-[#D4AF37]/40 text-xs font-semibold backdrop-blur-md"
          >
            <div className="w-5 h-5 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#8C6210]">
              <Sparkles className="w-3 h-3 text-[#BA8C37]" />
            </div>
            <span>{wishlistToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Section */}
      <motion.div
        id="wishlist"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-8 shadow-[0_12px_35px_rgba(0,0,0,0.05)] space-y-6 scroll-mt-28 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-72 h-36 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Wishlist Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FAF3E0] to-[#F3D382]/30 border border-[#D4AF37]/50 flex items-center justify-center text-[#8C6210] shadow-sm">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                My Saved Wishlist
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'Piece' : 'Pieces'}
                </span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Fine jewelry pieces you have saved for later. Move them to your shopping bag anytime.
              </p>
            </div>
          </div>

          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="self-start sm:self-center text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400 shadow-inner">
              <Heart className="w-8 h-8 text-neutral-300 stroke-[1.5]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-neutral-800">Your Wishlist is Empty</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                You haven&apos;t saved any jewelry pieces yet. Explore our handcrafted diamonds, gold, and custom designs and tap the heart icon on any piece to save it here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-105 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
              >
                <span>Explore Fine Jewelry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {wishlistItems.map((item) => {
              const numPrice =
                typeof item.price === 'number'
                  ? item.price
                  : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;

              const productLink = item.slug ? `/products/${item.slug}` : `/products`;

              return (
                <div
                  key={item.id}
                  className="bg-[#FAF9F6] border border-neutral-200/90 hover:border-[#D4AF37]/60 rounded-2xl p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative w-full h-44 rounded-xl bg-white border border-neutral-100 overflow-hidden flex items-center justify-center p-2 mb-3">
                      <Image
                        src={item.image || '/products/product1.jpg'}
                        alt={item.title}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.category && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-sm">
                          {item.category}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        title="Remove from Wishlist"
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-neutral-200 shadow-sm transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title & Price */}
                    <div className="space-y-1">
                      <Link
                        href={productLink}
                        className="block text-xs font-bold text-neutral-900 hover:text-[#8C6210] transition-colors line-clamp-2 leading-snug"
                      >
                        {item.title}
                      </Link>
                      <div className="text-sm font-black text-[#8C6210] pt-0.5">
                        ${numPrice.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-neutral-200/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-105 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                    <Link
                      href={productLink}
                      className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Edit Details Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6 z-10 overflow-hidden"
            >
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-64 h-32 bg-[#D4AF37]/15 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF3E0] border border-[#D4AF37]/40 flex items-center justify-center text-[#8C6210]">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 tracking-tight">
                      Edit Account Details
                    </h3>
                    <p className="text-[11px] text-neutral-500">Update your personal and delivery profile</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isSaving && setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveDetails} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-[#8C6210]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-neutral-900 text-xs sm:text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-500 text-xs sm:text-sm outline-none cursor-not-allowed"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">Email cannot be changed</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-neutral-900 text-xs sm:text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="Street address, Apt, City, State, ZIP code"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-neutral-900 text-xs sm:text-sm outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
