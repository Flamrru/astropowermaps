# Authentication Implementation Spec

> Generated from interview on Jan 4, 2026

## Overview

Implement passwordless authentication for AstroPowerMaps using Supabase Auth with magic links, triggered after successful Stripe payment. Zero friction before paywall.

---

## Requirements

### Core Flow

1. **Auth timing**: Account created AFTER successful payment (not before)
2. **Email handling**: Pre-fill Stripe checkout with quiz email, but allow user to change
3. **Returning users**: Can resume from paywall via email lookup (7-day retention)
4. **Login method**: Magic link by default, optional password for convenience

### User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEW USER FLOW                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Quiz (/) ──► Reveal Flow ──► Paywall ──► Stripe Checkout ──► Payment       │
│     │                            │              │                  │        │
│     ▼                            │              ▼                  ▼        │
│  Capture email              Pre-fill email   Allow change    On success:    │
│  Save to astro_leads                                         1. Webhook     │
│                                                              2. Create auth │
│                                                              3. Send email  │
│                                                                    │        │
│                                                                    ▼        │
│                              Confirmation Screen ◄─────────────────┘        │
│                              "You're in! Your 2026 forecast awaits."        │
│                                        │                                    │
│                                        ▼                                    │
│                                  Click magic link                           │
│                                  (from email)                               │
│                                        │                                    │
│                                        ▼                                    │
│                                /setup (display name)                        │
│                                        │                                    │
│                                        ▼                                    │
│                                  /dashboard                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RETURNING SUBSCRIBER FLOW                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /login ──► Enter email ──► Send magic link ──► Click link ──► /dashboard   │
│                │                                                             │
│                ▼                                                             │
│         OR enter password                                                    │
│         (if previously set)                                                  │
│                │                                                             │
│                ▼                                                             │
│           /dashboard                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RETURNING NON-SUBSCRIBER FLOW (didn't complete purchase)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  / (landing) ──► Enter email ──► Check astro_leads                          │
│                                        │                                    │
│                           ┌────────────┴────────────┐                       │
│                           │                         │                       │
│                    Has saved data?            No data found                 │
│                    (within 7 days)                  │                       │
│                           │                         ▼                       │
│                           ▼                   Start fresh quiz              │
│                 Resume at /reveal?d=9                                       │
│                 (paywall with their data)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. Stripe Webhook Handler Updates

**File**: `src/app/api/stripe/webhook/route.ts`

On `checkout.session.completed`:
1. Get customer email from Stripe session
2. Create Supabase Auth user (if not exists) using `supabaseAdmin.auth.admin.createUser()`
3. Create/update `user_profiles` record with birth data from `astro_leads`
4. Mark `astro_leads.converted = true`
5. Create `astro_purchases` record
6. Send purchase confirmation email via Resend (includes magic link)

```typescript
// Pseudo-code for webhook
const email = session.customer_details?.email;

// 1. Create auth user
const { data: authUser } = await supabaseAdmin.auth.admin.createUser({
  email,
  email_confirm: true, // Skip email verification
});

// 2. Create profile from lead data
const lead = await getLead(session.metadata.session_id);
await supabaseAdmin.from('user_profiles').insert({
  user_id: authUser.user.id,
  email,
  birth_date: lead.birth_date,
  birth_time: lead.birth_time,
  birth_place: lead.birth_place,
  // ... other fields
  account_status: 'pending_setup',
});

// 3. Generate magic link
const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
  type: 'magiclink',
  email,
  options: { redirectTo: `${origin}/auth/callback?next=/setup` }
});

// 4. Send email via Resend
await resend.emails.send({
  to: email,
  subject: 'Your 2026 Forecast is Ready',
  // Include magic link in email
});
```

### 2. Email Provider: Resend

**File**: `src/lib/resend.ts` (already exists)

Configure Supabase to use custom SMTP OR send magic links manually via Resend.

**Recommendation**: Use Supabase's `generateLink` API + send via Resend for full control over email design.

### 3. Resume from Paywall Feature

**New API**: `GET /api/check-resume?email=xxx`

Returns:
```json
{
  "canResume": true,
  "sessionId": "xxx",
  "birthData": { ... },
  "expiresAt": "2026-01-11T..."
}
```

**Landing page update**: Add "Already started?" link that shows email input modal.

### 4. Middleware Updates

**File**: `src/lib/supabase/middleware.ts`

- Set `BYPASS_AUTH = false`
- Protected routes: `/dashboard`, `/calendar`, `/profile`, `/map`
- Redirect to `/login` if not authenticated
- After login, check subscription status:
  - Active → allow access
  - No subscription → redirect to `/login` with message

### 5. Login Page Updates

**File**: `src/app/login/page.tsx`

- If user enters email with no account: Show "No account found. [Take the quiz →]"
- If user has account but no subscription: Show "Your subscription has expired. [Resubscribe →]"

### 6. Auth Callback Updates

**File**: `src/app/auth/callback/route.ts`

Current logic is good. Ensures:
- New users → `/setup`
- Existing users → `/dashboard`

### 7. Post-Payment Confirmation Screen

**New component**: `src/components/reveal/screens/RevealScreen10Confirmation.tsx`

```
┌─────────────────────────────────────┐
│                                     │
│            ✨ You're In!            │
│                                     │
│   Your 2026 Forecast awaits.        │
│                                     │
│   We've sent a magic link to        │
│   your@email.com                    │
│                                     │
│   Click it to access your           │
│   personalized dashboard.           │
│                                     │
│   [Check Your Email]                │
│                                     │
│   Didn't get it? Check spam or      │
│   request a new link.               │
│                                     │
└─────────────────────────────────────┘
```

### 8. Failed Payment Email

**Trigger**: Stripe webhook `payment_intent.payment_failed`

**Email content**:
- "Your payment didn't go through"
- Link to retry: `/reveal?d=9&retry=true`
- Support email for questions

---

## Database Changes

### `astro_leads` table updates

Add columns:
```sql
ALTER TABLE astro_leads ADD COLUMN IF NOT EXISTS
  resume_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days');

ALTER TABLE astro_leads ADD COLUMN IF NOT EXISTS
  converted BOOLEAN DEFAULT FALSE;
```

### `user_profiles` table updates

Ensure columns exist:
```sql
-- account_status: 'pending_setup' | 'active' | 'suspended'
-- subscription_status: 'active' | 'past_due' | 'canceled' | 'trialing'
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User changes email at Stripe checkout | New email is used for auth. Lead data still linked via session_id. |
| User pays, never clicks magic link | Account exists. They can request new magic link at /login. |
| User tries /dashboard without auth | Middleware redirects to /login. |
| User has auth but no subscription | /login shows "subscription expired" with link to resubscribe. |
| Magic link expires (default 1hr) | User requests new link at /login. |
| Resume data older than 7 days | Treat as new user, start fresh quiz. |
| Payment fails | Email sent with retry link. Data preserved in localStorage. |

---

## Out of Scope (v1)

- [ ] Self-service subscription cancellation (email support only)
- [ ] Welcome email sequence (purchase confirmation only)
- [ ] Social login (Google, Apple)
- [ ] Password reset flow (magic link handles this)
- [ ] Account deletion self-service

---

## Implementation Checklist

### Phase 1: Core Auth
- [ ] Disable `BYPASS_AUTH` in both files
- [ ] Update Stripe webhook to create auth user
- [ ] Update Stripe webhook to send confirmation email via Resend
- [ ] Test magic link flow end-to-end

### Phase 2: Resume Feature
- [ ] Create `/api/check-resume` endpoint
- [ ] Add "Already started?" modal on landing page
- [ ] Add `resume_expires_at` column to `astro_leads`
- [ ] Implement 7-day cleanup job (optional, can do manually)

### Phase 3: Polish
- [ ] Create confirmation screen (RevealScreen10Confirmation)
- [ ] Update login page error messages
- [ ] Add failed payment email trigger
- [ ] Test all edge cases

---

## Open Questions

1. **Cleanup job**: Should we auto-delete expired lead data, or just ignore it?
2. **Email design**: Use plain text or HTML template for purchase confirmation?
3. **Retry limit**: How many times can they retry a failed payment before we stop emailing?
