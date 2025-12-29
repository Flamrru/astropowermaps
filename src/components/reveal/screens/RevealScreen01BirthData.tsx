"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { useReveal, BirthData } from "@/lib/reveal-state";
import GoldButton from "@/components/GoldButton";
import LocationSearch from "@/components/astro-map/LocationSearch";
import { BirthLocation, BirthTimeWindow } from "@/lib/astro/types";
import tzlookup from "tz-lookup";
import { fromZonedTime } from "date-fns-tz";

// Time window options
const TIME_WINDOWS: { id: BirthTimeWindow; label: string; icon: string; hours: string }[] = [
  { id: "morning", label: "Morning", icon: "🌅", hours: "(6am-12pm)" },
  { id: "afternoon", label: "Afternoon", icon: "☀️", hours: "(12pm-6pm)" },
  { id: "evening", label: "Evening", icon: "🌙", hours: "(6pm-12am)" },
  { id: "unknown", label: "Not sure", icon: "✨", hours: "(use full day)" },
];

export default function RevealScreen01BirthData() {
  const { state, dispatch } = useReveal();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [timeWindow, setTimeWindow] = useState<BirthTimeWindow | null>(null);
  const [location, setLocation] = useState<BirthLocation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = "Please enter your birth date";
    if (!timeUnknown && !time) newErrors.time = "Please enter your birth time";
    if (!location) newErrors.location = "Please select your birth city";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [date, time, timeUnknown, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !location) return;

    setIsSubmitting(true);

    // Calculate default time based on window
    let finalTime = time;
    if (timeUnknown) {
      const defaults: Record<BirthTimeWindow, string> = {
        morning: "09:00",
        afternoon: "15:00",
        evening: "21:00",
        unknown: "12:00",
      };
      finalTime = defaults[timeWindow || "unknown"];
    }

    // Get timezone from coordinates
    const timezone = tzlookup(location.lat, location.lng);

    // Compute UTC datetime
    const localDateTime = `${date}T${finalTime}:00`;
    const birthDatetimeUtc = fromZonedTime(localDateTime, timezone).toISOString();

    const birthData: BirthData = {
      date,
      time: finalTime,
      timeUnknown,
      location: {
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        timezone,
      },
      birthDatetimeUtc,
    };

    // Update state and advance
    dispatch({ type: "SET_BIRTH_DATA", payload: birthData });
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col px-5 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col"
      >
        {/* Header */}
        <div className="text-center pt-4 mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
              border: "1px solid rgba(232, 197, 71, 0.3)",
              boxShadow: "0 0 30px rgba(201, 162, 39, 0.2)",
            }}
          >
            <Sparkles className="w-7 h-7 text-gold" />
          </motion.div>

          <h1 className="text-[26px] font-bold text-white mb-2">
            You&apos;re in! Now the exciting part:
          </h1>
          <h2 className="text-[22px] font-semibold text-gold mb-3">
            Let&apos;s find your specific map.
          </h2>
          <p className="text-white/60 text-[15px]">
            Enter your birth details below. The more precise, the more accurate your power places and power months will be.
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Birth Date */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                <Calendar size={14} className="text-gold" />
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
                className={`w-full px-4 py-3.5 rounded-xl bg-white/10 border ${
                  errors.date ? "border-red-400/50" : "border-white/20"
                } text-white focus:outline-none focus:border-gold/50 transition-all [color-scheme:dark]`}
              />
              {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Birth Time */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                <Clock size={14} className="text-gold" />
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
                className={`w-full px-4 py-3.5 rounded-xl bg-white/10 border ${
                  errors.time ? "border-red-400/50" : "border-white/20"
                } text-white focus:outline-none focus:border-gold/50 transition-all disabled:opacity-50 [color-scheme:dark]`}
              />

              {/* Unknown time checkbox */}
              <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    timeUnknown ? "bg-gold border-gold" : "bg-transparent border-white/30 group-hover:border-white/50"
                  }`}
                >
                  {timeUnknown && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-white/60 text-sm">I don&apos;t know my exact time</span>
              </label>

              {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time}</p>}
            </div>

            {/* Time Window (when unknown) */}
            {timeUnknown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-4 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(201, 162, 39, 0.05))",
                  border: "1px solid rgba(201, 162, 39, 0.2)",
                }}
              >
                <p className="text-white/70 text-sm mb-3">No worries — we can still calculate with high accuracy. Do you remember roughly when?</p>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_WINDOWS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTimeWindow(opt.id)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: timeWindow === opt.id ? "rgba(201, 162, 39, 0.2)" : "rgba(255, 255, 255, 0.05)",
                        border: timeWindow === opt.id ? "1px solid rgba(201, 162, 39, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.icon}</span>
                        <div>
                          <p className={`text-sm font-medium ${timeWindow === opt.id ? "text-gold" : "text-white/80"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-white/40">{opt.hours}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Birth Location - higher z-index to ensure dropdown appears above button */}
            <div className="relative z-[60]">
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                <MapPin size={14} className="text-gold" />
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
              {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-auto pt-4">
            <GoldButton type="submit" loading={isSubmitting}>
              Generate my power map
            </GoldButton>
          </div>
        </motion.form>

        {/* Privacy note */}
        <p className="text-center text-white/40 text-xs mt-4">
          Your data is used only to calculate your chart.
        </p>
      </motion.div>
    </div>
  );
}
