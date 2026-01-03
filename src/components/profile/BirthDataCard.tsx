"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, HelpCircle } from "lucide-react";
import { useProfile } from "./ProfileShell";

/**
 * BirthDataCard
 *
 * Displays the user's birth information in an elegant card.
 * Shows date, time (or unknown indicator), and location.
 */
export default function BirthDataCard() {
  const { state } = useProfile();
  const { profile } = state;

  if (!profile) return null;

  // Format birth date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format birth time
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const birthItems = [
    {
      icon: Calendar,
      label: "Birth Date",
      value: formatDate(profile.birthDate),
      accent: true,
    },
    {
      icon: profile.birthTimeUnknown ? HelpCircle : Clock,
      label: "Birth Time",
      value: profile.birthTimeUnknown
        ? "Unknown"
        : formatTime(profile.birthTime) || "12:00 PM (noon)",
      subtitle: profile.birthTimeUnknown
        ? "Houses unavailable without birth time"
        : null,
      muted: profile.birthTimeUnknown,
    },
    {
      icon: MapPin,
      label: "Birth Place",
      value: profile.birthPlace,
      subtitle: `${profile.birthLat.toFixed(2)}°, ${profile.birthLng.toFixed(2)}°`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mx-4"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: "linear-gradient(180deg, #E8C547 0%, #C9A227 100%)" }}
        />
        <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider">
          Cosmic Origin
        </h2>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.4), transparent)",
          }}
        />

        <div className="p-5 space-y-4">
          {birthItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.muted
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(201, 162, 39, 0.1)",
                  border: `1px solid ${
                    item.muted
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(201, 162, 39, 0.2)"
                  }`,
                }}
              >
                <item.icon
                  size={18}
                  className={item.muted ? "text-white/40" : "text-[#E8C547]"}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                  {item.label}
                </div>
                <div
                  className={`text-sm font-medium ${
                    item.muted ? "text-white/50 italic" : "text-white/90"
                  }`}
                >
                  {item.value}
                </div>
                {item.subtitle && (
                  <div className="text-white/30 text-xs mt-0.5">{item.subtitle}</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Edit link */}
        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <motion.a
            href="/setup"
            whileHover={{ x: 4 }}
            className="text-xs text-[#E8C547]/70 hover:text-[#E8C547] transition-colors flex items-center gap-1"
          >
            <span>Update birth data</span>
            <span className="text-[10px]">→</span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
