"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { saveAstroData } from "@/lib/astro-storage";

// PRD-specified loading messages
const LOADING_MESSAGES = [
  "Converting birth time to UTC...",
  "Calculating planetary positions at your birth...",
  "Most people never see this map.",
  "Mapping celestial bodies to geographic lines...",
  "Finding where your energy naturally amplifies...",
  "Matching your lines to 100+ world cities...",
  "Discovering what you've been missing...",
];

// Orbital ring component - refined
function OrbitalRing({
  radius,
  duration,
  direction = 1,
  planetCount = 3,
  planetSize = 4,
  opacity = 0.3,
}: {
  radius: number;
  duration: number;
  direction?: number;
  planetCount?: number;
  planetSize?: number;
  opacity?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
        border: `1px solid rgba(201, 162, 39, ${opacity})`,
      }}
      animate={{ rotate: direction * 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {Array.from({ length: planetCount }).map((_, i) => {
        const angle = (i / planetCount) * 360;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: planetSize,
              height: planetSize,
              background: `radial-gradient(circle, #E8C547 0%, #C9A227 60%, transparent 100%)`,
              boxShadow: `0 0 ${planetSize * 2}px rgba(232, 197, 71, 0.5)`,
              left: `calc(50% - ${planetSize / 2}px + ${Math.cos((angle * Math.PI) / 180) * radius}px)`,
              top: `calc(50% - ${planetSize / 2}px + ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
            }}
          />
        );
      })}
    </motion.div>
  );
}

// Nebula cloud - slow drifting gradient blob
function NebulaCloud({
  position,
  size,
  color,
  duration,
  delay = 0,
}: {
  position: { x: string; y: string };
  size: number;
  color: string;
  duration: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y,
        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
        filter: "blur(40px)",
        transform: "translate(-50%, -50%)",
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 15, -10, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
        opacity: [0.4, 0.6, 0.5, 0.55, 0.4],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Ambient glow ring around orrery
function AmbientGlowRing() {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 340,
        height: 340,
        left: "calc(50% - 170px)",
        top: "calc(50% - 170px)",
        background: "transparent",
        boxShadow: `
          inset 0 0 60px rgba(201, 162, 39, 0.08),
          0 0 80px rgba(201, 162, 39, 0.05),
          0 0 120px rgba(201, 162, 39, 0.03)
        `,
      }}
      animate={{
        boxShadow: [
          `inset 0 0 60px rgba(201, 162, 39, 0.08), 0 0 80px rgba(201, 162, 39, 0.05), 0 0 120px rgba(201, 162, 39, 0.03)`,
          `inset 0 0 80px rgba(201, 162, 39, 0.12), 0 0 100px rgba(201, 162, 39, 0.08), 0 0 150px rgba(201, 162, 39, 0.05)`,
          `inset 0 0 60px rgba(201, 162, 39, 0.08), 0 0 80px rgba(201, 162, 39, 0.05), 0 0 120px rgba(201, 162, 39, 0.03)`,
        ],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Subtle rotating light rays
function LightRays() {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 500,
        height: 500,
        left: "calc(50% - 250px)",
        top: "calc(50% - 250px)",
        background: `conic-gradient(
          from 0deg,
          transparent 0deg,
          rgba(201, 162, 39, 0.03) 30deg,
          transparent 60deg,
          transparent 120deg,
          rgba(201, 162, 39, 0.02) 150deg,
          transparent 180deg,
          transparent 240deg,
          rgba(201, 162, 39, 0.03) 270deg,
          transparent 300deg,
          transparent 360deg
        )`,
        borderRadius: "50%",
        filter: "blur(20px)",
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 120,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export default function RevealScreen02Generation() {
  const { state, dispatch } = useReveal();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);

  // Rotate loading text every 0.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Progress animation
  useEffect(() => {
    const startTime = Date.now();
    const duration = 5600;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= duration && apiComplete) {
        clearInterval(interval);
        dispatch({ type: "NEXT_STEP" });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [apiComplete, dispatch]);

  // Call astrocartography API
  useEffect(() => {
    if (!state.birthData || hasCalledApiRef.current) return;
    hasCalledApiRef.current = true;

    const fetchAstroData = async () => {
      try {
        const res = await fetch("/api/astrocartography", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthData: {
              date: state.birthData!.date,
              time: state.birthData!.time,
              timeUnknown: state.birthData!.timeUnknown,
              location: {
                name: state.birthData!.location.name,
                lat: state.birthData!.location.lat,
                lng: state.birthData!.location.lng,
                timezone: state.birthData!.location.timezone,
              },
            },
          }),
        });

        if (res.ok) {
          const response = await res.json();
          if (response.success && response.data) {
            dispatch({ type: "SET_ASTRO_DATA", payload: response.data });
            saveAstroData(response.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch astro data:", error);
      } finally {
        setApiComplete(true);
      }
    };

    fetchAstroData();
  }, [state.birthData, dispatch]);

  const isEmotionalMessage = !LOADING_MESSAGES[textIndex].endsWith("...");

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Layer 1: Deep cosmic background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(15, 12, 30, 1) 0%, #050510 100%)
          `,
        }}
      />

      {/* Layer 2: Nebula clouds - slow, elegant, non-competing */}
      <NebulaCloud
        position={{ x: "25%", y: "30%" }}
        size={300}
        color="rgba(80, 50, 120, 0.3)"
        duration={25}
        delay={0}
      />
      <NebulaCloud
        position={{ x: "75%", y: "65%" }}
        size={350}
        color="rgba(60, 40, 100, 0.25)"
        duration={30}
        delay={5}
      />
      <NebulaCloud
        position={{ x: "50%", y: "50%" }}
        size={200}
        color="rgba(201, 162, 39, 0.08)"
        duration={20}
        delay={2}
      />

      {/* Layer 3: Subtle light rays */}
      <LightRays />

      {/* Layer 4: Ambient glow ring */}
      <AmbientGlowRing />

      {/* Layer 5: Central orrery */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbitalRing
          radius={130}
          duration={50}
          direction={1}
          planetCount={3}
          planetSize={3}
          opacity={0.2}
        />
        <OrbitalRing
          radius={90}
          duration={35}
          direction={-1}
          planetCount={2}
          planetSize={4}
          opacity={0.3}
        />
        <OrbitalRing
          radius={50}
          duration={20}
          direction={1}
          planetCount={2}
          planetSize={5}
          opacity={0.4}
        />

        {/* Central sun */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 20,
            height: 20,
            background: `radial-gradient(circle, #E8C547 0%, #C9A227 50%, rgba(201, 162, 39, 0.4) 80%, transparent 100%)`,
          }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(232, 197, 71, 0.5), 0 0 40px rgba(201, 162, 39, 0.3)",
              "0 0 30px rgba(232, 197, 71, 0.7), 0 0 60px rgba(201, 162, 39, 0.4)",
              "0 0 20px rgba(232, 197, 71, 0.5), 0 0 40px rgba(201, 162, 39, 0.3)",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Layer 6: Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.7) 100%)",
        }}
      />

      {/* Layer 7: Content */}
      <div className="flex-1 flex flex-col items-center justify-end pb-24 relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center max-w-md w-full"
        >
          {/* Status text */}
          <div className="min-h-[80px] flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`text-[15px] sm:text-[17px] leading-relaxed ${
                  isEmotionalMessage
                    ? "text-white/90 font-medium"
                    : "text-white/50"
                }`}
                style={{
                  letterSpacing: "0.03em",
                }}
              >
                {LOADING_MESSAGES[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Minimal progress line */}
          <div className="flex justify-center">
            <div className="w-32 h-[2px] rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, rgba(201, 162, 39, 0.5), #E8C547)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
