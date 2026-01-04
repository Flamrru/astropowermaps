/**
 * Multi-Person Simulation: Variation F
 *
 * Tests Flow Score across different birth charts to validate consistency
 * Run with: npx tsx scripts/simulate-multiple-people.ts
 */

import { calculateNatalPositions } from "../src/lib/astro/calculations";
import { get2026Transits, findAspectsOnDate } from "../src/lib/astro/transit-calculations";
import { ASPECTS, PlanetaryAspect } from "../src/lib/astro/transit-types";
import { PlanetId, BirthData } from "../src/lib/astro/types";

// ============================================
// TEST PROFILES - 4 Different People
// ============================================

const TEST_PROFILES: { name: string; data: BirthData; description: string }[] = [
  {
    name: "Sarah (Original Dev)",
    description: "Taurus Sun, 1988, Bratislava - Afternoon birth",
    data: {
      date: "1988-05-05",
      time: "14:30",
      timeUnknown: false,
      location: {
        name: "Bratislava, Slovakia",
        lat: 48.1486,
        lng: 17.1077,
        timezone: "Europe/Bratislava",
      },
    },
  },
  {
    name: "Marcus",
    description: "Scorpio Sun, 1995, New York - Morning birth",
    data: {
      date: "1995-11-08",
      time: "06:45",
      timeUnknown: false,
      location: {
        name: "New York, USA",
        lat: 40.7128,
        lng: -74.006,
        timezone: "America/New_York",
      },
    },
  },
  {
    name: "Yuki",
    description: "Cancer Sun, 1978, Tokyo - Midnight birth",
    data: {
      date: "1978-07-15",
      time: "00:15",
      timeUnknown: false,
      location: {
        name: "Tokyo, Japan",
        lat: 35.6762,
        lng: 139.6503,
        timezone: "Asia/Tokyo",
      },
    },
  },
  {
    name: "Luna",
    description: "Aquarius Sun, 2001, São Paulo - Evening birth",
    data: {
      date: "2001-02-14",
      time: "19:30",
      timeUnknown: false,
      location: {
        name: "São Paulo, Brazil",
        lat: -23.5505,
        lng: -46.6333,
        timezone: "America/Sao_Paulo",
      },
    },
  },
];

// Planet categories
const PERSONAL_PLANETS: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars"];
const LUMINARIES: PlanetId[] = ["sun", "moon"];
const HARMONIOUS_ASPECTS = ["trine", "sextile"];
const CHALLENGING_ASPECTS = ["square", "opposition"];
const CONJUNCTION = ["conjunction"];
const BENEFICS: PlanetId[] = ["venus", "jupiter"];
const MALEFICS: PlanetId[] = ["mars", "saturn"];

// All months
const allMonths = [
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
// VARIATION F: Flow Score
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

function variationF(aspects: PlanetaryAspect[]): { score: number; harmonious: number; challenging: number } {
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
  if (total === 0) return { score: 50, harmonious, challenging };

  const harmRatio = harmonious / total;
  const baseScore = harmRatio * 100;
  const magnitude = Math.sqrt(total) / 10;
  const magnitudeEffect = (harmRatio - 0.5) * magnitude * 20;

  const score = Math.max(0, Math.min(100, Math.round(baseScore + magnitudeEffect)));
  return { score, harmonious, challenging };
}

// ============================================
// MAIN SIMULATION
// ============================================

console.log("\n" + "=".repeat(90));
console.log("MULTI-PERSON SIMULATION: Variation F (Flow Score)");
console.log("Testing 4 different birth charts across 2026-2027");
console.log("=".repeat(90) + "\n");

console.log("Generating transit cache...");
const transitCache = get2026Transits();

interface PersonResults {
  name: string;
  description: string;
  scores2026: number[];
  scores2027: number[];
  allScores: number[];
}

const allResults: PersonResults[] = [];

for (const profile of TEST_PROFILES) {
  console.log(`\nProcessing ${profile.name}...`);

  const natalPositions = calculateNatalPositions(profile.data);
  const scores2026: number[] = [];
  const scores2027: number[] = [];

  // 2026
  for (const month of allMonths) {
    for (let day = 1; day <= month.days; day++) {
      const date = `2026-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const aspects = findAspectsOnDate(natalPositions, date, transitCache);
      scores2026.push(variationF(aspects).score);
    }
  }

  // 2027
  for (const month of allMonths) {
    for (let day = 1; day <= month.days; day++) {
      const date = `2027-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const aspects = findAspectsOnDate(natalPositions, date, transitCache);
      scores2027.push(variationF(aspects).score);
    }
  }

  allResults.push({
    name: profile.name,
    description: profile.description,
    scores2026,
    scores2027,
    allScores: [...scores2026, ...scores2027],
  });
}

// ============================================
// OUTPUT RESULTS
// ============================================

console.log("\n" + "=".repeat(90));
console.log("RESULTS SUMMARY");
console.log("=".repeat(90));

// Overview table
console.log("\n--- 2-Year Overview (All 4 People) ---\n");
console.log("Person          | Sun Sign   | Range   | Avg | Power% | Rest%  | Rating");
console.log("----------------|------------|---------|-----|--------|--------|--------");

for (const result of allResults) {
  const scores = result.allScores;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const powerPct = Math.round((scores.filter(s => s >= 65).length / scores.length) * 100);
  const restPct = Math.round((scores.filter(s => s <= 35).length / scores.length) * 100);

  let rating = "";
  if (powerPct >= 12 && powerPct <= 28 && restPct >= 10 && restPct <= 25) rating = "✅ GOOD";
  else if (powerPct >= 8 && powerPct <= 35 && restPct >= 5 && restPct <= 30) rating = "👍 OK";
  else rating = "⚠️ Check";

  const sunSign = result.description.split(",")[0].split(" ")[0];
  console.log(
    `${result.name.padEnd(15)} | ${sunSign.padEnd(10)} | ${String(min).padStart(2)}-${String(max).padStart(3)}  | ` +
    `${String(avg).padStart(3)} | ${String(powerPct).padStart(5)}% | ${String(restPct).padStart(5)}% | ${rating}`
  );
}

// Detailed breakdown per person
for (const result of allResults) {
  console.log("\n" + "=".repeat(90));
  console.log(`${result.name.toUpperCase()} - ${result.description}`);
  console.log("=".repeat(90));

  // 2026 stats
  const s26 = result.scores2026;
  const s27 = result.scores2027;

  console.log("\n--- Year Comparison ---\n");
  console.log("Year | Range   | Avg | Power (≥65) | Rest (≤35) | Power% | Rest%");
  console.log("-----|---------|-----|-------------|------------|--------|------");

  for (const [year, scores] of [["2026", s26], ["2027", s27]] as const) {
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const power = scores.filter(s => s >= 65).length;
    const rest = scores.filter(s => s <= 35).length;
    const powerPct = Math.round((power / scores.length) * 100);
    const restPct = Math.round((rest / scores.length) * 100);

    console.log(
      `${year} | ${String(min).padStart(2)}-${String(max).padStart(3)}  | ${String(avg).padStart(3)} | ` +
      `${String(power).padStart(11)} | ${String(rest).padStart(10)} | ${String(powerPct).padStart(5)}% | ${String(restPct).padStart(4)}%`
    );
  }

  // Distribution
  console.log("\n--- Score Distribution (Both Years) ---\n");
  const scores = result.allScores;
  const buckets = [
    { range: "85-100", min: 85, max: 100, label: "⚡⚡ Peak Power" },
    { range: "65-84 ", min: 65, max: 84, label: "⚡  Power Day" },
    { range: "50-64 ", min: 50, max: 64, label: "   Balanced" },
    { range: "35-49 ", min: 35, max: 49, label: "   Low Energy" },
    { range: "20-34 ", min: 20, max: 34, label: "😴  Rest Day" },
    { range: "0-19  ", min: 0, max: 19, label: "😴😴 Deep Rest" },
  ];

  for (const bucket of buckets) {
    const count = scores.filter(s => s >= bucket.min && s <= bucket.max).length;
    const pct = Math.round((count / scores.length) * 100);
    const bar = "█".repeat(Math.round(pct / 2));
    console.log(`${bucket.range}: ${String(count).padStart(3)} (${String(pct).padStart(2)}%) ${bar} ${bucket.label}`);
  }

  // Top days
  console.log("\n--- Best Power Days ---");
  const indexed2026 = s26.map((s, i) => ({ score: s, year: 2026, dayOfYear: i + 1 }));
  const indexed2027 = s27.map((s, i) => ({ score: s, year: 2027, dayOfYear: i + 1 }));
  const allIndexed = [...indexed2026, ...indexed2027];
  const topPower = allIndexed.sort((a, b) => b.score - a.score).slice(0, 5);

  for (const d of topPower) {
    const date = dayOfYearToDate(d.year, d.dayOfYear);
    console.log(`  ${date}: Score ${d.score}`);
  }

  console.log("\n--- Deepest Rest Days ---");
  const bottomRest = allIndexed.sort((a, b) => a.score - b.score).slice(0, 5);
  for (const d of bottomRest) {
    const date = dayOfYearToDate(d.year, d.dayOfYear);
    console.log(`  ${date}: Score ${d.score}`);
  }
}

// Helper function
function dayOfYearToDate(year: number, dayOfYear: number): string {
  const date = new Date(year, 0, dayOfYear);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${year}`;
}

// ============================================
// CROSS-PERSON COMPARISON
// ============================================

console.log("\n" + "=".repeat(90));
console.log("CROSS-PERSON ANALYSIS");
console.log("=".repeat(90));

// Do all people have similar distribution patterns?
console.log("\n--- Distribution Consistency Check ---\n");
console.log("All 4 people should have similar percentages for the system to be fair.\n");

console.log("Bucket      | Sarah  | Marcus | Yuki   | Luna   | Variance");
console.log("------------|--------|--------|--------|--------|----------");

const bucketRanges = [
  { name: "Peak Power", min: 85, max: 100 },
  { name: "Power Day ", min: 65, max: 84 },
  { name: "Balanced  ", min: 50, max: 64 },
  { name: "Low Energy", min: 35, max: 49 },
  { name: "Rest Day  ", min: 20, max: 34 },
  { name: "Deep Rest ", min: 0, max: 19 },
];

for (const bucket of bucketRanges) {
  const pcts = allResults.map(r => {
    const count = r.allScores.filter(s => s >= bucket.min && s <= bucket.max).length;
    return Math.round((count / r.allScores.length) * 100);
  });

  const variance = Math.max(...pcts) - Math.min(...pcts);
  const varianceRating = variance <= 10 ? "✅" : variance <= 15 ? "👍" : "⚠️";

  console.log(
    `${bucket.name} | ${String(pcts[0]).padStart(4)}%  | ${String(pcts[1]).padStart(4)}%  | ` +
    `${String(pcts[2]).padStart(4)}%  | ${String(pcts[3]).padStart(4)}%  | ${String(variance).padStart(3)}% ${varianceRating}`
  );
}

// Check if different people have different best days (they should!)
console.log("\n--- Best Day Uniqueness (Each person's #1 power day) ---\n");

for (const result of allResults) {
  const indexed2026 = result.scores2026.map((s, i) => ({ score: s, year: 2026, dayOfYear: i + 1 }));
  const indexed2027 = result.scores2027.map((s, i) => ({ score: s, year: 2027, dayOfYear: i + 1 }));
  const best = [...indexed2026, ...indexed2027].sort((a, b) => b.score - a.score)[0];
  const date = dayOfYearToDate(best.year, best.dayOfYear);
  console.log(`${result.name.padEnd(15)}: ${date} (Score: ${best.score})`);
}

// Final summary
console.log("\n" + "=".repeat(90));
console.log("FINAL VERDICT");
console.log("=".repeat(90) + "\n");

const avgPowerPct = Math.round(allResults.reduce((sum, r) => {
  return sum + (r.allScores.filter(s => s >= 65).length / r.allScores.length) * 100;
}, 0) / allResults.length);

const avgRestPct = Math.round(allResults.reduce((sum, r) => {
  return sum + (r.allScores.filter(s => s <= 35).length / r.allScores.length) * 100;
}, 0) / allResults.length);

console.log(`Average across all 4 people:`);
console.log(`  Power Days: ${avgPowerPct}% (target: 15-20%)`);
console.log(`  Rest Days:  ${avgRestPct}% (target: 10-15%)`);
console.log(`  Neutral:    ${100 - avgPowerPct - avgRestPct}% (target: 65-75%)`);
console.log("");

if (avgPowerPct >= 12 && avgPowerPct <= 28 && avgRestPct >= 10 && avgRestPct <= 25) {
  console.log("✅ VARIATION F WORKS CONSISTENTLY ACROSS DIFFERENT BIRTH CHARTS!");
  console.log("");
  console.log("The scoring system is fair and produces meaningful variation for everyone.");
} else {
  console.log("⚠️ Distribution needs tuning - thresholds may need adjustment.");
}
