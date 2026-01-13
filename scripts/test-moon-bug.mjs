/**
 * Moon Bug Simulation Script
 *
 * Tests the timezone bug in transit cache generation and verifies the fix.
 *
 * Usage: node scripts/test-moon-bug.mjs
 */

import * as julian from 'astronomia/julian';
import * as moonposition from 'astronomia/moonposition';

const RAD_TO_DEG = 180 / Math.PI;

// Zodiac signs with their degree ranges
const ZODIAC_SIGNS = [
  { name: "Aries", start: 0 },
  { name: "Taurus", start: 30 },
  { name: "Gemini", start: 60 },
  { name: "Cancer", start: 90 },
  { name: "Leo", start: 120 },
  { name: "Virgo", start: 150 },
  { name: "Libra", start: 180 },
  { name: "Scorpio", start: 210 },
  { name: "Sagittarius", start: 240 },
  { name: "Capricorn", start: 270 },
  { name: "Aquarius", start: 300 },
  { name: "Pisces", start: 330 },
];

function getZodiacSign(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[signIndex].name;
}

function getMoonPosition(jd) {
  const moon = moonposition.position(jd);
  const longitude = ((moon.lon * RAD_TO_DEG % 360) + 360) % 360;
  return {
    longitude,
    sign: getZodiacSign(longitude),
    degree: Math.round((longitude % 30) * 100) / 100
  };
}

// ============================================
// BUGGY VERSION (current code)
// ============================================

function dateToJulianDay_BUGGY(date) {
  // Current code uses UTC methods on a local Date
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const decimalDay = day + (hour + minute / 60) / 24;
  return julian.CalendarGregorianToJD(year, month, decimalDay);
}

function simulateBuggyCache(year, month, day, serverTimezoneOffset) {
  // Simulate a server in a different timezone
  // serverTimezoneOffset: hours ahead of UTC (e.g., +10 for Sydney)

  // new Date(year, month-1, day) creates LOCAL midnight
  // On a UTC+10 server, local Feb 1 00:00 = Jan 31 14:00 UTC

  const localDate = new Date(year, month - 1, day);

  // Simulate the timezone offset by adjusting what UTC methods return
  // This mimics what happens when the server is in a non-UTC timezone
  const utcHours = 24 - serverTimezoneOffset; // Hours in UTC when local is midnight
  const utcDay = utcHours >= 24 ? day : day - 1;
  const actualUtcHours = utcHours % 24;

  // Calculate JD as if we're on that timezone
  const jd = julian.CalendarGregorianToJD(year, month, utcDay + actualUtcHours / 24);

  return {
    localDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 00:00 local`,
    utcEquivalent: `${year}-${String(month).padStart(2, '0')}-${String(utcDay).padStart(2, '0')} ${String(actualUtcHours).padStart(2, '0')}:00 UTC`,
    julianDay: jd,
    moon: getMoonPosition(jd)
  };
}

// ============================================
// FIXED VERSION (proposed fix)
// ============================================

function isoDateToJulianDay_FIXED(isoDate) {
  // Fixed: Parse ISO string and use noon UTC consistently
  const [year, month, day] = isoDate.split('-').map(Number);
  return julian.CalendarGregorianToJD(year, month, day + 0.5); // Noon UTC
}

function simulateFixedCache(year, month, day) {
  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const jd = isoDateToJulianDay_FIXED(isoDate);

  return {
    isoDate,
    utcTime: `${isoDate} 12:00 UTC (noon)`,
    julianDay: jd,
    moon: getMoonPosition(jd)
  };
}

// ============================================
// RUN SIMULATION
// ============================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('   MOON BUG SIMULATION - February 1, 2026 Full Moon');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('ASTRONOMICAL FACT: Full Moon on Feb 1, 2026 at 22:09 UTC is in LEO (~13°)');
console.log('');

// Test the actual Full Moon moment
console.log('─────────────────────────────────────────────────────────────────');
console.log('1. ACTUAL FULL MOON MOMENT (Feb 1, 2026 22:09 UTC)');
console.log('─────────────────────────────────────────────────────────────────');
const fullMoonJD = julian.CalendarGregorianToJD(2026, 2, 1 + 22.15/24);
const fullMoonPos = getMoonPosition(fullMoonJD);
console.log(`   Julian Day: ${fullMoonJD.toFixed(4)}`);
console.log(`   Moon longitude: ${fullMoonPos.longitude.toFixed(2)}°`);
console.log(`   Moon sign: ${fullMoonPos.sign} (${fullMoonPos.degree.toFixed(1)}°)`);
console.log(`   Expected: LEO ✓`);
console.log('');

// Test buggy behavior on different server timezones
console.log('─────────────────────────────────────────────────────────────────');
console.log('2. BUGGY BEHAVIOR - Server timezone affects results');
console.log('─────────────────────────────────────────────────────────────────');

const timezones = [
  { name: 'UTC (Vercel default)', offset: 0 },
  { name: 'UTC+5 (Pakistan/India)', offset: 5 },
  { name: 'UTC+10 (Sydney)', offset: 10 },
  { name: 'UTC+12 (New Zealand)', offset: 12 },
];

for (const tz of timezones) {
  console.log(`\n   Server timezone: ${tz.name}`);
  const buggy = simulateBuggyCache(2026, 2, 1, tz.offset);
  console.log(`   Local date: ${buggy.localDate}`);
  console.log(`   UTC equivalent: ${buggy.utcEquivalent}`);
  console.log(`   Moon longitude: ${buggy.moon.longitude.toFixed(2)}°`);
  console.log(`   Moon sign: ${buggy.moon.sign} (${buggy.moon.degree.toFixed(1)}°)`);

  if (buggy.moon.sign === 'Leo') {
    console.log(`   Result: ✅ CORRECT (Leo)`);
  } else {
    console.log(`   Result: ❌ WRONG (${buggy.moon.sign} instead of Leo)`);
  }
}

console.log('');
console.log('─────────────────────────────────────────────────────────────────');
console.log('3. FIXED BEHAVIOR - Consistent UTC noon calculation');
console.log('─────────────────────────────────────────────────────────────────');

const fixed = simulateFixedCache(2026, 2, 1);
console.log(`\n   ISO Date: ${fixed.isoDate}`);
console.log(`   UTC Time: ${fixed.utcTime}`);
console.log(`   Julian Day: ${fixed.julianDay.toFixed(4)}`);
console.log(`   Moon longitude: ${fixed.moon.longitude.toFixed(2)}°`);
console.log(`   Moon sign: ${fixed.moon.sign} (${fixed.moon.degree.toFixed(1)}°)`);

if (fixed.moon.sign === 'Leo') {
  console.log(`   Result: ✅ CORRECT (Leo)`);
} else {
  console.log(`   Result: ❌ WRONG (${fixed.moon.sign} instead of Leo)`);
}

console.log('');
console.log('─────────────────────────────────────────────────────────────────');
console.log('4. VERIFICATION - Check neighboring dates');
console.log('─────────────────────────────────────────────────────────────────');

const testDates = [
  { date: '2026-01-03', expected: 'Cancer', note: 'Actual Cancer Full Moon' },
  { date: '2026-01-31', expected: 'Cancer', note: 'Day before Feb Full Moon' },
  { date: '2026-02-01', expected: 'Leo', note: 'Feb Full Moon (Emily\'s bug)' },
  { date: '2026-02-02', expected: 'Leo', note: 'Day after Feb Full Moon' },
];

console.log('\n   Date         | Expected | Fixed Result | Status');
console.log('   -------------|----------|--------------|--------');

for (const test of testDates) {
  const result = simulateFixedCache(
    parseInt(test.date.split('-')[0]),
    parseInt(test.date.split('-')[1]),
    parseInt(test.date.split('-')[2])
  );

  const status = result.moon.sign === test.expected ? '✅' : '❌';
  console.log(`   ${test.date}  | ${test.expected.padEnd(8)} | ${result.moon.sign.padEnd(12)} | ${status}`);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('   CONCLUSION');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('   The bug occurs when the server runs in a timezone ahead of UTC.');
console.log('   For Feb 1, 2026, a UTC+10 server calculates moon position for');
console.log('   Jan 31 14:00 UTC instead of Feb 1, showing Cancer instead of Leo.');
console.log('');
console.log('   The fix uses consistent UTC noon for all date calculations,');
console.log('   regardless of server timezone.');
console.log('');
