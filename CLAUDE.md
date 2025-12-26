# Project Memory (CLAUDE.md)

> Keep this file **short**. Link to other docs for details.

## Project Goal
Mobile-first astrology quiz funnel to capture email leads from Meta ads. 10-screen flow ending in email capture.

## Repo Map
- `/docs` — architecture + status
- `/src/app` — Next.js pages + API routes
- `/src/components` — React components (screens, UI)
- `/src/content` — **LOCKED** copy text (do not modify)
- `/src/lib` — state management, utilities

## Source-of-Truth Docs
- Architecture: docs/ARCHITECTURE.md
- Status: docs/STATUS.md
- Changelog: CHANGELOG.md

## Commands
```bash
npm run dev      # localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## Key Constraints
- Copy in `src/content/copy.ts` is **LOCKED** — do not rewrite text
- Mobile-first: max-width 768px container
- Videos need `scale(1.15)` to avoid edge gaps on desktop

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY    # Supabase admin (server-side only)
ADMIN_PASSWORD               # Dashboard login password
NEXT_PUBLIC_META_PIXEL_ID    # Meta Pixel ID (848967188002206)
```

## Guardrails
- Always test on mobile viewport before deploying
- Don't modify copy.ts without explicit approval
- Update CHANGELOG.md after features
