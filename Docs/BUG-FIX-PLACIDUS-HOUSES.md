# CRITICAL BUG FIX: Placidus House Calculation

**Status:** VALIDATED - Ready to implement
**Date:** January 20, 2026
**Reported by:** User Teresa (teresita13@gmail.com)
**Issue:** Stella AI says Sun is in 3rd house when it should be in 9th house

---

## The Bug

The Placidus intermediate house calculation in `src/lib/astro/houses.ts` has THREE bugs that cause houses 2, 3, 8, and 9 to be calculated in the **wrong zodiac signs**.

### Symptoms
- Teresa (Aquarius rising, Scorpio Sun) was told her Sun is in 3rd house
- Her Sun should be in 9th house (confirmed by astro.com)
- Houses 2 and 3 were showing as Cancer instead of Aries/Taurus

### Root Cause
The function `calculatePlacidusIntermediate()` has errors in:
1. **Direction of calculation** - adds instead of subtracts for nocturnal houses
2. **Initial guess position** - starts in wrong quadrant
3. **Fraction assignment** - houses 2 and 3 have swapped fractions

---

## THE FIX (3 Code Changes)

### File: `src/lib/astro/houses.ts`

### Change 1: Fix fraction assignment (around line 282)

```javascript
// FIND THIS (BUGGY):
const F = (houseNumber === 11 || houseNumber === 2) ? 1 / 3 : 2 / 3;

// REPLACE WITH (FIXED):
const F = (houseNumber === 11 || houseNumber === 3) ? 1 / 3 : 2 / 3;
```

**Why:** House 3 (not House 2) should use 1/3 because it's closer to IC. House 2 should use 2/3 because it's further from IC.

---

### Change 2: Fix initial guess for nocturnal houses (around line 294)

```javascript
// FIND THIS (BUGGY):
let cusp = isDiurnal
  ? normalizeAngle(RAMC + F * 90)
  : normalizeAngle(RAMC + 180 + F * 90);

// REPLACE WITH (FIXED):
let cusp = isDiurnal
  ? normalizeAngle(RAMC + F * 90)
  : normalizeAngle(RAMC + 180 - F * 90);  // Changed + to -
```

**Why:** The initial guess for nocturnal houses needs to be in the correct quadrant (between ASC and IC), not past the IC.

---

### Change 3: Fix target RA formula for nocturnal houses (around line 318)

```javascript
// FIND THIS (BUGGY):
if (isDiurnal) {
  targetRA = normalizeAngle(RAMC + F * semiArc);
} else {
  const nocturnalSemiArc = 180 - semiArc;
  targetRA = normalizeAngle(RAMC + 180 + F * nocturnalSemiArc);  // WRONG
}

// REPLACE WITH (FIXED):
if (isDiurnal) {
  targetRA = normalizeAngle(RAMC + F * semiArc);
} else {
  const nocturnalSemiArc = 180 - semiArc;
  targetRA = normalizeAngle(RAMC + 180 - F * nocturnalSemiArc);  // Changed + to -
}
```

**Why:** The formula was going from IC toward DSC (wrong direction). It should go from IC toward ASC (subtract instead of add).

---

## Validation Results

Tested against astro.com (Swiss Ephemeris) with two charts:

### Teresa's Chart (Alexandria VA, 38.8°N)
| House | BUGGY | FIXED | Astro.com |
|-------|-------|-------|-----------|
| 2 | 3° Cancer ❌ | 13° Aries ✅ | 13° Aries 27' |
| 3 | 26° Cancer ❌ | 17° Taurus ✅ | 16° Taurus 40' |

### Nina's Chart (Saskatoon, 52°N)
| House | BUGGY | FIXED | Astro.com |
|-------|-------|-------|-----------|
| 2 | 11° Libra ❌ | 26° Cancer ✅ | 26° Cancer 0' |
| 3 | 29° Scorpio ❌ | 13° Leo ✅ | 13° Leo 28' |

---

## Quick Reference: The Complete Fixed Function

Here's what the fixed `calculatePlacidusIntermediate` function should look like:

```javascript
function calculatePlacidusIntermediate(
  houseNumber: 2 | 3 | 11 | 12,
  RAMC: number,
  latitude: number,
  obliquity: number
): number {
  // FIX 1: Correct fraction assignment
  // House 11 and 3 are closest to MC and IC respectively (use 1/3)
  // House 12 and 2 are further from MC and IC respectively (use 2/3)
  const F = (houseNumber === 11 || houseNumber === 3) ? 1 / 3 : 2 / 3;

  const isDiurnal = houseNumber >= 11;
  const latRad = latitude * DEG_TO_RAD;

  // FIX 2: Correct initial guess - use MINUS for nocturnal houses
  let cusp = isDiurnal
    ? normalizeAngle(RAMC + F * 90)
    : normalizeAngle(RAMC + 180 - F * 90);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const dec = calculateDeclination(cusp, obliquity);
    const semiArc = calculateSemiArc(dec, latRad);

    if (isNaN(semiArc)) {
      return NaN;
    }

    let targetRA: number;
    if (isDiurnal) {
      targetRA = normalizeAngle(RAMC + F * semiArc);
    } else {
      const nocturnalSemiArc = 180 - semiArc;
      // FIX 3: Correct direction - use MINUS to go from IC toward ASC
      targetRA = normalizeAngle(RAMC + 180 - F * nocturnalSemiArc);
    }

    const currentRA = longitudeToRA(cusp, obliquity);
    let error = targetRA - currentRA;

    if (error > 180) error -= 360;
    if (error < -180) error += 360;

    if (Math.abs(error) < CONVERGENCE_THRESHOLD) {
      return normalizeAngle(cusp);
    }

    cusp = normalizeAngle(cusp + error * 0.5);
  }

  return NaN;
}
```

---

## Impact

This bug affects **ALL users** of the app:
- Every natal chart has wrong house placements for houses 2, 3, 5, 6, 8, 9
- Only angular houses (1, 4, 7, 10) are correct
- Stella AI gives incorrect house-based readings
- Any planet placement in houses 2, 3, 8, 9 is wrong

---

## Summary of Changes

| Line | Change | From | To |
|------|--------|------|-----|
| ~282 | Fraction | `houseNumber === 2` | `houseNumber === 3` |
| ~294 | Initial guess | `+ F * 90` | `- F * 90` |
| ~318 | Target RA | `+ F * nocturnalSemiArc` | `- F * nocturnalSemiArc` |

All three changes involve the **nocturnal house calculation** (houses 2 and 3). The key insight is that the direction was wrong - the algorithm was calculating toward DSC instead of toward ASC.
