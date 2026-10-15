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
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  ArrowLeft,
} from 'lucide-react';

interface AdminResetPasswordTabProps {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const AdminResetPasswordTab: React.FC<AdminResetPasswordTabProps> = ({ admin }) => {
  const [step, setStep] = useState<'request' | 'verify' | 'completed'>('request');
  const [email, setEmail] = useState(admin.email || '');
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
    ctx.fillStyle = '#1A1814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distorted text
    ctx.font = 'bold 22px monospace, serif';
    for (let i = 0; i < code.length; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#E5C058' : '#FFFFFF';
      ctx.save();
      const x = 16 + i * 22;
      const y = 26 + (Math.random() * 4 - 2);
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
      setError('Please provide a valid administrator email address.');
      return;
    }

    if (!captchaInput.trim()) {
      setError('Please solve the security captcha.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect security captcha. Please try again.');
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
      setError('Network connection error. Please try again.');
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
        setError(data.message || 'Verification failed. Please check the OTP code.');
        return;
      }

      setStep('completed');
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div>
        <h2 className="text-lg font-serif font-bold text-neutral-900 flex items-center gap-2">
          Reset Administrator Password
          <Sparkles className="w-4 h-4 text-[#8F6B1E]" />
        </h2>
        <p className="text-xs text-neutral-600">
          Verify your email identity with security captcha, then confirm the OTP code sent to your inbox to securely reset your credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-6">
          {/* Progress Indicators */}
          <div className="flex items-center gap-3 pb-5 border-b border-neutral-100">
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                step === 'request'
                  ? 'bg-[#FBF6E9] text-[#8F6B1E] border border-[#EADBBD]'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#8F6B1E] text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Email & Captcha</span>
            </div>

            <div className="w-4 h-px bg-neutral-200" />

            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                step === 'verify'
                  ? 'bg-[#FBF6E9] text-[#8F6B1E] border border-[#EADBBD]'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#8F6B1E] text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>OTP & New Password</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Banner */}
          {successMsg && step === 'verify' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">{successMsg}</span>
              </div>
            </motion.div>
          )}

          {/* STEP 1: EMAIL & CAPTCHA */}
          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                  Admin Email Address <span className="text-[#8F6B1E]">*</span>
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
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-[#D4AF37] focus:bg-white text-neutral-900 text-xs sm:text-sm rounded-xl outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  The 6-digit OTP code will be sent to this email address.
                </p>
              </div>

              {/* Security Captcha */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                  Security Captcha <span className="text-[#8F6B1E]">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-inner bg-[#1A1814] shrink-0">
                    <canvas ref={canvasRef} width={140} height={42} className="block cursor-pointer" onClick={generateCaptcha} title="Click to refresh captcha" />
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 hover:border-[#D4AF37] text-neutral-600 hover:text-[#8F6B1E] transition-colors"
                    title="Generate new captcha"
                    aria-label="Refresh captcha code"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CAPTCHA"
                    maxLength={5}
                    required
                    disabled={loading}
                    className="flex-1 min-w-[140px] px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-[#D4AF37] focus:bg-white text-neutral-900 text-xs sm:text-sm font-mono uppercase tracking-widest text-center rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-sm hover:brightness-105 active:scale-98 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit & Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyAndReset} className="space-y-5">
              {/* OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                    6-Digit OTP Code <span className="text-[#8F6B1E]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-xs text-[#8F6B1E] hover:underline disabled:opacity-50 disabled:no-underline font-medium"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
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
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-[#D4AF37] focus:bg-white text-neutral-900 font-mono text-base tracking-widest rounded-xl outline-none transition-colors"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                  New Password (min 6 characters) <span className="text-[#8F6B1E]">*</span>
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
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-[#D4AF37] focus:bg-white text-neutral-900 text-xs sm:text-sm rounded-xl outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-[#8F6B1E]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                  Confirm New Password <span className="text-[#8F6B1E]">*</span>
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
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-[#D4AF37] focus:bg-white text-neutral-900 text-xs sm:text-sm rounded-xl outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-sm hover:brightness-105 active:scale-98 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP & Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: COMPLETED FEEDBACK */}
          {step === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-neutral-900">
                  Password Reset Successfully!
                </h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  Your administrator password for <span className="font-semibold text-neutral-900">{email}</span> has been securely updated.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    generateCaptcha();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Reset Another Password
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Info Column */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-5 h-fit">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FBF6E9] text-[#8F6B1E] border border-[#EADBBD]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-neutral-900">Security Guidelines</h3>
              <p className="text-[11px] text-neutral-500">Administrator access protection</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-neutral-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-neutral-200/70">
              <KeyRound className="w-4 h-4 text-[#8F6B1E] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block font-semibold">Captcha Verification</strong>
                <span>Prevents automated scripts and brute force attacks from dispatching unverified requests.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-neutral-200/70">
              <Clock className="w-4 h-4 text-[#8F6B1E] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block font-semibold">10-Minute Expiry</strong>
                <span>OTP verification codes expire in 10 minutes and automatically self-delete from the database.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-neutral-200/70">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block font-semibold">Bcrypt Encryption</strong>
                <span>Passwords are hashed with cryptographic salt factor before saving to MongoDB Atlas.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
