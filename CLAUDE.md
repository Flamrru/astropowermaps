# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **2026 Power Map** — a mobile-first astrology quiz funnel built to capture email leads from Meta ads traffic. The funnel guides users through 10 screens: insight screens, questions, social proof, and email capture.

**Key constraint**: All copy is locked in `src/content/copy.ts`. Text must match the spec exactly — no rewrites or "improvements."

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Quiz Flow State Machine

The quiz uses a reducer pattern in `src/lib/quiz-state.ts`:
- `stepIndex` (1-10) controls which screen is shown
- `QuizContext` provides state + dispatch to all components
- Actions: `NEXT_STEP`, `PREV_STEP`, `SET_ANSWER_Q1`, `TOGGLE_ANSWER_Q2`, `SET_EMAIL`, `SET_UTM`

### Screen Rendering

`src/app/page.tsx` maps `stepIndex` to screen components:
```
1: Entry → 2: Insight → 3: Question → 4: Proof → 5: Question →
6: Insight → 7: Testimonial → 8: Loading (auto-advance 3s) →
9: Email Capture → 10: Confirmation
```

### Component Hierarchy

```
QuizShell (provides QuizContext, handles backgrounds + transitions)
└── Screen components (import from content/copy.ts)
    ├── ProgressHeader (back button, title, progress bar)
    ├── GoldButton (pill CTA with gold gradient)
    ├── OptionCard (glassmorphism selection cards)
    └── GlassCard (translucent container)
```

### Backgrounds

`QuizShell` manages 3 background images with crossfade:
- Step 1: `/public/question-bg.webp` (celestial astrolabe)
- Step 2: `/public/globe-bg.webp` (globe)
- Steps 3-10: `/public/nebula-mobile.webp` + `/public/nebula-desktop.webp`

### Email Capture (No Database)

`POST /api/lead` validates email and forwards to `LEAD_WEBHOOK_URL` env var (Zapier/Make/etc).

Payload includes: email, quiz answers (q1, q2), UTM params, session_id, timestamp.

### Styling

- Tailwind CSS 4 with custom CSS variables in `globals.css`
- Color tokens: `--gold-main`, `--cosmic-black`, `--glass-bg`, etc.
- Uses `@/` import alias for `src/` directory

## Key Files

| File | Purpose |
|------|---------|
| `src/content/copy.ts` | **LOCKED** — all quiz text lives here |
| `src/lib/quiz-state.ts` | Quiz state reducer + context |
| `src/lib/utm.ts` | UTM parameter parsing |
| `src/components/QuizShell.tsx` | Layout wrapper, backgrounds, transitions |
| `src/app/api/lead/route.ts` | Email submission API |

## Visual Design Notes

- Dark cosmic/nebula aesthetic with gold accents
- Glassmorphism: translucent backgrounds with blur
- Gold CTAs: pill-shaped with gradient and outer glow
- Mobile-first: content max-width ~360-420px, safe-area padding for iOS
