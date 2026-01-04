/**
 * Hybrid Scoring Simulation
 *
 * Tests balance-based approaches: Harmonious vs Challenging energy
 * Run with: npx tsx scripts/simulate-hybrid.ts
 */

import { calculateNatalPositions } from "../src/lib/astro/calculations";
import { get2026Transits, findAspectsOnDate } from "../src/lib/astro/transit-calculations";
import { ASPECTS, PlanetaryAspect } from "../src/lib/astro/transit-types";
import { DEV_BIRTH_DATA } from "../src/lib/mock-data";
import { PlanetId } from "../src/lib/astro/types";

const natalPositions = calculateNatalPositions(DEV_BIRTH_DATA);
const transitCache = get2026Transits();

// Months to analyze
const months = [
  { name: "January", num: 1, days: 31 },
  { name: "April", num: 4, days: 30 },
  { name: "August", num: 8, days: 31 },
  { name: "September", num: 9, days: 30 },
  { name: "November", num: 11, days: 30 },
];

// Planet categories
const PERSONAL_PLANETS: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars"];
const LUMINARIES: PlanetId[] = ["sun", "moon"];

// Aspect categories
const HARMONIOUS_ASPECTS = ["trine", "sextile"];
const CHALLENGING_ASPECTS = ["square", "opposition"];
const CONJUNCTION = ["conjunction"]; // Neutral - depends on planets involved

// Benefic planets (conjunction with these = harmonious)
const BENEFICS: PlanetId[] = ["venus", "jupiter"];
const MALEFICS: PlanetId[] = ["mars", "saturn"];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getOrbMultiplier(aspect: PlanetaryAspect): number {
  const maxOrb = ASPECTS[aspect.aspectType].orb;
  const orbTightness = Math.max(0, 1 - aspect.orb / maxOrb);
  return Math.pow(orbTightness, 1.5);
}

function getPlanetWeight(planet: PlanetId): number {
  if (LUMINARIES.includes(planet)) return 2.0;
  if (PERSONAL_PLANETS.includes(planet)) return 1.5;
  return 1.0;
}

function isConjunctionHarmonious(aspect: PlanetaryAspect): boolean {
  // Conjunction with benefics = harmonious
  return BENEFICS.includes(aspect.transitPlanet) || BENEFICS.includes(aspect.natalPlanet);
}

function isConjunctionChallenging(aspect: PlanetaryAspect): boolean {
  // Conjunction with malefics = challenging
  return MALEFICS.includes(aspect.transitPlanet) || MALEFICS.includes(aspect.natalPlanet);
}

// ============================================
// GATHER RAW DATA
// ============================================

interface DayData {
  date: string;
  month: string;
  day: number;
  aspects: PlanetaryAspect[];
}

const allDays: DayData[] = [];

for (const month of months) {
  for (let day = 1; day <= month.days; day++) {
    const date = `2026-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const aspects = findAspectsOnDate(natalPositions, date, transitCache);
    allDays.push({ date, month: month.name, day, aspects });
  }
}

// ============================================
// HYBRID SCORING VARIATIONS
// ============================================

interface EnergyBreakdown {
  harmonious: number;
  challenging: number;
  score: number;
}

// Hybrid A: Simple difference (Harmonious - Challenging × 0.5)
function hybridA(aspects: PlanetaryAspect[]): EnergyBreakdown {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const power = basePower * orbMultiplier * applyingBonus;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (CONJUNCTION.includes(aspect.aspectType)) {
      if (isConjunctionHarmonious(aspect)) harmonious += power * 0.8;
      else if (isConjunctionChallenging(aspect)) challenging += power * 0.8;
      else harmonious += power * 0.5; // Neutral conjunction slightly harmonious
    }
  }

  // Score = harmonious - (challenging × 0.5), normalized to 0-100
  const raw = harmonious - (challenging * 0.5);
  const score = Math.round(50 + raw); // Center at 50
  return { harmonious, challenging, score: Math.max(0, Math.min(100, score)) };
}

// Hybrid B: Ratio-based (Harmonious / Total)
function hybridB(aspects: PlanetaryAspect[]): EnergyBreakdown {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const power = basePower * orbMultiplier * applyingBonus;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (CONJUNCTION.includes(aspect.aspectType)) {
      if (isConjunctionHarmonious(aspect)) harmonious += power * 0.8;
      else if (isConjunctionChallenging(aspect)) challenging += power * 0.8;
    }
  }

  const total = harmonious + challenging;
  const ratio = total > 0 ? harmonious / total : 0.5;
  const score = Math.round(ratio * 100);
  return { harmonious, challenging, score };
}

// Hybrid C: Personal planet focus + balance
function hybridC(aspects: PlanetaryAspect[]): EnergyBreakdown {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const planetWeight = getPlanetWeight(aspect.transitPlanet) * getPlanetWeight(aspect.natalPlanet) * 0.5;
    const power = basePower * orbMultiplier * applyingBonus * planetWeight;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (CONJUNCTION.includes(aspect.aspectType)) {
      if (isConjunctionHarmonious(aspect)) harmonious += power * 0.8;
      else if (isConjunctionChallenging(aspect)) challenging += power * 0.8;
    }
  }

  const raw = harmonious - (challenging * 0.4);
  const score = Math.round(50 + raw * 0.8);
  return { harmonious, challenging, score: Math.max(0, Math.min(100, score)) };
}

// Hybrid D: Tight aspects only + balance
function hybridD(aspects: PlanetaryAspect[]): EnergyBreakdown {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    if (aspect.orb > 4) continue; // Only tight aspects

    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.3 : 1.0;
    const power = basePower * orbMultiplier * applyingBonus;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (CONJUNCTION.includes(aspect.aspectType)) {
      if (isConjunctionHarmonious(aspect)) harmonious += power;
      else if (isConjunctionChallenging(aspect)) challenging += power;
    }
  }

  const raw = harmonious - (challenging * 0.5);
  const score = Math.round(50 + raw * 1.5);
  return { harmonious, challenging, score: Math.max(0, Math.min(100, score)) };
}

// Hybrid E: Weighted ratio with personal planets
function hybridE(aspects: PlanetaryAspect[]): EnergyBreakdown {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

    // Extra weight for personal planet involvement
    let personalBonus = 1.0;
    if (LUMINARIES.includes(aspect.transitPlanet) || LUMINARIES.includes(aspect.natalPlanet)) {
      personalBonus = 1.8;
    } else if (PERSONAL_PLANETS.includes(aspect.transitPlanet) || PERSONAL_PLANETS.includes(aspect.natalPlanet)) {
      personalBonus = 1.4;
    }

    const power = basePower * orbMultiplier * applyingBonus * personalBonus;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (CONJUNCTION.includes(aspect.aspectType)) {
      if (isConjunctionHarmonious(aspect)) harmonious += power * 0.9;
      else if (isConjunctionChallenging(aspect)) challenging += power * 0.9;
      else harmonious += power * 0.3;
    }
  }

  // Weighted ratio: more harmonious = higher score
  const total = harmonious + challenging;
  if (total === 0) return { harmonious, challenging, score: 50 };

  // Base ratio (0-100)
  const ratio = (harmonious / total) * 100;

  // Add intensity bonus for high total energy
  const intensityBonus = Math.min(15, Math.sqrt(total) * 2);

  // Shift score: ratio 50% = score 50, ratio 70% = score ~75
  const score = Math.round(ratio * 0.8 + intensityBonus);
  return { harmonious, challenging, score: Math.max(0, Math.min(100, score)) };
}

// Hybrid F: Flow Score (Best balance approach)
function hybridF(aspects: PlanetaryAspect[]): EnergyBreakdown {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    // Only count major aspects for clarity
    const majorAspects = ["conjunction", "trine", "sextile", "square", "opposition"];
    if (!majorAspects.includes(aspect.aspectType)) continue;

    const basePower = ASPECTS[aspect.aspectType].power;

    // Exponential orb bonus for tight aspects
    let orbBonus = 1.0;
    if (aspect.orb < 1) orbBonus = 2.5;
    else if (aspect.orb < 2) orbBonus = 2.0;
    else if (aspect.orb < 3) orbBonus = 1.5;
    else if (aspect.orb < 5) orbBonus = 1.0;
    else orbBonus = 0.5;

    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

    // Personal planet weight
    let planetWeight = 1.0;
    if (LUMINARIES.includes(aspect.transitPlanet) || LUMINARIES.includes(aspect.natalPlanet)) {
      planetWeight = 2.0;
    } else if (PERSONAL_PLANETS.includes(aspect.transitPlanet) || PERSONAL_PLANETS.includes(aspect.natalPlanet)) {
      planetWeight = 1.5;
    }

    const power = basePower * orbBonus * applyingBonus * planetWeight;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (CONJUNCTION.includes(aspect.aspectType)) {
      // Conjunction: split based on planet nature
      if (isConjunctionHarmonious(aspect)) harmonious += power;
      else if (isConjunctionChallenging(aspect)) challenging += power;
      else {
        // Neutral conjunction: slight boost to harmonious
        harmonious += power * 0.6;
        challenging += power * 0.4;
      }
    }
  }

  // Flow Score formula:
  // - Pure harmonious = 100
  // - Pure challenging = 0
  // - Equal mix = 50
  // - Harmonious dominant = 60-85
  // - Challenging dominant = 15-40

  const total = harmonious + challenging;
  if (total === 0) return { harmonious, challenging, score: 50 };

  const harmRatio = harmonious / total;
  const baseScore = harmRatio * 100;

  // Add magnitude bonus (more total energy = more pronounced effect)
  const magnitude = Math.sqrt(total) / 10;
  const magnitudeEffect = (harmRatio - 0.5) * magnitude * 20;

  const score = Math.round(baseScore + magnitudeEffect);
  return { harmonious, challenging, score: Math.max(0, Math.min(100, score)) };
}

// ============================================
// CALCULATE ALL VARIATIONS
// ============================================

interface DayScores {
  date: string;
  month: string;
  day: number;
  A: EnergyBreakdown;
  B: EnergyBreakdown;
  C: EnergyBreakdown;
  D: EnergyBreakdown;
  E: EnergyBreakdown;
  F: EnergyBreakdown;
}

const allScores: DayScores[] = allDays.map(d => ({
  date: d.date,
  month: d.month,
  day: d.day,
  A: hybridA(d.aspects),
  B: hybridB(d.aspects),
  C: hybridC(d.aspects),
  D: hybridD(d.aspects),
  E: hybridE(d.aspects),
  F: hybridF(d.aspects),
}));

// ============================================
// OUTPUT RESULTS
// ============================================

console.log("\n" + "=".repeat(80));
console.log("HYBRID SCORING SIMULATION - Balance of Harmonious vs Challenging Energy");
console.log("=".repeat(80));
console.log(`\nBirth Data: ${DEV_BIRTH_DATA.date} ${DEV_BIRTH_DATA.time} (${DEV_BIRTH_DATA.location.name})\n`);

console.log("HYBRID VARIATIONS:");
console.log("  A = Simple Difference: 50 + (Harmonious - Challenging×0.5)");
console.log("  B = Ratio: (Harmonious / Total) × 100");
console.log("  C = Personal Planet Focus + Balance");
console.log("  D = Tight Aspects Only + Balance");
console.log("  E = Weighted Ratio + Intensity Bonus");
console.log("  F = Flow Score (Best Balance Approach)");
console.log("");
console.log("Thresholds: Power Day ≥ 65, Rest Day ≤ 35");

// Summary comparison
console.log("\n" + "=".repeat(80));
console.log("VARIATION COMPARISON SUMMARY");
console.log("=".repeat(80) + "\n");

const variations = ["A", "B", "C", "D", "E", "F"] as const;

console.log("Var | Description                      | Range   | Avg | Power≥65 | Rest≤35 | Spread");
console.log("----|----------------------------------|---------|-----|----------|---------|-------");

for (const v of variations) {
  const scores = allScores.map(d => d[v].score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const powerDays = scores.filter(s => s >= 65).length;
  const restDays = scores.filter(s => s <= 35).length;
  const spread = max - min;

  const descriptions: Record<string, string> = {
    A: "Simple Difference",
    B: "Ratio (Harm/Total)",
    C: "Personal + Balance",
    D: "Tight + Balance",
    E: "Weighted Ratio + Intensity",
    F: "Flow Score (Best)",
  };

  console.log(
    `${v}   | ${descriptions[v].padEnd(32)} | ${String(min).padStart(2)}-${String(max).padStart(3)} ` +
    `| ${String(avg).padStart(3)} | ${String(powerDays).padStart(8)} | ${String(restDays).padStart(7)} | ${String(spread).padStart(6)}`
  );
}

// Distribution analysis
console.log("\n" + "=".repeat(80));
console.log("DISTRIBUTION ANALYSIS (Target: 15-20% Power, 10-15% Rest)");
console.log("=".repeat(80) + "\n");

for (const v of variations) {
  const scores = allScores.map(d => d[v].score);
  const total = scores.length;
  const powerPct = Math.round((scores.filter(s => s >= 65).length / total) * 100);
  const restPct = Math.round((scores.filter(s => s <= 35).length / total) * 100);
  const neutralPct = 100 - powerPct - restPct;

  let rating = "";
  if (powerPct >= 12 && powerPct <= 25 && restPct >= 8 && restPct <= 20) {
    rating = "✅ EXCELLENT";
  } else if (powerPct >= 8 && powerPct <= 30 && restPct >= 5 && restPct <= 25) {
    rating = "👍 GOOD";
  } else {
    rating = "⚠️ Needs tuning";
  }

  console.log(`${v}: ${String(powerPct).padStart(2)}% power / ${String(restPct).padStart(2)}% rest / ${String(neutralPct).padStart(2)}% neutral → ${rating}`);
}

// Monthly breakdown
console.log("\n" + "=".repeat(80));
console.log("MONTHLY BREAKDOWN - Power (≥65) / Rest (≤35) Days");
console.log("=".repeat(80) + "\n");

console.log("Month      | Days |   A    |   B    |   C    |   D    |   E    |   F");
console.log("-----------|------|--------|--------|--------|--------|--------|--------");

for (const month of months) {
  const monthScores = allScores.filter(d => d.month === month.name);
  const counts: string[] = [];

  for (const v of variations) {
    const scores = monthScores.map(d => d[v].score);
    const power = scores.filter(s => s >= 65).length;
    const rest = scores.filter(s => s <= 35).length;
    counts.push(`${power}/${rest}`.padStart(6));
  }

  console.log(`${month.name.padEnd(10)} | ${String(month.days).padStart(4)} | ${counts.join(" | ")}`);
}

// Score distribution histogram for best variation
console.log("\n" + "=".repeat(80));
console.log("SCORE DISTRIBUTION - Variation F (Flow Score)");
console.log("=".repeat(80) + "\n");

const buckets = [
  { range: "85-100 ⚡⚡", min: 85, max: 100, label: "Very High Energy" },
  { range: "65-84  ⚡ ", min: 65, max: 84, label: "Power Day" },
  { range: "50-64    ", min: 50, max: 64, label: "Balanced" },
  { range: "35-49    ", min: 35, max: 49, label: "Low Energy" },
  { range: "20-34  😴", min: 20, max: 34, label: "Rest Day" },
  { range: "0-19  😴😴", min: 0, max: 19, label: "Deep Rest" },
];

const fScores = allScores.map(d => d.F.score);
for (const bucket of buckets) {
  const count = fScores.filter(s => s >= bucket.min && s <= bucket.max).length;
  const pct = Math.round((count / fScores.length) * 100);
  const bar = "█".repeat(Math.round(count / 3));
  console.log(`${bucket.range}: ${String(count).padStart(3)} (${String(pct).padStart(2)}%) ${bar} ${bucket.label}`);
}

// Sample output for each month
console.log("\n" + "=".repeat(80));
console.log("SAMPLE DAYS - Variation F (Flow Score)");
console.log("=".repeat(80));

for (const month of months) {
  const monthScores = allScores.filter(d => d.month === month.name);

  console.log(`\n--- ${month.name} 2026 ---\n`);
  console.log("Day | Harm | Chall | Score | Type");
  console.log("----|------|-------|-------|---------------");

  for (const d of monthScores) {
    const f = d.F;
    let dayType = "   Neutral";
    if (f.score >= 75) dayType = "⚡⚡ HIGH POWER";
    else if (f.score >= 65) dayType = "⚡  Power Day";
    else if (f.score <= 25) dayType = "😴😴 Deep Rest";
    else if (f.score <= 35) dayType = "😴  Rest Day";

    console.log(
      `${String(d.day).padStart(2)} | ${f.harmonious.toFixed(0).padStart(4)} | ${f.challenging.toFixed(0).padStart(5)} | ` +
      `${String(f.score).padStart(5)} | ${dayType}`
    );
  }
}

// Top days analysis
console.log("\n" + "=".repeat(80));
console.log("TOP 10 POWER DAYS (Highest Flow Score)");
console.log("=".repeat(80) + "\n");

const sortedByScore = [...allScores].sort((a, b) => b.F.score - a.F.score);
for (let i = 0; i < 10; i++) {
  const d = sortedByScore[i];
  console.log(`${i + 1}. ${d.date} (${d.month.slice(0, 3)} ${d.day}) - Score: ${d.F.score} (Harm: ${d.F.harmonious.toFixed(0)}, Chall: ${d.F.challenging.toFixed(0)})`);
}

console.log("\n" + "=".repeat(80));
console.log("TOP 10 REST DAYS (Lowest Flow Score)");
console.log("=".repeat(80) + "\n");

const sortedByScoreAsc = [...allScores].sort((a, b) => a.F.score - b.F.score);
for (let i = 0; i < 10; i++) {
  const d = sortedByScoreAsc[i];
  console.log(`${i + 1}. ${d.date} (${d.month.slice(0, 3)} ${d.day}) - Score: ${d.F.score} (Harm: ${d.F.harmonious.toFixed(0)}, Chall: ${d.F.challenging.toFixed(0)})`);
}

// Final recommendation
console.log("\n" + "=".repeat(80));
console.log("ASTROLOGICAL INTERPRETATION");
console.log("=".repeat(80) + "\n");

console.log("The Flow Score measures the BALANCE of cosmic energy, not just quantity.");
console.log("");
console.log("⚡ Power Days (65+): Harmonious aspects dominate");
console.log("   → Trines & sextiles create FLOW - perfect for action, decisions, launches");
console.log("");
console.log("😴 Rest Days (35-): Challenging aspects dominate");
console.log("   → Squares & oppositions create FRICTION - time for reflection, not action");
console.log("");
console.log("Neutral Days (36-64): Mixed energy");
console.log("   → Both present - proceed with awareness, good for routine tasks");
console.log("");
console.log("This is astrologically authentic:");
console.log("   - A trine doesn't make you 'powerful' - it makes things FLOW");
console.log("   - A square doesn't make you 'weak' - it creates RESISTANCE");
console.log("   - Rest days aren't bad - they're for integration and planning");
