# Architecture

## Overview
Lead capture quiz funnel for astrology/Power Map product. Users from Meta ads go through 10 screens, answer 2 questions, and submit email.

## Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Analytics**: Meta Pixel, custom funnel tracking

## Components

### Frontend
- `QuizShell.tsx` — Layout wrapper, background videos, state provider
- `Screen01-10` — Individual screen components
- `GoldButton`, `OptionCard`, `GlassCard` — Reusable UI

### API Routes
| Route | Purpose |
|-------|---------|
| `/api/lead` | Save email + quiz answers to Supabase |
| `/api/funnel-event` | Track funnel step events |
| `/api/admin/auth` | Dashboard login/logout |
| `/api/admin/leads` | Fetch leads + analytics |

### Database Tables
| Table | Purpose |
|-------|---------|
| `astro_leads` | Email captures with quiz answers + UTMs |
| `astro_funnel_events` | Funnel step tracking |

## Data Flows

### Lead Capture Flow
```
User lands (PageView pixel) → Quiz screens →
Submit email → POST /api/lead → Supabase astro_leads →
Lead pixel event → Confirmation screen
```

### Funnel Tracking Flow
```
Step change → QuizShell useEffect →
POST /api/funnel-event → Supabase astro_funnel_events
```

### Admin Dashboard Flow
```
Login → GET /api/admin/leads →
Fetch leads + funnel counts → Display charts + table
```

## Quiz State Machine
Located in `src/lib/quiz-state.ts`:
- `stepIndex` (1-10) — current screen
- `answer_q1` — single select answer
- `answer_q2` — multi-select array
- `session_id` — UUID for tracking
- `utm` — captured UTM params

Actions: `NEXT_STEP`, `PREV_STEP`, `SET_ANSWER_Q1`, `TOGGLE_ANSWER_Q2`, `SET_EMAIL`, `SET_UTM`

## Screen Flow
```
1: Entry → 2: Insight → 3: Q1 → 4: Proof → 5: Q2 →
6: Insight → 7: Testimonial → 8: Loading → 9: Email → 10: Confirmation
```

## Background Videos
| Steps | Video | Notes |
|-------|-------|-------|
| 1 | question-bg.mp4 | Entry orb, scale(1.15) |
| 2 | globe-bg.mp4 | Rotating globe |
| 3 | orb-question-bg.mp4 | Crossfade loop |
| 4-10 | nebula-bg.mp4 | Nebula, scale(1.15) |

## Key Design Decisions

### Mobile-First Container
- **Decision**: Max-width 768px centered container
- **Rationale**: Optimized for phone users from Meta ads
- **Note**: Desktop shows cosmic gradient on sides

### Client-Side State Only
- **Decision**: No server-side quiz state persistence
- **Rationale**: Simple, fast, no need to resume sessions

### Video Backgrounds with Scale
- **Decision**: `scale(1.15)` on entry/nebula videos
- **Rationale**: Prevents black edge strips on various aspect ratios

### City Star Rating System
- **Decision**: 3-5 star range (no cities below 3 stars)
- **Rationale**: All shown cities are on beneficial planetary lines, so none are "bad"
- **Scoring Formula**:
  ```
  CityScore = (ProximityScore × LineTypeMultiplier × PlanetRelevance) + MultiLineBonus

  ProximityScore (distance-based):
    < 30km = 100 (exceptionally close)
    30-75km = 90 (very close)
    75-150km = 70 (close)
    150-250km = 50 (moderate)
    250-350km = 30 (far)
    350-400km = 20 (very far)

  LineTypeMultiplier:
    MC (Midheaven) = 1.2
    AC (Ascendant) = 1.1
    DC (Descendant) = 1.0
    IC (Imum Coeli) = 0.9

  PlanetRelevance (category-specific):
    Venus for Love = 1.3
    Jupiter for Career = 1.3
    etc.

  Star Conversion: Linear scale from score 22-200 → 3.0-5.0 stars
  ```
- **File**: `src/lib/astro/power-places.ts`

### Yearly Power Score (2026 Report)
- **Decision**: Optimistic benefic-focused scoring (range 50-100)
- **Rationale**: Everyone starts with cosmic potential; no one gets a "bad" year
- **Scoring Formula**:
  ```
  Score = Base (50) + YearlyBonus + PeakBonus + BeneficBonus

  YearlyBonus = yearlyAverage × 0.5
    (yearlyAverage = average of all 12 monthly scores)

  PeakBonus = +5 if top 3 months average > yearlyAverage + 10
    (rewards users with standout power months)

  BeneficBonus = 0-10 points
    Jupiter/Venus harmonious aspects (trine/sextile/conjunction)
    Capped at 10 points

  Labels:
    85-100 = "Exceptional Year"
    70-84  = "Powerful Year"
    55-69  = "Strong Year"
    50-54  = "Foundation Year" (frames low support as building time)
  ```
- **File**: `src/lib/astro/report-derivations.ts` (calculatePowerScore function)

### Astronomical Calculations (astronomia library)
- **Decision**: Use `astronomia` library instead of Swiss Ephemeris
- **Algorithms used**:
  - Mercury–Neptune: VSOP87 theory (~1 arcsecond accuracy)
  - Moon: ELP2000 lunar theory (dedicated geocentric algorithm)
  - Sun: Solar position algorithms
- **Rationale**:
  - Accuracy sufficient for astrocartography and aspects
  - Swiss Ephemeris requires GPL compliance or $290 commercial license
  - `astronomia` is MIT-licensed, free for commercial use
  - Smaller bundle size (~100KB vs 2-50MB for Swiss Ephemeris)
- **Limitation**: Simplified Pluto calculation (no precise ephemeris data)
- **When to reconsider**: If adding asteroids (Chiron, Lilith) or pre-3000 BCE charts

### ⚠️ CRITICAL: astronomia Library Unit Conventions (Bug Fixed Jan 2026)

**DO NOT CHANGE the sidereal time calculations without understanding this!**

We discovered and fixed a critical bug where Rising signs were 2+ zodiac signs off
(e.g., showing Leo instead of Libra). The root cause: misunderstanding what units
the `astronomia` library returns.

**The Bug:**
```typescript
// WRONG - treats return value as radians
const gmst = sidereal.mean(jd) * (180 / Math.PI);

// CORRECT - sidereal.mean() returns SECONDS, not radians!
const gmstSeconds = sidereal.mean(jd);
const gmst = (gmstSeconds / 86400) * 360;  // Convert seconds to degrees
```

**Why This Matters:**
- `sidereal.mean(jd)` returns Greenwich Mean Sidereal Time in **seconds** (~21,000 for a typical date)
- Treating 21,000 as radians and multiplying by 57.3 gives 1,200,000° (completely wrong)
- This shifted the Local Sidereal Time by ~270°, causing Rising signs to be way off

**Files Fixed (Jan 7, 2026):**
| File | Function | What Was Wrong |
|------|----------|----------------|
| `zodiac.ts` | `calculateRisingSign()` | GMST treated as radians |
| `houses.ts` | `calculateLST()` | GMST treated as radians |
| `transit-calculations.ts` | `dateToJulianDay()` | Used local time instead of UTC |

**Verification:**
All calculations now match astro.com within 0.5° (verified with May 5, 1988, 5:00 PM, Bratislava birth data).

**Rules for Future Development:**
1. **NEVER assume units** — always check astronomia docs or test against astro.com
2. **Common astronomia return types:**
   - `sidereal.mean(jd)` → returns **seconds**
   - `nutation.meanObliquity(jd)` → returns **radians**
   - Planet positions (VSOP87) → return **radians**
3. **Always use UTC** for transit calculations (use `getUTCHours()`, not `getHours()`)
4. **Test changes** against astro.com with known birth data before deploying

## Operational Notes
- **Deploy**: `vercel --prod` or push to main
- **Logs**: Vercel dashboard or `vercel logs`
- **Database**: Supabase dashboard for direct queries
