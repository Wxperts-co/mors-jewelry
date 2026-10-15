'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Gem,
  Wrench,
  ChevronRight,
  Home,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export const ContactPage: React.FC = () => {
  const siteConfig = useSiteConfig();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Custom Engagement Ring',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          serviceType: 'Custom Engagement Ring',
          message: '',
        });
      } else {
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setErrorMessage('Unable to connect to the server. Please call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFBF8] via-white to-[#FAF8F5] text-neutral-900 pb-20">
      
      {/* Hero Header & Breadcrumb */}
      <section className="relative w-full bg-gradient-to-b from-[#F7F4EC] to-white border-b border-neutral-200/80 pt-6 sm:pt-10 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            <span className="text-neutral-900 font-bold">Contact Us</span>
          </nav>

          {/* Title and subtitle */}
          <div className="max-w-3xl">
           
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 leading-tight">
              <span className="bg-gradient-to-r from-neutral-950 via-[#78590F] to-neutral-900 bg-clip-text text-transparent">
                Visit Us or Connect With Our Master Jewelers
              </span>
            </h1>
          
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Store Details & Guarantees (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Store Locations Accordion / List */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>Our Showroom & Workshop</span>
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl bg-white border border-neutral-200/90 hover:border-[#D4AF37]/60 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(212,175,55,0.12)] transition-all duration-300 space-y-4 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {siteConfig.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40 uppercase tracking-wider mb-1.5">
                        {siteConfig.badge}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-[#996515] transition-colors">
                      {siteConfig.storeName}
                    </h3>
                  </div>
                  <a
                    href={siteConfig.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-neutral-100 group-hover:bg-[#D4AF37] text-neutral-700 group-hover:text-black transition-colors shrink-0"
                    title="Open in Google Maps"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-neutral-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <a
                      href={siteConfig.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-neutral-900 hover:underline leading-relaxed"
                    >
                      {siteConfig.address}
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div className="space-x-2">
                      <a href={`tel:${siteConfig.phone}`} className="hover:text-neutral-900 font-semibold transition-colors">
                        {siteConfig.phoneDisplay}
                      </a>
                      <span className="text-neutral-300">|</span>
                      <a href={`tel:${siteConfig.mobile}`} className="hover:text-neutral-900 font-semibold transition-colors">
                        {siteConfig.mobileDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <a href={`mailto:${siteConfig.email}`} className="hover:text-neutral-900 transition-colors">
                      {siteConfig.email}
                    </a>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1 border-t border-neutral-100">
                    <Clock className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <span className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-relaxed">
                      Mon – Sat: {siteConfig.hours.weekdays} | Sun: {siteConfig.hours.sunday}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Guarantees & Trust Badges */}
            <div className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white p-6 shadow-xl border border-[#D4AF37]/30 space-y-4">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-sm tracking-wider uppercase">Our In-Store Promises</h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#F3D382] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Certified 10K, 14K & 18K Gold</span>
                    <span className="text-neutral-400 text-xs">Authenticity verified and hallmarked.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#F3D382] shrink-0">
                    <Gem className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Certified Natural & Lab Diamonds</span>
                    <span className="text-neutral-400 text-xs">Conflict-free with gemological grading.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#F3D382] shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Master Repair Workshop On-Site</span>
                    <span className="text-neutral-400 text-xs">Laser precision sizing & cleaning.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Contact & Consultation Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-10 relative overflow-hidden">
              
              {/* Subtle gold decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />

              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40 uppercase tracking-wider mb-2">
                  Direct Consultation
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                  Send Us a Message
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">
                  Fill out the form below and one of our master jewelers will respond within 24 hours.
                </p>
              </div>

              {/* Success Alert */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 text-xs sm:text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Thank you! Your inquiry has been received.</span>
                      <span className="text-emerald-700">Our team will get in touch with you shortly to assist with your request.</span>
                    </div>
                  </motion.div>
                )}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm"
                  >
                    <span className="font-bold">{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Consultation Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Full Name <span className="text-[#996515]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Email Address <span className="text-[#996515]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. (470) 278-1018"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all"
                    />
                  </div>

                  {/* Service Requested */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Inquiry / Service Type
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all cursor-pointer"
                    >
                      <option value="Custom Engagement Ring">Custom Engagement Ring</option>
                      <option value="Diamond Sourcing & Grading">Diamond Sourcing & Grading</option>
                      <option value="Jewelry & Watch Repair">Jewelry & Watch Repair</option>
                      <option value="Custom Gold Design">Custom Gold Design (Chains, Pendants)</option>
                      <option value="Ring Sizing & Cleaning">Ring Sizing & Complimentary Cleaning</option>
                      <option value="Sell or Trade Jewelry">Sell / Trade Gold & Diamonds</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Your Message / Project Details <span className="text-[#996515]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the piece you have in mind, metal preferences (10K, 14K, 18K), diamond specs, or repair details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-neutral-900 hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Sending Inquiry...</span>
                  ) : (
                    <>
                      <span>Submit Consultation Request</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>

        {/* Interactive Google Map Section */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40 uppercase tracking-wider mb-2">
              Interactive Map
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Find Our Showroom
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500">
              {siteConfig.storeName} — {siteConfig.address}
            </p>
          </div>

          <div className="relative group w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-neutral-200/90 shadow-md bg-neutral-100">
            <iframe
              src={siteConfig.embedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${siteConfig.storeName} Location Map`}
            />
            {/* Direct Google Maps Redirect Link Badge */}
            <a
              href={siteConfig.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900/95 hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-xl border border-[#D4AF37]/50 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <span>Get Directions</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

      

      </div>

    </div>
  );
};
