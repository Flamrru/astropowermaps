"use client";

import { motion } from "framer-motion";
import { Calendar, Map, Sparkles } from "lucide-react";

// Floating particles component for cosmic atmosphere
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
            background: i % 3 === 0
              ? "rgba(232, 197, 71, 0.6)"
              : i % 3 === 1
              ? "rgba(147, 197, 253, 0.5)"
              : "rgba(196, 181, 253, 0.5)",
            boxShadow: i % 3 === 0
              ? "0 0 6px rgba(232, 197, 71, 0.8)"
              : i % 3 === 1
              ? "0 0 6px rgba(147, 197, 253, 0.8)"
              : "0 0 6px rgba(196, 181, 253, 0.8)",
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="px-5 pt-8 pb-1 relative">
      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <h1
          className="text-white text-[34px] leading-tight font-bold"
          style={{
            textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
          }}
        >
          Unlock Your{" "}
          <motion.span
            className="relative inline-block"
            animate={{
              textShadow: [
                "0 0 20px rgba(232, 197, 71, 0.5), 0 0 40px rgba(232, 197, 71, 0.3), 0 0 60px rgba(232, 197, 71, 0.2)",
                "0 0 30px rgba(232, 197, 71, 0.7), 0 0 50px rgba(232, 197, 71, 0.5), 0 0 80px rgba(232, 197, 71, 0.3)",
                "0 0 20px rgba(232, 197, 71, 0.5), 0 0 40px rgba(232, 197, 71, 0.3), 0 0 60px rgba(232, 197, 71, 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              color: "#E8C547",
              textShadow: "0 0 20px rgba(232, 197, 71, 0.5), 0 0 40px rgba(232, 197, 71, 0.3), 0 0 60px rgba(232, 197, 71, 0.2)",
            }}
          >
            2026
          </motion.span>
        </h1>
      </motion.div>

      {/* Premium Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative rounded-2xl p-[2px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(232, 197, 71, 0.5), rgba(147, 197, 253, 0.3), rgba(196, 181, 253, 0.4), rgba(232, 197, 71, 0.5))",
          backgroundSize: "300% 300%",
          animation: "gradientShift 6s ease infinite",
        }}
      >
        {/* Inner card with glass effect */}
        <div
          className="relative rounded-2xl p-6 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(15, 15, 35, 0.95) 0%, rgba(10, 10, 25, 0.98) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Floating particles inside */}
          <FloatingParticles />

          {/* Ambient glow overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(232, 197, 71, 0.08) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 space-y-5">
            {/* WHEN - Gold/Amber */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
                  border: "1px solid rgba(232, 197, 71, 0.3)",
                  boxShadow: "0 0 20px rgba(232, 197, 71, 0.2), inset 0 0 15px rgba(232, 197, 71, 0.1)",
                }}
              >
                <Calendar
                  className="w-5 h-5"
                  style={{
                    color: "#E8C547",
                    filter: "drop-shadow(0 0 8px rgba(232, 197, 71, 0.8))",
                  }}
                />
              </div>
              <p className="text-white text-[15px]">
                Your <span className="text-gold font-semibold" style={{ textShadow: "0 0 6px rgba(232, 197, 71, 0.4)" }}>2026 Forecast</span> tells you{" "}
                <strong
                  className="font-black text-[16px] text-white"
                  style={{
                    textShadow: "0 0 6px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  when
                </strong>
              </p>
            </motion.div>

            {/* WHERE - Blue/Cyan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.1))",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  boxShadow: "0 0 20px rgba(96, 165, 250, 0.2), inset 0 0 15px rgba(96, 165, 250, 0.1)",
                }}
              >
                <Map
                  className="w-5 h-5"
                  style={{
                    color: "#60A5FA",
                    filter: "drop-shadow(0 0 8px rgba(96, 165, 250, 0.8))",
                  }}
                />
              </div>
              <p className="text-white text-[15px]">
                Your <span style={{ color: "#60A5FA", textShadow: "0 0 6px rgba(96, 165, 250, 0.4)" }} className="font-semibold">Birth Chart</span> tells you{" "}
                <strong
                  className="font-black text-[16px] text-white"
                  style={{
                    textShadow: "0 0 6px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  where
                </strong>
              </p>
            </motion.div>

            {/* WHAT - Purple/Magenta */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.1))",
                  border: "1px solid rgba(167, 139, 250, 0.3)",
                  boxShadow: "0 0 20px rgba(167, 139, 250, 0.2), inset 0 0 15px rgba(167, 139, 250, 0.1)",
                }}
              >
                <Sparkles
                  className="w-5 h-5"
                  style={{
                    color: "#A78BFA",
                    filter: "drop-shadow(0 0 8px rgba(167, 139, 250, 0.8))",
                  }}
                />
              </div>
              <p className="text-white text-[15px]">
                Your <span style={{ color: "#A78BFA", textShadow: "0 0 6px rgba(167, 139, 250, 0.4)" }} className="font-semibold">Daily Guidance</span> tells you{" "}
                <strong
                  className="font-black text-[16px] text-white"
                  style={{
                    textShadow: "0 0 6px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  what
                </strong>
              </p>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  );
}
