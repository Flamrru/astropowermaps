"use client";

import { motion } from "framer-motion";
import { COPY } from "@/content/copy";
import { Check, Share2, Mail, Sparkles, Map, ArrowRight } from "lucide-react";
import { useQuiz } from "@/lib/quiz-state";
import GoldButton from "@/components/GoldButton";

// Animated star burst component
function StarBurst() {
  const stars = Array.from({ length: 12 }, (_, i) => ({
    angle: (i * 30) * (Math.PI / 180),
    delay: i * 0.05,
    size: i % 3 === 0 ? 3 : 2,
    distance: i % 2 === 0 ? 80 : 60,
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0.6],
            x: Math.cos(star.angle) * star.distance,
            y: Math.sin(star.angle) * star.distance,
          }}
          transition={{
            duration: 0.8,
            delay: 0.3 + star.delay,
            ease: "easeOut",
          }}
          className="absolute"
          style={{
            width: star.size,
            height: star.size,
            background: i % 3 === 0
              ? 'radial-gradient(circle, #E8C547 0%, rgba(232, 197, 71, 0) 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            boxShadow: i % 3 === 0
              ? '0 0 8px rgba(232, 197, 71, 0.8)'
              : '0 0 6px rgba(255,255,255,0.6)',
          }}
        />
      ))}
    </div>
  );
}

// Floating particles for ambient effect
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [10, -20, -40],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
          className="absolute"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: i % 4 === 0
              ? 'rgba(232, 197, 71, 0.8)'
              : 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            boxShadow: i % 4 === 0
              ? '0 0 4px rgba(232, 197, 71, 0.6)'
              : '0 0 3px rgba(255, 255, 255, 0.4)',
          }}
        />
      ))}
    </div>
  );
}

export default function Screen10Confirmation() {
  const { state } = useQuiz();

  const handleSeeChart = () => {
    // Navigate to reveal flow with session ID
    window.location.href = `/reveal?sid=${state.session_id}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: "2026 Power Map",
      text: "Discover your 3 power months and destinations for 2026!",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert("Link copied to clipboard!");
      }
    } catch {
      // Share cancelled or failed - no action needed
    }
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Floating particles background */}
      <FloatingParticles />

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-6">
        <div className="max-w-md mx-auto w-full">
          {/* Success icon with star burst */}
          <div className="relative flex justify-center mb-6">
            <StarBurst />

            {/* Glowing orb behind icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
              className="relative"
            >
              {/* Outer glow rings */}
              <div
                className="absolute -inset-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
              />
              <div
                className="absolute -inset-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Main icon circle */}
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #8B6914 100%)',
                  boxShadow: '0 0 30px rgba(201, 162, 39, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
                }}
              >
                <Check className="w-10 h-10 text-[#1a1400]" strokeWidth={3} />
              </div>
            </motion.div>
          </div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-6"
          >
            <h2 className="heading-display text-[34px] md:text-[40px] text-white font-bold mb-2">
              You&apos;re <span className="text-gold-glow">In</span>.
            </h2>
            <p className="text-[15px] text-white/60">
              Your spot on the waitlist is confirmed
            </p>
          </motion.div>

          {/* What happens next - dark glass card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded-2xl p-5 mb-5"
            style={{
              background: 'rgba(10, 10, 20, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(201,162,39,0.25)',
            }}
          >
            {/* Card header */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-[13px] text-gold uppercase tracking-wider font-medium">
                What happens next
              </span>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: "Check your inbox",
                  desc: "We'll email you the moment 2026 Power Map goes live",
                },
                {
                  icon: Sparkles,
                  title: "Enter your birth details",
                  desc: "Date, time, and place of birth for your personalized map",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(232,197,71,0.2) 0%, rgba(201,162,39,0.1) 100%)',
                      border: '1px solid rgba(201,162,39,0.3)',
                    }}
                  >
                    <step.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[14px] text-white font-medium mb-0.5">
                      {step.title}
                    </p>
                    <p className="text-[13px] text-white/50 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* See My Birth Chart CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-6"
          >
            <GoldButton onClick={handleSeeChart}>
              <span className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                See My Birth Chart
                <ArrowRight className="w-4 h-4" />
              </span>
            </GoldButton>
          </motion.div>

          {/* Share section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p className="text-center text-[13px] text-white/40 mb-3">
              Know someone who needs their map?
            </p>
            <button
              onClick={handleShare}
              className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(201, 162, 39, 0.1)',
                border: '1px solid rgba(201, 162, 39, 0.3)',
                boxShadow: '0 0 20px rgba(201, 162, 39, 0.1)',
              }}
            >
              <Share2 className="w-5 h-5 text-gold" />
              <span className="text-[15px] text-gold font-medium">
                {COPY.screen10.shareText}
              </span>
            </button>
          </motion.div>

          {/* Bottom flourish */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center justify-center gap-3 mt-8"
          >
            <div
              className="w-12 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.4) 100%)',
              }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'rgba(232, 197, 71, 0.6)',
                boxShadow: '0 0 8px rgba(232, 197, 71, 0.4)',
              }}
            />
            <div
              className="w-12 h-px"
              style={{
                background: 'linear-gradient(90deg, rgba(201,162,39,0.4) 0%, transparent 100%)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
