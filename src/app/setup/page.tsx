"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

/**
 * Stella+ Account Setup Page
 *
 * Shown after first magic link login.
 * Collects display name and optional password.
 */
export default function SetupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Not authenticated, redirect to login
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? null);

      // Check if profile exists and has birth data
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("account_status, display_name, birth_date")
        .eq("user_id", user.id)
        .single();

      if (profile && profile.account_status === "active") {
        // Already set up, redirect to home
        router.push("/home");
        return;
      }

      // If no profile or no birth data, they haven't completed purchase flow
      if (!profile || !profile.birth_date) {
        console.log("No profile with birth data - redirecting to purchase flow");
        router.push("/reveal");
        return;
      }

      // Pre-fill display name if we have one
      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    if (!password) {
      setError("Please create a password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });

        if (passwordError) {
          throw passwordError;
        }
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            display_name: displayName.trim(),
            account_status: "active",
            setup_completed_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new profile (minimal - birth data will come from purchase flow)
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            display_name: displayName.trim(),
            account_status: "active",
            setup_completed_at: new Date().toISOString(),
            // Note: birth_date and birth_place are required in DB
            // They should already exist from the reveal flow purchase
            // This insert will fail if they don't - which is expected
          });

        // If insert fails due to missing required fields, that's okay
        // The user might need to go through the quiz first
        if (insertError) {
          console.error("Profile insert error:", insertError);
          // Try to update any existing record instead
          const { error: fallbackError } = await supabase
            .from("user_profiles")
            .update({
              display_name: displayName.trim(),
              account_status: "active",
              setup_completed_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          if (fallbackError) {
            throw new Error(
              "Could not update your profile. Please complete the quiz first."
            );
          }
        }
      }

      // Success! Redirect to home
      router.push("/home");
    } catch (err) {
      console.error("Setup error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Loading state while checking auth
  if (isCheckingAuth) {
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
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Sparkle icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(140, 110, 40, 0.4) 100%)",
                border: "2px solid rgba(232, 197, 71, 0.5)",
                boxShadow: "0 0 30px rgba(201, 162, 39, 0.4)",
              }}
            >
              <Sparkles className="w-8 h-8 text-gold-bright" strokeWidth={1.5} />
            </div>
          </motion.div>

          <h1 className="heading-display text-3xl text-white mb-2">
            Complete Your Setup
          </h1>
          <p className="text-white/60 text-sm">
            Personalize your{" "}
            <span className="text-gold-glow font-medium">Stella+</span> experience
          </p>
          {userEmail && (
            <p className="text-white/40 text-xs mt-2">Signed in as {userEmail}</p>
          )}
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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

            {/* Display Name */}
            <div className="mb-5">
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
            <div className="mb-5">
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
                  style={{ minHeight: "56px" }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !displayName.trim() || !password || !confirmPassword}
              className="gold-button-premium gold-button-shimmer w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 mt-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup</span>
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
