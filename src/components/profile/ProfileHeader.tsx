"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "./ProfileShell";

/**
 * ProfileHeader
 *
 * Displays the user's Big Three (Sun, Moon, Rising) with a beautiful
 * cosmic card design. Includes back navigation.
 */
export default function ProfileHeader() {
  const router = useRouter();
  const { state } = useProfile();
  const { profile, bigThree } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!profile) return null;

  const handleStartEditing = () => {
    setEditName(profile.displayName || "");
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditName("");
  };

  const handleSaveName = async () => {
    if (editName.trim() === (profile.displayName || "")) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: editName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update name");
      }

      // Reload to show updated name
      window.location.reload();
    } catch (error) {
      console.error("Failed to save name:", error);
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEditing();
    }
  };

  const placements = bigThree
    ? [
        {
          type: "Sun",
          icon: "☀️",
          sign: bigThree.sun.sign,
          symbol: bigThree.sun.symbol,
          meaning: "Core identity",
        },
        {
          type: "Moon",
          icon: "🌙",
          sign: bigThree.moon.sign,
          symbol: bigThree.moon.symbol,
          meaning: "Emotional nature",
        },
        {
          type: "Rising",
          icon: "⬆️",
          sign: bigThree.rising.sign,
          symbol: bigThree.rising.symbol,
          meaning: "First impression",
        },
      ]
    : [];

  return (
    <motion.header
      className="px-4 pt-6 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button */}
      <motion.button
        onClick={() => router.push("/dashboard")}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors mb-4"
      >
        <ChevronLeft size={18} />
        <span className="text-sm">Dashboard</span>
      </motion.button>

      {/* Profile card */}
      <motion.div
        className="relative overflow-hidden rounded-3xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: `
            linear-gradient(135deg,
              rgba(201, 162, 39, 0.12) 0%,
              rgba(139, 92, 246, 0.08) 50%,
              rgba(201, 162, 39, 0.06) 100%
            )
          `,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: `
            0 0 60px rgba(201, 162, 39, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Animated gradient border on top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              #C9A227 20%,
              #E8C547 50%,
              #C9A227 80%,
              transparent 100%
            )`,
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["200% 0%", "-200% 0%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Background shimmer */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              120deg,
              transparent 30%,
              rgba(255, 255, 255, 0.04) 50%,
              transparent 70%
            )`,
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["200% 0%", "-200% 0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative p-6">
          {/* Name and avatar area */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar with zodiac ring */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
            >
              {/* Rotating zodiac ring */}
              <motion.div
                className="absolute -inset-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="none"
                    stroke="rgba(201, 162, 39, 0.2)"
                    strokeWidth="0.5"
                    strokeDasharray="3 5"
                  />
                </svg>
              </motion.div>

              {/* Avatar circle */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(139, 92, 246, 0.15))",
                  border: "2px solid rgba(201, 162, 39, 0.4)",
                  boxShadow: "0 0 30px rgba(201, 162, 39, 0.2)",
                }}
              >
                {bigThree?.sun.symbol || "✨"}
              </div>
            </motion.div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSaving}
                    placeholder="Your name"
                    maxLength={30}
                    className="flex-1 min-w-0 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-lg font-medium text-white placeholder-white/30 focus:outline-none focus:border-[#E8C547]/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-green-300/30 border-t-green-300 rounded-full"
                      />
                    ) : (
                      <Check size={16} />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelEditing}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                  </motion.button>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-medium truncate"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {profile.displayName || "Cosmic Traveler"}
                  </motion.h1>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartEditing}
                    className="p-1 rounded-md text-white/30 hover:text-[#E8C547] hover:bg-white/5 transition-colors"
                  >
                    <Pencil size={14} />
                  </motion.button>
                </div>
              )}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/40 text-sm"
              >
                Your cosmic profile
              </motion.p>
            </div>
          </div>

          {/* Big Three Display */}
          {placements.length > 0 && (
            <div className="space-y-3">
              {placements.map((placement, index) => (
                <motion.div
                  key={placement.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {/* Icon */}
                  <span
                    className="text-lg"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(201, 162, 39, 0.5))",
                    }}
                  >
                    {placement.icon}
                  </span>

                  {/* Type and sign */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-xs uppercase tracking-wider">
                        {placement.type}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-white/30 text-xs">
                        {placement.meaning}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="font-medium"
                        style={{ color: "#E8C547" }}
                      >
                        {placement.sign}
                      </span>
                      <span className="text-white/50 text-lg">
                        {placement.symbol}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Decorative constellation dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-6 opacity-20">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 h-0.5 rounded-full bg-white"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.header>
  );
}
