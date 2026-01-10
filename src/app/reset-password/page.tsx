"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, Check, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

// Password validation helper
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("At least 6 characters");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("At least 1 letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("At least 1 number");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Reset Password Page
 *
 * Users land here after clicking the password reset link from email.
 * Supabase handles the auth session automatically via the URL hash.
 */

function ResetPasswordContent() {
  const router = useRouter();
  // Use ref to maintain single Supabase client instance across renders
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const hasCheckedRef = useRef(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canReset, setCanReset] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Password validation
  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = passwordValidation.valid && passwordsMatch && confirmPassword.length > 0;

  // Listen for PASSWORD_RECOVERY event when user lands from email link
  // Fixed: Explicitly parse hash fragment since @supabase/ssr may not auto-detect it
  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Create client once and store in ref
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    const supabase = supabaseRef.current;

    // EXPLICIT HASH PARSING: @supabase/ssr doesn't auto-detect hash fragments
    // We need to manually extract tokens from the URL hash and set the session
    const processHashFragment = async () => {
      const hash = window.location.hash;
      console.log("[ResetPassword] Hash fragment:", hash ? "present" : "none");

      if (hash && hash.length > 1) {
        // Parse hash parameters (remove the leading #)
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        console.log("[ResetPassword] Parsed hash - type:", type, "hasTokens:", !!(accessToken && refreshToken));

        if (accessToken && refreshToken) {
          // Manually set the session with tokens from hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log("[ResetPassword] setSession result:", error ? error.message : "success");

          if (!error && data.session) {
            setCanReset(true);
            setIsCheckingSession(false);
            // Clear the hash from URL for cleaner look (optional)
            window.history.replaceState(null, "", window.location.pathname);
            return true;
          }
        }
      }
      return false;
    };

    // Also subscribe to auth state changes as backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[ResetPassword] Auth event:", event, "Session:", !!session);

        if (event === "PASSWORD_RECOVERY") {
          setCanReset(true);
          setIsCheckingSession(false);
        } else if (event === "SIGNED_IN" && session) {
          setCanReset(true);
          setIsCheckingSession(false);
        }
      }
    );

    // Process hash first, then fallback to session check
    processHashFragment().then(async (hashProcessed) => {
      if (!hashProcessed) {
        // No hash or hash processing failed - check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[ResetPassword] Existing session check:", !!session);
        if (session) {
          setCanReset(true);
        }
        setIsCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValidation.valid) {
      setError("Password must have at least 6 characters, 1 letter, and 1 number");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      // Use the existing client from ref (same session)
      const supabase = supabaseRef.current || createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Password update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to login after success
  const handleContinue = () => {
    router.push("/login?message=password_updated");
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Star background */}
      <div className="stars-layer" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Floating Lock Icon */}
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
              <Lock className="w-10 h-10 text-gold-bright" strokeWidth={1.5} />
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
            {isSuccess ? "Password Updated" : "Create New Password"}
          </h1>
          <p className="text-white/60 text-sm">
            {isSuccess
              ? "You can now sign in with your new password"
              : "Choose a strong password for your account"}
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
            {isCheckingSession ? (
              // Loading state
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-10 h-10 border-2 border-gold-main border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60 text-sm">Verifying reset link...</p>
              </motion.div>
            ) : !canReset ? (
              // Invalid/expired link state
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-4"
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: "rgba(220, 38, 38, 0.2)",
                    border: "2px solid rgba(220, 38, 38, 0.4)",
                  }}
                >
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Invalid or Expired Link
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  This password reset link is no longer valid. Please request a new one.
                </p>
                <Link
                  href="/forgot-password"
                  className="gold-button-premium gold-button-shimmer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                >
                  Request New Link
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : isSuccess ? (
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
                  All Set!
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  Your password has been updated successfully.
                </p>
                <motion.button
                  onClick={handleContinue}
                  className="gold-button-premium gold-button-shimmer w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
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

                {/* New Password Input */}
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    New Password
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
                      placeholder="Min 6 chars, 1 letter, 1 number"
                      required
                      autoComplete="new-password"
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
                  {/* Password requirements */}
                  {password.length > 0 && !passwordValidation.valid && (
                    <div className="mt-2 space-y-1">
                      {passwordValidation.errors.map((err, i) => (
                        <p key={i} className="text-red-400 text-xs flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-red-400" />
                          {err}
                        </p>
                      ))}
                    </div>
                  )}
                  {password.length > 0 && passwordValidation.valid && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Password meets requirements
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="mb-6">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="w-5 h-5 text-white/40" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                      className="input-glass w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder:text-white/30 text-base"
                      style={{
                        minHeight: "56px",
                        borderColor:
                          confirmPassword.length > 0
                            ? passwordsMatch
                              ? "rgba(74, 222, 128, 0.5)"
                              : "rgba(239, 68, 68, 0.5)"
                            : undefined,
                      }}
                    />
                    {confirmPassword.length > 0 && passwordsMatch && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-red-400 text-xs mt-1">
                      Passwords don't match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  className="gold-button-premium gold-button-shimmer w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
                  whileHover={canSubmit ? { scale: 1.01 } : {}}
                  whileTap={canSubmit ? { scale: 0.99 } : {}}
                  style={{
                    opacity: !canSubmit || isLoading ? 0.6 : 1,
                    cursor: !canSubmit || isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
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
function ResetPasswordLoading() {
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
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
