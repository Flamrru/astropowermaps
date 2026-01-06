"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

/**
 * Stella+ Login Page
 *
 * Cosmic-themed email + password authentication.
 * Handles returning subscribers who want to access their dashboard.
 */

// Inner component that uses useSearchParams
function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for messages from other pages (password reset success, etc.)
  const message = searchParams.get("message");
  const authError = searchParams.get("error");
  const authErrorDescription = searchParams.get("error_description");
  const redirectTo = searchParams.get("redirect") || "/home";

  useEffect(() => {
    // Handle success messages
    if (message === "password_updated") {
      setSuccessMessage("Password updated! You can now sign in.");
    }

    // Handle auth errors from callback
    if (authError) {
      const errorMessages: Record<string, string> = {
        otp_expired: "Your link has expired. Please try again.",
        access_denied: "Access was denied. Please try again.",
        auth_failed: "Authentication failed. Please try again.",
      };

      setError(
        errorMessages[authError] ||
        authErrorDescription ||
        "Something went wrong. Please try again."
      );
    }
  }, [message, authError, authErrorDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Map Supabase errors to user-friendly messages
        if (signInError.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.");
        }
        throw signInError;
      }

      // Redirect on success
      window.location.href = redirectTo;
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        // Check for "no account" type errors
        if (
          err.message.includes("not found") ||
          err.message.includes("Invalid login")
        ) {
          setError("no_account");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
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
        {/* Floating Stella Avatar */}
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
            {/* Star icon container */}
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
            Welcome Back
          </h1>
          <p className="text-white/60 text-sm">
            Sign in to your{" "}
            <span className="text-gold-glow font-medium">Stella+</span> account
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
          <form onSubmit={handleSubmit}>
            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl"
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm text-emerald-200">{successMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl"
                  style={{
                    background: error === "no_account"
                      ? "rgba(201, 162, 39, 0.15)"
                      : "rgba(220, 38, 38, 0.15)",
                    border: error === "no_account"
                      ? "1px solid rgba(201, 162, 39, 0.3)"
                      : "1px solid rgba(220, 38, 38, 0.3)",
                  }}
                >
                  {error === "no_account" ? (
                    <div className="text-center">
                      <p className="text-sm text-gold mb-2">
                        Invalid email or password.
                      </p>
                      <p className="text-xs text-white/60 mb-3">
                        Don't have an account? Accounts are created when you purchase Stella+.
                      </p>
                      <Link
                        href="/"
                        className="inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        style={{
                          background: "rgba(201, 162, 39, 0.2)",
                          border: "1px solid rgba(201, 162, 39, 0.4)",
                          color: "#E8C547",
                        }}
                      >
                        Take the Quiz →
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Input */}
            <div className="mb-4">
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

            {/* Password Input */}
            <div className="mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="input-glass w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder:text-white/30 text-base"
                  style={{ minHeight: "56px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="mb-6 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-gold/70 hover:text-gold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !email || !password}
              className="gold-button-premium gold-button-shimmer w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                opacity: isLoading || !email || !password ? 0.6 : 1,
                cursor: isLoading || !email || !password ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* New User Link */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-white/50 text-sm">
            New to Stella+?{" "}
            <Link
              href="/"
              className="text-gold hover:text-gold-bright transition-colors font-medium"
            >
              Take the quiz
            </Link>
          </p>
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
function LoginLoading() {
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
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
