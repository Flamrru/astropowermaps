"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { usePalm } from "../lib/palm-state";

// Mystical loading messages from Stella
const LOADING_MESSAGES = [
  "Sensing your palm's energy...",
  "Tracing the lines of destiny...",
  "Reading the map written by stars...",
  "Connecting with ancient wisdom...",
  "Revealing your hidden truths...",
];

// Orbiting particle component
function OrbitingParticle({ delay, radius, duration }: { delay: number; radius: number; duration: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        background: "radial-gradient(circle, #E8C547 0%, rgba(232,197,71,0) 70%)",
        left: "50%",
        top: "50%",
        marginLeft: -4,
        marginTop: -4,
      }}
      animate={{
        x: [radius, 0, -radius, 0, radius],
        y: [0, radius, 0, -radius, 0],
        opacity: [0.8, 0.4, 0.8, 0.4, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export default function Screen03Analyzing() {
  const { state, dispatch } = usePalm();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Simulate progress while waiting for API
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95; // Cap at 95% until API completes
        }
        // Slow down as we approach 95%
        const increment = Math.max(1, Math.floor((95 - prev) / 8));
        return Math.min(prev + increment, 95);
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Use ref to track if analysis has started (survives re-renders and StrictMode)
  const analysisStartedRef = useRef(false);

  // Actually call the API to analyze the palm - only once
  useEffect(() => {
    // Prevent double-calls from React StrictMode or re-renders
    if (analysisStartedRef.current) {
      return;
    }

    if (!state.capturedImage) {
      console.error("No captured image to analyze");
      dispatch({ type: "SET_STEP", payload: 2 }); // Go back to capture
      return;
    }

    analysisStartedRef.current = true;

    async function analyzepalm() {
      try {
        console.log("🔮 Calling palm analysis API...");

        const response = await fetch("/api/palm/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64: state.capturedImage,
            sessionId: state.sessionId,
            palmBounds: state.palmBounds,
            handLandmarks: state.handLandmarks, // Send landmarks for anatomical line positioning
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error("API error:", result.error);
          dispatch({ type: "SET_ANALYSIS_RESULT", payload: null });
        } else {
          console.log("✅ Analysis complete:", result.data);
          dispatch({ type: "SET_ANALYSIS_RESULT", payload: result.data });
        }

        // Complete progress and move to results (step 4)
        setProgress(100);
        setTimeout(() => {
          dispatch({ type: "SET_STEP", payload: 4 }); // Explicitly go to step 4
        }, 500);
      } catch (error) {
        console.error("Failed to analyze palm:", error);
        dispatch({ type: "SET_ANALYSIS_RESULT", payload: null });
        setProgress(100);
        setTimeout(() => {
          dispatch({ type: "SET_STEP", payload: 4 }); // Explicitly go to step 4
        }, 500);
      }
    }

    analyzepalm();
  }, [state.capturedImage, state.sessionId, dispatch]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background cosmic effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient pulses */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(201,162,39,0.1) 0%, transparent 50%)",
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Mystical orb container */}
      <div className="relative w-48 h-48 mb-12">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,162,39,0.2) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotating rings */}
        <motion.div
          className="absolute inset-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(201,162,39,0.3)"
              strokeWidth="0.5"
              strokeDasharray="10 5"
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute inset-8"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(201,162,39,0.2)"
              strokeWidth="0.5"
              strokeDasharray="5 10"
            />
          </svg>
        </motion.div>

        {/* Orbiting particles */}
        <OrbitingParticle delay={0} radius={60} duration={4} />
        <OrbitingParticle delay={1} radius={50} duration={5} />
        <OrbitingParticle delay={2} radius={70} duration={6} />

        {/* Central palm icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, rgba(201,162,39,0.15) 0%, rgba(5,5,16,0.9) 70%)",
              border: "1px solid rgba(201,162,39,0.3)",
              boxShadow: "inset 0 0 30px rgba(201,162,39,0.1)",
            }}
            animate={{
              boxShadow: [
                "inset 0 0 30px rgba(201,162,39,0.1), 0 0 20px rgba(201,162,39,0.2)",
                "inset 0 0 40px rgba(201,162,39,0.2), 0 0 40px rgba(201,162,39,0.3)",
                "inset 0 0 30px rgba(201,162,39,0.1), 0 0 20px rgba(201,162,39,0.2)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Hand icon */}
            <motion.svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8C547"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </motion.svg>
          </motion.div>
        </div>

        {/* Scanning line */}
        <motion.div
          className="absolute left-1/2 w-px h-full -translate-x-1/2"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(232,197,71,0.5), transparent)",
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Loading message */}
      <div className="h-16 flex items-center justify-center">
        <motion.p
          key={messageIndex}
          className="text-white/70 text-center font-display text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          style={{
            textShadow: "0 0 20px rgba(201,162,39,0.3)",
          }}
        >
          {LOADING_MESSAGES[messageIndex]}
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mt-8">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #C9A227, #E8C547)",
              boxShadow: "0 0 10px rgba(201,162,39,0.5)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-white/40 text-xs mt-2">{progress}%</p>
      </div>

      {/* Stella quote */}
      <motion.p
        className="absolute bottom-12 left-0 right-0 text-center px-8 text-white/40 text-sm italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        "Every line tells a story only you can write..."
      </motion.p>
    </div>
  );
}
