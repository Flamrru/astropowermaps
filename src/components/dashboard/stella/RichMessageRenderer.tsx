"use client";

import React from "react";
import GlowText from "./message-parts/GlowText";
import PlanetBadge from "./message-parts/PlanetBadge";
import DateBadge from "./message-parts/DateBadge";
import TransitBadge from "./message-parts/TransitBadge";

/**
 * RichMessageRenderer
 *
 * Parses Stella's message text and transforms it into rich components:
 * - **bold** → GlowText with golden glow
 * - Planet names → PlanetBadge with symbol
 * - Dates (Month Year) → DateBadge pill
 * - Transit names → TransitBadge
 */

interface RichMessageRendererProps {
  content: string;
}

// Pattern definitions - ORDER MATTERS (more specific first)
const PATTERNS = {
  // Transit names (must be before planets, as "Saturn Return" contains "Saturn")
  transit: /\b(Saturn Return|Jupiter Return|Chiron Return|Uranus conjunct|Neptune conjunct|Pluto conjunct)\b/gi,
  // Dates: Month Year (e.g., "June 2031", "January 2025")
  date: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
  // Bold markdown
  bold: /\*\*([^*]+)\*\*/g,
  // Planet names (standalone, case-insensitive)
  planet: /\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Chiron)\b/gi,
};

// Placeholder tokens to prevent double-matching
const TOKENS = {
  transit: "___TRANSIT_",
  date: "___DATE_",
  bold: "___BOLD_",
  planet: "___PLANET_",
};

export default function RichMessageRenderer({ content }: RichMessageRendererProps) {
  // Store matched elements
  const matches: { token: string; element: React.ReactNode }[] = [];
  let processedContent = content;
  let tokenIndex = 0;

  // Helper to create unique token
  const createToken = (prefix: string) => `${prefix}${tokenIndex++}___`;

  // 1. Extract transits first (most specific)
  processedContent = processedContent.replace(PATTERNS.transit, (match) => {
    const token = createToken(TOKENS.transit);
    matches.push({ token, element: <TransitBadge key={token} transit={match} /> });
    return token;
  });

  // 2. Extract dates
  processedContent = processedContent.replace(PATTERNS.date, (match) => {
    const token = createToken(TOKENS.date);
    matches.push({ token, element: <DateBadge key={token}>{match}</DateBadge> });
    return token;
  });

  // 3. Extract bold text
  processedContent = processedContent.replace(PATTERNS.bold, (_, text) => {
    const token = createToken(TOKENS.bold);
    matches.push({ token, element: <GlowText key={token}>{text}</GlowText> });
    return token;
  });

  // 4. Extract planets (least specific, after transits)
  processedContent = processedContent.replace(PATTERNS.planet, (match) => {
    const token = createToken(TOKENS.planet);
    matches.push({ token, element: <PlanetBadge key={token} planet={match} /> });
    return token;
  });

  // 5. Split by tokens and rebuild with React elements
  // Create regex that matches any of our tokens
  const tokenPattern = /(___(TRANSIT|DATE|BOLD|PLANET)_\d+___)/g;
  const parts = processedContent.split(tokenPattern);

  const result: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Skip the capture group matches (TRANSIT, DATE, etc.)
    if (["TRANSIT", "DATE", "BOLD", "PLANET"].includes(part)) {
      continue;
    }

    // Check if this part is a token
    const matchedElement = matches.find((m) => m.token === part);

    if (matchedElement) {
      result.push(matchedElement.element);
    } else if (part) {
      // Regular text - preserve whitespace and line breaks
      result.push(<span key={`text-${i}`}>{part}</span>);
    }
  }

  return <>{result}</>;
}
