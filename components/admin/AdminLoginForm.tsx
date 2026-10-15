'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  RotateCw,
} from 'lucide-react';
import { AdminResetPasswordModal } from './AdminResetPasswordModal';

interface AdminLoginFormProps {
  onLoginSuccess: (admin: { id: string; name: string; email: string; role: string }) => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset Password modal state
  const [showResetModal, setShowResetModal] = useState(false);

  // Captcha states
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Field validation states
  const [errors, setErrors] = useState<{ email?: string; password?: string; captcha?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean; captcha?: boolean }>({});

  const generateCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setErrors((prev) => ({ ...prev, captcha: undefined }));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas background
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
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = 'rgba(212, 175, 55, 0.22)';
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
      ctx.font = 'bold 22px monospace, sans-serif';
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
  }, [generateCaptcha]);

  const validateEmail = (val: string): string | undefined => {
    if (!val.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (val: string): string | undefined => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateCaptcha = (val: string): string | undefined => {
    if (!val.trim()) return 'Captcha code is required';
    if (val.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      return 'Incorrect captcha. Please try again';
    }
    return undefined;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCaptchaInput(val);
    if (touched.captcha) {
      setErrors((prev) => ({ ...prev, captcha: validateCaptcha(val) }));
    }
  };

  const handleBlur = (field: 'email' | 'password' | 'captcha') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    } else if (field === 'captcha') {
      setErrors((prev) => ({ ...prev, captcha: validateCaptcha(captchaInput) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const captchaErr = validateCaptcha(captchaInput);

    setTouched({ email: true, password: true, captcha: true });
    setErrors({ email: emailErr, password: passwordErr, captcha: captchaErr });

    if (captchaErr) {
      generateCaptcha();
      return;
    }

    if (emailErr || passwordErr) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setErrors((prev) => ({ ...prev, ...data.errors }));
        }
        setGeneralError(data.message || 'Login failed. Please verify your credentials.');
        generateCaptcha();
        setLoading(false);
        return;
      }

      // Successful login
      onLoginSuccess(data.admin);
    } catch {
      setGeneralError('Network connection error. Please try again.');
      generateCaptcha();
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl bg-[#0c0c0c]/90 border border-[#D4AF37]/35 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.08)] backdrop-blur-2xl p-8 sm:p-10"
      >
        {/* Subtle Top Gold Shimmer Bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* Brand Header with Exact Site Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo/logo.png"
              alt="Mor's Jewelry & Repair"
              width={260}
              height={90}
              priority
              className="h-14 sm:h-16 md:h-18 w-auto object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.3)]"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium tracking-widest uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white font-light">
            Welcome Back
          </h1>
          <p className="text-neutral-400 text-sm mt-1.5 font-light">
            Sign in to manage products, inventory & orders
          </p>
        </div>

        {/* General Error Banner */}
        <AnimatePresence>
          {generalError && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="leading-snug">{generalError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
              Email Address <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                placeholder="admin@morsjewelry.com"
                autoComplete="email"
                disabled={loading}
                className={`w-full pl-10 pr-4 py-3 bg-[#141414] text-white placeholder-neutral-500 text-sm rounded-lg border transition-all duration-200 outline-none ${
                  touched.email && errors.email
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                    : 'border-neutral-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50'
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.email}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                Password <span className="text-[#D4AF37]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-xs text-[#D4AF37] hover:text-[#f3e5ab] hover:underline font-medium transition-colors cursor-pointer"
              >
                Reset Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className={`w-full pl-10 pr-11 py-3 bg-[#141414] text-white placeholder-neutral-500 text-sm rounded-lg border transition-all duration-200 outline-none ${
                  touched.password && errors.password
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                    : 'border-neutral-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-[#D4AF37] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Security Captcha Field */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
              Security Verification <span className="text-[#D4AF37]">*</span>
            </label>

            {/* Visual Canvas Display & Refresh Button */}
            <div className="flex items-center gap-3 mb-2">
              <div className="relative rounded-lg overflow-hidden border border-[#D4AF37]/40 shadow-inner bg-[#121212]">
                <canvas
                  ref={canvasRef}
                  width={150}
                  height={42}
                  className="block cursor-pointer"
                  onClick={generateCaptcha}
                  title="Click to refresh captcha"
                />
              </div>

              <button
                type="button"
                onClick={generateCaptcha}
                disabled={loading}
                className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] text-neutral-400 transition-colors"
                aria-label="Refresh Captcha"
                title="Generate new captcha code"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-neutral-500 font-light select-none">
                Case-insensitive
              </span>
            </div>

            {/* Captcha Input */}
            <input
              id="admin-captcha"
              type="text"
              value={captchaInput}
              onChange={handleCaptchaChange}
              onBlur={() => handleBlur('captcha')}
              placeholder="Enter the 5 characters above"
              maxLength={6}
              disabled={loading}
              className={`w-full px-3.5 py-2.5 bg-[#141414] text-white placeholder-neutral-500 text-sm tracking-wider uppercase rounded-lg border transition-all duration-200 outline-none ${
                touched.captcha && errors.captcha
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                  : 'border-neutral-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50'
              }`}
            />
            {touched.captcha && errors.captcha && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.captcha}
              </motion.p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="admin-login-submit"
            disabled={loading}
            className="group relative w-full mt-3 py-3.5 px-4 rounded-lg bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Reset Password Modal */}
      <AdminResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        initialEmail={email}
        onSuccess={(updatedEmail, updatedPassword) => {
          setEmail(updatedEmail);
          if (updatedPassword) {
            setPassword(updatedPassword);
          }
          generateCaptcha();
        }}
      />
    </div>
  );
};
