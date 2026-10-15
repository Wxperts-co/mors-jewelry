'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  Lock,
  ChevronRight,
  Home,
  CheckCircle2,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  HelpCircle,
  Tag,
  Clock,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSiteConfig } from '@/hooks/useSiteConfig';

type DeliveryMethod = 'shipping' | 'pickup';
type PaymentMethod = 'card' | 'store_pickup';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, totalCount, clearCart } = useCart();
  const siteConfig = useSiteConfig();

  // Fulfillment & payment options
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Customer Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'GA',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    orderNotes: '',
    sameAsShipping: true,
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME10' || code === 'MORS10' || code === 'LUXURY') {
      const discount = subtotal * 0.1;
      setAppliedDiscount(discount);
      setPromoMessage({ type: 'success', text: '10% Luxury VIP discount applied!' });
    } else if (code) {
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try WELCOME10' });
    }
  };

  const shippingCost = deliveryMethod === 'shipping' ? 0 : 0; // Free insured express shipping
  const estimatedTax = (subtotal - appliedDiscount) * 0.07; // 7% standard GA sales tax
  const grandTotal = Math.max(0, subtotal - appliedDiscount + shippingCost + estimatedTax);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate luxury order verification & processing
    setTimeout(() => {
      const orderNum = `MORS-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderNumber(orderNum);
      setOrderConfirmed(true);
      setIsSubmitting(false);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  // If order is completed successfully, render luxury confirmation view
  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FCFBF8] via-white to-[#FAF8F5] text-neutral-900 py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 text-center relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#D4AF37]/15 rounded-full blur-[90px] pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FAF3E0] to-[#F3D382]/30 border border-[#D4AF37]/50 flex items-center justify-center text-[#8C6210] mx-auto mb-5 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40 uppercase tracking-wider mb-2">
            Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Thank You for Your Order
          </h1>

          <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
            Your fine jewelry order has been received and is being prepared by our master jewelers.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-left space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500 font-medium">Order Reference:</span>
              <span className="font-bold text-neutral-900 font-mono">{confirmedOrderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500 font-medium">Recipient:</span>
              <span className="font-semibold text-neutral-900">
                {formData.firstName || 'Valued'} {formData.lastName || 'Client'}
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500 font-medium">Fulfillment Method:</span>
              <span className="font-semibold text-neutral-900">
                {deliveryMethod === 'shipping'
                  ? 'FedEx Insured Express Delivery'
                  : `In-Store Pickup (${siteConfig.storeName})`}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-neutral-500 font-medium">Total Paid:</span>
              <span className="font-black text-[#996515] text-base">
                ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-6 text-xs text-neutral-500 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-[#D4AF37]" />
            <span>A confirmation receipt has been sent to <strong>{formData.email || 'your email'}</strong>.</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 shadow-md transition-all text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // If bag is empty and no confirmed order
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FCFBF8] via-white to-[#FAF8F5] text-neutral-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
          <div className="w-20 h-20 rounded-full bg-[#FAF3E0] border border-[#D4AF37]/40 flex items-center justify-center text-[#8C6210] mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your Bag is Empty</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-6">
            There are currently no items in your shopping bag to checkout.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 shadow-md transition-all"
          >
            Explore Fine Jewelry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFBF8] via-white to-[#FAF8F5] text-neutral-900 pb-24">
      {/* Breadcrumb & Header */}
      <section className="relative w-full bg-gradient-to-b from-[#F7F4EC] to-white border-b border-neutral-200/80 pt-6 sm:pt-10 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm font-medium text-neutral-500 mb-3">
            <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link href="/products" className="hover:text-neutral-900 transition-colors">
              Collections
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-900 font-bold">Checkout</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
                <span className="bg-gradient-to-r from-neutral-950 via-[#78590F] to-neutral-900 bg-clip-text text-transparent">
                  Secure Luxury Checkout
                </span>
              </h1>
             
            </div>

          
          </div>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (7 cols): Checkout Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer Contact Information */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/50 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <span>Contact Information</span>
                </h2>
                <span className="text-xs text-neutral-400">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Your insured tracking receipt will be sent here.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="(470) 278-1018"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Required for carrier delivery updates.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery & Fulfillment Method */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/50 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <span>Fulfillment & Delivery</span>
                </h2>
                <span className="text-xs text-neutral-400">Step 2 of 3</span>
              </div>

              {/* Delivery Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('shipping')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryMethod === 'shipping'
                      ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-[0_0_15px_rgba(212,175,55,0.12)]'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      deliveryMethod === 'shipping'
                        ? 'bg-[#FAF3E0] text-[#8C6210]'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">
                        Insured Express Delivery
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        FREE
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      FedEx/UPS Priority, discreet tamper-evident packaging & adult signature required.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryMethod === 'pickup'
                      ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-[0_0_15px_rgba(212,175,55,0.12)]'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      deliveryMethod === 'pickup'
                        ? 'bg-[#FAF3E0] text-[#8C6210]'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">
                        Showroom Pickup
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#FAF3E0] text-[#8C6210]">
                        VIP
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Collect at {siteConfig.storeName}. Complimentary ring sizing & luxury gift box.
                    </p>
                  </div>
                </button>
              </div>

              {/* Showroom Details if Pickup is selected */}
              {deliveryMethod === 'pickup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs text-neutral-700"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-neutral-900 font-bold">{siteConfig.storeName}</strong>
                      <p className="text-neutral-600">{siteConfig.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 pt-1 border-t border-neutral-200/50">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Mon – Sat: {siteConfig.hours.weekdays} | Sun: {siteConfig.hours.sunday}</span>
                  </div>
                </motion.div>
              )}

              {/* Shipping Address Inputs if Delivery is selected */}
              {deliveryMethod === 'shipping' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="123 Luxury Lane"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Apt / Suite
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        placeholder="Apt 4B"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="Atlanta"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="GA"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        placeholder="30038"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-neutral-50/50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/50 text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <span>Payment Method</span>
                </h2>
                <span className="text-xs text-neutral-400">Step 3 of 3</span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-[0_0_12px_rgba(212,175,55,0.08)]'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#BA8C37] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#8C6210]" />
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">
                        Credit / Debit Card
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-semibold">
                    <span>Visa</span> • <span>MC</span> • <span>Amex</span> • <span>Discover</span>
                  </div>
                </label>

                {paymentMethod === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        required={paymentMethod === 'card'}
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Expiration (MM/YY) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardExpiry"
                          required={paymentMethod === 'card'}
                          placeholder="MM/YY"
                          maxLength={5}
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-white text-center font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Security Code (CVC) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardCvc"
                          required={paymentMethod === 'card'}
                          placeholder="CVC"
                          maxLength={4}
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-white text-center font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Name on Card <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        required={paymentMethod === 'card'}
                        placeholder="Full name as printed on card"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm bg-white"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Option 2: Pay upon In-Store Collection */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'store_pickup'
                      ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-[0_0_12px_rgba(212,175,55,0.08)]'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'store_pickup'}
                      onChange={() => setPaymentMethod('store_pickup')}
                      className="accent-[#BA8C37] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#8C6210]" />
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">
                        Pay in Showroom upon Inspection
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FAF3E0] text-[#8C6210]">
                    In-Store
                  </span>
                </label>
              </div>
            </div>

           
          </div>

          {/* Right Column (5 cols): Order Summary Sticky Card */}
          <div className="lg:col-span-5 sticky top-24 space-y-5">
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                  <span>Order Summary</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100 pr-1 space-y-3 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover object-center"
                        onError={(e) => {
                          const target = e.currentTarget as unknown as HTMLImageElement;
                          target.src = '/products/product1.jpg';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-neutral-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-tl-md">
                        ×{item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                        {item.title}
                      </h4>
                      {item.category && (
                        <span className="text-[10px] text-[#8C6210] uppercase tracking-wider font-bold">
                          {item.category}
                        </span>
                      )}
                      <div className="text-xs font-bold text-neutral-900 mt-0.5">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo Code (WELCOME10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:border-[#D4AF37] outline-none uppercase font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {promoMessage && (
                  <p
                    className={`mt-1.5 text-[11px] font-semibold ${
                      promoMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>VIP Promotion Discount</span>
                    <span>-${appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-bold uppercase">Free</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Sales Tax (GA)</span>
                  <span className="font-semibold text-neutral-900">${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-neutral-200 text-base sm:text-lg font-black text-neutral-900">
                  <span>Total Due</span>
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-neutral-950 via-[#78590F] to-neutral-900 bg-clip-text text-transparent">
                    ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-4 px-6 rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 shadow-[0_4px_25px_rgba(212,175,55,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Luxury Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Complete Purchase • ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="pt-2 text-center text-[11px] text-neutral-500 space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-neutral-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>30-Day Complete Authenticity Guarantee</span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  By clicking Complete Purchase, you agree to Mor&apos;s Jewelry Terms of Service & Privacy Policy.
                </p>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
