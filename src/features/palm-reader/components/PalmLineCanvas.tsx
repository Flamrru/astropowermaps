"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { DetectedLine, PalmLineType } from "../types";

interface PalmLineCanvasProps {
  imageUrl: string;
  lines: DetectedLine[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  animate?: boolean;
}

// Line colors with stronger glow for visibility
const LINE_STYLES: Record<
  PalmLineType,
  { color: string; glow: string; label: string }
> = {
  heart: { color: "#FFD700", glow: "rgba(255,215,0,0.9)", label: "Heart" },
  head: { color: "#A78BFA", glow: "rgba(167,139,250,0.9)", label: "Head" },
  life: { color: "#34D399", glow: "rgba(52,211,153,0.9)", label: "Life" },
  fate: { color: "#F472B6", glow: "rgba(244,114,182,0.9)", label: "Fate" },
  sun: { color: "#FBBF24", glow: "rgba(251,191,36,0.9)", label: "Sun" },
  marriage: { color: "#FB7185", glow: "rgba(251,113,133,0.9)", label: "Marriage" },
};

// Line depth affects visual thickness and glow intensity
const DEPTH_STYLES: Record<string, { lineWidth: number; glowMultiplier: number }> = {
  deep: { lineWidth: 8, glowMultiplier: 1.2 },
  medium: { lineWidth: 6, glowMultiplier: 1.0 },
  faint: { lineWidth: 4, glowMultiplier: 0.7 },
};

// Calculate how object-contain positions the image
interface ImageLayout {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
}

function calculateImageLayout(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ImageLayout {
  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  let displayWidth: number;
  let displayHeight: number;

  if (imageRatio > containerRatio) {
    // Image is wider - fit to width
    displayWidth = containerWidth;
    displayHeight = containerWidth / imageRatio;
  } else {
    // Image is taller - fit to height
    displayHeight = containerHeight;
    displayWidth = containerHeight * imageRatio;
  }

  const offsetX = (containerWidth - displayWidth) / 2;
  const offsetY = (containerHeight - displayHeight) / 2;

  return { offsetX, offsetY, displayWidth, displayHeight };
}

export default function PalmLineCanvas({
  imageUrl,
  lines,
  width = 300,
  height = 400,
  showLabels = true,
  animate = true,
}: PalmLineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);

  // Animate the line drawing
  useEffect(() => {
    if (!animate || !imageLoaded) return;

    let frame: number;
    let start: number | null = null;
    const duration = 2000; // 2 seconds

    const animateProgress = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      if (progress < 1) {
        frame = requestAnimationFrame(animateProgress);
      }
    };

    frame = requestAnimationFrame(animateProgress);

    return () => cancelAnimationFrame(frame);
  }, [animate, imageLoaded]);

  // Draw lines on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !imageLayout) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    console.log("🎨 Drawing lines with layout:", imageLayout);
    console.log("🎨 Lines data:", lines);

    // Draw each line
    lines.forEach((line, index) => {
      const style = LINE_STYLES[line.type];
      if (!style) return;

      // Calculate animation progress for staggered reveal
      const lineProgress = Math.max(
        0,
        Math.min(1, (animationProgress - index * 0.15) / 0.4)
      );

      if (lineProgress <= 0) return;

      // Get points to draw - either from new points format or generate from boundingBox
      let points: [number, number][];

      if (line.points && line.points.length >= 2) {
        // Use actual points from AI detection
        points = line.points;
      } else if (line.boundingBox) {
        // Fallback: generate points from bounding box (legacy)
        points = generatePointsFromBox(line.type, line.boundingBox);
      } else {
        return; // No data to draw
      }

      // Convert normalized points to pixel coordinates within the displayed image area
      // The image is displayed with object-contain, so we need to map to the actual visible area
      const pixelPoints = points.map(([px, py]) => {
        const x = imageLayout.offsetX + px * imageLayout.displayWidth;
        const y = imageLayout.offsetY + py * imageLayout.displayHeight;
        return [x, y] as [number, number];
      });

      console.log(`🎨 ${line.type} line points:`, points, "->", pixelPoints);

      // Calculate how many points to draw based on progress
      const pointsToDraw = Math.ceil(pixelPoints.length * lineProgress);
      const visiblePoints = pixelPoints.slice(0, pointsToDraw);

      if (visiblePoints.length < 2) return;

      // Get depth-based styling (from Roboflow detection confidence)
      const depthStyle = DEPTH_STYLES[line.depth || "medium"] || DEPTH_STYLES.medium;
      const confidenceAlpha = line.confidence ? Math.max(0.6, line.confidence) : 1;

      // First pass: dark outline for contrast
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = depthStyle.lineWidth + 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = lineProgress * 0.6 * confidenceAlpha;

      drawSmoothLine(ctx, visiblePoints);
      ctx.stroke();
      ctx.restore();

      // Second pass: colored line with glow
      ctx.save();
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 20 * depthStyle.glowMultiplier;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = depthStyle.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = lineProgress * confidenceAlpha;

      drawSmoothLine(ctx, visiblePoints);
      ctx.stroke();
      ctx.restore();

      // Third pass: bright center highlight
      ctx.save();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = Math.max(1, depthStyle.lineWidth / 3);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = lineProgress * 0.4 * confidenceAlpha;

      drawSmoothLine(ctx, visiblePoints);
      ctx.stroke();
      ctx.restore();

      // Draw label at the start of the line
      if (showLabels && lineProgress > 0.8 && pixelPoints.length > 0) {
        ctx.save();
        ctx.font = "bold 11px system-ui";
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = (lineProgress - 0.8) * 5;
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 4;

        const [labelX, labelY] = pixelPoints[0];
        ctx.textAlign = "center";
        ctx.fillText(style.label, labelX, labelY - 10);
        ctx.restore();
      }
    });
  }, [lines, width, height, imageLoaded, imageLayout, animationProgress, showLabels]);

  // Handle image load - calculate layout based on natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const layout = calculateImageLayout(width, height, img.naturalWidth, img.naturalHeight);
    console.log("📐 Image loaded:", {
      natural: { w: img.naturalWidth, h: img.naturalHeight },
      container: { w: width, h: height },
      layout,
    });
    setImageLayout(layout);
    setImageLoaded(true);
  };

  // Draw a smooth curved line through points using bezier curves
  function drawSmoothLine(ctx: CanvasRenderingContext2D, points: [number, number][]) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    if (points.length === 2) {
      ctx.lineTo(points[1][0], points[1][1]);
    } else {
      // Use quadratic curves for smooth line
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i][0] + points[i + 1][0]) / 2;
        const yc = (points[i][1] + points[i + 1][1]) / 2;
        ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
      }
      // Last segment
      const last = points[points.length - 1];
      ctx.lineTo(last[0], last[1]);
    }
  }

  // Generate points from bounding box (legacy fallback)
  function generatePointsFromBox(type: PalmLineType, box: { x: number; y: number; width: number; height: number }): [number, number][] {
    const { x, y, width: w, height: h } = box;

    if (type === "life") {
      // Curved arc around thumb
      return [
        [x + w * 0.8, y],
        [x + w * 0.5, y + h * 0.2],
        [x + w * 0.2, y + h * 0.4],
        [x, y + h * 0.6],
        [x + w * 0.1, y + h * 0.8],
        [x + w * 0.3, y + h],
      ];
    } else if (type === "heart" || type === "head") {
      // Horizontal with slight curve
      const curveOffset = type === "heart" ? -0.03 : 0.03;
      return [
        [x, y + h / 2],
        [x + w * 0.25, y + h / 2 + curveOffset],
        [x + w * 0.5, y + h / 2 + curveOffset * 2],
        [x + w * 0.75, y + h / 2 + curveOffset],
        [x + w, y + h / 2],
      ];
    } else if (type === "fate") {
      // Vertical line
      return [
        [x + w / 2, y + h],
        [x + w / 2, y + h * 0.5],
        [x + w / 2, y],
      ];
    }
    // Default
    return [
      [x, y + h / 2],
      [x + w, y + h / 2],
    ];
  }

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width,
        height,
        boxShadow: "0 0 40px rgba(201,162,39,0.2), 0 20px 60px rgba(0,0,0,0.4)",
      }}
    >
      {/* Palm image - using object-contain so coordinates align */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Your palm"
        className="w-full h-full object-contain bg-cosmic-black"
        onLoad={handleImageLoad}
      />

      {/* Canvas overlay for lines */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(5,5,16,0.4) 100%)",
        }}
      />

      {/* Decorative corner accents */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <motion.g
          stroke="rgba(201,162,39,0.4)"
          strokeWidth="1.5"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Top left */}
          <path d={`M 15 30 L 15 15 L 30 15`} />
          {/* Top right */}
          <path d={`M ${width - 15} 30 L ${width - 15} 15 L ${width - 30} 15`} />
          {/* Bottom left */}
          <path d={`M 15 ${height - 30} L 15 ${height - 15} L 30 ${height - 15}`} />
          {/* Bottom right */}
          <path
            d={`M ${width - 15} ${height - 30} L ${width - 15} ${height - 15} L ${width - 30} ${height - 15}`}
          />
        </motion.g>
      </svg>

      {/* Legend */}
      {showLabels && (
        <motion.div
          className="absolute bottom-3 left-3 right-3 flex justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          {lines.map((line) => {
            const style = LINE_STYLES[line.type];
            if (!style) return null;
            return (
              <div key={line.type} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: style.color,
                    boxShadow: `0 0 6px ${style.glow}`,
                  }}
                />
                <span className="text-[10px] text-white/60">{style.label}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
