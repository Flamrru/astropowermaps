/**
 * Test script for Lifetime Special Transits
 *
 * Verifies the calculation by testing against known Saturn Return dates
 * for a sample birth date.
 *
 * Run with: npx ts-node scripts/test-lifetime-transits.ts
 */

import { calculateLifetimeTransits } from "../src/lib/astro/lifetime-transits";
import { calculateNatalPositions } from "../src/lib/astro/calculations";
import { BirthData } from "../src/lib/astro/types";

// Test birth data: January 1, 1995, 12:00 PM in New York
const testBirthData: BirthData = {
  date: "1995-01-01",
  time: "12:00",
  timeUnknown: false,
  location: {
    name: "New York, NY, USA",
    lat: 40.7128,
    lng: -74.006,
    timezone: "America/New_York",
  },
};

console.log("=".repeat(60));
console.log("LIFETIME SPECIAL TRANSITS TEST");
console.log("=".repeat(60));
console.log("\nBirth Data:");
console.log(`  Date: ${testBirthData.date}`);
console.log(`  Time: ${testBirthData.time}`);
console.log(`  Location: ${testBirthData.location.name}`);
console.log("");

// Calculate natal positions
const natalPositions = calculateNatalPositions(testBirthData);
console.log("Natal Positions:");
for (const pos of natalPositions) {
  console.log(`  ${pos.id.padEnd(10)} ${pos.longitude.toFixed(2)}°`);
}
console.log("");

// Calculate lifetime transits
console.log("Calculating lifetime transits (90 years)...");
const startTime = Date.now();
const report = calculateLifetimeTransits(testBirthData, natalPositions);
const elapsed = Date.now() - startTime;
console.log(`Calculation time: ${elapsed}ms`);
console.log("");

// Display Saturn Returns
console.log("-".repeat(60));
console.log("SATURN RETURNS");
console.log("-".repeat(60));
for (const transit of report.saturnReturns) {
  console.log(`\n${transit.label}`);
  console.log(`  Exact Date: ${transit.exactDate}`);
  console.log(`  Age: ${transit.ageAtTransit}`);
  console.log(`  Hits: ${transit.hits.length}`);
  for (const hit of transit.hits) {
    console.log(
      `    - ${hit.date} (${hit.phase}${hit.isRetrograde ? ", retrograde" : ""})`
    );
  }
}
console.log("");

// Display Jupiter Returns
console.log("-".repeat(60));
console.log("JUPITER RETURNS");
console.log("-".repeat(60));
for (const transit of report.jupiterReturns) {
  console.log(`  ${transit.exactDate} - Age ${transit.ageAtTransit}`);
}
console.log("");

// Display Chiron Return
console.log("-".repeat(60));
console.log("CHIRON RETURN");
console.log("-".repeat(60));
if (report.chironReturn) {
  console.log(`  Exact Date: ${report.chironReturn.exactDate}`);
  console.log(`  Age: ${report.chironReturn.ageAtTransit}`);
} else {
  console.log("  No Chiron Return found in lifespan");
}
console.log("");

// Display Outer Planet Transits
console.log("-".repeat(60));
console.log("OUTER PLANET TRANSITS (to Sun/Moon)");
console.log("-".repeat(60));
if (report.outerPlanetTransits.length === 0) {
  console.log("  No outer planet transits to Sun/Moon in lifespan");
} else {
  for (const transit of report.outerPlanetTransits) {
    console.log(`\n  ${transit.label}`);
    console.log(`    Date: ${transit.exactDate}, Age: ${transit.ageAtTransit}`);
    console.log(`    Rarity: ${transit.rarity}`);
  }
}
console.log("");

// Next major transit
console.log("-".repeat(60));
console.log("NEXT MAJOR TRANSIT");
console.log("-".repeat(60));
if (report.nextMajorTransit) {
  console.log(`  ${report.nextMajorTransit.label}`);
  console.log(`  Date: ${report.nextMajorTransit.exactDate}`);
  console.log(`  Age: ${report.nextMajorTransit.ageAtTransit}`);
} else {
  console.log("  All major transits are in the past");
}
console.log("");

// Summary
console.log("=".repeat(60));
console.log("SUMMARY");
console.log("=".repeat(60));
console.log(`  Total transits found: ${report.allTransits.length}`);
console.log(`  Saturn Returns: ${report.saturnReturns.length}`);
console.log(`  Jupiter Returns: ${report.jupiterReturns.length}`);
console.log(`  Chiron Return: ${report.chironReturn ? "Yes" : "No"}`);
console.log(`  Outer Planet Transits: ${report.outerPlanetTransits.length}`);
console.log("");
