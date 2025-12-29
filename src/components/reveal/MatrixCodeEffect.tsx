"use client";

import { useEffect, useRef, memo } from "react";

/**
 * MatrixCodeEffect - NASA mission control aesthetic
 *
 * Creates cascading "code lines" that flow down the screen,
 * using astrological symbols and numbers for the cosmic theme.
 * Rendered via canvas for performance.
 */

// Characters: mix of numbers, astrological symbols, and technical glyphs
const MATRIX_CHARS = [
  // Numbers
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  // Astrological symbols
  "☉", "☽", "☿", "♀", "♂", "♃", "♄", "♅", "♆", "♇",
  // Zodiac
  "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓",
  // Technical
  "°", "′", "″", ":", ".", "-", "+", "×",
  // Greek letters (used in astronomy)
  "α", "β", "γ", "δ", "λ", "μ", "π", "Ω",
];

interface MatrixCodeEffectProps {
  opacity?: number;
  color?: string;
  speed?: number;
}

function MatrixCodeEffect({
  opacity = 0.2,
  color = "#C9A227",
  speed = 1
}: MatrixCodeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to window
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Column settings
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Track Y position of each column's "drop"
    const drops: number[] = Array(columns).fill(0).map(() =>
      Math.random() * -100 // Start at random negative positions for staggered start
    );

    // Track character for each position (for visual variety)
    const chars: string[] = Array(columns).fill("").map(() =>
      MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
    );

    // Animation loop
    let animationId: number;
    const draw = () => {
      // Semi-transparent background for trail effect
      ctx.fillStyle = "rgba(5, 5, 16, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Get character
        const char = chars[i];

        // Calculate opacity based on position (fade at edges)
        const yPos = drops[i] * fontSize;
        const fadeTop = Math.min(1, yPos / 100);
        const fadeBottom = Math.min(1, (canvas.height - yPos) / 200);
        const charOpacity = Math.min(fadeTop, fadeBottom) * opacity;

        // Color with varying brightness
        const brightness = 0.5 + Math.random() * 0.5;
        ctx.fillStyle = `rgba(201, 162, 39, ${charOpacity * brightness})`;

        // Draw character
        ctx.fillText(char, i * fontSize, yPos);

        // Randomly change character
        if (Math.random() > 0.95) {
          chars[i] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        }

        // Move drop down
        drops[i] += speed * (0.5 + Math.random() * 0.5);

        // Reset when off screen (with randomness for organic feel)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -20;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animationId);
    };
  }, [opacity, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 1,
        mixBlendMode: "screen",
      }}
    />
  );
}

// Memo to prevent unnecessary re-renders
export default memo(MatrixCodeEffect);
