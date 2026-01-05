"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, ArrowRight, Sparkles } from "lucide-react";

function AccountSetupContent() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get session info from URL params
  const sessionId = searchParams.get("sid");
  const isDevMode = searchParams.get("d") !== null;

  // Validate passwords match in real-time
  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 6;
  const canSubmit = passwordValid && passwordsMatch && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords don't match");
      return;
    }

    setIsCreating(true);

    try {
      // Get email from localStorage (saved during quiz/reveal flow)
      const savedEmail = localStorage.getItem("stella_email") || "test@example.com";

      const response = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: savedEmail,
          password,
          sessionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create account");
      }

      // Redirect to map
      if (isDevMode) {
        window.location.href = "/map?d=1";
      } else if (sessionId) {
        window.location.href = `/map?sid=${sessionId}`;
      } else {
        window.location.href = "/map?d=1";
      }
    } catch (err) {
      console.error("Account creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create account");
      setIsCreating(false);
    }
  };

  const handleSkip = () => {
    if (isDevMode) {
      window.location.href = "/map?d=1";
    } else if (sessionId) {
      window.location.href = `/map?sid=${sessionId}`;
    } else {
      window.location.href = "/map?d=1";
    }
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Star background */}
      <div className="stars-layer" />

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
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-white/60 text-sm">
            One last step — create your password
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "rgba(15, 15, 35, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder:text-white/30 text-base outline-none focus:ring-2 focus:ring-gold/50"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-red-400 text-xs mt-1">Must be at least 6 characters</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/30 text-base outline-none focus:ring-2 focus:ring-gold/50"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: confirmPassword.length > 0
                      ? passwordsMatch
                        ? "1px solid rgba(74, 222, 128, 0.5)"
                        : "1px solid rgba(239, 68, 68, 0.5)"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
                {confirmPassword.length > 0 && passwordsMatch && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                )}
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!canSubmit || isCreating}
              className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)"
                  : "rgba(255, 255, 255, 0.1)",
                color: canSubmit ? "#1a1400" : "rgba(255, 255, 255, 0.4)",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              whileHover={canSubmit ? { scale: 1.01 } : {}}
              whileTap={canSubmit ? { scale: 0.99 } : {}}
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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

          {/* Skip option */}
          <button
            onClick={handleSkip}
            className="w-full mt-4 text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            Skip for now — I'll set this up later
          </button>
        </motion.div>

        {/* Info text */}
        <motion.p
          className="text-center text-white/40 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          We'll send a confirmation email to verify your account
        </motion.p>

        {/* Decorative */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.6 }}
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

export default function AccountSetupPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AccountSetupContent />
    </Suspense>
  );
}
