'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  RotateCw,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UserAuthFormProps {
  onAuthSuccess: (user: { id: string; name: string; email: string; phone?: string }) => void;
}

export const UserAuthForm: React.FC<UserAuthFormProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');

  // Security Captcha states
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.28)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with slight rotation & luxury gold palette
    const spacing = canvas.width / (code.length + 1);
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = spacing * (i + 1);
      const y = canvas.height / 2 + (Math.random() * 4 - 2);
      const angle = (Math.random() - 0.5) * 0.35;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 20px monospace, sans-serif';
      ctx.fillStyle = i % 2 === 0 ? '#F3D382' : '#D4AF37';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
      ctx.shadowBlur = 4;
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate captcha
    if (!captchaInput.trim()) {
      setErrorMessage('Please enter the security verification captcha.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Incorrect security captcha. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signin' ? '/api/user/login' : '/api/user/register';
      const payload =
        mode === 'signin'
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Authentication failed. Please check your credentials.');
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-change'));
      }
      onAuthSuccess(data.user);
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0f0f12] border border-[#D4AF37]/30 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-32 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="text-center mb-4">
          <Link href="/" className="inline-block mb-2">
            <Image
              src="/logo/logo.png"
              alt="Mor's Jewelry"
              width={160}
              height={50}
              className="h-11 sm:h-12 w-auto mx-auto object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.25)]"
            />
          </Link>
        
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to Your Account' : 'Create Luxury Account'}
          </h1>
         
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-black/60 rounded-xl border border-neutral-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#F3D382] transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Verification Captcha */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Security Verification <span className="text-[#D4AF37]">*</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-medium">Click image to refresh</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="relative rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-inner bg-[#121212] shrink-0 cursor-pointer"
                onClick={generateCaptcha}
                title="Click to refresh captcha"
              >
                <canvas ref={canvasRef} width={120} height={38} className="block" />
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-700/80 hover:border-[#D4AF37] text-neutral-400 hover:text-[#F3D382] transition-colors shrink-0"
                title="Generate new captcha"
                aria-label="Refresh captcha code"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                maxLength={5}
                required
                disabled={loading}
                className="flex-1 min-w-0 px-3 py-2 bg-neutral-900/90 border border-neutral-700/80 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-white text-xs sm:text-sm font-mono uppercase tracking-widest text-center rounded-xl outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-black bg-gradient-to-r from-[#BA8C37] via-[#F3D382] to-[#BA8C37] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,55,0.25)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors inline-block"
          >
            ← Return to Mor&apos;s Jewelry Store
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
