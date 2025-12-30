"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Mail, Sparkles, ArrowRight } from "lucide-react";
import { useQuiz } from "@/lib/quiz-state";
import { trackMetaEvent } from "@/components/MetaPixel";
import GoldButton from "@/components/GoldButton";
import LocationSearch from "@/components/astro-map/LocationSearch";
import { BirthLocation, BirthTimeWindow } from "@/lib/astro/types";
import tzlookup from "tz-lookup";
import { fromZonedTime } from "date-fns-tz";

// Time window options
const TIME_WINDOWS: { id: BirthTimeWindow; label: string; hint: string }[] = [
  { id: "morning", label: "Morning", hint: "6am-12pm" },
  { id: "afternoon", label: "Afternoon", hint: "12pm-6pm" },
  { id: "evening", label: "Evening", hint: "6pm-12am" },
  { id: "unknown", label: "Not sure", hint: "We'll use noon" },
];

// Floating celestial particles
function CelestialParticles() {
  const particles = [
    { left: "8%", top: "12%", size: 2, delay: 0, duration: 3 },
    { left: "92%", top: "18%", size: 2.5, delay: 0.5, duration: 4 },
    { left: "12%", top: "45%", size: 1.5, delay: 1, duration: 3.5 },
    { left: "88%", top: "55%", size: 2, delay: 0.3, duration: 3 },
    { left: "6%", top: "78%", size: 2, delay: 0.8, duration: 4 },
    { left: "94%", top: "85%", size: 1.5, delay: 0.2, duration: 3.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.2, 0.7, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background:
              i % 2 === 0
                ? "radial-gradient(circle, rgba(232,197,71,0.9) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
            boxShadow:
              i % 2 === 0
                ? "0 0 8px rgba(232,197,71,0.5)"
                : "0 0 6px rgba(255,255,255,0.3)",
          }}
        />
      ))}
    </div>
  );
}

export default function Screen08CombinedCapture() {
  const { state, dispatch } = useQuiz();

  // Form state
  const [email, setEmail] = useState(state.email);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [timeWindow, setTimeWindow] = useState<BirthTimeWindow | null>(null);
  const [location, setLocation] = useState<BirthLocation | null>(null);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!date) newErrors.date = "Please enter your birth date";
    if (!timeUnknown && !time) newErrors.time = "Please enter your birth time";
    if (!location) newErrors.location = "Please select your birth city";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, date, time, timeUnknown, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Bot protection
    if (!validate() || !location) return;

    setIsSubmitting(true);

    try {
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

      // 1. Save lead to database
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          quiz: {
            q1: state.answer_q1,
            q2: state.answer_q2,
          },
          utm: state.utm,
          session_id: state.session_id,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save lead");
      }

      // 2. Fire Meta Pixel Lead event
      trackMetaEvent("Lead", {
        content_name: "2026 Power Map Combined Capture",
      });

      // 3. Update quiz state with email
      dispatch({ type: "SET_EMAIL", payload: email.trim() });

      // 4. Update quiz state with birth data
      dispatch({
        type: "SET_BIRTH_DATA",
        payload: {
          date,
          time: finalTime,
          timeUnknown,
          timeWindow: timeWindow || undefined,
          location: {
            name: location.name,
            lat: location.lat,
            lng: location.lng,
            timezone,
          },
        },
      });

      // 5. Store session data in localStorage for reveal flow
      localStorage.setItem(
        "astro_quiz_session",
        JSON.stringify({
          email: email.trim(),
          session_id: state.session_id,
          utm: state.utm,
          quizAnswers: {
            q1: state.answer_q1,
            q2: state.answer_q2,
          },
          birthData: {
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
          },
        })
      );

      // 6. Advance to loading screen
      dispatch({ type: "NEXT_STEP" });
    } catch (error) {
      console.error("Submit error:", error);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <CelestialParticles />

      <div className="flex-1 flex flex-col px-5 pb-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col max-w-md mx-auto w-full"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center pt-4 mb-3">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(232,197,71,0.15) 0%, rgba(201,162,39,0.05) 100%)",
                border: "1px solid rgba(201,162,39,0.3)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] text-gold uppercase tracking-[0.15em] font-medium">
                Almost there
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-[28px] md:text-[32px] font-bold text-white text-center mb-2 leading-tight"
          >
            One step to your{" "}
            <span className="text-gold-glow">map</span>.
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={itemVariants}
            className="text-[14px] text-white/60 text-center mb-5 leading-relaxed px-2"
          >
            Enter your details below. The more precise your birth info, the more accurate your{" "}
            <span className="text-gold/80">power places</span> and{" "}
            <span className="text-gold/80">power months</span>.
          </motion.p>

          {/* Form Card */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col"
          >
            <div
              className="rounded-2xl p-5 mb-4"
              style={{
                background: "rgba(10, 10, 25, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Gold accent line */}
              <div
                className="absolute top-0 left-1/4 right-1/4 h-px -mt-px rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(232,197,71,0.4) 50%, transparent 100%)",
                }}
              />

              {/* Email Field */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-white/80 text-[13px] font-medium mb-2">
                  <Mail size={13} className="text-gold" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border ${
                    errors.email ? "border-red-400/50" : "border-white/10"
                  } text-white text-[15px] placeholder:text-white/30 focus:outline-none focus:border-gold/40 focus:bg-white/[0.08] transition-all`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-400 text-[12px] mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-white/80 text-[13px] font-medium mb-2">
                  <Calendar size={13} className="text-gold" />
                  Birth Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border ${
                    errors.date ? "border-red-400/50" : "border-white/10"
                  } text-white text-[15px] focus:outline-none focus:border-gold/40 focus:bg-white/[0.08] transition-all [color-scheme:dark]`}
                  disabled={isSubmitting}
                />
                {errors.date && (
                  <p className="text-red-400 text-[12px] mt-1.5">{errors.date}</p>
                )}
              </div>

              {/* Birth Time */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-white/80 text-[13px] font-medium mb-2">
                  <Clock size={13} className="text-gold" />
                  Birth Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setTimeUnknown(false);
                    setTimeWindow(null);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: "" }));
                  }}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border ${
                    errors.time ? "border-red-400/50" : "border-white/10"
                  } text-white text-[15px] focus:outline-none focus:border-gold/40 focus:bg-white/[0.08] transition-all [color-scheme:dark]`}
                  disabled={isSubmitting}
                />

                {/* Time window selector */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-white/50 text-[12px] mb-2.5">
                    Not sure? Estimate:
                  </p>
                  <div
                    className="relative inline-flex p-[3px] rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    {/* Sliding gold indicator */}
                    <motion.div
                      className="absolute top-[3px] bottom-[3px] rounded-[10px]"
                      initial={false}
                      animate={{
                        left: `calc(${TIME_WINDOWS.findIndex((t) => t.id === timeWindow) * 25}% + 3px)`,
                        opacity: timeWindow ? 1 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{
                        width: "calc(25% - 2px)",
                        background: "linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(201, 162, 39, 0.12) 100%)",
                        boxShadow: "0 0 20px rgba(201, 162, 39, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(201, 162, 39, 0.35)",
                      }}
                    />

                    {/* Segments */}
                    {TIME_WINDOWS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTimeWindow(opt.id);
                          setTimeUnknown(true);
                          setTime("");
                          if (errors.time) setErrors((prev) => ({ ...prev, time: "" }));
                        }}
                        disabled={isSubmitting}
                        className={`relative z-10 px-3 py-2 text-[11px] font-medium tracking-wide transition-colors duration-200 ${
                          timeWindow === opt.id
                            ? "text-gold"
                            : "text-white/40 hover:text-white/60"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {errors.time && (
                  <p className="text-red-400 text-[12px] mt-2">{errors.time}</p>
                )}
              </div>

              {/* Birth City */}
              <div className="relative">
                <label className="flex items-center gap-2 text-white/80 text-[13px] font-medium mb-2">
                  <MapPin size={13} className="text-gold" />
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
                  <p className="text-red-400 text-[12px] mt-1.5">{errors.location}</p>
                )}
              </div>

              {/* Honeypot */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute opacity-0 pointer-events-none"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Submit error */}
            {errors.submit && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-[13px] text-center mb-3"
              >
                {errors.submit}
              </motion.p>
            )}

            {/* CTA Button */}
            <div className="mt-auto pt-2">
              <GoldButton
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                <span className="flex items-center gap-2">
                  Generate My 2026 Map
                  <ArrowRight className="w-4 h-4" />
                </span>
              </GoldButton>
            </div>

            {/* Privacy note */}
            <p className="text-center text-white/30 text-[11px] mt-3">
              Your data is used only to calculate your chart. No spam.
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
