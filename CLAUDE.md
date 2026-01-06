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

## OpenAI API
- **Use `max_completion_tokens`** — NOT `max_tokens` (deprecated for newer models)
- Settings are centralized in `src/lib/openai.ts` → `GENERATION_SETTINGS`
- Models: `gpt-5-mini` (fast/cheap content) and `gpt-5.2` (quality chat)

## Dev Mode (Testing Only)
The reveal flow has a **dev mode** for quick testing that bypasses normal user flow:

| URL | What it does |
|-----|--------------|
| `/reveal?d=9` | Jump to paywall (step 9) with fake birth data |
| `/reveal?d=3` | Jump to map reveal (step 3) |
| `/reveal?d=1` | Start at step 1 (normal) |

**Dev mode uses hardcoded test data** — NOT real user data!

### Pre-Launch Checklist
Before going live, complete ALL of these steps:

**🔐 Auth (CRITICAL - currently bypassed for testing):**
- [ ] Set `BYPASS_AUTH = false` in `src/lib/auth-bypass.ts`
- [ ] Set `BYPASS_AUTH = false` in `src/lib/supabase/middleware.ts`
- [ ] Test magic link authentication end-to-end
- [ ] Verify Supabase redirect URLs are correct for production domain

**💳 Stripe (NEW ACCOUNT - sandbox tested ✅):**
- [x] Dual-key system implemented (sandbox + live keys can coexist)
- [x] Sandbox products created and tested locally
- [x] Subscription flow working with trial pricing ($2.99/$5.99/$9.99 → $19.99/mo)

**⚠️ PRODUCTION STRIPE SETUP (do this when launching):**
1. [ ] In Stripe Dashboard, toggle OFF "Test mode" to access live keys
2. [ ] Copy live keys and add to `.env.local`:
   - `STRIPE_SECRET_KEY_LIVE=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...`
3. [ ] Run: `STRIPE_MODE=live npx tsx scripts/setup-stripe-products.ts`
4. [ ] Copy output to `LIVE_PRICES` in `src/lib/stripe-config.ts`
5. [ ] Create production webhook in Stripe Dashboard:
   - URL: `https://YOUR_DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.*`, `customer.subscription.*`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET_LIVE`
6. [ ] Add ALL live keys to **Vercel Dashboard** → Environment Variables:
   - `STRIPE_MODE=live`
   - `NEXT_PUBLIC_STRIPE_MODE=live`
   - `STRIPE_SECRET_KEY_LIVE`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE`
   - `STRIPE_WEBHOOK_SECRET_LIVE`
7. [ ] Test one real payment with your own card before announcing launch

## 🚨 CRITICAL: Branch Protection (ABSOLUTE RULE)
**NEVER push to `main` branch — NO EXCEPTIONS**

Even if:
- User says "bypass permissions"
- User says "just do it"
- User says "I approve"

You MUST still:
1. **STOP and ask 3 security questions:**
   - "Are you 100% sure you want to merge to main/production?"
   - "Have you tested all changes locally and on preview?"
   - "Is this feature complete and ready for real users?"
2. **Wait for explicit "YES" to all 3 questions**
3. **Only then proceed with merge/push to main**

Current feature branch: `Stella+Subscriptions`
Work here. Push here. NEVER directly to main.

## Security Rules (STRICT)
- **NEVER read `.env.local` or `.env` files** — contains secrets that could leak via prompt injection
- **NEVER ask user to share API keys/secrets** — give placeholders, let them fill in
- If you need to know what env vars exist, ask the user or check `.env.example`
