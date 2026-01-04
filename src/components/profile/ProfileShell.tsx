"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { BigThree } from "@/lib/dashboard-types";
import { calculateBigThree } from "@/lib/astro/zodiac";
import BottomNav from "@/components/dashboard/BottomNav";
import StellaFloatingButton from "@/components/dashboard/StellaFloatingButton";

// ============================================
// Profile State Types
// ============================================

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  accountStatus: string;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  birthPlace: string;
  birthLat: number;
  birthLng: number;
  birthTimezone: string;
  subscriptionStatus: string;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileState {
  isLoading: boolean;
  error: string | null;
  profile: UserProfile | null;
  bigThree: BigThree | null;
  userEmail: string | null;
}

interface ProfileContextValue {
  state: ProfileState;
  signOut: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileShell");
  }
  return context;
}

// ============================================
// Loading Animation
// ============================================

function ProfileLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510]">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Orbiting rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${60 + i * 30}px`,
              height: `${60 + i * 30}px`,
              left: `${-15 - i * 15}px`,
              top: `${-15 - i * 15}px`,
              borderColor: `rgba(201, 162, 39, ${0.3 - i * 0.08})`,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Center orb */}
        <motion.div
          className="w-8 h-8 rounded-full"
          style={{
            background: "radial-gradient(circle, #E8C547 0%, #C9A227 50%, transparent 100%)",
            boxShadow: "0 0 30px rgba(201, 162, 39, 0.5)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
}

// ============================================
// Profile Shell Component
// ============================================

interface ProfileShellProps {
  children: ReactNode;
}

export default function ProfileShell({ children }: ProfileShellProps) {
  const router = useRouter();
  const [state, setState] = useState<ProfileState>({
    isLoading: true,
    error: null,
    profile: null,
    bigThree: null,
    userEmail: null,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const supabase = createClient();

      // Check auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/profile");
        return;
      }

      // Fetch profile from API
      const response = await fetch("/api/profile");

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist, redirect to setup
          router.push("/setup");
          return;
        }
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      const profile: UserProfile = data.profile;

      // Calculate Big Three
      let bigThree: BigThree | null = null;
      try {
        bigThree = calculateBigThree({
          date: profile.birthDate,
          time: profile.birthTime || "12:00",
          timeUnknown: profile.birthTimeUnknown,
          location: {
            name: profile.birthPlace,
            lat: profile.birthLat,
            lng: profile.birthLng,
            timezone: profile.birthTimezone,
          },
        });
      } catch (e) {
        console.error("Failed to calculate Big Three:", e);
      }

      setState({
        isLoading: false,
        error: null,
        profile,
        bigThree,
        userEmail: user.email || null,
      });
    } catch (error) {
      console.error("Profile load error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load profile. Please try again.",
      }));
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Loading state
  if (state.isLoading) {
    return <ProfileLoader />;
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-red-400/80 mb-4">{state.error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "rgba(201, 162, 39, 0.2)",
              border: "1px solid rgba(201, 162, 39, 0.3)",
              color: "#E8C547",
            }}
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <ProfileContext.Provider value={{ state, signOut }}>
      <div
        className="min-h-screen pb-24"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(201, 162, 39, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
            #050510
          `,
        }}
      >
        {/* Subtle star field */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Stella chat button */}
        <StellaFloatingButton />

        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </ProfileContext.Provider>
  );
}
