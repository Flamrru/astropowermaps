# Project Memory (CLAUDE.md)

> Keep this file **short**. Link to other docs for details.

## Project Goal
Mobile-first astrology app with quiz funnel, astrocartography map, Stella+ subscription, and AI chat.

## Production Domain
- **Live site:** `https://astropowermap.com` (singular, no "s")
- **Vercel subdomain:** `https://astropowermaps.vercel.app` (has "s")
- **Repo name:** `astropowermaps` (has "s") — don't confuse with domain!

## Main Routes
| Route | Purpose |
|-------|---------|
| `/` | Quiz funnel (10 screens) → email capture |
| `/reveal` | Guided reveal flow (birth data → map → onboarding → paywall) |
| `/setup` | Account setup after payment (or grandfathered invite) |
| `/home` | Stella+ dashboard (daily guidance, chat, calendar) |
| `/map` | Full astrocartography map |
| `/profile` | User profile, subscription management |
| `/admin` | Dashboard with leads and funnel analytics |
| `/tracking` | Product analytics (user behavior, topics, revenue) |

## Repo Map
- `/src/app` — Next.js pages + API routes
- `/src/components/screens` — Quiz flow screens
- `/src/components/reveal` — Reveal flow screens + shell
- `/src/components/dashboard` — Stella+ dashboard components
- `/src/components/astro-map` — AstroMap, BirthDataForm, PowerPlacesPanel
- `/src/components/tracking` — Product analytics dashboard tabs
- `/src/lib/astro` — Planetary calculations, types, power places
- `/src/lib/tracking.ts` — Topic categorization, engagement classification
- `/src/lib/hooks/useTrack.ts` — Event tracking hook
- `/src/content` — **LOCKED** copy text (do not modify)

## Source-of-Truth Docs
- Architecture: docs/ARCHITECTURE.md
- Debug Solutions: docs/DEBUG_SOLUTIONS.md — **Check before debugging known issues!**
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
ADMIN_PASSWORD                # Admin dashboard login password
TRACKING_PASSWORD             # Product analytics dashboard password
NEXT_PUBLIC_META_PIXEL_ID     # Meta Pixel ID
NEXT_PUBLIC_MAPBOX_TOKEN      # Mapbox GL JS token
STRIPE_MODE                   # "sandbox" or "live"
STRIPE_SECRET_KEY_SANDBOX     # Stripe test key
STRIPE_SECRET_KEY_LIVE        # Stripe live key
STRIPE_WEBHOOK_SECRET_LIVE    # Stripe webhook secret
RESEND_API_KEY                # Resend email API key
OPENAI_API_KEY                # OpenAI for Stella AI
```

## Database
- **Supabase project:** `lbfjjwmjaycacdtvpewq.supabase.co`
- **Key tables:**
  - `astro_leads` — Quiz leads, birth data
  - `astro_purchases` — Stripe payments
  - `user_profiles` — Subscriptions, user data
  - `stella_messages` — AI chat history
  - `app_events` — Product analytics tracking

## Stripe Integration
- **Subscription mode** with mixed cart (trial fee + recurring)
- Trial pricing: $2.99 / $5.99 / $9.99 → $19.99/month after trial
- Customer reuse: Looks up existing customer by email before checkout
- Webhook handles: user creation, subscription sync, emails

## Guardrails
- Always test on mobile viewport before deploying
- Don't modify copy.ts without explicit approval
- Update CHANGELOG.md after features
- **Do not push to main** without explicit user approval

## Vercel Deployments — CRITICAL
- **NEVER use `vercel` CLI to deploy** — it deploys local files and can overwrite production
- **ONLY use `git push`** to trigger deployments via GitHub integration
- Feature branches → Preview (automatic via GitHub)
- Main branch → Production (automatic via GitHub)
- If you need to test on Preview, push to the feature branch and wait for GitHub to deploy

## OpenAI API
- **Use `max_completion_tokens`** — NOT `max_tokens` (deprecated)
- Settings in `src/lib/openai.ts` → `GENERATION_SETTINGS`
- Models: `gpt-5-mini` (content) and `gpt-5.2` (chat)

## Stella AI Context
- **View context**: Stella adapts behavior based on page (dashboard, calendar, map, life-transits)
- **Map page**: Receives pre-computed distances from 350 cities to all planetary lines
- **Key file**: `src/components/dashboard/stella/StellaChatDrawer.tsx` → `summarizeMapLines()`
- See `docs/ARCHITECTURE.md` → "Stella AI Integration" for full details

## Security Rules
- **NEVER read `.env.local` or `.env` files** — secrets could leak
- **NEVER ask user to share API keys** — use placeholders
- If you need env var info, ask user or check `.env.example`
