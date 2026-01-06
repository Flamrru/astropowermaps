"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Check,
  Mail,
} from "lucide-react";

/**
 * Stella+ Account Setup Page
 *
 * Shown after successful payment (Stripe redirects here).
 * Collects display name and creates password.
 * No magic link required - uses localStorage email from checkout.
 */

function SetupContent() {
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get session ID from URL (passed by Stripe return_url)
  const sessionId = searchParams.get("sid");

  // Load email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("stella_email") || "";
    setEmail(savedEmail);
    setIsInitializing(false);
  }, []);

  // Password validation
  const passwordErrors: string[] = [];
  if (password.length > 0) {
    if (password.length < 8) passwordErrors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) passwordErrors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) passwordErrors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) passwordErrors.push("One number");
  }
  const passwordValid = password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = displayName.trim() && email && passwordValid && passwordsMatch && confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!passwordValid) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and number");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Create account via API (sets password on existing user created by webhook)
      const response = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName.trim(),
          sessionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create account");
      }

      // Sign in the user automatically after account creation
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Auto sign-in failed:", signInError);
        // Don't fail completely - account was created, they can log in manually
        // But still try to redirect to home
      }

      // Update localStorage with email (in case they changed it)
      localStorage.setItem("stella_email", email);

      // Trigger onboarding flow for new users
      localStorage.setItem("stella-onboarding-start", "true");

      // Redirect to home where onboarding will start
      window.location.href = "/home";
    } catch (err) {
      console.error("Setup error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  // Loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="stars-layer" />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-2 border-gold-main border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Preparing your account...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Star background */}
      <div className="stars-layer" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Success Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              boxShadow: "0 0 40px rgba(74, 222, 128, 0.5)",
            }}
          >
            <Check className="w-10 h-10 text-black" strokeWidth={3} />
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="heading-display text-2xl text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-white/60 text-sm">
            Create your{" "}
            <span className="text-gold-glow font-medium">Stella+</span> account
          </p>
        </motion.div>

        {/* Form Card */}
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
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl flex items-start gap-3"
                  style={{
                    background: "rgba(220, 38, 38, 0.15)",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email (editable) */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Email Address
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
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="input-glass w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/30 text-base"
                  style={{ minHeight: "56px" }}
                />
              </div>
              <p className="text-white/40 text-xs mt-1">
                You can change this if needed
              </p>
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                What should Stella call you?
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="w-5 h-5 text-white/40" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  className="input-glass w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/30 text-base"
                  style={{ minHeight: "56px" }}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Create a password
              </label>
              <p className="text-xs text-white/40 mb-2">
                Min 8 characters, with uppercase, lowercase & number
              </p>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. MyPass123"
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
              {/* Password requirements feedback */}
              {password.length > 0 && !passwordValid && (
                <div className="mt-2 space-y-1">
                  {passwordErrors.map((err, i) => (
                    <p key={i} className="text-red-400 text-xs flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      {err}
                    </p>
                  ))}
                </div>
              )}
              {password.length > 0 && passwordValid && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Password meets requirements
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="input-glass w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/30 text-base"
                  style={{
                    minHeight: "56px",
                    borderColor: confirmPassword.length > 0
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
                <p className="text-red-400 text-xs mt-1">Passwords don&apos;t match</p>
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
                opacity: canSubmit && !isLoading ? 1 : 0.6,
                cursor: canSubmit && !isLoading ? "pointer" : "not-allowed",
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & View Map</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
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

// Loading fallback
function LoadingState() {
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

export default function SetupPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SetupContent />
    </Suspense>
  );
}
