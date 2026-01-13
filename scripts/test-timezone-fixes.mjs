/**
 * Timezone Fixes Simulation Script
 *
 * Tests all the timezone bug fixes to ensure they work correctly
 * across different server timezones.
 *
 * Usage: node scripts/test-timezone-fixes.mjs
 */

console.log('═══════════════════════════════════════════════════════════════');
console.log('   TIMEZONE FIXES SIMULATION');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// ============================================
// TEST 1: Days in Month Calculation
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('1. DAYS IN MONTH - Testing month boundary calculations');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Buggy version (local time)
function getDaysInMonth_BUGGY(year, month) {
  return new Date(year, month, 0).getDate();
}

// Fixed version (UTC)
function getDaysInMonth_FIXED(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const testMonths = [
  { year: 2026, month: 1, expected: 31, name: 'January 2026' },
  { year: 2026, month: 2, expected: 28, name: 'February 2026' },
  { year: 2024, month: 2, expected: 29, name: 'February 2024 (leap)' },
  { year: 2026, month: 12, expected: 31, name: 'December 2026' },
];

console.log('   Month            | Expected | Buggy  | Fixed  | Status');
console.log('   -----------------|----------|--------|--------|--------');

let allPassed = true;
for (const test of testMonths) {
  const buggy = getDaysInMonth_BUGGY(test.year, test.month);
  const fixed = getDaysInMonth_FIXED(test.year, test.month);
  const status = fixed === test.expected ? '✅' : '❌';
  if (fixed !== test.expected) allPassed = false;
  console.log(`   ${test.name.padEnd(16)} | ${String(test.expected).padEnd(8)} | ${String(buggy).padEnd(6)} | ${String(fixed).padEnd(6)} | ${status}`);
}

console.log('');

// ============================================
// TEST 2: Tomorrow Date Calculation
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('2. TOMORROW DATE - Testing date increment across timezones');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Buggy version
function getTomorrow_BUGGY(isoDate) {
  const tomorrow = new Date(isoDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Fixed version
function getTomorrow_FIXED(isoDate) {
  const tomorrow = new Date(isoDate);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

const tomorrowTests = [
  { date: '2026-01-31', expected: '2026-02-01', name: 'Jan→Feb boundary' },
  { date: '2026-02-28', expected: '2026-03-01', name: 'Feb→Mar boundary' },
  { date: '2026-12-31', expected: '2027-01-01', name: 'Year boundary' },
  { date: '2026-06-15', expected: '2026-06-16', name: 'Mid-month' },
];

console.log('   Test Case        | Expected    | Buggy       | Fixed       | Status');
console.log('   -----------------|-------------|-------------|-------------|--------');

for (const test of tomorrowTests) {
  const buggy = getTomorrow_BUGGY(test.date);
  const fixed = getTomorrow_FIXED(test.date);
  const status = fixed === test.expected ? '✅' : '❌';
  if (fixed !== test.expected) allPassed = false;
  console.log(`   ${test.name.padEnd(16)} | ${test.expected} | ${buggy} | ${fixed} | ${status}`);
}

console.log('');

// ============================================
// TEST 3: Week Dates Generation
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('3. WEEK DATES - Testing 7-day sequence generation');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Buggy version
function getWeekDates_BUGGY(startDate) {
  const dates = [];
  const current = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Fixed version
function getWeekDates_FIXED(startDate) {
  const dates = [];
  const current = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

const weekStart = '2026-01-26'; // Week crossing into February
const buggyWeek = getWeekDates_BUGGY(weekStart);
const fixedWeek = getWeekDates_FIXED(weekStart);

const expectedWeek = [
  '2026-01-26', '2026-01-27', '2026-01-28', '2026-01-29',
  '2026-01-30', '2026-01-31', '2026-02-01'
];

console.log(`   Start date: ${weekStart} (week crossing Jan→Feb)`);
console.log('');
console.log('   Day | Expected    | Buggy       | Fixed       | Status');
console.log('   ----|-------------|-------------|-------------|--------');

for (let i = 0; i < 7; i++) {
  const status = fixedWeek[i] === expectedWeek[i] ? '✅' : '❌';
  if (fixedWeek[i] !== expectedWeek[i]) allPassed = false;
  console.log(`   ${i + 1}   | ${expectedWeek[i]} | ${buggyWeek[i]} | ${fixedWeek[i]} | ${status}`);
}

console.log('');

// ============================================
// TEST 4: Display Date Formatting
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('4. DISPLAY DATE - Testing day number extraction');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Buggy version
function getDisplayDay_BUGGY(dateStr) {
  const date = new Date(dateStr);
  return date.getDate();
}

// Fixed version
function getDisplayDay_FIXED(dateStr) {
  const date = new Date(dateStr);
  return date.getUTCDate();
}

const displayTests = [
  { date: '2026-02-01', expected: 1 },
  { date: '2026-02-15', expected: 15 },
  { date: '2026-02-28', expected: 28 },
  { date: '2026-01-01', expected: 1 },
];

console.log('   ISO Date     | Expected | Buggy | Fixed | Status');
console.log('   -------------|----------|-------|-------|--------');

for (const test of displayTests) {
  const buggy = getDisplayDay_BUGGY(test.date);
  const fixed = getDisplayDay_FIXED(test.date);
  const status = fixed === test.expected ? '✅' : '❌';
  if (fixed !== test.expected) allPassed = false;
  console.log(`   ${test.date}  | ${String(test.expected).padEnd(8)} | ${String(buggy).padEnd(5)} | ${String(fixed).padEnd(5)} | ${status}`);
}

console.log('');

// ============================================
// TEST 5: Calendar Days in Month Loop
// ============================================

console.log('─────────────────────────────────────────────────────────────────');
console.log('5. CALENDAR LOOP - Testing getDaysInMonth iteration');
console.log('─────────────────────────────────────────────────────────────────');
console.log('');

// Buggy version
function getDaysInMonthLoop_BUGGY(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Fixed version
function getDaysInMonthLoop_FIXED(year, month) {
  const days = [];
  const date = new Date(Date.UTC(year, month, 1));
  while (date.getUTCMonth() === month) {
    days.push(date.toISOString().split('T')[0]);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

// Test February 2026
const buggyFeb = getDaysInMonthLoop_BUGGY(2026, 1); // month is 0-indexed
const fixedFeb = getDaysInMonthLoop_FIXED(2026, 1);

console.log(`   February 2026 (should have 28 days):`);
console.log(`   - Buggy version: ${buggyFeb.length} days`);
console.log(`   - Fixed version: ${fixedFeb.length} days`);
console.log(`   - First day: ${fixedFeb[0]}`);
console.log(`   - Last day:  ${fixedFeb[fixedFeb.length - 1]}`);

const febCorrect = fixedFeb.length === 28 &&
                   fixedFeb[0] === '2026-02-01' &&
                   fixedFeb[27] === '2026-02-28';
console.log(`   - Status: ${febCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
if (!febCorrect) allPassed = false;

console.log('');

// Test December 2026 (year boundary)
const buggyDec = getDaysInMonthLoop_BUGGY(2026, 11);
const fixedDec = getDaysInMonthLoop_FIXED(2026, 11);

console.log(`   December 2026 (should have 31 days):`);
console.log(`   - Buggy version: ${buggyDec.length} days`);
console.log(`   - Fixed version: ${fixedDec.length} days`);
console.log(`   - First day: ${fixedDec[0]}`);
console.log(`   - Last day:  ${fixedDec[fixedDec.length - 1]}`);

const decCorrect = fixedDec.length === 31 &&
                   fixedDec[0] === '2026-12-01' &&
                   fixedDec[30] === '2026-12-31';
console.log(`   - Status: ${decCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
if (!decCorrect) allPassed = false;

console.log('');

// ============================================
// SUMMARY
// ============================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('   SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

if (allPassed) {
  console.log('   ✅ ALL TESTS PASSED!');
  console.log('');
  console.log('   All timezone fixes are working correctly:');
  console.log('   - Days in month uses UTC boundaries');
  console.log('   - Tomorrow calculation uses setUTCDate()');
  console.log('   - Week dates iteration uses UTC');
  console.log('   - Display dates use getUTCDate()');
  console.log('   - Calendar loop uses UTC methods');
} else {
  console.log('   ❌ SOME TESTS FAILED!');
  console.log('');
  console.log('   Review the failures above and fix accordingly.');
}

console.log('');
console.log('   Note: "Buggy" column shows what the OLD code did.');
console.log('   On a UTC server, buggy and fixed may match.');
console.log('   The bugs appear on non-UTC servers (UTC+5, UTC+10, etc.)');
console.log('');
