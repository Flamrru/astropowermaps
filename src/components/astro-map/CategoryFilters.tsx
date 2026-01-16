"use client";

import { motion } from "framer-motion";
import { PlanetId } from "@/lib/astro/types";
import { PLANET_ORDER } from "@/lib/astro/planets";
import { useTrack } from "@/lib/hooks/useTrack";

// ============================================
// Celestial Filter Icons - Tarot-inspired SVGs
// ============================================

type FilterCategoryId = "all" | "love" | "career" | "adventure" | "home";

interface FilterIconProps {
  category: FilterCategoryId;
  color: string;
  size?: number;
  isActive?: boolean;
}

function FilterCategoryIcon({ category, color, size = 18, isActive = false }: FilterIconProps) {
  const strokeWidth = 1.5;
  const glowFilter = isActive ? `drop-shadow(0 0 4px ${color})` : "none";

  const iconStyle = {
    filter: glowFilter,
    transition: "filter 0.3s ease",
  };

  switch (category) {
    // All Lines: Orbital rings / constellation - all celestial influences
    case "all":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
          {/* Central star */}
          <circle
            cx="12"
            cy="12"
            r="2"
            fill={color}
            opacity={isActive ? 1 : 0.7}
          />
          {/* Orbital ring 1 */}
          <ellipse
            cx="12"
            cy="12"
            rx="8"
            ry="4"
            stroke={color}
            strokeWidth={strokeWidth}
            transform="rotate(-30 12 12)"
            opacity={0.8}
          />
          {/* Orbital ring 2 */}
          <ellipse
            cx="12"
            cy="12"
            rx="8"
            ry="4"
            stroke={color}
            strokeWidth={strokeWidth}
            transform="rotate(30 12 12)"
            opacity={0.8}
          />
          {/* Small orbital dots */}
          <circle cx="5" cy="8" r="1" fill={color} opacity={0.5} />
          <circle cx="19" cy="16" r="1" fill={color} opacity={0.5} />
          <circle cx="12" cy="4" r="1" fill={color} opacity={0.5} />
        </svg>
      );

    // Love: Twin crescent moons forming a heart - Venus energy
    case "love":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
          <path
            d="M8 4C5.5 6 4 9 4 12C4 15 5.5 18 8 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M16 4C18.5 6 20 9 20 12C20 15 18.5 18 16 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M8 20Q12 24 16 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="1.5" fill={color} opacity={isActive ? 1 : 0.6} />
        </svg>
      );

    // Career: North Star with ascending trajectory
    case "career":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
          <path
            d="M12 3L13.5 9.5L20 11L13.5 12.5L12 19L10.5 12.5L4 11L10.5 9.5L12 3Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill={isActive ? `${color}20` : "none"}
          />
          <path d="M12 3L12 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <circle cx="6" cy="6" r="1" fill={color} opacity={0.4} />
          <circle cx="18" cy="6" r="1" fill={color} opacity={0.4} />
          <path d="M7 21L17 21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.5} />
        </svg>
      );

    // Adventure: Shooting star / comet - exploration and discovery
    case "adventure":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
          {/* Shooting star head */}
          <circle
            cx="18"
            cy="6"
            r="3"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={isActive ? `${color}30` : "none"}
          />
          {/* Comet tail - three lines */}
          <path
            d="M15 9L4 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M16 10L7 19"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.6}
          />
          <path
            d="M14 8L5 17"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* Sparkle points around head */}
          <circle cx="21" cy="4" r="0.8" fill={color} opacity={0.5} />
          <circle cx="20" cy="9" r="0.8" fill={color} opacity={0.4} />
        </svg>
      );

    // Home: Sanctuary with crescent moon
    case "home":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
          <path
            d="M12 3L4 10L4 20L20 20L20 10L12 3Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill={isActive ? `${color}10` : "none"}
          />
          <path
            d="M10 20L10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15L14 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M11 8C11 8 10 7 10 6C10 6 11 6.5 12 6.5C12.5 6.5 13 6.3 13.5 6C13 7 12 8 11 8Z"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
            fill={color}
            opacity={isActive ? 1 : 0.7}
          />
        </svg>
      );

    default:
      return null;
  }
}

/**
 * Category definitions for filtering planetary lines by life themes.
 * Each category maps to specific planets that influence that area of life.
 */
interface Category {
  id: FilterCategoryId;
  label: string;
  planets: PlanetId[];
  description: string;
}

const CATEGORIES: Category[] = [
  {
    id: "all",
    label: "All Lines",
    planets: [...PLANET_ORDER],
    description: "Show all planetary lines",
  },
  {
    id: "love",
    label: "Love",
    planets: ["venus", "moon"],
    description: "Romance & relationships",
  },
  {
    id: "career",
    label: "Career",
    planets: ["sun", "jupiter", "saturn"],
    description: "Success & recognition",
  },
  {
    id: "adventure",
    label: "Adventure",
    planets: ["mercury", "uranus"],
    description: "Travel & discovery",
  },
  {
    id: "home",
    label: "Home",
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
  const track = useTrack();

  const handleCategoryChange = (categoryId: string, planets: PlanetId[]) => {
    // Track category filter change
    track("category_filter", { category: categoryId, planets }, "map");
    onCategoryChange(categoryId, planets);
  };

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
              onClick={() => handleCategoryChange(category.id, category.planets)}
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
              {/* Celestial Icon */}
              <FilterCategoryIcon
                category={category.id}
                color={isActive ? "#E8C547" : "rgba(255, 255, 255, 0.7)"}
                size={18}
                isActive={isActive}
              />

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
