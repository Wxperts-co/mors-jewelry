'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RotateCw,
  Loader2,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AdminResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: (email: string, newPassword?: string) => void;
}

export const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccess,
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'completed'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Generate dynamic canvas captcha
  const generateCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setError(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.35)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Distorted text
    ctx.font = 'bold 20px serif';
    for (let i = 0; i < code.length; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#D4AF37' : '#E8E8E8';
      ctx.save();
      const x = 16 + i * 19;
      const y = 26 + (Math.random() * 4 - 2);
      ctx.translate(x, y);
      ctx.rotate((Math.random() * 16 - 8) * (Math.PI / 180));
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, []);

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('request');
      setEmail(initialEmail);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMsg(null);
      setCountdown(0);
      setTimeout(generateCaptcha, 60);
    }
  }, [isOpen, initialEmail, generateCaptcha]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Submit Email and Captcha -> Send OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide a valid administrator email.');
      return;
    }

    if (!captchaInput.trim()) {
      setError('Please solve the captcha verification.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect captcha code. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send OTP verification code.');
        generateCaptcha();
        return;
      }

      setSuccessMsg(data.message);
      setStep('verify');
      setCountdown(60);
    } catch {
      setError('Network error. Please try again.');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to resend code.');
        return;
      }
      setSuccessMsg(data.message);
      setCountdown(60);
    } catch {
      setError('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Set New Password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Verification failed. Please check the code.');
        return;
      }

      setStep('completed');
      if (onSuccess) {
        onSuccess(email.trim(), newPassword);
      }

      setTimeout(() => {
        onClose();
      }, 2200);
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-[#121212] border border-[#D4AF37]/45 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.15)] text-neutral-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white tracking-wide">
                  Reset Password
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {step === 'request'
                    ? 'Verify identity with email and security captcha'
                    : step === 'verify'
                    ? 'Enter 6-digit OTP and choose new password'
                    : 'Credentials updated successfully'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && step === 'verify' && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* STEP 1: EMAIL & CAPTCHA */}
          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="mt-5 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Admin Email Address <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@morsjewelry.com"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-neutral-700 focus:border-[#D4AF37] text-white text-xs rounded-xl outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Security Captcha <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-[#161616] shrink-0 shadow-inner">
                    <canvas ref={canvasRef} width={130} height={38} className="block" />
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2.5 rounded-xl bg-[#1c1c1c] border border-neutral-700 hover:border-[#D4AF37] text-neutral-300 hover:text-[#D4AF37] transition-colors"
                    title="Generate new captcha"
                    aria-label="Refresh captcha code"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    maxLength={5}
                    required
                    disabled={loading}
                    className="flex-1 px-3 py-2.5 bg-[#181818] border border-neutral-700 focus:border-[#D4AF37] text-white text-xs font-mono uppercase tracking-widest text-center rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md hover:brightness-105 active:scale-98 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyAndReset} className="mt-5 space-y-4">
              {/* 6-Digit OTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                    6-Digit OTP Code <span className="text-[#D4AF37]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-xs text-[#D4AF37] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-neutral-700 focus:border-[#D4AF37] text-white font-mono text-sm tracking-widest rounded-xl outline-none transition-colors"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  New Password (min 6 characters) <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#181818] border border-neutral-700 focus:border-[#D4AF37] text-white text-xs rounded-xl outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-[#D4AF37]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Confirm New Password <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#181818] border border-neutral-700 focus:border-[#D4AF37] text-white text-xs rounded-xl outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md hover:brightness-105 active:scale-98 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Reset Password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: COMPLETED SUCCESS */}
          {step === 'completed' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-white">Password Reset Successful</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  Your administrator credentials have been securely updated. You can now sign in.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
