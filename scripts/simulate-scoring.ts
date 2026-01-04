/**
 * Scoring Formula Simulation - 4 Month Analysis (Sqrt ×8)
 *
 * Run with: npx tsx scripts/simulate-scoring.ts
 */

import { calculateNatalPositions } from "../src/lib/astro/calculations";
import { get2026Transits, findAspectsOnDate } from "../src/lib/astro/transit-calculations";
import { ASPECTS } from "../src/lib/astro/transit-types";
import { DEV_BIRTH_DATA } from "../src/lib/mock-data";

// Get natal positions for dev user
const natalPositions = calculateNatalPositions(DEV_BIRTH_DATA);
const transitCache = get2026Transits();

console.log("\n=== SQRT ×8 SCORING - 4 Month Analysis (Jan-Apr 2026) ===\n");
console.log(`Birth Data: ${DEV_BIRTH_DATA.date} ${DEV_BIRTH_DATA.time} (${DEV_BIRTH_DATA.location.name})\n`);

interface DayData {
  date: string;
  month: string;
  day: number;
  rawPower: number;
  aspectCount: number;
  score: number;
}

const allData: DayData[] = [];
const months = [
  { name: "January", num: 1, days: 31 },
  { name: "February", num: 2, days: 28 },
  { name: "March", num: 3, days: 31 },
  { name: "April", num: 4, days: 30 },
];

// Sqrt ×8 formula
const sqrtScore = (raw: number) => Math.min(100, Math.round(Math.sqrt(raw) * 8));

for (const month of months) {
  for (let day = 1; day <= month.days; day++) {
    const date = `2026-${String(month.num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const aspects = findAspectsOnDate(natalPositions, date, transitCache);

    let totalPower = 0;

    for (const aspect of aspects) {
      const basePower = ASPECTS[aspect.aspectType].power;
      const maxOrb = ASPECTS[aspect.aspectType].orb;
      const orbTightness = Math.max(0, 1 - aspect.orb / maxOrb);
      const orbMultiplier = Math.pow(orbTightness, 1.5);
      const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

      const nature = ASPECTS[aspect.aspectType].nature;
      let natureModifier = 0.5;
      switch (nature) {
        case "harmonious": natureModifier = 1.0; break;
        case "major": natureModifier = 0.9; break;
        case "awareness": natureModifier = 0.7; break;
        case "challenging": natureModifier = 0.5; break;
        case "minor-harmonious": natureModifier = 0.6; break;
        case "adjustment": natureModifier = 0.4; break;
        case "minor-challenging": natureModifier = 0.3; break;
      }

      totalPower += basePower * orbMultiplier * applyingBonus * natureModifier;
    }

    allData.push({
      date,
      month: month.name,
      day,
      rawPower: totalPower,
      aspectCount: aspects.length,
      score: sqrtScore(totalPower),
    });
  }
}

// Print each month's data
for (const month of months) {
  const monthData = allData.filter(d => d.month === month.name);

  console.log(`\n=== ${month.name.toUpperCase()} 2026 ===\n`);
  console.log("Day | Raw   | Asp | Score | Day Type");
  console.log("----|-------|-----|-------|----------");

  for (const d of monthData) {
    const dayType = d.score >= 70 ? "⚡ POWER" : d.score <= 40 ? "😴 Rest" : "   Neutral";
    console.log(
      `${String(d.day).padStart(2)} | ${d.rawPower.toFixed(1).padStart(5)} | ${String(d.aspectCount).padStart(3)} | ` +
      `${String(d.score).padStart(5)} | ${dayType}`
    );
  }

  // Month summary
  const scores = monthData.map(d => d.score);
  const powerDays = monthData.filter(d => d.score >= 70).length;
  const restDays = monthData.filter(d => d.score <= 40).length;
  const neutralDays = monthData.filter(d => d.score > 40 && d.score < 70).length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  console.log(`\n${month.name} Summary:`);
  console.log(`  Score Range: ${minScore} - ${maxScore} (avg: ${avgScore})`);
  console.log(`  ⚡ Power Days (≥70): ${powerDays}`);
  console.log(`  😴 Rest Days (≤40): ${restDays}`);
  console.log(`     Neutral Days: ${neutralDays}`);
}

// Overall 4-month summary
console.log("\n" + "=".repeat(60));
console.log("=== 4-MONTH OVERALL SUMMARY (SQRT ×8) ===");
console.log("=".repeat(60) + "\n");

const allScores = allData.map(d => d.score);
const totalPowerDays = allData.filter(d => d.score >= 70).length;
const totalRestDays = allData.filter(d => d.score <= 40).length;
const totalNeutralDays = allData.filter(d => d.score > 40 && d.score < 70).length;

console.log(`Total Days Analyzed: ${allData.length}`);
console.log(`Score Range: ${Math.min(...allScores)} - ${Math.max(...allScores)}`);
console.log(`Average Score: ${Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)}`);
console.log("");
console.log(`⚡ Power Days (≥70): ${totalPowerDays} (${Math.round(totalPowerDays/allData.length*100)}%)`);
console.log(`😴 Rest Days (≤40):  ${totalRestDays} (${Math.round(totalRestDays/allData.length*100)}%)`);
console.log(`   Neutral Days:     ${totalNeutralDays} (${Math.round(totalNeutralDays/allData.length*100)}%)`);

// Score distribution histogram
console.log("\n--- Score Distribution ---\n");
const buckets = [
  { range: "90-100", min: 90, max: 100 },
  { range: "80-89", min: 80, max: 89 },
  { range: "70-79", min: 70, max: 79 },
  { range: "60-69", min: 60, max: 69 },
  { range: "50-59", min: 50, max: 59 },
  { range: "40-49", min: 40, max: 49 },
  { range: "30-39", min: 30, max: 39 },
  { range: "20-29", min: 20, max: 29 },
];

for (const bucket of buckets) {
  const count = allData.filter(d => d.score >= bucket.min && d.score <= bucket.max).length;
  const bar = "█".repeat(Math.round(count / 2));
  console.log(`${bucket.range}: ${String(count).padStart(3)} ${bar}`);
}

// Top 10 best days across all 4 months
console.log("\n--- TOP 10 BEST DAYS (Jan-Apr 2026) ---\n");
const sortedByScore = [...allData].sort((a, b) => b.score - a.score);
for (let i = 0; i < 10; i++) {
  const d = sortedByScore[i];
  console.log(`${i + 1}. ${d.date} (${d.month.slice(0, 3)} ${d.day}) - Score: ${d.score}`);
}

// Top 10 rest days
console.log("\n--- TOP 10 REST DAYS (Lowest Energy) ---\n");
const sortedByScoreAsc = [...allData].sort((a, b) => a.score - b.score);
for (let i = 0; i < 10; i++) {
  const d = sortedByScoreAsc[i];
  console.log(`${i + 1}. ${d.date} (${d.month.slice(0, 3)} ${d.day}) - Score: ${d.score}`);
}
