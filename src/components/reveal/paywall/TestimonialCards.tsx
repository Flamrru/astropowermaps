"use client";

import { motion } from "framer-motion";

interface Testimonial {
  quote: string;
  author: string;
  location: string;
}

// PRD-specified testimonials - exact copy
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Booked a trip to my #1 power city on a whim. Met my now-business partner in a hotel lobby. I'm not saying it's magic — but I'm not saying it isn't.",
    author: "Sarah M.",
    location: "London",
  },
  {
    quote:
      "My 'worst month' was March. I had already planned to launch then. Pushed it to May — my #2 power month. Best decision I made all year.",
    author: "James T.",
    location: "Toronto",
  },
  {
    quote:
      "Honestly was skeptical. But my power city was Lisbon — a place I'd been thinking about for years. Finally went. Came back with so much clarity. Coincidence? Maybe. But I'm planning 2026 around this now.",
    author: "Emma K.",
    location: "Sydney",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 text-gold text-sm mb-3">
      {[...Array(5)].map((_, i) => (
        <span key={i}>⭐</span>
      ))}
    </div>
  );
}

export default function TestimonialCards() {
  return (
    <section className="py-8 px-5">
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-white/70 text-lg font-medium mb-6"
      >
        What people are saying
      </motion.h3>

      <div className="space-y-4 max-w-md mx-auto">
        {TESTIMONIALS.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <StarRating />
            <p className="text-white/70 text-[14px] leading-relaxed mb-4 italic">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="text-white/50 text-[13px]">
              — {item.author}, {item.location}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
