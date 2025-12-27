"use client";

import { motion } from "framer-motion";
import { PlanetId } from "@/lib/astro/types";
import { PLANET_ORDER } from "@/lib/astro/planets";

/**
 * Category definitions for filtering planetary lines by life themes.
 * Each category maps to specific planets that influence that area of life.
 */
interface Category {
  id: string;
  label: string;
  icon: string;
  planets: PlanetId[];
  description: string;
}

const CATEGORIES: Category[] = [
  {
    id: "all",
    label: "All Lines",
    icon: "✨",
    planets: [...PLANET_ORDER],
    description: "Show all planetary lines",
  },
  {
    id: "love",
    label: "Love",
    icon: "💕",
    planets: ["venus", "moon"],
    description: "Romance & relationships",
  },
  {
    id: "career",
    label: "Career",
    icon: "💼",
    planets: ["sun", "jupiter", "saturn"],
    description: "Success & recognition",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: "🧭",
    planets: ["mercury", "uranus"],
    description: "Travel & discovery",
  },
  {
    id: "home",
    label: "Home",
    icon: "🏠",
    planets: ["moon"],
    description: "Roots & family",
  },
];

interface CategoryFiltersProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string, planets: PlanetId[]) => void;
}

/**
 * Horizontal category filter buttons for quick planet filtering.
 * Allows users to filter the map by life themes like Love, Career, etc.
 */
export default function CategoryFilters({
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
    >
      {/* Scrollable container for mobile */}
      <div
        className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide max-w-[95vw]"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {CATEGORIES.map((category, index) => {
          const isActive = activeCategory === category.id;

          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id, category.planets)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(232, 197, 71, 0.15) 100%)"
                  : "rgba(10, 10, 30, 0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: isActive
                  ? "1px solid rgba(201, 162, 39, 0.5)"
                  : "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: isActive
                  ? "0 0 20px rgba(201, 162, 39, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                  : "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
              title={category.description}
            >
              {/* Icon */}
              <span className="text-lg">{category.icon}</span>

              {/* Label */}
              <span
                className="text-sm font-medium"
                style={{
                  color: isActive ? "#E8C547" : "rgba(255, 255, 255, 0.85)",
                }}
              >
                {category.label}
              </span>

              {/* Active indicator glow */}
              {isActive && (
                <motion.div
                  layoutId="categoryActiveGlow"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle at center, rgba(201, 162, 39, 0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Gradient fade on edges for scroll indication */}
      <div
        className="absolute top-0 left-0 h-full w-8 pointer-events-none md:hidden"
        style={{
          background: "linear-gradient(to right, rgba(5, 5, 16, 0.8), transparent)",
        }}
      />
      <div
        className="absolute top-0 right-0 h-full w-8 pointer-events-none md:hidden"
        style={{
          background: "linear-gradient(to left, rgba(5, 5, 16, 0.8), transparent)",
        }}
      />
    </motion.div>
  );
}

// Export categories for use in other components
export { CATEGORIES };
export type { Category };
