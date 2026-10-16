'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  RotateCw,
  ArrowUpRight,
  ShoppingBag,
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

  const [submittedData, setSubmittedData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Custom Engagement Ring',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Security Captcha State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  // Generate dynamic canvas security captcha
  const generateCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setErrorMessage(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#1A1814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle gold & silver noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.45)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distorted alphanumeric text
    ctx.font = 'bold 22px monospace, serif';
    for (let i = 0; i < code.length; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#E5C058' : '#FFFFFF';
      ctx.save();
      const x = 16 + i * 22;
      const y = 28 + (Math.random() * 4 - 2);
      ctx.translate(x, y);
      ctx.rotate((Math.random() * 16 - 8) * (Math.PI / 180));
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, []);

  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Verify Captcha
    if (!captchaInput.trim()) {
      setErrorMessage('Please enter the security captcha code.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Security captcha does not match. Please try again.');
      generateCaptcha();
      return;
    }

    // 2. Immediately transition to the Thank You Page / Confirmation Screen
    const currentData = { ...formData };
    setSubmittedData(currentData);
    setSubmitted(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });

    // 3. Execute email process in the background (sends to admin, bcc, and client in parallel)
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...currentData,
        captchaInput: captchaInput.trim(),
        captchaCode: captchaCode,
      }),
    }).catch((err) => {
      console.error('Background contact inquiry error:', err);
    });
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceType: 'Custom Engagement Ring',
      message: '',
    });
    setCaptchaInput('');
    setTimeout(generateCaptcha, 60);
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

          {/* Right Column: Contact & Consultation Form OR Immediate Thank You Screen (7 cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {submitted ? (
                /* Immediate Thank You Page */
                <motion.div
                  key="thank-you-view"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl bg-white border border-neutral-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5 sm:p-7 text-center relative overflow-hidden"
                >
                  {/* Ambient Gold Halo */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#D4AF37]/15 rounded-full blur-[80px] pointer-events-none" />

                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FAF3E0] to-[#F3D382]/30 border border-[#D4AF37]/50 flex items-center justify-center text-[#8C6210] mx-auto mb-3.5 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40 uppercase tracking-wider mb-1.5">
                    Inquiry Received
                  </span>

                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                    Thank You, {submittedData.name || 'Valued Client'}!
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-md mx-auto leading-relaxed">
                    Your consultation request has been submitted successfully. Our master jewelers are reviewing your details and will get in touch with you shortly.
                  </p>

                  {/* Submitted Details Summary Card */}
                  <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-left space-y-2 text-xs">
                    <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-neutral-500 font-medium">Customer:</span>
                      <span className="font-bold text-neutral-900">{submittedData.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-neutral-500 font-medium">Email:</span>
                      <span className="font-semibold text-neutral-900">{submittedData.email}</span>
                    </div>
                    {submittedData.phone && (
                      <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
                        <span className="text-neutral-500 font-medium">Phone:</span>
                        <span className="font-semibold text-neutral-900">{submittedData.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-neutral-500 font-medium">Service Requested:</span>
                      <span className="font-bold text-[#8C6210]">{submittedData.serviceType}</span>
                    </div>
                    <div className="pt-0.5">
                      <span className="text-neutral-500 font-medium block mb-1">Your Message:</span>
                      <p className="p-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 italic text-xs leading-relaxed">
                        "{submittedData.message}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>A confirmation receipt has been sent to <strong>{submittedData.email}</strong>.</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 shadow-md transition-all text-center cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                    <Link
                      href="/products"
                      className="py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Browse Collections
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Active Consultation Form */
                <motion.div
                  key="form-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl bg-white border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 sm:p-7 relative overflow-hidden"
                >
                  {/* Subtle gold decorative accent */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />

                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                      Send Us a Message
                    </h2>
                 
                  </div>

                  {/* Error Alert */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between"
                    >
                      <span>{errorMessage}</span>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="text-rose-500 hover:text-rose-800 text-xs font-bold"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}

                  {/* Consultation Form */}
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          Full Name <span className="text-[#996515]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Eleanor Vance"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          Email Address <span className="text-[#996515]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. eleanor@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. (470) 278-1018"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all"
                        />
                      </div>

                      {/* Service Requested */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          Inquiry / Service Type
                        </label>
                        <select
                          value={formData.serviceType}
                          onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                          className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all cursor-pointer"
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
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                        Your Message / Project Details <span className="text-[#996515]">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tell us about the piece you have in mind, metal preferences (10K, 14K, 18K), diamond specs, or repair details..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-xs sm:text-sm text-neutral-900 bg-neutral-50/50 transition-all resize-none"
                      />
                    </div>

                    {/* Proper Canvas Security Captcha */}
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-neutral-200/90 space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                        Security Verification <span className="text-[#996515]">*</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative rounded-lg overflow-hidden border border-[#D4AF37]/60 shadow-inner bg-[#1A1814] shrink-0">
                          <canvas
                            ref={canvasRef}
                            width={130}
                            height={36}
                            className="block cursor-pointer"
                            onClick={generateCaptcha}
                            title="Click to generate new captcha"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="p-2 rounded-lg bg-white border border-neutral-200 hover:border-[#D4AF37] text-neutral-600 hover:text-[#8C6210] transition-colors cursor-pointer"
                          title="Generate new captcha code"
                          aria-label="Refresh captcha"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          required
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                          placeholder="ENTER CODE"
                          maxLength={5}
                          className="flex-1 min-w-[120px] px-3 py-1.5 sm:py-2 bg-white border border-neutral-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-neutral-900 text-xs sm:text-sm font-mono uppercase tracking-widest text-center rounded-lg outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        Type the 5 characters shown above to verify your request.
                      </p>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-neutral-900 hover:bg-gradient-to-r hover:from-[#BA8C37] hover:via-[#F3D382] hover:to-[#BA8C37] text-white hover:text-black font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] cursor-pointer"
                    >
                      <span>Submit Consultation Request</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Interactive Google Map Section */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Find Our Showroom
            </h2>
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
          </div>
        </section>

      </div>

    </div>
  );
};
