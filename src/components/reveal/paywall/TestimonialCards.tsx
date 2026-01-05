"use client";

import { motion } from "framer-motion";

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  initials: string;
  color: string;
}

// V2.5 Copy - testimonials with avatar colors
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I was about to send a resignation email on a 19-score day. Stella told me to wait. Sent it on a 78-score day instead — got a counteroffer I didn't expect. Same email. Different day. Different outcome.",
    author: "Marcus L.",
    location: "Chicago",
    initials: "ML",
    color: "from-blue-500 to-blue-700",
  },
  {
    quote:
      "Booked a trip to my #1 power city on a whim. Met my now-business partner in a hotel lobby. I'm not saying it's magic — but I'm not saying it isn't.",
    author: "Sarah M.",
    location: "London",
    initials: "SM",
    color: "from-pink-500 to-rose-600",
  },
  {
    quote:
      "My 'worst month' was March. I had already planned to launch then. Pushed it to May — my #2 power month. Best decision I made all year.",
    author: "James T.",
    location: "Toronto",
    initials: "JT",
    color: "from-emerald-500 to-teal-600",
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

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white text-sm font-semibold">{initials}</span>
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
            <div className="flex items-center gap-3">
              <Avatar initials={item.initials} color={item.color} />
              <p className="text-white/50 text-[13px]">
                {item.author}, {item.location}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
