"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, ArrowRight, Sparkles, Mail } from "lucide-react";

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

function AccountSetupContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get session info from URL params
  const sessionId = searchParams.get("sid");

  // Load email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("stella_email") || "";
    setEmail(savedEmail);
  }, []);

  // Validate passwords
  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = passwordValidation.valid && passwordsMatch && confirmPassword.length > 0 && email.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!passwordValidation.valid) {
      setError("Password must have at least 6 characters, 1 letter, and 1 number");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords don't match");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          sessionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create account");
      }

      // Update localStorage with potentially changed email
      localStorage.setItem("stella_email", email);

      // Trigger onboarding flow for new users
      localStorage.setItem("stella-onboarding-start", "true");

      // Redirect to home where onboarding will start
      window.location.href = "/home";
    } catch (err) {
      console.error("Account creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create account");
      setIsCreating(false);
    }
  };

  const handleSkip = () => {
    // Trigger onboarding flow even when skipping account setup
    localStorage.setItem("stella-onboarding-start", "true");
    // Redirect to home where onboarding will start
    window.location.href = "/home";
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
            One last step — create your account
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

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/30 text-base outline-none focus:ring-2 focus:ring-gold/50"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
              </div>
              <p className="text-white/40 text-xs mt-1">
                You can change this if needed
              </p>
            </div>

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
                  placeholder="Min 6 chars, 1 letter, 1 number"
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
