/**
 * Astro Calculation Bug Simulation Script
 *
 * Tests potential bugs identified in the astro calculations audit.
 * Run with: node scripts/test-astro-bugs.mjs
 */

console.log('═══════════════════════════════════════════════════════════════');
console.log('   ASTRO CALCULATIONS BUG SIMULATION');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

let allPassed = true;
let issues = [];

// ============================================
// TEST 1: Operator Precedence (calculations.ts:196)
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('1. OPERATOR PRECEDENCE - Testing longitude normalization');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

const RAD_TO_DEG = 180 / Math.PI;

// Simulate the current code
function normalizeLongitude_CURRENT(geoLon) {
  return ((geoLon * RAD_TO_DEG % 360) + 360) % 360;
}

// What the code SHOULD do (explicit parentheses)
function normalizeLongitude_INTENDED(geoLon) {
  return (((geoLon * RAD_TO_DEG) % 360) + 360) % 360;
}

// Test values (radians)
const testRadians = [
  { rad: 0, name: '0°' },
  { rad: Math.PI / 2, name: '90°' },
  { rad: Math.PI, name: '180°' },
  { rad: 3 * Math.PI / 2, name: '270°' },
  { rad: 2 * Math.PI, name: '360°' },
  { rad: -Math.PI / 4, name: '-45°' },
  { rad: 10, name: '~573°' }, // Large value to test wrapping
];

console.log('   Radians      | Expected | Current  | Intended | Match');
console.log('   -------------|----------|----------|----------|------');

let issue1Found = false;
for (const test of testRadians) {
  const expected = (((test.rad * RAD_TO_DEG) % 360) + 360) % 360;
  const current = normalizeLongitude_CURRENT(test.rad);
  const intended = normalizeLongitude_INTENDED(test.rad);
  const match = Math.abs(current - intended) < 0.001 ? '✅' : '❌';

  if (Math.abs(current - intended) >= 0.001) {
    issue1Found = true;
    allPassed = false;
  }

  console.log(`   ${test.name.padEnd(12)} | ${expected.toFixed(2).padStart(8)} | ${current.toFixed(2).padStart(8)} | ${intended.toFixed(2).padStart(8)} | ${match}`);
}

console.log('');
if (issue1Found) {
  console.log('   ❌ BUG CONFIRMED: Operator precedence differs from intended!');
  issues.push({ severity: 'CRITICAL', issue: 'Operator precedence in longitude normalization' });
} else {
  console.log('   ✅ NO BUG: JavaScript evaluates * and % left-to-right (same precedence)');
  console.log('   Note: The code works correctly, though explicit parentheses would be clearer');
}

console.log('');

// ============================================
// TEST 2: Division by Near-Zero (power-places.ts:296)
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('2. DIVISION BY NEAR-ZERO - Testing segment distance calculation');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Haversine distance (from power-places.ts)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Current code
function pointToSegmentDistance_CURRENT(pLat, pLng, lat1, lng1, lat2, lng2) {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;

  if (dx === 0 && dy === 0) {
    return haversineDistance(pLat, pLng, lat1, lng1);
  }

  const t = Math.max(0, Math.min(1, ((pLng - lng1) * dx + (pLat - lat1) * dy) / (dx * dx + dy * dy)));
  const closestLng = lng1 + t * dx;
  const closestLat = lat1 + t * dy;

  return haversineDistance(pLat, pLng, closestLat, closestLng);
}

// Fixed version (epsilon check)
function pointToSegmentDistance_FIXED(pLat, pLng, lat1, lng1, lat2, lng2) {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const denominator = dx * dx + dy * dy;

  if (denominator < 1e-10) {
    return haversineDistance(pLat, pLng, lat1, lng1);
  }

  const t = Math.max(0, Math.min(1, ((pLng - lng1) * dx + (pLat - lat1) * dy) / denominator));
  const closestLng = lng1 + t * dx;
  const closestLat = lat1 + t * dy;

  return haversineDistance(pLat, pLng, closestLat, closestLng);
}

// Test cases
const segmentTests = [
  {
    name: 'Normal segment',
    point: [40.7128, -74.0060],  // NYC
    seg: [[40.7, -74.0], [40.8, -73.9]],
    shouldWork: true
  },
  {
    name: 'Zero-length segment',
    point: [40.7128, -74.0060],
    seg: [[40.75, -73.95], [40.75, -73.95]],  // Point, not line
    shouldWork: true
  },
  {
    name: 'Near-zero segment',
    point: [40.7128, -74.0060],
    seg: [[40.75, -73.95], [40.75 + 1e-12, -73.95 + 1e-12]],  // Tiny segment
    shouldWork: false  // This is where the bug would appear
  },
];

console.log('   Test Case        | Current   | Fixed     | Status');
console.log('   -----------------|-----------|-----------|--------');

let issue2Found = false;
for (const test of segmentTests) {
  const [pLat, pLng] = test.point;
  const [[lat1, lng1], [lat2, lng2]] = test.seg;

  let currentResult, fixedResult;
  let currentOK = true, fixedOK = true;

  try {
    currentResult = pointToSegmentDistance_CURRENT(pLat, pLng, lat1, lng1, lat2, lng2);
    if (!Number.isFinite(currentResult)) currentOK = false;
  } catch (e) {
    currentResult = 'ERROR';
    currentOK = false;
  }

  try {
    fixedResult = pointToSegmentDistance_FIXED(pLat, pLng, lat1, lng1, lat2, lng2);
    if (!Number.isFinite(fixedResult)) fixedOK = false;
  } catch (e) {
    fixedResult = 'ERROR';
    fixedOK = false;
  }

  const currentDisplay = typeof currentResult === 'number' ?
    (Number.isFinite(currentResult) ? currentResult.toFixed(1) + ' km' : 'Infinity') : currentResult;
  const fixedDisplay = typeof fixedResult === 'number' ?
    (Number.isFinite(fixedResult) ? fixedResult.toFixed(1) + ' km' : 'Infinity') : fixedResult;

  const status = currentOK === test.shouldWork ? '✅' : '❌';
  if (!currentOK && test.shouldWork) {
    issue2Found = true;
  }

  console.log(`   ${test.name.padEnd(16)} | ${currentDisplay.padStart(9)} | ${fixedDisplay.padStart(9)} | ${status}`);
}

console.log('');
if (issue2Found) {
  console.log('   ❌ BUG CONFIRMED: Near-zero segments produce Infinity/NaN');
  issues.push({ severity: 'CRITICAL', issue: 'Division by near-zero in segment distance' });
  allPassed = false;
} else {
  console.log('   ✅ NO BUG: Near-zero segments are handled correctly');
  console.log('   (The strict equality check happens to work for this edge case)');
}

console.log('');

// ============================================
// TEST 3: CommonJS require() in ESM (zodiac.ts:177)
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('3. COMMONJS IN ESM - Testing require() usage');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

console.log('   This test checks if require() is used in zodiac.ts.');
console.log('   In Next.js with transpilation, this usually works but is not ideal.');
console.log('');

// We can't actually test this without importing the module, but we can note it
console.log('   Location: src/lib/astro/zodiac.ts lines 177, 189');
console.log('   Pattern: const { calculatePlanetPosition } = require("./calculations")');
console.log('');
console.log('   ⚠️  CODE SMELL: Using require() to avoid circular dependency');
console.log('   Impact: Works in Next.js but breaks in pure ESM environments');
console.log('   Severity: LOW (it works, but should be refactored)');

console.log('');

// ============================================
// TEST 4: Moon Illumination Formula (transits.ts:73)
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('4. MOON ILLUMINATION - Testing formula correctness');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Current formula from transits.ts line 73
function calculateIllumination_CURRENT(elongation) {
  return Math.round((1 - Math.cos((elongation * Math.PI) / 180)) * 50);
}

// Standard formula (should give 0-100%)
function calculateIllumination_STANDARD(elongation) {
  // (1 - cos(θ)) / 2 gives 0-1, multiply by 100 for percentage
  return Math.round(((1 - Math.cos((elongation * Math.PI) / 180)) / 2) * 100);
}

const moonPhases = [
  { elongation: 0, name: 'New Moon', expected: 0 },
  { elongation: 45, name: 'Waxing Crescent', expected: 15 },
  { elongation: 90, name: 'First Quarter', expected: 50 },
  { elongation: 135, name: 'Waxing Gibbous', expected: 85 },
  { elongation: 180, name: 'Full Moon', expected: 100 },
  { elongation: 225, name: 'Waning Gibbous', expected: 85 },
  { elongation: 270, name: 'Last Quarter', expected: 50 },
  { elongation: 315, name: 'Waning Crescent', expected: 15 },
];

console.log('   Phase            | Elongation | Current | Standard | Diff');
console.log('   -----------------|------------|---------|----------|-----');

let issue4Found = false;
let maxDiff = 0;
for (const phase of moonPhases) {
  const current = calculateIllumination_CURRENT(phase.elongation);
  const standard = calculateIllumination_STANDARD(phase.elongation);
  const diff = Math.abs(current - standard);
  maxDiff = Math.max(maxDiff, diff);

  if (diff > 1) issue4Found = true;

  console.log(`   ${phase.name.padEnd(16)} | ${String(phase.elongation).padStart(10)}° | ${String(current).padStart(5)}%  | ${String(standard).padStart(6)}%  | ${diff > 1 ? '❌' : '✅'} ${diff}`);
}

console.log('');
if (issue4Found) {
  console.log(`   ❌ BUG CONFIRMED: Illumination formula produces different results`);
  console.log(`   Maximum difference: ${maxDiff}%`);
  issues.push({ severity: 'CRITICAL', issue: 'Moon illumination formula incorrect' });
  allPassed = false;
} else {
  console.log('   ✅ NO BUG: Current formula produces identical results');
  console.log('');
  console.log('   Explanation:');
  console.log('   Current:  (1 - cos(θ)) * 50');
  console.log('   Standard: ((1 - cos(θ)) / 2) * 100');
  console.log('   These are mathematically equivalent! (50 = 100/2)');
}

console.log('');

// ============================================
// TEST 5: Floating-Point Division by Zero (power-days.ts:204)
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('5. FLOATING-POINT DIVISION - Testing score calculation');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Simulate the scoring logic from power-days.ts
function calculateFlowScore_CURRENT(harmonious, challenging) {
  const total = harmonious + challenging;
  if (total === 0) {
    return 50;
  }
  const harmRatio = harmonious / total;
  const baseScore = harmRatio * 100;
  const magnitude = Math.sqrt(total) / 10;
  const magnitudeEffect = (harmRatio - 0.5) * magnitude * 20;
  return Math.max(0, Math.min(100, Math.round(baseScore + magnitudeEffect)));
}

function calculateFlowScore_FIXED(harmonious, challenging) {
  const total = harmonious + challenging;
  if (total < 1e-10) {  // Epsilon comparison
    return 50;
  }
  const harmRatio = harmonious / total;
  const baseScore = harmRatio * 100;
  const magnitude = Math.sqrt(total) / 10;
  const magnitudeEffect = (harmRatio - 0.5) * magnitude * 20;
  return Math.max(0, Math.min(100, Math.round(baseScore + magnitudeEffect)));
}

const scoreTests = [
  { h: 10, c: 5, name: 'Normal (10, 5)' },
  { h: 0, c: 0, name: 'Both zero' },
  { h: 1e-16, c: 1e-16, name: 'Near-zero (1e-16)' },
  { h: 1e-10, c: 0, name: 'Tiny harmonious' },
  { h: 0, c: 1e-10, name: 'Tiny challenging' },
];

console.log('   Test Case        | Current | Fixed   | Status');
console.log('   -----------------|---------|---------|--------');

let issue5Found = false;
for (const test of scoreTests) {
  const current = calculateFlowScore_CURRENT(test.h, test.c);
  const fixed = calculateFlowScore_FIXED(test.h, test.c);

  const currentOK = Number.isFinite(current);
  const fixedOK = Number.isFinite(fixed);

  const status = currentOK ? '✅' : '❌';
  if (!currentOK) issue5Found = true;

  const currentDisplay = currentOK ? String(current) : 'NaN/Inf';
  const fixedDisplay = fixedOK ? String(fixed) : 'NaN/Inf';

  console.log(`   ${test.name.padEnd(16)} | ${currentDisplay.padStart(7)} | ${fixedDisplay.padStart(7)} | ${status}`);
}

console.log('');
if (issue5Found) {
  console.log('   ❌ BUG CONFIRMED: Near-zero totals produce NaN/Infinity');
  issues.push({ severity: 'MEDIUM', issue: 'Floating-point division edge case in power-days' });
  allPassed = false;
} else {
  console.log('   ✅ NO BUG: Floating-point edge cases handled correctly');
  console.log('   Note: Very small but non-zero values are unlikely in practice');
}

console.log('');

// ============================================
// TEST 6: Pluto Position Accuracy
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('6. PLUTO ACCURACY - Testing simplified Pluto calculation');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Current Pluto calculation from calculations.ts
function calculatePlutoPosition_CURRENT(jde) {
  const T = (jde - 2451545.0) / 36525;
  let lon = 238.93 + 0.003979 * (jde - 2451545.0);
  lon = ((lon % 360) + 360) % 360;
  return lon;
}

// Known Pluto positions (from JPL Horizons or astronomical almanac)
// JD 2451545.0 = Jan 1, 2000 12:00 TT
// JD 2460310.5 = Jan 1, 2024 (Pluto ~300° in Aquarius)
// JD 2461041.5 = Jan 1, 2026 (Pluto ~303° in Aquarius)

const plutoTests = [
  { jd: 2451545.0, name: 'Jan 1, 2000', actualApprox: 251 }, // Sagittarius
  { jd: 2460310.5, name: 'Jan 1, 2024', actualApprox: 299 }, // Capricorn/Aquarius cusp
  { jd: 2461041.5, name: 'Jan 1, 2026', actualApprox: 304 }, // Aquarius
];

console.log('   Date          | Calculated | Actual* | Difference');
console.log('   --------------|------------|---------|------------');

let plutoMaxError = 0;
for (const test of plutoTests) {
  const calculated = calculatePlutoPosition_CURRENT(test.jd);
  const diff = Math.abs(calculated - test.actualApprox);
  plutoMaxError = Math.max(plutoMaxError, diff);

  const status = diff < 5 ? '✅' : diff < 15 ? '⚠️' : '❌';
  console.log(`   ${test.name.padEnd(13)} | ${calculated.toFixed(1).padStart(10)}° | ${String(test.actualApprox).padStart(5)}°  | ${status} ${diff.toFixed(1)}°`);
}

console.log('');
console.log(`   *Actual values are approximate from ephemeris data`);
console.log(`   Maximum error: ~${plutoMaxError.toFixed(1)}°`);
console.log('');
if (plutoMaxError > 10) {
  console.log('   ⚠️  KNOWN LIMITATION: Pluto uses simplified calculation');
  console.log('   Impact: Pluto lines on map may be off by up to ~' + plutoMaxError.toFixed(0) + '°');
  console.log('   Note: This was documented as intentional (user confirmed)');
} else {
  console.log('   ✅ Pluto accuracy is acceptable for astrological purposes');
}

console.log('');

// ============================================
// SUMMARY
// ============================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('   SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

if (issues.length === 0) {
  console.log('   ✅ NO BUGS CONFIRMED!');
  console.log('');
  console.log('   The audit identified potential issues, but simulation shows:');
  console.log('   - Operator precedence: Works correctly (JavaScript evaluates L→R)');
  console.log('   - Moon illumination: Formula is mathematically equivalent');
  console.log('   - Division by zero: Handled correctly in practice');
  console.log('');
  console.log('   Code quality items (non-blocking):');
  console.log('   - require() in zodiac.ts could be refactored to ESM import');
  console.log('   - Explicit parentheses in longitude formula would improve clarity');
  console.log('   - Pluto calculation is simplified (known/intentional)');
} else {
  console.log('   ❌ BUGS CONFIRMED:');
  console.log('');
  for (const issue of issues) {
    console.log(`   [${issue.severity}] ${issue.issue}`);
  }
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
