# Debug Solutions & Implementation Patterns

> A knowledge base of solved issues, working patterns, and lessons learned.
> Reference this before implementing similar features to avoid repeating mistakes.

**Guidelines for this file:**
- Keep entries **brief and actionable** — just the fix, not the journey
- Include only the **concrete code snippet** that solved the problem
- Focus on **what worked**, not all the things that didn't
- Each entry should be readable in under 2 minutes

---

## Table of Contents
1. [Stripe: Trial Payment + Subscription](#stripe-trial-payment--subscription)
2. [Vercel Environment Variables](#vercel-environment-variables)
3. [Missing stripe_customer_id in Profile](#missing-stripe_customer_id-in-profile)
4. [Duplicate Stripe Customers on Re-purchase](#duplicate-stripe-customers-on-re-purchase)
5. [iOS Safari Popup Blocker (Manage Billing)](#ios-safari-popup-blocker-manage-billing)

---

## Stripe: Trial Payment + Subscription

**Date:** 2026-01-07
**Status:** ✅ SOLVED - Mixed cart approach CONFIRMED WORKING

### The Problem
We need to charge users an upfront trial fee ($2.99/$5.99/$9.99) and then automatically start a $19.99/month subscription after the trial period ends.

### Approaches Tried

#### Approach 1: Payment Mode + Webhook Creates Subscription (WORKS - PROVEN)
**File:** `src/app/api/stripe/create-checkout-session/route.ts`

```typescript
// Checkout in PAYMENT mode
const checkoutSession = await stripe.checkout.sessions.create({
  mode: "payment",  // One-time payment
  customer_email: body.email,
  customer_creation: "always",  // CRITICAL: Creates Stripe customer

  payment_intent_data: {
    setup_future_usage: "off_session",  // Saves card for later
  },

  line_items: [{
    price_data: {
      currency: "usd",
      product_data: { name: "Trial Access" },
      unit_amount: trialPriceCents,
    },
    quantity: 1,
  }],

  metadata: {
    create_subscription: "true",  // Flag for webhook
    trial_days: "7",
    // ... other metadata
  },
});
```

**Webhook creates subscription:**
```typescript
// In webhook handler after checkout.session.completed
if (createSubscription && session.mode === "payment") {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: monthlyPriceId }],
    trial_end: Math.floor(Date.now() / 1000) + trialDays * 86400,
    default_payment_method: paymentMethodId,
  });
}
```

**Pros:**
- Works reliably
- Full control over subscription creation

**Cons:**
- Depends on webhook (if webhook fails, subscription not created)
- More complex webhook logic

---

#### Approach 2: Subscription Mode + add_invoice_items (FAILED)
**Error:** `Received unknown parameter: subscription_data[add_invoice_items]`

```typescript
// This does NOT work - API version issue
subscription_data: {
  trial_period_days: 7,
  add_invoice_items: [{  // <-- NOT SUPPORTED in checkout
    price_data: { ... },
  }],
}
```

**Why it failed:**
- `add_invoice_items` in `subscription_data` requires specific Stripe API version
- Our SDK (v20.1.0) types don't support it
- Even with type assertion, the API rejected it

---

#### Approach 3: Subscription Mode + Mixed Cart (✅ WORKS - CONFIRMED)
**File:** `src/app/api/stripe/create-checkout-session/route.ts`

```typescript
// Checkout in SUBSCRIPTION mode with mixed line_items
const checkoutSession = await stripe.checkout.sessions.create({
  mode: "subscription",
  customer_email: body.email,

  line_items: [
    // One-time trial fee (charged on first invoice)
    {
      price_data: {
        currency: "usd",
        product_data: { name: "Trial Access" },
        unit_amount: trialPriceCents,
      },
      quantity: 1,
    },
    // Recurring subscription (trial applies to this)
    {
      price: monthlyPriceId,
      quantity: 1,
    },
  ],

  subscription_data: {
    trial_period_days: 7,
  },
});
```

**Pros:**
- Stripe creates subscription automatically ✅
- No webhook needed for subscription creation ✅
- Simpler flow ✅
- One-time fee charged immediately on first invoice ✅

**Confirmed by live transaction (2026-01-07):**
```
Invoice: in_1SmjQe24zElYF83GJ1FRV4wE
Line 1: "Stella+ 7-Day Trial" - $5.99 (paid immediately)
Line 2: "Trial period for Stella+ Monthly" - $0 (trial)
Subscription: sub_1SmjQe24zElYF83GlNl3e3kK (status: trialing)
```

---

### Key Learnings

1. **`customer_creation: "always"`** is CRITICAL in payment mode - without it, no Stripe customer is created and subscription creation fails.

2. **`setup_future_usage: "off_session"`** saves the payment method for future charges.

3. **Webhook is still needed** for user creation, emails, and profile setup - even in subscription mode.

4. **API versions matter** - `add_invoice_items` in subscription_data requires newer API versions.

### Fallback Plan
If mixed cart doesn't work, revert to commit `e42d5d9` which has the proven payment mode approach:
```bash
git revert HEAD --no-edit && git push origin main
```

---

## Vercel Environment Variables

**Date:** 2026-01-07

### The Problem
Stripe mode detection failed even after adding `STRIPE_MODE=live` to Vercel.

### Root Cause
Using `echo "live"` in Vercel CLI adds a **newline character** to the value:
```
"live\n" !== "live"  // String comparison fails!
```

### Solution
Use `printf` instead of `echo`:
```bash
# WRONG - adds newline
vercel env add STRIPE_MODE production <<< "live"

# CORRECT - no newline
printf "live" | vercel env add STRIPE_MODE production
```

### How to Debug
```bash
# Check if value has hidden characters
vercel env pull .env.vercel
cat -A .env.vercel  # Shows $ for newlines
```

### Key Learning
Always use `printf` for Vercel env vars, or set them manually in the dashboard.

---

## Template for New Entries

```markdown
## [Feature/Bug Name]

**Date:** YYYY-MM-DD
**Status:** SOLVED / TESTING / DOCUMENTED

### The Problem
[What was broken or needed]

### Root Cause
[Why it happened]

### Solution
[What fixed it]

### Code Snippet
```language
// Working code here
```

### Key Learnings
1. [Lesson 1]
2. [Lesson 2]

### Related Files
- `path/to/file.ts`
```

---

## Missing stripe_customer_id in Profile

**Date:** 2026-01-07
**Status:** SOLVED

### The Problem
Users see "No Stripe customer found. Please contact support." when clicking "Manage billing" on the profile page.

### Root Cause
Race condition between webhook and `/api/auth/create-account`:

1. User pays → Stripe webhook fires
2. Webhook creates auth user (no password yet)
3. User completes /setup and creates password BEFORE webhook finishes
4. `/api/auth/create-account` creates profile WITHOUT `stripe_customer_id`
5. Webhook runs later but profile already exists → upsert might not update

The `/api/auth/create-account` route was inserting profiles without fetching `stripe_customer_id` from the purchase record.

### Solution
Updated `create-account/route.ts` to:
1. Fetch `stripe_customer_id` from `astro_purchases` when creating profiles
2. **Fallback to Stripe API lookup** if purchase record doesn't have it (common because webhook update often fails)

```typescript
// Try to get stripe_customer_id from purchase record
const { data: purchase } = await supabaseAdmin
  .from("astro_purchases")
  .select("stripe_customer_id")
  .eq("session_id", lead.session_id)
  .eq("status", "completed")
  .single();

// Fallback to Stripe API lookup (purchase often doesn't have it)
const stripeCustomerId = purchase?.stripe_customer_id || await getStripeCustomerByEmail(email);

const { error: insertError } = await supabaseAdmin.from("user_profiles").insert({
  user_id: existingUser.id,
  // ... other fields
  stripe_customer_id: stripeCustomerId,
});
```

The `getStripeCustomerByEmail` helper function looks up the customer directly from Stripe:
```typescript
async function getStripeCustomerByEmail(email: string): Promise<string | null> {
  const stripe = new Stripe(getStripeSecretKey());
  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data[0]?.id || null;
}
```

### Manual Fix for Existing Users
If a user is missing `stripe_customer_id`, update manually:

```bash
# 1. Find customer in Stripe
stripe customers list --email="user@example.com" --api-key="$STRIPE_SECRET_KEY_LIVE"

# 2. Update profile in Supabase
# Use the Supabase dashboard or API to set stripe_customer_id
```

### Key Learnings
1. **Always include Stripe data** when creating profiles - don't rely solely on webhook
2. **Race conditions** between webhook and user actions need careful handling
3. **The `astro_purchases` table** stores `stripe_customer_id` and can be used as source of truth

### Related Files
- `src/app/api/auth/create-account/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/portal/route.ts`

---

## Duplicate Stripe Customers on Re-purchase

**Date:** 2026-01-07
**Status:** ✅ SOLVED

### The Problem
When a user cancels their subscription and re-purchases, Stripe creates a **new customer** instead of reusing the existing one. This causes:
- User profile has old customer ID (with cancelled subscription)
- New subscription is under a new customer ID
- "Manage billing" portal shows nothing (wrong customer)

### Root Cause
Using `customer_email` in checkout lets Stripe create a new customer every time. It doesn't automatically link to existing customers.

### Solution
Check for existing customers before creating checkout session:

```typescript
// Check if customer already exists to prevent duplicates
let existingCustomerId: string | undefined;
try {
  const existingCustomers = await stripe.customers.list({
    email: body.email,
    limit: 1,
  });
  if (existingCustomers.data.length > 0) {
    existingCustomerId = existingCustomers.data[0].id;
  }
} catch (err) {
  // Continue without existing customer
}

const checkoutSession = await stripe.checkout.sessions.create({
  // Use existing customer if found, otherwise let Stripe create new
  ...(existingCustomerId
    ? { customer: existingCustomerId }
    : { customer_email: body.email }),
  // ... rest of config
});
```

### Key Learnings
1. **`customer_email` creates new customers** - it doesn't look up existing ones
2. **Use `customer` parameter** with existing ID to reuse customers
3. **Always search by email first** before creating checkout sessions

### Related Files
- `src/app/api/stripe/create-checkout-session/route.ts`

---

## Meta Pixel / CAPI Not Showing in Events Manager

**Date:** 2026-01-07
**Status:** ✅ SOLVED

### The Problem
Events sent via Meta Conversions API (CAPI) don't appear in Meta Events Manager, even though Vercel logs show `events_received: 1`.

### Common Causes

#### 1. Looking in Wrong Place
Meta Events Manager has TWO places to see events:
- **Overview tab**: Shows aggregated data, can take 20-60 minutes to update
- **Test Events tab**: Shows real-time events BUT requires `test_event_code`

#### 2. Stripe Redirect Breaking Client Pixel
When users go through Stripe checkout:
1. User clicks pay → redirected to Stripe
2. Stripe processes payment
3. User redirected back → **client session may be broken**
4. Client-side pixel might not fire

**Solution:** Rely on server-side CAPI via webhook (already implemented).

#### 3. Ad Blocker Blocking Client Pixel
Browser console shows: `GET https://connect.facebook.net/en_US/fbevents.js net::ERR_BLOCKED_BY_CLIENT`

**Solution:** Server-side CAPI still works - this is expected behavior.

#### 4. Missing test_event_code for Debugging
Without `test_event_code`, events don't appear in "Test Events" tab.

### How to Debug

#### Step 1: Get Your Test Event Code
1. Go to [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Click **"Test Events"** tab
4. Copy the "Server" test event code (e.g., `TEST12345`)

#### Step 2: Use the Test Endpoint
```bash
curl -X POST https://www.astropowermap.com/api/meta/test-capi \
  -H "Content-Type: application/json" \
  -d '{
    "password": "YOUR_ADMIN_PASSWORD",
    "test_event_code": "TEST12345",
    "email": "test@example.com",
    "event_name": "Purchase",
    "value": 5.99
  }'
```

#### Step 3: Verify in Events Manager
1. Stay on "Test Events" tab
2. Event should appear **within seconds**
3. Shows event_id, parameters, and any errors

#### Step 4: Enable Test Mode in Production (Optional)
Add to Vercel environment variables:
```
META_TEST_EVENT_CODE=TEST12345
```

All CAPI events will now appear in "Test Events" tab instantly.

### Where to Look for Events

| Tab | What It Shows | Update Speed |
|-----|--------------|--------------|
| **Overview** | Aggregated production events | 20-60 minutes |
| **Test Events** | Events with test_event_code | Instant |
| **Diagnostics** | Errors and warnings | Real-time |

### Verifying CAPI is Working

Check Vercel logs for:
```
Meta CAPI: Purchase event sent successfully {
  eventId: 'purchase_xxx',
  events_received: 1,  ← This confirms Meta received it!
}
```

If you see `events_received: 1`, the event WAS received by Meta.

### Event Match Quality (EMQ)

If events appear but don't attribute to ads:
1. Go to Events Manager → Your Pixel → Overview
2. Check "Event Match Quality" score
3. Score below 6.0 means poor attribution

**Improve EMQ by sending more user data:**
- `em` (email) - ✅ We send this
- `client_ip_address` - ✅ We send this
- `client_user_agent` - ✅ We send this
- `fbc` (Facebook Click ID) - ✅ We send this
- `fbp` (Facebook Browser ID) - ✅ We send this

### Related Files
- `src/lib/meta-capi.ts` - CAPI implementation
- `src/app/api/meta/test-capi/route.ts` - Test endpoint
- `src/app/api/stripe/webhook/route.ts` - Sends Purchase event
- `src/app/api/lead/route.ts` - Sends Lead event

---

## iOS Safari Popup Blocker (Manage Billing)

**Date:** 2026-01-08
**Status:** ✅ SOLVED

### The Problem
"Manage billing" button works on desktop but **spins forever on iPhone**. The Stripe billing portal never opens on iOS Safari.

### Root Cause
iOS Safari blocks `window.open()` when called **after an async operation** (like `fetch()`).

```
1. User taps button ✅ (user gesture detected)
2. fetch("/api/stripe/portal") starts... ⏳
3. ~200ms pass waiting for response
4. window.open(url, "_blank") called ❌
   → iOS: "This isn't from a user gesture anymore!"
5. Popup silently blocked, spinner keeps spinning
```

**Why desktop works:** Desktop browsers are more lenient with popup timing after async delays.

### Solution
Use `window.location.href` instead of `window.open()` — navigations aren't blocked:

```typescript
// ❌ BROKEN on iOS - popup blocked after async fetch
if (response.ok && data.url) {
  window.open(data.url, "_blank");
}

// ✅ WORKS on iOS - navigation in same tab
if (response.ok && data.url) {
  window.location.href = data.url;
}
```

### Alternative (Keep New Tab)
If you need a new tab, pre-open the window **before** the async call:

```typescript
const handleOpenPortal = async () => {
  const newWindow = window.open('', '_blank');  // Open immediately!

  const response = await fetch("/api/stripe/portal", { method: "POST" });
  const data = await response.json();

  if (response.ok && data.url) {
    newWindow.location.href = data.url;  // Redirect the pre-opened window
  } else {
    newWindow.close();  // Close if error
  }
};
```

### Key Learnings
1. **iOS Safari popup blocker** is stricter than desktop browsers
2. **`window.open()` after `await`** = blocked on iOS
3. **`window.location.href`** is a navigation, not a popup — always allowed
4. **Test mobile early** — iOS has unique browser behaviors

### Related Files
- `src/components/profile/SubscriptionCard.tsx`

---

*Last updated: 2026-01-08*
