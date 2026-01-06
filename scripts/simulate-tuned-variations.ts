/**
 * Tuned Variations Simulation
 *
 * Tests:
 * - Variation F with 70/30 thresholds
 * - Variation F with 70/30 + Outer planet 0.5x weight
 *
 * Run with: npx tsx scripts/simulate-tuned-variations.ts
 */

import { calculateNatalPositions } from "../src/lib/astro/calculations";
import { get2026Transits, findAspectsOnDate } from "../src/lib/astro/transit-calculations";
import { ASPECTS, PlanetaryAspect } from "../src/lib/astro/transit-types";
import { PlanetId, BirthData } from "../src/lib/astro/types";

// ============================================
// TEST PROFILES
// ============================================

const TEST_PROFILES: { name: string; data: BirthData }[] = [
  {
    name: "Sarah",
    data: {
      date: "1988-05-05",
      time: "14:30",
      timeUnknown: false,
      location: { name: "Bratislava", lat: 48.1486, lng: 17.1077, timezone: "Europe/Bratislava" },
    },
  },
  {
    name: "Marcus",
    data: {
      date: "1995-11-08",
      time: "06:45",
      timeUnknown: false,
      location: { name: "New York", lat: 40.7128, lng: -74.006, timezone: "America/New_York" },
    },
  },
  {
    name: "Yuki",
    data: {
      date: "1978-07-15",
      time: "00:15",
      timeUnknown: false,
      location: { name: "Tokyo", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo" },
    },
  },
  {
    name: "Luna",
    data: {
      date: "2001-02-14",
      time: "19:30",
      timeUnknown: false,
      location: { name: "São Paulo", lat: -23.5505, lng: -46.6333, timezone: "America/Sao_Paulo" },
    },
  },
];

// Planet categories
const PERSONAL_PLANETS: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars"];
const LUMINARIES: PlanetId[] = ["sun", "moon"];
const OUTER_PLANETS: PlanetId[] = ["uranus", "neptune", "pluto"];
const HARMONIOUS_ASPECTS = ["trine", "sextile"];
const CHALLENGING_ASPECTS = ["square", "opposition"];
const CONJUNCTION = ["conjunction"];
const BENEFICS: PlanetId[] = ["venus", "jupiter"];
const MALEFICS: PlanetId[] = ["mars", "saturn"];

// All months
const allMonths = [
  { num: 1, days: 31 }, { num: 2, days: 28 }, { num: 3, days: 31 },
  { num: 4, days: 30 }, { num: 5, days: 31 }, { num: 6, days: 30 },
  { num: 7, days: 31 }, { num: 8, days: 31 }, { num: 9, days: 30 },
  { num: 10, days: 31 }, { num: 11, days: 30 }, { num: 12, days: 31 },
];

// ============================================
// SCORING FUNCTIONS
// ============================================

function isConjunctionHarmonious(aspect: PlanetaryAspect): boolean {
  return BENEFICS.includes(aspect.transitPlanet) || BENEFICS.includes(aspect.natalPlanet);
}

function isConjunctionChallenging(aspect: PlanetaryAspect): boolean {
  return MALEFICS.includes(aspect.transitPlanet) || MALEFICS.includes(aspect.natalPlanet);
}

// VARIATION F1: Original (for comparison) - thresholds 65/35
function variationF1(aspects: PlanetaryAspect[]): number {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    const majorAspects = ["conjunction", "trine", "sextile", "square", "opposition"];
    if (!majorAspects.includes(aspect.aspectType)) continue;

    const basePower = ASPECTS[aspect.aspectType].power;

    let orbBonus = 1.0;
    if (aspect.orb < 1) orbBonus = 2.5;
    else if (aspect.orb < 2) orbBonus = 2.0;
    else if (aspect.orb < 3) orbBonus = 1.5;
    else if (aspect.orb < 5) orbBonus = 1.0;
    else orbBonus = 0.5;

    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

    // Original planet weights
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
      if (isConjunctionHarmonious(aspect)) harmonious += power;
      else if (isConjunctionChallenging(aspect)) challenging += power;
      else {
        harmonious += power * 0.6;
        challenging += power * 0.4;
      }
    }
  }

  const total = harmonious + challenging;
  if (total === 0) return 50;

  const harmRatio = harmonious / total;
  const baseScore = harmRatio * 100;
  const magnitude = Math.sqrt(total) / 10;
  const magnitudeEffect = (harmRatio - 0.5) * magnitude * 20;

  return Math.max(0, Math.min(100, Math.round(baseScore + magnitudeEffect)));
}

// VARIATION F2: Same formula, but with OUTER PLANET 0.5x weight
function variationF2(aspects: PlanetaryAspect[]): number {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    const majorAspects = ["conjunction", "trine", "sextile", "square", "opposition"];
    if (!majorAspects.includes(aspect.aspectType)) continue;

    const basePower = ASPECTS[aspect.aspectType].power;

    let orbBonus = 1.0;
    if (aspect.orb < 1) orbBonus = 2.5;
    else if (aspect.orb < 2) orbBonus = 2.0;
    else if (aspect.orb < 3) orbBonus = 1.5;
    else if (aspect.orb < 5) orbBonus = 1.0;
    else orbBonus = 0.5;

    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

    // MODIFIED: Outer planets reduced to 0.5x
    let planetWeight = 1.0;
    if (LUMINARIES.includes(aspect.transitPlanet) || LUMINARIES.includes(aspect.natalPlanet)) {
      planetWeight = 2.0;
    } else if (PERSONAL_PLANETS.includes(aspect.transitPlanet) || PERSONAL_PLANETS.includes(aspect.natalPlanet)) {
      planetWeight = 1.5;
    } else if (OUTER_PLANETS.includes(aspect.transitPlanet) || OUTER_PLANETS.includes(aspect.natalPlanet)) {
      planetWeight = 0.5; // REDUCED from 1.0
    }

    const power = basePower * orbBonus * applyingBonus * planetWeight;

    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (CONJUNCTION.includes(aspect.aspectType)) {
      if (isConjunctionHarmonious(aspect)) harmonious += power;
      else if (isConjunctionChallenging(aspect)) challenging += power;
      else {
        harmonious += power * 0.6;
        challenging += power * 0.4;
      }
    }
  }

  const total = harmonious + challenging;
  if (total === 0) return 50;

  const harmRatio = harmonious / total;
  const baseScore = harmRatio * 100;
  const magnitude = Math.sqrt(total) / 10;
  const magnitudeEffect = (harmRatio - 0.5) * magnitude * 20;

  return Math.max(0, Math.min(100, Math.round(baseScore + magnitudeEffect)));
}

// ============================================
// SIMULATION
// ============================================

console.log("\n" + "=".repeat(90));
console.log("TUNED VARIATIONS SIMULATION");
console.log("=".repeat(90));
console.log("\nComparing:");
console.log("  F1: Original Variation F (thresholds 70/30)");
console.log("  F2: Variation F + Outer planets 0.5x weight (thresholds 70/30)");
console.log("\nThresholds for both: Power ≥ 70, Rest ≤ 30\n");

console.log("Generating transit cache...");
const transitCache = get2026Transits();

interface PersonScores {
  name: string;
  f1Scores: number[];
  f2Scores: number[];
}

const allResults: PersonScores[] = [];

for (const profile of TEST_PROFILES) {
  console.log(`Processing ${profile.name}...`);
  const natalPositions = calculateNatalPositions(profile.data);
  const f1Scores: number[] = [];
  const f2Scores: number[] = [];

  // Both years
  for (const year of [2026, 2027]) {
    for (const month of allMonths) {
      for (let day = 1; day <= month.days; day++) {
        const date = `${year}-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const aspects = findAspectsOnDate(natalPositions, date, transitCache);
        f1Scores.push(variationF1(aspects));
        f2Scores.push(variationF2(aspects));
      }
    }
  }

  allResults.push({ name: profile.name, f1Scores, f2Scores });
}

// ============================================
// ANALYSIS WITH 70/30 THRESHOLDS
// ============================================

const POWER_THRESHOLD = 70;
const REST_THRESHOLD = 30;

console.log("\n" + "=".repeat(90));
console.log(`RESULTS WITH THRESHOLDS: Power ≥ ${POWER_THRESHOLD}, Rest ≤ ${REST_THRESHOLD}`);
console.log("=".repeat(90));

// Summary table
console.log("\n--- Overview: All 4 People × 2 Years (730 days each) ---\n");
console.log("Person  | Variation | Range   | Avg | Power Days | Rest Days | Power% | Rest%");
console.log("--------|-----------|---------|-----|------------|-----------|--------|------");

for (const result of allResults) {
  for (const [label, scores] of [["F1 (Original)", result.f1Scores], ["F2 (Outer 0.5x)", result.f2Scores]] as const) {
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const power = scores.filter(s => s >= POWER_THRESHOLD).length;
    const rest = scores.filter(s => s <= REST_THRESHOLD).length;
    const powerPct = Math.round((power / scores.length) * 100);
    const restPct = Math.round((rest / scores.length) * 100);

    console.log(
      `${result.name.padEnd(7)} | ${label.padEnd(9)} | ${String(min).padStart(2)}-${String(max).padStart(3)}  | ` +
      `${String(avg).padStart(3)} | ${String(power).padStart(10)} | ${String(rest).padStart(9)} | ` +
      `${String(powerPct).padStart(5)}% | ${String(restPct).padStart(4)}%`
    );
  }
}

// Aggregate stats
console.log("\n--- Aggregate Statistics ---\n");

for (const [label, getScores] of [
  ["F1 (Original)", (r: PersonScores) => r.f1Scores],
  ["F2 (Outer 0.5x)", (r: PersonScores) => r.f2Scores],
] as const) {
  const allScores = allResults.flatMap(r => getScores(r));
  const power = allScores.filter(s => s >= POWER_THRESHOLD).length;
  const rest = allScores.filter(s => s <= REST_THRESHOLD).length;
  const neutral = allScores.filter(s => s > REST_THRESHOLD && s < POWER_THRESHOLD).length;
  const total = allScores.length;

  const powerPct = Math.round((power / total) * 100);
  const restPct = Math.round((rest / total) * 100);
  const neutralPct = Math.round((neutral / total) * 100);

  console.log(`${label}:`);
  console.log(`  Total days: ${total}`);
  console.log(`  Power Days (≥${POWER_THRESHOLD}): ${power} (${powerPct}%)`);
  console.log(`  Rest Days (≤${REST_THRESHOLD}):  ${rest} (${restPct}%)`);
  console.log(`  Neutral Days:    ${neutral} (${neutralPct}%)`);

  let rating = "";
  if (powerPct >= 12 && powerPct <= 22 && restPct >= 8 && restPct <= 18) {
    rating = "✅ EXCELLENT - Close to target!";
  } else if (powerPct >= 10 && powerPct <= 28 && restPct >= 5 && restPct <= 22) {
    rating = "👍 GOOD";
  } else {
    rating = "⚠️ Needs adjustment";
  }
  console.log(`  Rating: ${rating}`);
  console.log("");
}

// Distribution comparison
console.log("--- Score Distribution Comparison ---\n");

const buckets = [
  { range: "85-100", min: 85, max: 100, label: "⚡⚡ Peak" },
  { range: "70-84 ", min: 70, max: 84, label: "⚡  Power" },
  { range: "50-69 ", min: 50, max: 69, label: "   Balanced" },
  { range: "31-49 ", min: 31, max: 49, label: "   Low" },
  { range: "15-30 ", min: 15, max: 30, label: "😴  Rest" },
  { range: "0-14  ", min: 0, max: 14, label: "😴😴 Deep" },
];

console.log("Bucket   | F1 (Original)      | F2 (Outer 0.5x)");
console.log("---------|--------------------|-----------------");

for (const bucket of buckets) {
  const f1All = allResults.flatMap(r => r.f1Scores);
  const f2All = allResults.flatMap(r => r.f2Scores);

  const f1Count = f1All.filter(s => s >= bucket.min && s <= bucket.max).length;
  const f2Count = f2All.filter(s => s >= bucket.min && s <= bucket.max).length;

  const f1Pct = Math.round((f1Count / f1All.length) * 100);
  const f2Pct = Math.round((f2Count / f2All.length) * 100);

  console.log(
    `${bucket.range} ${bucket.label} | ${String(f1Count).padStart(4)} (${String(f1Pct).padStart(2)}%)         | ` +
    `${String(f2Count).padStart(4)} (${String(f2Pct).padStart(2)}%)`
  );
}

// Per-person breakdown
console.log("\n--- Per-Person Distribution (70/30 thresholds) ---\n");
console.log("Person  | F1: Power/Rest     | F2: Power/Rest     | Better?");
console.log("--------|--------------------|--------------------|--------");

for (const result of allResults) {
  const f1Power = result.f1Scores.filter(s => s >= POWER_THRESHOLD).length;
  const f1Rest = result.f1Scores.filter(s => s <= REST_THRESHOLD).length;
  const f2Power = result.f2Scores.filter(s => s >= POWER_THRESHOLD).length;
  const f2Rest = result.f2Scores.filter(s => s <= REST_THRESHOLD).length;

  const f1PowerPct = Math.round((f1Power / 730) * 100);
  const f1RestPct = Math.round((f1Rest / 730) * 100);
  const f2PowerPct = Math.round((f2Power / 730) * 100);
  const f2RestPct = Math.round((f2Rest / 730) * 100);

  // Determine which is better (closer to 18% power, 12% rest)
  const f1Distance = Math.abs(f1PowerPct - 18) + Math.abs(f1RestPct - 12);
  const f2Distance = Math.abs(f2PowerPct - 18) + Math.abs(f2RestPct - 12);
  const better = f2Distance < f1Distance ? "F2 ✓" : f1Distance < f2Distance ? "F1" : "Same";

  console.log(
    `${result.name.padEnd(7)} | ${String(f1PowerPct).padStart(2)}% / ${String(f1RestPct).padStart(2)}% (${f1Power}/${f1Rest})  | ` +
    `${String(f2PowerPct).padStart(2)}% / ${String(f2RestPct).padStart(2)}% (${f2Power}/${f2Rest})  | ${better}`
  );
}

// Variance check
console.log("\n--- Consistency Check (Variance between people) ---\n");
console.log("Metric       | F1 Variance | F2 Variance | Better?");
console.log("-------------|-------------|-------------|--------");

const f1PowerPcts = allResults.map(r => Math.round((r.f1Scores.filter(s => s >= POWER_THRESHOLD).length / 730) * 100));
const f2PowerPcts = allResults.map(r => Math.round((r.f2Scores.filter(s => s >= POWER_THRESHOLD).length / 730) * 100));
const f1RestPcts = allResults.map(r => Math.round((r.f1Scores.filter(s => s <= REST_THRESHOLD).length / 730) * 100));
const f2RestPcts = allResults.map(r => Math.round((r.f2Scores.filter(s => s <= REST_THRESHOLD).length / 730) * 100));

const f1PowerVar = Math.max(...f1PowerPcts) - Math.min(...f1PowerPcts);
const f2PowerVar = Math.max(...f2PowerPcts) - Math.min(...f2PowerPcts);
const f1RestVar = Math.max(...f1RestPcts) - Math.min(...f1RestPcts);
const f2RestVar = Math.max(...f2RestPcts) - Math.min(...f2RestPcts);

console.log(
  `Power Days % | ${String(f1PowerVar).padStart(9)}% | ${String(f2PowerVar).padStart(9)}% | ${f2PowerVar < f1PowerVar ? "F2 ✓" : "F1"}`
);
console.log(
  `Rest Days %  | ${String(f1RestVar).padStart(9)}% | ${String(f2RestVar).padStart(9)}% | ${f2RestVar < f1RestVar ? "F2 ✓" : "F1"}`
);

// Final recommendation
console.log("\n" + "=".repeat(90));
console.log("FINAL RECOMMENDATION");
console.log("=".repeat(90) + "\n");

const f1AllScores = allResults.flatMap(r => r.f1Scores);
const f2AllScores = allResults.flatMap(r => r.f2Scores);

const f1FinalPower = Math.round((f1AllScores.filter(s => s >= POWER_THRESHOLD).length / f1AllScores.length) * 100);
const f1FinalRest = Math.round((f1AllScores.filter(s => s <= REST_THRESHOLD).length / f1AllScores.length) * 100);
const f2FinalPower = Math.round((f2AllScores.filter(s => s >= POWER_THRESHOLD).length / f2AllScores.length) * 100);
const f2FinalRest = Math.round((f2AllScores.filter(s => s <= REST_THRESHOLD).length / f2AllScores.length) * 100);

console.log("Target: 15-20% Power, 10-15% Rest, 65-75% Neutral\n");
console.log(`F1 (Original + 70/30):     ${f1FinalPower}% power / ${f1FinalRest}% rest / ${100 - f1FinalPower - f1FinalRest}% neutral`);
console.log(`F2 (Outer 0.5x + 70/30):   ${f2FinalPower}% power / ${f2FinalRest}% rest / ${100 - f2FinalPower - f2FinalRest}% neutral`);

// Determine winner
const f1Dist = Math.abs(f1FinalPower - 17.5) + Math.abs(f1FinalRest - 12.5);
const f2Dist = Math.abs(f2FinalPower - 17.5) + Math.abs(f2FinalRest - 12.5);

console.log("");
if (f2Dist < f1Dist) {
  console.log("✅ WINNER: F2 (Outer planets 0.5x + 70/30 thresholds)");
  console.log("   Reducing outer planet weight creates better balance!");
} else if (f1Dist < f2Dist) {
  console.log("✅ WINNER: F1 (Original + 70/30 thresholds)");
  console.log("   Simple threshold change is sufficient!");
} else {
  console.log("🤝 TIE: Both variations perform similarly.");
}
