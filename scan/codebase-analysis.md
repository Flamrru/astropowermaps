# AstroPowerMaps - Codebase Analysis

## What Is This App?

**AstroPowerMaps** is a **lead capture quiz funnel** designed to collect email addresses from people interested in astrology. It's built specifically for running **Meta (Facebook/Instagram) ads**.

---

## The User Journey

| Screen | Type | What Happens |
|--------|------|--------------|
| 1 | **Entry** | Hook: "3 months and 3 places will define your 2026" |
| 2 | **Insight** | Build intrigue about travel + destiny |
| 3 | **Question 1** | "Have you visited a place that felt right?" |
| 4 | **Social Proof** | "87% of people feel the difference" |
| 5 | **Question 2** | "What do you want 2026 to be about?" (multi-select) |
| 6 | **Insight** | Explain "power months" concept |
| 7 | **Testimonial** | Sarah's success story |
| 8 | **Loading** | Fake "scanning" animation |
| 9 | **Email Capture** | The main goal - get their email |
| 10 | **Confirmation** | "You're on the list" |

---

## The Product Being Sold

A **"2026 Power Map"** — personalized astrology report showing:
- **3 power months** — best times to take action
- **3 power destinations** — places where "energy amplifies"
- **Rest windows** — when to recharge

---

## Tech Stack Summary

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Analytics | Meta Pixel + custom funnel tracking |

---

## Key Components

### Frontend Components
- `QuizShell.tsx` — Layout wrapper, background videos, state provider
- `Screen01-10` — Individual screen components
- `GoldButton`, `OptionCard`, `GlassCard` — Reusable UI elements
- `CredibilityBar` — Shows publication logos (Cosmopolitan, Well+Good, etc.)
- `MetaPixel` — Facebook/Meta tracking integration

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

---

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

---

## Quiz State Machine

Located in `src/lib/quiz-state.ts`:
- `stepIndex` (1-10) — current screen
- `answer_q1` — single select answer
- `answer_q2` — multi-select array
- `session_id` — UUID for tracking
- `utm` — captured UTM params

Actions: `NEXT_STEP`, `PREV_STEP`, `SET_ANSWER_Q1`, `TOGGLE_ANSWER_Q2`, `SET_EMAIL`, `SET_UTM`

---

## Background Videos

| Steps | Video | Notes |
|-------|-------|-------|
| 1 | question-bg.mp4 | Entry orb, scale(1.15) |
| 2 | globe-bg.mp4 | Rotating globe |
| 3 | orb-question-bg.mp4 | Crossfade loop |
| 4-10 | nebula-bg.mp4 | Nebula, scale(1.15) |

---

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

---

## Project Status

### Completed
- MVP Quiz Flow
- Email Capture + Supabase
- Admin Dashboard
- Meta Pixel Integration
- Funnel Analytics

### Planned
- Conversions API (server-side tracking)
- A/B testing different quiz questions

---

## URLs

- **Production**: https://astropowermaps.vercel.app
- **Admin**: https://astropowermaps.vercel.app/admin

---

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

---

## Key Constraints

- Copy in `src/content/copy.ts` is **LOCKED** — do not rewrite text
- Mobile-first: max-width 768px container
- Videos need `scale(1.15)` to avoid edge gaps on desktop

---

*Analysis generated: December 27, 2025*
