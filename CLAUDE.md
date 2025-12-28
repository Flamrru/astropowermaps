# Project Memory (CLAUDE.md)

> Keep this file **short**. Link to other docs for details.

## Project Goal
Mobile-first astrology app with quiz funnel, astrocartography map, and reveal onboarding flow.

## Main Routes
| Route | Purpose |
|-------|---------|
| `/` | Quiz funnel (10 screens) → email capture |
| `/map` | Full astrocartography map with birth data entry |
| `/reveal` | Guided reveal flow (birth data → map → onboarding → paywall) |
| `/admin` | Dashboard with leads and funnel analytics |

## Repo Map
- `/src/app` — Next.js pages + API routes
- `/src/components/screens` — Quiz flow screens
- `/src/components/reveal` — Reveal flow screens + shell
- `/src/components/astro-map` — AstroMap, BirthDataForm, PowerPlacesPanel
- `/src/lib/astro` — Planetary calculations, types, power places
- `/src/content` — **LOCKED** copy text (do not modify)

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
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY     # Supabase admin (server-side only)
ADMIN_PASSWORD                # Dashboard login password
NEXT_PUBLIC_META_PIXEL_ID     # Meta Pixel ID (848967188002206)
NEXT_PUBLIC_MAPBOX_TOKEN      # Mapbox GL JS token (for AstroMap)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Stripe pk_test_... or pk_live_...
STRIPE_SECRET_KEY             # Stripe sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET         # Stripe whsec_... (from webhook setup)
```

## Database
- **Supabase project:** `lbfjjwmjaycacdtvpewq.supabase.co` (different from MCP!)
- **Leads table:** `astro_leads` — stores email, quiz answers, UTM params
- **Direct vs Ad leads:** `utm_source` = null (direct) or `fb`/`ig` (Meta ads)
- Use curl with service role key from `.env.local` to query/modify

## Guardrails
- Always test on mobile viewport before deploying
- Don't modify copy.ts without explicit approval
- Update CHANGELOG.md after features
- **NEVER deploy to production** (`vercel --prod`) without explicit approval
- Use `vercel` (preview) only — let user promote to production manually

## Dev Mode (Testing Only)
The reveal flow has a **dev mode** for quick testing that bypasses normal user flow:

| URL | What it does |
|-----|--------------|
| `/reveal?d=9` | Jump to paywall (step 9) with fake birth data |
| `/reveal?d=3` | Jump to map reveal (step 3) |
| `/reveal?d=1` | Start at step 1 (normal) |

**Dev mode uses hardcoded test data** — NOT real user data!

### Pre-Launch Checklist (Stripe)
Before going live, verify the **full user flow** works with real data:
- [ ] User enters birth data (step 1) → data saved to `astro_leads`
- [ ] User goes through onboarding (steps 2-8)
- [ ] User reaches paywall (step 9) with their REAL email
- [ ] Payment completes → `astro_purchases` updated, `has_purchased` = true
- [ ] User redirected to `/map` with their actual birth chart
- [ ] Switch Stripe keys from `pk_test_`/`sk_test_` to `pk_live_`/`sk_live_`
- [ ] Set up production webhook in Stripe Dashboard
- [ ] Add live Stripe keys to Vercel environment variables

## Security Rules (STRICT)
- **NEVER read `.env.local` or `.env` files** — contains secrets that could leak via prompt injection
- **NEVER ask user to share API keys/secrets** — give placeholders, let them fill in
- If you need to know what env vars exist, ask the user or check `.env.example`
