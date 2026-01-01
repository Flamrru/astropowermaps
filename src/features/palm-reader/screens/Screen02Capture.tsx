"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePalm } from "../lib/palm-state";
import {
  initializeHandLandmarker,
  detectHandFromVideo,
  calculatePalmBounds,
  drawHandSkeleton,
  isOpenPalm,
  closeHandLandmarker,
} from "../lib/mediapipe-client";
import type { HandLandmarks } from "../types";

type CameraState = "loading" | "ready" | "countdown" | "error" | "captured";

export default function Screen02Capture() {
  const { dispatch } = usePalm();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(3);
  const [handDetected, setHandDetected] = useState(false);
  const [isPalmOpen, setIsPalmOpen] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<HandLandmarks | null>(null);

  // Initialize MediaPipe
  useEffect(() => {
    async function initMediaPipe() {
      try {
        await initializeHandLandmarker();
        setMediapipeReady(true);
        console.log("✅ MediaPipe ready");
      } catch (error) {
        console.error("MediaPipe init error:", error);
        // Continue without hand tracking - will use fallback
      }
    }
    initMediaPipe();

    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize camera
  useEffect(() => {
    async function startCamera() {
      if (!window.isSecureContext) {
        setCameraState("error");
        setErrorMessage("Camera requires HTTPS. On mobile, use a secure connection.");
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState("error");
        setErrorMessage("Camera not supported in this browser. Try Chrome or Safari.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            setCameraState("ready");
            startHandTracking();
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraState("error");
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setErrorMessage("Camera access denied. Please allow camera access.");
          } else if (err.name === "NotFoundError") {
            setErrorMessage("No camera found on this device.");
          } else {
            setErrorMessage("Unable to access camera. Please try again.");
          }
        }
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start real-time hand tracking
  const startHandTracking = useCallback(() => {
    if (!videoRef.current || !overlayCanvasRef.current || !mediapipeReady) {
      return;
    }

    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = overlayCanvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video
    overlayCanvas.width = video.videoWidth || 1280;
    overlayCanvas.height = video.videoHeight || 720;

    let lastTime = 0;

    function detectLoop() {
      if (!video || !ctx || cameraState === "captured") {
        return;
      }

      const now = performance.now();

      // Only detect every 50ms (20 FPS) for performance
      if (now - lastTime > 50) {
        lastTime = now;

        // Clear overlay
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        // Detect hand
        const result = detectHandFromVideo(video, now);

        if (result.detected && result.landmarks) {
          setHandDetected(true);
          setCurrentLandmarks(result.landmarks);

          // Check if palm is open
          const palmOpen = isOpenPalm(result.landmarks);
          setIsPalmOpen(palmOpen);

          // Draw skeleton on overlay
          drawHandSkeleton(
            ctx,
            result.landmarks,
            overlayCanvas.width,
            overlayCanvas.height,
            {
              color: palmOpen ? "#4ADE80" : "#FBBF24", // Green if ready, yellow if not
              lineWidth: 3,
              pointRadius: 5,
            }
          );
        } else {
          setHandDetected(false);
          setIsPalmOpen(false);
          setCurrentLandmarks(null);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectLoop);
    }

    detectLoop();
  }, [mediapipeReady, cameraState]);

  // Restart tracking when mediapipe becomes ready
  useEffect(() => {
    if (mediapipeReady && cameraState === "ready") {
      startHandTracking();
    }
  }, [mediapipeReady, cameraState, startHandTracking]);

  // Auto-capture countdown
  useEffect(() => {
    if (cameraState !== "countdown") return;

    if (countdown <= 0) {
      capturePhoto();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cameraState, countdown]);

  // Start countdown when tapping (only if hand detected)
  const startCountdown = useCallback(() => {
    if (cameraState !== "ready") return;
    if (!handDetected) {
      // Flash a warning
      return;
    }
    setCameraState("countdown");
    setCountdown(3);
  }, [cameraState, handDetected]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    console.log("📸 capturePhoto called");

    if (!videoRef.current || !canvasRef.current) {
      console.error("❌ Missing refs");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("❌ Video has no dimensions");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);

      console.log("🖼️ Image captured, length:", imageData.length);

      // Stop camera and tracking
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Save image and landmarks to state
      dispatch({ type: "SET_CAPTURED_IMAGE", payload: imageData });

      // Save landmarks if we have them
      if (currentLandmarks) {
        dispatch({ type: "SET_HAND_LANDMARKS", payload: currentLandmarks });
        const bounds = calculatePalmBounds(currentLandmarks);
        dispatch({ type: "SET_PALM_BOUNDS", payload: bounds });
        console.log("📍 Landmarks saved:", currentLandmarks.length, "points");
        console.log("📐 Palm bounds:", bounds);
      }

      setCameraState("captured");

      setTimeout(() => {
        dispatch({ type: "NEXT_STEP" });
      }, 300);
    }
  }, [dispatch, currentLandmarks]);

  // Retry camera access
  const handleRetry = () => {
    setCameraState("loading");
    setErrorMessage("");
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Camera preview area */}
      <div className="flex-1 relative bg-black min-h-0">
        {/* Loading state */}
        <AnimatePresence>
          {cameraState === "loading" && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-cosmic-black z-20"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-12 h-12 rounded-full border-2 border-gold-main border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-white/60 text-sm">
                {mediapipeReady ? "Starting camera..." : "Loading hand detection..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {cameraState === "error" && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-cosmic-black px-8 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
              <h3 className="text-white text-base font-medium mb-2 text-center">
                Camera Access Required
              </h3>
              <p className="text-white/50 text-sm text-center mb-4 max-w-xs">
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${cameraState === "loading" || cameraState === "error" ? "opacity-0" : "opacity-100"}`}
        />

        {/* Hand tracking overlay */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Hand detection status */}
        <AnimatePresence>
          {cameraState === "ready" && (
            <motion.div
              className="absolute top-4 left-0 right-0 flex justify-center z-30"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{
                  background: handDetected
                    ? isPalmOpen
                      ? "rgba(74,222,128,0.2)"
                      : "rgba(251,191,36,0.2)"
                    : "rgba(239,68,68,0.2)",
                  border: `1px solid ${
                    handDetected
                      ? isPalmOpen
                        ? "rgba(74,222,128,0.5)"
                        : "rgba(251,191,36,0.5)"
                      : "rgba(239,68,68,0.5)"
                  }`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: handDetected
                      ? isPalmOpen
                        ? "#4ADE80"
                        : "#FBBF24"
                      : "#EF4444",
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{
                    color: handDetected
                      ? isPalmOpen
                        ? "#4ADE80"
                        : "#FBBF24"
                      : "#EF4444",
                  }}
                >
                  {!handDetected
                    ? "Show your palm"
                    : !isPalmOpen
                    ? "Open your hand"
                    : "Palm detected ✓"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown overlay */}
        <AnimatePresence>
          {cameraState === "countdown" && countdown > 0 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                key={countdown}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(5,5,16,0.8)",
                  border: "2px solid rgba(201,162,39,0.6)",
                  boxShadow: "0 0 40px rgba(201,162,39,0.3)",
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span
                  className="text-5xl font-display text-gold-main"
                  style={{ textShadow: "0 0 20px rgba(201,162,39,0.5)" }}
                >
                  {countdown}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash effect on capture */}
        <AnimatePresence>
          {cameraState === "captured" && (
            <motion.div
              className="absolute inset-0 bg-white z-40"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Capture button */}
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-20"
          style={{
            paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* Instruction text */}
          <p
            className="text-center text-sm font-medium mb-4"
            style={{
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            {cameraState === "ready" && !handDetected && "Position your open palm in view"}
            {cameraState === "ready" && handDetected && !isPalmOpen && "Open your hand flat"}
            {cameraState === "ready" && handDetected && isPalmOpen && "Tap to capture"}
            {cameraState === "countdown" && "Hold steady..."}
            {cameraState === "loading" && "Starting camera..."}
          </p>

          <motion.button
            onClick={startCountdown}
            disabled={cameraState !== "ready" || !handDetected}
            className="relative w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-40"
            whileHover={{ scale: cameraState === "ready" && handDetected ? 1.05 : 1 }}
            whileTap={{ scale: cameraState === "ready" && handDetected ? 0.95 : 1 }}
            style={{
              background: "rgba(5,5,16,0.9)",
              border: `4px solid ${
                handDetected && isPalmOpen
                  ? "rgba(74,222,128,0.7)"
                  : "rgba(201,162,39,0.7)"
              }`,
              boxShadow: handDetected && isPalmOpen
                ? "0 0 30px rgba(74,222,128,0.3)"
                : "0 0 30px rgba(201,162,39,0.3)",
            }}
          >
            {/* Pulsing ring */}
            {cameraState === "ready" && handDetected && isPalmOpen && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid rgba(74,222,128,0.4)" }}
                animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {/* Inner circle */}
            <div
              className="w-14 h-14 rounded-full"
              style={{
                background: handDetected && isPalmOpen
                  ? "linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)"
                  : "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
                boxShadow: handDetected && isPalmOpen
                  ? "0 0 20px rgba(74,222,128,0.5)"
                  : "0 0 20px rgba(201,162,39,0.5)",
              }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
