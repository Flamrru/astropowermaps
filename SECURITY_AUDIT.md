# Security & Pre-Production Audit Report

**Date:** December 31, 2025
**Project:** AstroPowerMaps
**Auditor:** Claude Code

---

## Executive Summary

Your app has a **solid security foundation** - Stripe webhooks are properly verified, database RLS is enabled, and no secrets are hardcoded. However, there are a few issues to fix before going live.

---

## What's Working Well

| Area | Status | Details |
|------|--------|---------|
| **Stripe Security** | Pass | Webhook signature verification, idempotency keys for double-charge prevention |
| **Admin Auth** | Pass | Rate limiting (5 attempts/15 min), HTTP-only secure cookies |
| **Database RLS** | Pass | Enabled on both tables, service_role only access |
| **No Hardcoded Secrets** | Pass | All sensitive values from environment variables |
| **No XSS Vectors** | Pass | No dangerous innerHTML or code execution patterns found |
| **Input Validation** | Pass | Email validation, date/coordinate format checks, event whitelist |
| **Build Status** | Pass | Production build completes successfully |
| **Source Maps** | Pass | Deleted after Sentry upload (prevents reverse engineering) |

---

## Critical Issues (Fix Before Launch)

### 1. Missing RLS Policy for UPDATE on `astro_leads`

The Stripe webhook updates `has_purchased` on `astro_leads`, but there's no UPDATE policy in the migration. This works now because you're using `service_role`, but it's best practice to have explicit policies.

**File:** `supabase/migrations/20251226000000_create_astro_leads.sql`

**Fix:** Run this SQL in Supabase Dashboard > SQL Editor:

```sql
CREATE POLICY "Service role can update leads"
  ON public.astro_leads
  FOR UPDATE
  TO service_role
  USING (true);
```

### 2. Missing `astro_funnel_events` Table Migration

Your code references `astro_funnel_events` table but there's no migration for it in your repo. This table may:
- Have been created manually (not tracked in git)
- Be missing RLS policies

**Action:** Verify RLS is enabled on this table in Supabase Dashboard > Authentication > Policies.

---

## Medium Issues (Recommended Before Launch)

### 3. No Rate Limiting on Public Endpoints

These endpoints can be abused by bots:
- `/api/lead` - could be spammed to fill your database
- `/api/funnel-event` - could be spammed
- `/api/astrocartography` - CPU-intensive calculations

**Recommendation:** Add rate limiting using Vercel Edge Middleware or Upstash Rate Limit.

### 4. No Security Headers

Missing important HTTP security headers that protect against common attacks.

**Fix:** Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

### 5. GeoNames API Uses HTTP (Not HTTPS)

**File:** `src/app/api/timezone/route.ts` line 80

```typescript
// Current (insecure):
`http://api.geonames.org/timezoneJSON...`

// Change to:
`https://api.geonames.org/timezoneJSON...`
```

---

## Low Priority Issues

### 6. Lint Errors (17 warnings, 18 errors)

The React Compiler is flagging several issues:
- `Math.random()` in render (causes hydration mismatches)
- `setState` in useEffect (cascading renders)
- Unused imports

Run `npm run lint` to see all issues.

### 7. Admin Session Cookie Could Be Stronger

Currently the cookie value is just `"authenticated"`. Consider using a signed JWT or random token. Low risk since HTTP-only.

### 8. Price Mismatch in Comment

Migration comment says `$27` but code has `$19`. Minor inconsistency.

---

## Pre-Launch Checklist

- [ ] Add UPDATE policy for `astro_leads` (SQL above)
- [ ] Verify `astro_funnel_events` table has RLS enabled
- [ ] Add security headers to `next.config.ts`
- [ ] Change GeoNames URL to HTTPS
- [ ] Test complete payment flow with Stripe test cards
- [ ] Switch Stripe keys from `sk_test_` to `sk_live_`
- [ ] Set up production webhook in Stripe Dashboard
- [ ] Add live Stripe keys to Vercel environment variables
- [ ] Fix lint errors (optional but recommended)

---

## Environment Variables for Production

Make sure these are set in Vercel Dashboard > Settings > Environment Variables:

| Variable | Type | Notes |
|----------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | OK to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | OK to expose |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Use `pk_live_...` for production |
| `NEXT_PUBLIC_META_PIXEL_ID` | Public | OK to expose |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Public | OK to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Never expose! |
| `ADMIN_PASSWORD` | **Secret** | Never expose! |
| `STRIPE_SECRET_KEY` | **Secret** | Use `sk_live_...` for production |
| `STRIPE_WEBHOOK_SECRET` | **Secret** | Get from Stripe live webhook |
| `META_CAPI_ACCESS_TOKEN` | **Secret** | Never expose! |
| `GEONAMES_USERNAME` | Secret | Optional but recommended |

---

## How to Switch to Production Stripe

1. **Stripe Dashboard:** Go to Developers > Webhooks
2. **Add endpoint:** `https://yourdomain.com/api/stripe/webhook`
3. **Select events:** `checkout.session.completed`, `checkout.session.expired`
4. **Copy webhook secret:** Starts with `whsec_...`
5. **Vercel:** Add `STRIPE_WEBHOOK_SECRET` with the live value
6. **Vercel:** Update `STRIPE_SECRET_KEY` to `sk_live_...`
7. **Vercel:** Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `pk_live_...`
8. **Test:** Make a real $1 test purchase, then refund it

---

## Overall Assessment

**Rating: Good - Ready for launch after critical fixes**

Your app has proper security fundamentals in place. The critical issues are database policy gaps that take 2 minutes to fix. The Stripe integration is correctly secured with webhook signature verification.

---

*Generated by Claude Code security audit*
