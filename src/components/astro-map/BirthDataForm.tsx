"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Sparkles } from "lucide-react";
import GoldButton from "@/components/GoldButton";
import LocationSearch from "./LocationSearch";
import { BirthData, BirthLocation, BirthTimeWindow } from "@/lib/astro/types";

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  loading?: boolean;
}

// Time window options for unknown birth time
const TIME_WINDOW_OPTIONS: { id: BirthTimeWindow; label: string; icon: string; hours: string }[] = [
  { id: "morning", label: "Morning", icon: "🌅", hours: "6am - 12pm" },
  { id: "afternoon", label: "Afternoon", icon: "☀️", hours: "12pm - 6pm" },
  { id: "evening", label: "Evening", icon: "🌙", hours: "6pm - 12am" },
  { id: "unknown", label: "No idea", icon: "✨", hours: "Full day" },
];

export default function BirthDataForm({ onSubmit, loading = false }: BirthDataFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [timeWindow, setTimeWindow] = useState<BirthTimeWindow | null>(null);
  const [location, setLocation] = useState<BirthLocation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = "Please enter your birth date";
    }

    if (!timeUnknown && !time) {
      newErrors.time = "Please enter your birth time or check 'I don't know'";
    }

    if (!location) {
      newErrors.location = "Please select your birth city";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Calculate default time based on time window
    let defaultTime = "12:00";
    if (timeUnknown && timeWindow) {
      const windowDefaults: Record<BirthTimeWindow, string> = {
        morning: "09:00",
        afternoon: "15:00",
        evening: "21:00",
        unknown: "12:00",
      };
      defaultTime = windowDefaults[timeWindow];
    }

    const birthData: BirthData = {
      date,
      time: timeUnknown ? defaultTime : time,
      timeUnknown,
      location: location!,
      timeWindow: timeUnknown ? (timeWindow ?? undefined) : undefined,
    };

    onSubmit(birthData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto px-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A227]/20 mb-4"
        >
          <Sparkles className="w-8 h-8 text-[#E8C547]" />
        </motion.div>

        <h1
          className="font-display text-[28px] md:text-[34px] font-semibold text-white mb-3"
          style={{
            textShadow: "0 0 30px rgba(201, 162, 39, 0.3), 0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          Your <span className="text-[#E8C547]">Astrocartography</span> Map
        </h1>

        <p className="text-white/60 text-base">
          Enter your birth details to discover where your stars align around the world.
        </p>
      </div>

      {/* Form Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="
          p-6 rounded-2xl
          bg-white/[0.08] backdrop-blur-xl
          border border-white/[0.12]
          shadow-[0_8px_32px_rgba(0,0,0,0.3)]
          overflow-hidden
        "
      >
        {/* Birth Date */}
        <div className="mb-5">
          <label className="block text-white/80 text-sm font-medium mb-2">
            <Calendar size={14} className="inline mr-2 text-[#C9A227]" />
            Date of Birth
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
            }}
            max={new Date().toISOString().split("T")[0]}
            className={`
              w-full px-4 py-4 rounded-xl
              bg-white/10 backdrop-blur-xl
              border ${errors.date ? "border-red-400/50" : "border-white/20"}
              text-white text-base
              focus:outline-none focus:border-[#C9A227]/50
              focus:shadow-[0_0_20px_rgba(201,162,39,0.15)]
              transition-all duration-300
              [color-scheme:dark]
            `}
          />
          {errors.date && (
            <p className="text-red-400 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Birth Time */}
        <div className="mb-5">
          <label className="block text-white/80 text-sm font-medium mb-2">
            <Clock size={14} className="inline mr-2 text-[#C9A227]" />
            Time of Birth
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              if (errors.time) setErrors((prev) => ({ ...prev, time: "" }));
            }}
            disabled={timeUnknown}
            className={`
              w-full px-4 py-4 rounded-xl
              bg-white/10 backdrop-blur-xl
              border ${errors.time ? "border-red-400/50" : "border-white/20"}
              text-white text-base
              focus:outline-none focus:border-[#C9A227]/50
              focus:shadow-[0_0_20px_rgba(201,162,39,0.15)]
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              [color-scheme:dark]
            `}
          />

          {/* Unknown Time Checkbox */}
          <label className="flex items-center gap-2 mt-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(e) => {
                  setTimeUnknown(e.target.checked);
                  if (e.target.checked && errors.time) {
                    setErrors((prev) => ({ ...prev, time: "" }));
                  }
                }}
                className="sr-only"
              />
              <div
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  transition-all duration-200
                  ${
                    timeUnknown
                      ? "bg-[#C9A227] border-[#C9A227]"
                      : "bg-transparent border-white/30 group-hover:border-white/50"
                  }
                `}
              >
                {timeUnknown && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
            </div>
            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
              I don&apos;t know my birth time
            </span>
          </label>

          {errors.time && (
            <p className="text-red-400 text-sm mt-1">{errors.time}</p>
          )}
        </div>

        {/* Birth Location */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Birth City
          </label>
          <LocationSearch
            value={location}
            onChange={(loc) => {
              setLocation(loc);
              if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
            }}
            placeholder="Search for your birth city..."
          />
          {errors.location && (
            <p className="text-red-400 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Time Window Selector - shown when time is unknown */}
        {timeUnknown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-5"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#C9A227]/15 to-[#C9A227]/5 border border-[#C9A227]/20">
              <p className="text-white/70 text-sm mb-3">
                Do you remember approximately when you were born?
              </p>

              {/* Time Window Options */}
              <div className="grid grid-cols-2 gap-2">
                {TIME_WINDOW_OPTIONS.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => setTimeWindow(option.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative p-3 rounded-xl text-left transition-all overflow-hidden"
                    style={{
                      background: timeWindow === option.id
                        ? "linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(201, 162, 39, 0.1) 100%)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: timeWindow === option.id
                        ? "1px solid rgba(201, 162, 39, 0.5)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: timeWindow === option.id
                        ? "0 0 20px rgba(201, 162, 39, 0.2)"
                        : "none",
                    }}
                  >
                    {/* Glow effect when selected */}
                    {timeWindow === option.id && (
                      <motion.div
                        layoutId="timeWindowGlow"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: "radial-gradient(circle at center, rgba(201, 162, 39, 0.15) 0%, transparent 70%)",
                        }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${timeWindow === option.id ? "text-[#E8C547]" : "text-white/80"}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-white/40">{option.hours}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Explanation */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/50 text-xs leading-relaxed">
                  {timeWindow ? (
                    <>
                      We&apos;ll sample multiple times within your window to calculate results with
                      <span className="text-[#E8C547]"> confidence ratings</span>.
                    </>
                  ) : (
                    "Select an approximate time window for more accurate results."
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <GoldButton type="submit" loading={loading}>
          Generate My Astro Map
        </GoldButton>
      </motion.form>

      {/* Footer Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/40 text-sm mt-6"
      >
        Your data is used only to calculate your map and is not stored.
      </motion.p>
    </motion.div>
  );
}
