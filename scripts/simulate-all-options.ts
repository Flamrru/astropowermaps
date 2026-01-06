/**
 * Comprehensive Scoring Simulation
 *
 * Tests multiple astrologically-meaningful approaches across 5 months
 * Run with: npx tsx scripts/simulate-all-options.ts
 */

import { calculateNatalPositions } from "../src/lib/astro/calculations";
import { get2026Transits, findAspectsOnDate } from "../src/lib/astro/transit-calculations";
import { ASPECTS, PlanetaryAspect } from "../src/lib/astro/transit-types";
import { DEV_BIRTH_DATA } from "../src/lib/mock-data";
import { PlanetId } from "../src/lib/astro/types";

const natalPositions = calculateNatalPositions(DEV_BIRTH_DATA);
const transitCache = get2026Transits();

// Months to analyze (spread across year)
const months = [
  { name: "January", num: 1, days: 31 },
  { name: "April", num: 4, days: 30 },
  { name: "August", num: 8, days: 31 },
  { name: "September", num: 9, days: 30 },
  { name: "November", num: 11, days: 30 },
];

// Planet categories for weighting
const PERSONAL_PLANETS: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars"];
const SOCIAL_PLANETS: PlanetId[] = ["jupiter", "saturn"];
const OUTER_PLANETS: PlanetId[] = ["uranus", "neptune", "pluto"];
const LUMINARIES: PlanetId[] = ["sun", "moon"];

// Major aspects (Ptolemaic)
const MAJOR_ASPECTS = ["conjunction", "opposition", "trine", "square", "sextile"];

// Harmonious aspects
const HARMONIOUS_ASPECTS = ["conjunction", "trine", "sextile"];
const CHALLENGING_ASPECTS = ["opposition", "square"];

// ============================================
// SCORING VARIATIONS
// ============================================

interface DayRawData {
  date: string;
  month: string;
  day: number;
  aspects: PlanetaryAspect[];
}

// Gather raw data for all days
const allDays: DayRawData[] = [];

for (const month of months) {
  for (let day = 1; day <= month.days; day++) {
    const date = `2026-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const aspects = findAspectsOnDate(natalPositions, date, transitCache);
    allDays.push({ date, month: month.name, day, aspects });
  }
}

// Base calculation helpers
function getNatureModifier(aspectType: string): number {
  const nature = ASPECTS[aspectType as keyof typeof ASPECTS]?.nature;
  switch (nature) {
    case "harmonious": return 1.0;
    case "major": return 0.9;
    case "awareness": return 0.7;
    case "challenging": return 0.5;
    case "minor-harmonious": return 0.6;
    case "adjustment": return 0.4;
    case "minor-challenging": return 0.3;
    default: return 0.5;
  }
}

function getOrbMultiplier(aspect: PlanetaryAspect): number {
  const maxOrb = ASPECTS[aspect.aspectType].orb;
  const orbTightness = Math.max(0, 1 - aspect.orb / maxOrb);
  return Math.pow(orbTightness, 1.5);
}

// ============================================
// VARIATION A: Current System (baseline)
// ============================================
function scoreVariationA(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;
  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const natureModifier = getNatureModifier(aspect.aspectType);
    totalPower += basePower * orbMultiplier * applyingBonus * natureModifier;
  }
  return Math.round((totalPower / (totalPower + 50)) * 100);
}

// ============================================
// VARIATION B: Tight Aspects Only (orb < 3°)
// ============================================
function scoreVariationB(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;
  for (const aspect of aspects) {
    if (aspect.orb > 3) continue; // Skip loose aspects

    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const natureModifier = getNatureModifier(aspect.aspectType);
    totalPower += basePower * orbMultiplier * applyingBonus * natureModifier;
  }
  // Lower divisor since fewer aspects count
  return Math.round((totalPower / (totalPower + 20)) * 100);
}

// ============================================
// VARIATION C: Personal Planet Focus
// Weight: Luminaries 2x, Personal 1.5x, Social 1x, Outer 0.5x
// ============================================
function scoreVariationC(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;
  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const natureModifier = getNatureModifier(aspect.aspectType);

    // Planet weight based on transit planet
    let planetWeight = 1.0;
    if (LUMINARIES.includes(aspect.transitPlanet)) {
      planetWeight = 2.0;
    } else if (PERSONAL_PLANETS.includes(aspect.transitPlanet)) {
      planetWeight = 1.5;
    } else if (SOCIAL_PLANETS.includes(aspect.transitPlanet)) {
      planetWeight = 1.0;
    } else if (OUTER_PLANETS.includes(aspect.transitPlanet)) {
      planetWeight = 0.5;
    }

    // Also weight natal planet (what's being activated)
    let natalWeight = 1.0;
    if (LUMINARIES.includes(aspect.natalPlanet)) {
      natalWeight = 1.5;
    } else if (PERSONAL_PLANETS.includes(aspect.natalPlanet)) {
      natalWeight = 1.2;
    } else if (OUTER_PLANETS.includes(aspect.natalPlanet)) {
      natalWeight = 0.7;
    }

    totalPower += basePower * orbMultiplier * applyingBonus * natureModifier * planetWeight * natalWeight;
  }
  return Math.round((totalPower / (totalPower + 60)) * 100);
}

// ============================================
// VARIATION D: Major Aspects Only (Ptolemaic)
// ============================================
function scoreVariationD(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;
  for (const aspect of aspects) {
    if (!MAJOR_ASPECTS.includes(aspect.aspectType)) continue;

    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const natureModifier = getNatureModifier(aspect.aspectType);
    totalPower += basePower * orbMultiplier * applyingBonus * natureModifier;
  }
  return Math.round((totalPower / (totalPower + 35)) * 100);
}

// ============================================
// VARIATION E: Exactness Bonus
// Exponential bonus for tight orbs
// ============================================
function scoreVariationE(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;
  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const natureModifier = getNatureModifier(aspect.aspectType);

    // Exactness bonus (exponential for tight orbs)
    let exactnessBonus = 1.0;
    if (aspect.orb < 0.5) exactnessBonus = 3.0;      // Nearly exact
    else if (aspect.orb < 1) exactnessBonus = 2.5;   // Very tight
    else if (aspect.orb < 2) exactnessBonus = 2.0;   // Tight
    else if (aspect.orb < 3) exactnessBonus = 1.5;   // Good
    else if (aspect.orb < 5) exactnessBonus = 1.0;   // Normal
    else exactnessBonus = 0.5;                        // Loose

    totalPower += basePower * exactnessBonus * applyingBonus * natureModifier;
  }
  return Math.round((totalPower / (totalPower + 50)) * 100);
}

// ============================================
// VARIATION F: Applying Aspects Only
// Only aspects that are getting tighter
// ============================================
function scoreVariationF(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;
  for (const aspect of aspects) {
    if (!aspect.isApplying) continue; // Skip separating aspects

    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const natureModifier = getNatureModifier(aspect.aspectType);
    totalPower += basePower * orbMultiplier * 1.3 * natureModifier; // Bonus for applying
  }
  return Math.round((totalPower / (totalPower + 25)) * 100);
}

// ============================================
// VARIATION G: Harmonious = Power, Challenging = Rest
// Different scoring for flow vs friction
// ============================================
function scoreVariationG(aspects: PlanetaryAspect[]): { power: number; friction: number; net: number } {
  let harmoniousPower = 0;
  let challengingPower = 0;

  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmoniousPower += basePower * orbMultiplier * applyingBonus;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challengingPower += basePower * orbMultiplier * applyingBonus;
    }
  }

  const power = Math.round((harmoniousPower / (harmoniousPower + 25)) * 100);
  const friction = Math.round((challengingPower / (challengingPower + 25)) * 100);
  const net = Math.round(power - friction * 0.5); // Net energy

  return { power, friction, net };
}

// ============================================
// VARIATION H: Top 5 Strongest Aspects Only
// Quality over quantity
// ============================================
function scoreVariationH(aspects: PlanetaryAspect[]): number {
  // Calculate power for each aspect
  const aspectPowers = aspects.map(aspect => {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const natureModifier = getNatureModifier(aspect.aspectType);
    return basePower * orbMultiplier * applyingBonus * natureModifier;
  });

  // Sort and take top 5
  aspectPowers.sort((a, b) => b - a);
  const top5Power = aspectPowers.slice(0, 5).reduce((sum, p) => sum + p, 0);

  return Math.round((top5Power / (top5Power + 20)) * 100);
}

// ============================================
// VARIATION I: Combined Best Practices
// Tight orbs + Personal planets + Major aspects + Applying bonus
// ============================================
function scoreVariationI(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;

  for (const aspect of aspects) {
    // Skip loose aspects
    if (aspect.orb > 5) continue;

    // Skip minor aspects for the main score
    const isMajor = MAJOR_ASPECTS.includes(aspect.aspectType);
    if (!isMajor) continue;

    const basePower = ASPECTS[aspect.aspectType].power;

    // Exponential orb bonus
    let orbBonus = 1.0;
    if (aspect.orb < 1) orbBonus = 2.5;
    else if (aspect.orb < 2) orbBonus = 2.0;
    else if (aspect.orb < 3) orbBonus = 1.5;
    else orbBonus = 1.0;

    // Applying bonus
    const applyingBonus = aspect.isApplying ? 1.3 : 1.0;

    // Personal planet weight
    let planetWeight = 1.0;
    if (LUMINARIES.includes(aspect.transitPlanet) || LUMINARIES.includes(aspect.natalPlanet)) {
      planetWeight = 1.8;
    } else if (PERSONAL_PLANETS.includes(aspect.transitPlanet) || PERSONAL_PLANETS.includes(aspect.natalPlanet)) {
      planetWeight = 1.4;
    }

    // Nature modifier
    const natureModifier = getNatureModifier(aspect.aspectType);

    totalPower += basePower * orbBonus * applyingBonus * planetWeight * natureModifier;
  }

  return Math.round((totalPower / (totalPower + 30)) * 100);
}

// ============================================
// VARIATION J: Sqrt with Personal Planet Focus
// ============================================
function scoreVariationJ(aspects: PlanetaryAspect[]): number {
  let totalPower = 0;

  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const natureModifier = getNatureModifier(aspect.aspectType);

    // Personal planet weight
    let planetWeight = 1.0;
    if (LUMINARIES.includes(aspect.transitPlanet)) {
      planetWeight = 1.5;
    } else if (PERSONAL_PLANETS.includes(aspect.transitPlanet)) {
      planetWeight = 1.2;
    } else if (OUTER_PLANETS.includes(aspect.transitPlanet)) {
      planetWeight = 0.6;
    }

    totalPower += basePower * orbMultiplier * applyingBonus * natureModifier * planetWeight;
  }

  // Sqrt formula for spread
  return Math.min(100, Math.round(Math.sqrt(totalPower) * 7));
}

// ============================================
// CALCULATE ALL VARIATIONS
// ============================================

interface DayScores {
  date: string;
  month: string;
  day: number;
  aspectCount: number;
  A: number; // Current
  B: number; // Tight Only
  C: number; // Personal Focus
  D: number; // Major Only
  E: number; // Exactness Bonus
  F: number; // Applying Only
  G: { power: number; friction: number; net: number }; // Harmonious/Challenging
  H: number; // Top 5 Only
  I: number; // Combined Best
  J: number; // Sqrt + Personal
}

const allScores: DayScores[] = allDays.map(d => ({
  date: d.date,
  month: d.month,
  day: d.day,
  aspectCount: d.aspects.length,
  A: scoreVariationA(d.aspects),
  B: scoreVariationB(d.aspects),
  C: scoreVariationC(d.aspects),
  D: scoreVariationD(d.aspects),
  E: scoreVariationE(d.aspects),
  F: scoreVariationF(d.aspects),
  G: scoreVariationG(d.aspects),
  H: scoreVariationH(d.aspects),
  I: scoreVariationI(d.aspects),
  J: scoreVariationJ(d.aspects),
}));

// ============================================
// OUTPUT RESULTS
// ============================================

console.log("\n" + "=".repeat(80));
console.log("COMPREHENSIVE SCORING SIMULATION - 5 Months (Jan, Apr, Aug, Sep, Nov 2026)");
console.log("=".repeat(80));
console.log(`\nBirth Data: ${DEV_BIRTH_DATA.date} ${DEV_BIRTH_DATA.time} (${DEV_BIRTH_DATA.location.name})\n`);

console.log("VARIATIONS:");
console.log("  A = Current (diminishing returns ÷50)");
console.log("  B = Tight Aspects Only (orb < 3°)");
console.log("  C = Personal Planet Focus (Luminaries 2x, Personal 1.5x, Outer 0.5x)");
console.log("  D = Major Aspects Only (Ptolemaic: conj, opp, trine, square, sextile)");
console.log("  E = Exactness Bonus (exponential bonus for tight orbs)");
console.log("  F = Applying Aspects Only (building energy)");
console.log("  G = Harmonious vs Challenging (Power/Friction/Net)");
console.log("  H = Top 5 Strongest Aspects Only");
console.log("  I = Combined Best (Major + Tight + Personal + Applying)");
console.log("  J = Sqrt×7 + Personal Planet Focus");

// Summary table per variation
console.log("\n" + "=".repeat(80));
console.log("VARIATION COMPARISON SUMMARY");
console.log("=".repeat(80) + "\n");

const variations = ["A", "B", "C", "D", "E", "F", "H", "I", "J"] as const;

console.log("Var | Description                          | Range   | Avg | Power≥70 | Rest≤30 | Spread");
console.log("----|--------------------------------------|---------|-----|----------|---------|-------");

for (const v of variations) {
  const scores = allScores.map(d => d[v] as number);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const powerDays = scores.filter(s => s >= 70).length;
  const restDays = scores.filter(s => s <= 30).length;
  const spread = max - min;

  const descriptions: Record<string, string> = {
    A: "Current (diminishing ÷50)",
    B: "Tight Aspects Only (orb<3°)",
    C: "Personal Planet Focus",
    D: "Major Aspects Only",
    E: "Exactness Bonus",
    F: "Applying Aspects Only",
    H: "Top 5 Strongest Only",
    I: "Combined Best Practices",
    J: "Sqrt×7 + Personal Planets",
  };

  console.log(
    `${v}   | ${descriptions[v].padEnd(36)} | ${min}-${max}`.padEnd(50) +
    ` | ${String(avg).padStart(3)} | ${String(powerDays).padStart(8)} | ${String(restDays).padStart(7)} | ${String(spread).padStart(6)}`
  );
}

// Special handling for G (has multiple scores)
const gScores = allScores.map(d => d.G);
const gNets = gScores.map(g => g.net);
const gMin = Math.min(...gNets);
const gMax = Math.max(...gNets);
const gAvg = Math.round(gNets.reduce((a, b) => a + b, 0) / gNets.length);
const gPower = gNets.filter(s => s >= 70).length;
const gRest = gNets.filter(s => s <= 30).length;
console.log(
  `G   | Harmonious - Challenging (Net)       | ${gMin}-${gMax}`.padEnd(50) +
  ` | ${String(gAvg).padStart(3)} | ${String(gPower).padStart(8)} | ${String(gRest).padStart(7)} | ${String(gMax - gMin).padStart(6)}`
);

// Distribution per month per variation
console.log("\n" + "=".repeat(80));
console.log("MONTHLY BREAKDOWN - Power Days (≥70) / Rest Days (≤30)");
console.log("=".repeat(80) + "\n");

console.log("Month      | Days | A      | B      | C      | D      | E      | F      | H      | I      | J");
console.log("-----------|------|--------|--------|--------|--------|--------|--------|--------|--------|--------");

for (const month of months) {
  const monthScores = allScores.filter(d => d.month === month.name);
  const counts: string[] = [];

  for (const v of variations) {
    const scores = monthScores.map(d => d[v] as number);
    const power = scores.filter(s => s >= 70).length;
    const rest = scores.filter(s => s <= 30).length;
    counts.push(`${power}/${rest}`.padStart(6));
  }

  console.log(`${month.name.padEnd(10)} | ${String(month.days).padStart(4)} | ${counts.join(" | ")}`);
}

// Best variation analysis
console.log("\n" + "=".repeat(80));
console.log("RECOMMENDATION ANALYSIS");
console.log("=".repeat(80) + "\n");

console.log("Target distribution: ~15-20% Power Days, ~10-15% Rest Days, ~65-75% Neutral\n");

for (const v of variations) {
  const scores = allScores.map(d => d[v] as number);
  const total = scores.length;
  const powerPct = Math.round((scores.filter(s => s >= 70).length / total) * 100);
  const restPct = Math.round((scores.filter(s => s <= 30).length / total) * 100);
  const neutralPct = 100 - powerPct - restPct;

  let rating = "";
  if (powerPct >= 10 && powerPct <= 25 && restPct >= 5 && restPct <= 20) {
    rating = "✅ GOOD";
  } else if (powerPct > 40 || restPct === 0) {
    rating = "❌ Poor";
  } else {
    rating = "⚠️ Okay";
  }

  console.log(`${v}: ${powerPct}% power / ${restPct}% rest / ${neutralPct}% neutral → ${rating}`);
}

// Sample days from each month for top variations
console.log("\n" + "=".repeat(80));
console.log("SAMPLE DAYS - Variations B, H, I (Most Promising)");
console.log("=".repeat(80));

for (const month of months) {
  const monthScores = allScores.filter(d => d.month === month.name);

  console.log(`\n--- ${month.name} 2026 ---\n`);
  console.log("Day | Asp | B (Tight) | H (Top5) | I (Combined) | Day Type (using I)");
  console.log("----|-----|-----------|----------|--------------|-------------------");

  for (const d of monthScores) {
    const dayType = d.I >= 70 ? "⚡ POWER" : d.I <= 30 ? "😴 Rest" : "   Neutral";
    console.log(
      `${String(d.day).padStart(2)} | ${String(d.aspectCount).padStart(3)} | ` +
      `${String(d.B).padStart(9)} | ${String(d.H).padStart(8)} | ${String(d.I).padStart(12)} | ${dayType}`
    );
  }
}

// Final recommendation
console.log("\n" + "=".repeat(80));
console.log("FINAL RECOMMENDATION");
console.log("=".repeat(80) + "\n");

const iScores = allScores.map(d => d.I);
const iPower = Math.round((iScores.filter(s => s >= 70).length / iScores.length) * 100);
const iRest = Math.round((iScores.filter(s => s <= 30).length / iScores.length) * 100);

console.log("Variation I (Combined Best Practices) appears most balanced:");
console.log("  - Only counts MAJOR aspects (Ptolemaic)");
console.log("  - Exponential bonus for TIGHT orbs (<3°)");
console.log("  - Extra weight for PERSONAL planets");
console.log("  - Bonus for APPLYING aspects");
console.log("");
console.log(`Current distribution: ${iPower}% power / ${iRest}% rest`);
console.log("");
console.log("If thresholds need adjustment:");
console.log("  - Lower power threshold to 65 for more power days");
console.log("  - Raise rest threshold to 35 for more rest days");
