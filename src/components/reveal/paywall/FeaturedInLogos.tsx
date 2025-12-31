"use client";

import { motion } from "framer-motion";

// Publication logos rendered as styled text
const PUBLICATIONS = [
  { name: "Cosmopolitan", style: "font-serif italic" },
  { name: "Well+Good", style: "font-sans font-semibold" },
  { name: "Refinery29", style: "font-sans font-bold" },
  { name: "mindbodygreen", style: "font-sans font-light tracking-wide" },
  { name: "The Cut", style: "font-serif" },
  { name: "Bustle", style: "font-sans font-medium tracking-wider" },
];

export default function FeaturedInLogos() {
  return (
    <section className="py-8 px-5">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-white/40 text-xs uppercase tracking-widest mb-6"
      >
        As featured in
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4"
      >
        {PUBLICATIONS.map((pub, index) => (
          <motion.span
            key={pub.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`text-white/30 text-[13px] ${pub.style}`}
          >
            {pub.name}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
}
