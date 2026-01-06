"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PlanetId } from "@/lib/astro/types";
import { PLANET_ORDER } from "@/lib/astro/planets";

/**
 * VerticalCategoryPills
 *
 * A mystical vertical navigation panel for filtering planetary lines by life themes.
 * Designed as a "Celestial Navigation Totem" - an ancient star-gazing instrument
 * carved from starlight with sacred geometry dividers.
 */

// ============================================
// Category Configuration
// ============================================

type CategoryId = "all" | "love" | "career" | "growth" | "home";

interface Category {
  id: CategoryId;
  label: string;
  planets: PlanetId[];
  color: string;
  glow: string;
}

const CATEGORIES: Category[] = [
  {
    id: "all",
    label: "All",
    planets: [...PLANET_ORDER],
    color: "#E8C547",
    glow: "rgba(232, 197, 71, 0.5)",
  },
  {
    id: "love",
    label: "Love",
    planets: ["venus", "moon"],
    color: "#E8A4C9",
    glow: "rgba(232, 164, 201, 0.5)",
  },
  {
    id: "career",
    label: "Career",
    planets: ["sun", "jupiter", "saturn"],
    color: "#E8C547",
    glow: "rgba(232, 197, 71, 0.5)",
  },
  {
    id: "growth",
    label: "Growth",
    planets: ["mercury", "uranus", "jupiter"],
    color: "#9B7ED9",
    glow: "rgba(155, 126, 217, 0.5)",
  },
  {
    id: "home",
    label: "Home",
    planets: ["moon"],
    color: "#C4C4C4",
    glow: "rgba(196, 196, 196, 0.4)",
  },
];

// ============================================
// Celestial Icons (inline for encapsulation)
// ============================================

interface IconProps {
  color: string;
  size?: number;
  isActive?: boolean;
}

function AllIcon({ color, size = 20, isActive }: IconProps) {
  const glowFilter = isActive ? `drop-shadow(0 0 6px ${color})` : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: glowFilter }}>
      <circle cx="12" cy="12" r="2.5" fill={color} opacity={isActive ? 1 : 0.7} />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" stroke={color} strokeWidth={1.5} transform="rotate(-25 12 12)" opacity={0.7} />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" stroke={color} strokeWidth={1.5} transform="rotate(25 12 12)" opacity={0.7} />
      <circle cx="5" cy="9" r="1" fill={color} opacity={0.4} />
      <circle cx="19" cy="15" r="1" fill={color} opacity={0.4} />
    </svg>
  );
}

function LoveIcon({ color, size = 20, isActive }: IconProps) {
  const glowFilter = isActive ? `drop-shadow(0 0 6px ${color})` : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: glowFilter }}>
      <path d="M8 4C5.5 6 4 9 4 12C4 15 5.5 18 8 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M16 4C18.5 6 20 9 20 12C20 15 18.5 18 16 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M8 20Q12 24 16 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill={color} opacity={isActive ? 1 : 0.6} />
    </svg>
  );
}

function CareerIcon({ color, size = 20, isActive }: IconProps) {
  const glowFilter = isActive ? `drop-shadow(0 0 6px ${color})` : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: glowFilter }}>
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={isActive ? `${color}20` : "none"} />
      <path d="M12 2L12 0.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="6" cy="5" r="1" fill={color} opacity={0.4} />
      <circle cx="18" cy="5" r="1" fill={color} opacity={0.4} />
      <path d="M7 22L17 22" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    </svg>
  );
}

function GrowthIcon({ color, size = 20, isActive }: IconProps) {
  const glowFilter = isActive ? `drop-shadow(0 0 6px ${color})` : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: glowFilter }}>
      {/* Lotus flower - symbol of growth and spiritual expansion */}
      <path d="M12 20C12 20 8 16 8 12C8 8 12 4 12 4C12 4 16 8 16 12C16 16 12 20 12 20Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill={isActive ? `${color}15` : "none"} />
      <path d="M12 20C12 20 6 14 4 12C6 10 12 4 12 4" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
      <path d="M12 20C12 20 18 14 20 12C18 10 12 4 12 4" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
      <circle cx="12" cy="11" r="2" fill={color} opacity={isActive ? 0.8 : 0.5} />
    </svg>
  );
}

function HomeIcon({ color, size = 20, isActive }: IconProps) {
  const glowFilter = isActive ? `drop-shadow(0 0 6px ${color})` : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: glowFilter }}>
      <path d="M12 3L4 10L4 20L20 20L20 10L12 3Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={isActive ? `${color}10` : "none"} />
      <path d="M10 20L10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15L14 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Crescent moon in the roof */}
      <path d="M11 7.5C11 7.5 10 6.5 10 5.5C10 5.5 11 6 12 6C12.5 6 13 5.8 13.5 5.5C13 6.5 12 7.5 11 7.5Z" stroke={color} strokeWidth={1} strokeLinecap="round" fill={color} opacity={isActive ? 1 : 0.7} />
    </svg>
  );
}

const CategoryIcon: Record<CategoryId, React.FC<IconProps>> = {
  all: AllIcon,
  love: LoveIcon,
  career: CareerIcon,
  growth: GrowthIcon,
  home: HomeIcon,
};

// ============================================
// Main Component
// ============================================

interface VerticalCategoryPillsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string, planets: PlanetId[]) => void;
}

export default function VerticalCategoryPills({
  activeCategory,
  onCategoryChange,
}: VerticalCategoryPillsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed left-3 top-1/2 -translate-y-1/2 z-20 md:left-4"
    >
      {/* Outer container - the "totem" frame */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(15, 15, 35, 0.9) 0%, rgba(10, 10, 25, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Ethereal edge glow - left side accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{
            background: `linear-gradient(180deg,
              transparent 0%,
              var(--element-primary, #E8C547)40 20%,
              var(--element-primary, #E8C547)60 50%,
              var(--element-primary, #E8C547)40 80%,
              transparent 100%
            )`,
          }}
        />

        {/* Category pills */}
        <div className="relative py-2">
          {CATEGORIES.map((category, index) => {
            const isActive = activeCategory === category.id;
            const Icon = CategoryIcon[category.id];
            const isFirst = index === 0;
            const isLast = index === CATEGORIES.length - 1;

            return (
              <div key={category.id}>
                {/* Sacred geometry divider (between pills) */}
                {!isFirst && (
                  <div className="flex items-center justify-center py-0.5 px-3">
                    <div
                      className="h-px flex-1"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                      }}
                    />
                    <div
                      className="w-1 h-1 rounded-full mx-2"
                      style={{
                        background: "rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 0 4px rgba(255, 255, 255, 0.1)",
                      }}
                    />
                    <div
                      className="h-px flex-1"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                      }}
                    />
                  </div>
                )}

                {/* Category button */}
                <motion.button
                  onClick={() => onCategoryChange(category.id, category.planets)}
                  className={`
                    relative w-full flex flex-col items-center gap-1.5
                    px-4 py-3 transition-colors
                    ${isFirst ? "pt-3" : ""}
                    ${isLast ? "pb-3" : ""}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active glow background */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute inset-1 rounded-xl"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          background: `linear-gradient(135deg, ${category.color}18 0%, ${category.color}08 100%)`,
                          boxShadow: `
                            0 0 20px ${category.glow},
                            inset 0 0 15px ${category.color}10
                          `,
                          border: `1px solid ${category.color}30`,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon container */}
                  <motion.div
                    className="relative z-10"
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      color={isActive ? category.color : "rgba(255, 255, 255, 0.5)"}
                      size={22}
                      isActive={isActive}
                    />
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    className="relative z-10 text-[10px] font-medium tracking-wider uppercase"
                    animate={{
                      opacity: isActive ? 1 : 0.5,
                    }}
                    style={{
                      color: isActive ? category.color : "rgba(255, 255, 255, 0.6)",
                      textShadow: isActive ? `0 0 10px ${category.glow}` : "none",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {category.label}
                  </motion.span>

                  {/* Active indicator dot */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute -right-0.5 top-1/2 -translate-y-1/2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="w-1 h-4 rounded-full"
                          style={{
                            background: `linear-gradient(180deg, transparent 0%, ${category.color} 50%, transparent 100%)`,
                            boxShadow: `0 0 8px ${category.glow}`,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Subtle floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-white/20"
              style={{
                left: `${20 + (i * 20)}%`,
                top: `${15 + (i * 22)}%`,
              }}
              animate={{
                opacity: [0.1, 0.4, 0.1],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Export categories for use in parent components
export { CATEGORIES };
export type { CategoryId, Category };
