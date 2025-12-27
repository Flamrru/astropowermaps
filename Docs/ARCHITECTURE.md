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

### Astronomical Calculations (VSOP87 via astronomia)
- **Decision**: Use `astronomia` library with VSOP87 theory instead of Swiss Ephemeris
- **Rationale**:
  - VSOP87 accuracy (~1 arcsecond) is sufficient for astrocartography and aspects
  - Swiss Ephemeris requires GPL compliance or $290 commercial license
  - `astronomia` is MIT-licensed, free for commercial use
  - Smaller bundle size (~100KB vs 2-50MB for Swiss Ephemeris)
- **Covers**: Sun, Moon, Mercury–Neptune, natal charts, aspects, transits
- **Limitation**: Simplified Pluto calculation (no VSOP87 data available)
- **When to reconsider**: If adding asteroids (Chiron, Lilith) or pre-3000 BCE charts

## Operational Notes
- **Deploy**: `vercel --prod` or push to main
- **Logs**: Vercel dashboard or `vercel logs`
- **Database**: Supabase dashboard for direct queries
