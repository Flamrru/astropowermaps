/**
 * 2-Year Simulation: Variations E and F
 *
 * Tests balance-based scoring across 2026 and 2027
 * Run with: npx tsx scripts/simulate-2-years.ts
 */

import { calculateNatalPositions } from "../src/lib/astro/calculations";
import { get2026Transits, findAspectsOnDate } from "../src/lib/astro/transit-calculations";
import { ASPECTS, PlanetaryAspect } from "../src/lib/astro/transit-types";
import { DEV_BIRTH_DATA } from "../src/lib/mock-data";
import { PlanetId } from "../src/lib/astro/types";

const natalPositions = calculateNatalPositions(DEV_BIRTH_DATA);

console.log("Generating transit caches for 2026-2027...");
const transitCache2026 = get2026Transits();

// Generate 2027 cache (modify the function to accept year parameter would be ideal, but for now we'll calculate on the fly)

// Planet categories
const PERSONAL_PLANETS: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars"];
const LUMINARIES: PlanetId[] = ["sun", "moon"];

// Aspect categories
const HARMONIOUS_ASPECTS = ["trine", "sextile"];
const CHALLENGING_ASPECTS = ["square", "opposition"];
const CONJUNCTION = ["conjunction"];
const BENEFICS: PlanetId[] = ["venus", "jupiter"];
const MALEFICS: PlanetId[] = ["mars", "saturn"];

// All months for both years
const months2026 = [
  { name: "Jan", num: 1, days: 31 },
  { name: "Feb", num: 2, days: 28 },
  { name: "Mar", num: 3, days: 31 },
  { name: "Apr", num: 4, days: 30 },
  { name: "May", num: 5, days: 31 },
  { name: "Jun", num: 6, days: 30 },
  { name: "Jul", num: 7, days: 31 },
  { name: "Aug", num: 8, days: 31 },
  { name: "Sep", num: 9, days: 30 },
  { name: "Oct", num: 10, days: 31 },
  { name: "Nov", num: 11, days: 30 },
  { name: "Dec", num: 12, days: 31 },
];

const months2027 = [
  { name: "Jan", num: 1, days: 31 },
  { name: "Feb", num: 2, days: 28 },
  { name: "Mar", num: 3, days: 31 },
  { name: "Apr", num: 4, days: 30 },
  { name: "May", num: 5, days: 31 },
  { name: "Jun", num: 6, days: 30 },
  { name: "Jul", num: 7, days: 31 },
  { name: "Aug", num: 8, days: 31 },
  { name: "Sep", num: 9, days: 30 },
  { name: "Oct", num: 10, days: 31 },
  { name: "Nov", num: 11, days: 30 },
  { name: "Dec", num: 12, days: 31 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getOrbMultiplier(aspect: PlanetaryAspect): number {
  const maxOrb = ASPECTS[aspect.aspectType].orb;
  const orbTightness = Math.max(0, 1 - aspect.orb / maxOrb);
  return Math.pow(orbTightness, 1.5);
}

function isConjunctionHarmonious(aspect: PlanetaryAspect): boolean {
  return BENEFICS.includes(aspect.transitPlanet) || BENEFICS.includes(aspect.natalPlanet);
}

function isConjunctionChallenging(aspect: PlanetaryAspect): boolean {
  return MALEFICS.includes(aspect.transitPlanet) || MALEFICS.includes(aspect.natalPlanet);
}

// ============================================
// VARIATION E: Weighted Ratio + Intensity
// ============================================
function variationE(aspects: PlanetaryAspect[]): number {
  let harmonious = 0;
  let challenging = 0;

  for (const aspect of aspects) {
    const basePower = ASPECTS[aspect.aspectType].power;
    const orbMultiplier = getOrbMultiplier(aspect);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

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

  const total = harmonious + challenging;
  if (total === 0) return 50;

  const ratio = (harmonious / total) * 100;
  const intensityBonus = Math.min(15, Math.sqrt(total) * 2);
  const score = Math.round(ratio * 0.8 + intensityBonus);

  return Math.max(0, Math.min(100, score));
}

// ============================================
// VARIATION F: Flow Score
// ============================================
function variationF(aspects: PlanetaryAspect[]): number {
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

// ============================================
// GATHER DATA FOR BOTH YEARS
// ============================================

interface DayScore {
  date: string;
  year: number;
  month: string;
  day: number;
  scoreE: number;
  scoreF: number;
}

const allScores: DayScore[] = [];

// 2026 (use cached transits)
console.log("Processing 2026...");
for (const month of months2026) {
  for (let day = 1; day <= month.days; day++) {
    const date = `2026-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const aspects = findAspectsOnDate(natalPositions, date, transitCache2026);
    allScores.push({
      date,
      year: 2026,
      month: month.name,
      day,
      scoreE: variationE(aspects),
      scoreF: variationF(aspects),
    });
  }
}

// 2027 (calculate on the fly - the cache only has 2026, but findAspectsOnDate should still work)
console.log("Processing 2027...");
for (const month of months2027) {
  for (let day = 1; day <= month.days; day++) {
    const date = `2027-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // Note: Transit cache is for 2026, but we can still calculate aspects
    // The function will use ephemeris data if available
    try {
      const aspects = findAspectsOnDate(natalPositions, date, transitCache2026);
      allScores.push({
        date,
        year: 2027,
        month: month.name,
        day,
        scoreE: variationE(aspects),
        scoreF: variationF(aspects),
      });
    } catch (e) {
      // If 2027 data not available, skip
      console.log(`Skipping ${date} - data not available`);
    }
  }
}

// ============================================
// OUTPUT RESULTS
// ============================================

console.log("\n" + "=".repeat(90));
console.log("2-YEAR SIMULATION: Variations E & F (2026-2027)");
console.log("=".repeat(90));
console.log(`\nBirth Data: ${DEV_BIRTH_DATA.date} ${DEV_BIRTH_DATA.time} (${DEV_BIRTH_DATA.location.name})`);
console.log(`Total Days Analyzed: ${allScores.length}\n`);

console.log("VARIATIONS:");
console.log("  E = Weighted Ratio + Intensity Bonus");
console.log("  F = Flow Score (Harmonious vs Challenging Balance)");
console.log("");
console.log("THRESHOLDS:");
console.log("  Power Day: Score ≥ 65");
console.log("  Rest Day:  Score ≤ 35");

// Split by year
const scores2026 = allScores.filter(d => d.year === 2026);
const scores2027 = allScores.filter(d => d.year === 2027);

// ============================================
// YEARLY SUMMARY
// ============================================

function analyzeYear(scores: DayScore[], year: number) {
  console.log("\n" + "=".repeat(90));
  console.log(`${year} ANALYSIS (${scores.length} days)`);
  console.log("=".repeat(90));

  // Variation E stats
  const eScores = scores.map(d => d.scoreE);
  const eMin = Math.min(...eScores);
  const eMax = Math.max(...eScores);
  const eAvg = Math.round(eScores.reduce((a, b) => a + b, 0) / eScores.length);
  const ePower = eScores.filter(s => s >= 65).length;
  const eRest = eScores.filter(s => s <= 35).length;
  const ePowerPct = Math.round((ePower / eScores.length) * 100);
  const eRestPct = Math.round((eRest / eScores.length) * 100);

  // Variation F stats
  const fScores = scores.map(d => d.scoreF);
  const fMin = Math.min(...fScores);
  const fMax = Math.max(...fScores);
  const fAvg = Math.round(fScores.reduce((a, b) => a + b, 0) / fScores.length);
  const fPower = fScores.filter(s => s >= 65).length;
  const fRest = fScores.filter(s => s <= 35).length;
  const fPowerPct = Math.round((fPower / fScores.length) * 100);
  const fRestPct = Math.round((fRest / fScores.length) * 100);

  console.log("\n--- Overall Statistics ---\n");
  console.log("Var | Range    | Avg | Power Days | Rest Days  | Power % | Rest %");
  console.log("----|----------|-----|------------|------------|---------|--------");
  console.log(`E   | ${String(eMin).padStart(2)}-${String(eMax).padStart(3)}   | ${String(eAvg).padStart(3)} | ${String(ePower).padStart(10)} | ${String(eRest).padStart(10)} | ${String(ePowerPct).padStart(6)}% | ${String(eRestPct).padStart(5)}%`);
  console.log(`F   | ${String(fMin).padStart(2)}-${String(fMax).padStart(3)}   | ${String(fAvg).padStart(3)} | ${String(fPower).padStart(10)} | ${String(fRest).padStart(10)} | ${String(fPowerPct).padStart(6)}% | ${String(fRestPct).padStart(5)}%`);

  // Monthly breakdown
  console.log("\n--- Monthly Breakdown ---\n");
  console.log("Month | Days | E: Power/Rest | F: Power/Rest | E Avg | F Avg");
  console.log("------|------|---------------|---------------|-------|------");

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (const monthName of monthNames) {
    const monthScores = scores.filter(d => d.month === monthName);
    if (monthScores.length === 0) continue;

    const mE = monthScores.map(d => d.scoreE);
    const mF = monthScores.map(d => d.scoreF);

    const mEPower = mE.filter(s => s >= 65).length;
    const mERest = mE.filter(s => s <= 35).length;
    const mFPower = mF.filter(s => s >= 65).length;
    const mFRest = mF.filter(s => s <= 35).length;
    const mEAvg = Math.round(mE.reduce((a, b) => a + b, 0) / mE.length);
    const mFAvg = Math.round(mF.reduce((a, b) => a + b, 0) / mF.length);

    console.log(
      `${monthName}   | ${String(monthScores.length).padStart(4)} | ` +
      `${String(mEPower).padStart(5)}/${String(mERest).padStart(4)}    | ` +
      `${String(mFPower).padStart(5)}/${String(mFRest).padStart(4)}    | ` +
      `${String(mEAvg).padStart(5)} | ${String(mFAvg).padStart(5)}`
    );
  }

  // Distribution histograms
  console.log("\n--- Score Distribution (E) ---\n");
  const eBuckets = [
    { range: "80-100", min: 80, max: 100, label: "⚡⚡ Peak" },
    { range: "65-79 ", min: 65, max: 79, label: "⚡  Power" },
    { range: "50-64 ", min: 50, max: 64, label: "   Balanced" },
    { range: "35-49 ", min: 35, max: 49, label: "   Low" },
    { range: "20-34 ", min: 20, max: 34, label: "😴  Rest" },
    { range: "0-19  ", min: 0, max: 19, label: "😴😴 Deep" },
  ];

  for (const bucket of eBuckets) {
    const count = eScores.filter(s => s >= bucket.min && s <= bucket.max).length;
    const pct = Math.round((count / eScores.length) * 100);
    const bar = "█".repeat(Math.round(pct / 2));
    console.log(`${bucket.range}: ${String(count).padStart(3)} (${String(pct).padStart(2)}%) ${bar} ${bucket.label}`);
  }

  console.log("\n--- Score Distribution (F) ---\n");
  for (const bucket of eBuckets) {
    const count = fScores.filter(s => s >= bucket.min && s <= bucket.max).length;
    const pct = Math.round((count / fScores.length) * 100);
    const bar = "█".repeat(Math.round(pct / 2));
    console.log(`${bucket.range}: ${String(count).padStart(3)} (${String(pct).padStart(2)}%) ${bar} ${bucket.label}`);
  }

  // Top power and rest days
  console.log("\n--- Top 5 Power Days ---\n");
  const sortedByE = [...scores].sort((a, b) => b.scoreE - a.scoreE);
  for (let i = 0; i < 5 && i < sortedByE.length; i++) {
    const d = sortedByE[i];
    console.log(`${i + 1}. ${d.date} - E: ${d.scoreE}, F: ${d.scoreF}`);
  }

  console.log("\n--- Top 5 Rest Days ---\n");
  const sortedByEAsc = [...scores].sort((a, b) => a.scoreE - b.scoreE);
  for (let i = 0; i < 5 && i < sortedByEAsc.length; i++) {
    const d = sortedByEAsc[i];
    console.log(`${i + 1}. ${d.date} - E: ${d.scoreE}, F: ${d.scoreF}`);
  }
}

analyzeYear(scores2026, 2026);
if (scores2027.length > 0) {
  analyzeYear(scores2027, 2027);
}

// ============================================
// COMBINED 2-YEAR SUMMARY
// ============================================

console.log("\n" + "=".repeat(90));
console.log("COMBINED 2-YEAR SUMMARY");
console.log("=".repeat(90) + "\n");

const allE = allScores.map(d => d.scoreE);
const allF = allScores.map(d => d.scoreF);

const totalDays = allScores.length;

console.log("VARIATION E (Weighted Ratio + Intensity):");
console.log(`  Range: ${Math.min(...allE)} - ${Math.max(...allE)}`);
console.log(`  Average: ${Math.round(allE.reduce((a, b) => a + b, 0) / totalDays)}`);
console.log(`  Power Days (≥65): ${allE.filter(s => s >= 65).length} (${Math.round((allE.filter(s => s >= 65).length / totalDays) * 100)}%)`);
console.log(`  Rest Days (≤35):  ${allE.filter(s => s <= 35).length} (${Math.round((allE.filter(s => s <= 35).length / totalDays) * 100)}%)`);
console.log(`  Neutral Days:     ${allE.filter(s => s > 35 && s < 65).length} (${Math.round((allE.filter(s => s > 35 && s < 65).length / totalDays) * 100)}%)`);

console.log("\nVARIATION F (Flow Score):");
console.log(`  Range: ${Math.min(...allF)} - ${Math.max(...allF)}`);
console.log(`  Average: ${Math.round(allF.reduce((a, b) => a + b, 0) / totalDays)}`);
console.log(`  Power Days (≥65): ${allF.filter(s => s >= 65).length} (${Math.round((allF.filter(s => s >= 65).length / totalDays) * 100)}%)`);
console.log(`  Rest Days (≤35):  ${allF.filter(s => s <= 35).length} (${Math.round((allF.filter(s => s <= 35).length / totalDays) * 100)}%)`);
console.log(`  Neutral Days:     ${allF.filter(s => s > 35 && s < 65).length} (${Math.round((allF.filter(s => s > 35 && s < 65).length / totalDays) * 100)}%)`);

// Rating
console.log("\n" + "=".repeat(90));
console.log("FINAL RATING");
console.log("=".repeat(90) + "\n");

const ePowerPct = Math.round((allE.filter(s => s >= 65).length / totalDays) * 100);
const eRestPct = Math.round((allE.filter(s => s <= 35).length / totalDays) * 100);
const fPowerPct = Math.round((allF.filter(s => s >= 65).length / totalDays) * 100);
const fRestPct = Math.round((allF.filter(s => s <= 35).length / totalDays) * 100);

function rate(power: number, rest: number): string {
  if (power >= 12 && power <= 22 && rest >= 10 && rest <= 20) return "✅ EXCELLENT";
  if (power >= 8 && power <= 28 && rest >= 5 && rest <= 25) return "👍 GOOD";
  return "⚠️ Needs adjustment";
}

console.log(`Variation E: ${ePowerPct}% power / ${eRestPct}% rest → ${rate(ePowerPct, eRestPct)}`);
console.log(`Variation F: ${fPowerPct}% power / ${fRestPct}% rest → ${rate(fPowerPct, fRestPct)}`);

console.log("\nTarget: 15-20% Power, 10-15% Rest, 65-75% Neutral");
