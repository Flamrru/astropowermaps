"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Mail, Sparkles, ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Forgot Password Page
 *
 * Cosmic-themed password reset request.
 * Uses Supabase's built-in password reset email.
 */

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          // Redirect directly to reset-password page (not through auth/callback)
          // This allows the client-side to pick up the hash fragment with tokens
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Star background */}
      <div className="stars-layer" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Floating Sparkles Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, transparent 70%)",
                transform: "scale(2)",
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Icon container */}
            <motion.div
              className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(140, 110, 40, 0.4) 100%)",
                border: "2px solid rgba(232, 197, 71, 0.5)",
                boxShadow:
                  "0 0 30px rgba(201, 162, 39, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)",
              }}
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-10 h-10 text-gold-bright" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="heading-display text-3xl text-white mb-2">
            Reset Password
          </h1>
          <p className="text-white/60 text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(201, 162, 39, 0.1)",
          }}
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              // Success State
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-4"
              >
                <motion.div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #4ade80, #22c55e)",
                    boxShadow: "0 0 30px rgba(74, 222, 128, 0.4)",
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  <Check className="w-8 h-8 text-black" strokeWidth={3} />
                </motion.div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-white/60 text-sm mb-4">
                  We sent a password reset link to
                </p>
                <p className="text-gold font-medium mb-6">{email}</p>
                <p className="text-white/50 text-xs mb-6">
                  Click the link in the email to set a new password. The link expires in 1 hour.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </motion.div>
            ) : (
              // Form State
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded-xl"
                      style={{
                        background: "rgba(220, 38, 38, 0.15)",
                        border: "1px solid rgba(220, 38, 38, 0.3)",
                      }}
                    >
                      <p className="text-sm text-red-200 text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail className="w-5 h-5 text-white/40" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="input-glass w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/30 text-base"
                      style={{ minHeight: "56px" }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  className="gold-button-premium gold-button-shimmer w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    opacity: isLoading || !email ? 0.6 : 1,
                    cursor: isLoading || !email ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to Login Link */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </motion.div>

        {/* Decorative bottom element */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 text-white/30 text-xs">
            <div className="w-8 h-px bg-white/20" />
            <Sparkles className="w-3 h-3" />
            <div className="w-8 h-px bg-white/20" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen cosmic-bg flex items-center justify-center">
      <div className="stars-layer" />
      <div className="relative z-10 text-center">
        <div className="w-12 h-12 border-2 border-gold-main border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
