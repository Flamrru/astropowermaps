# Debug Solutions & Implementation Patterns

> A knowledge base of solved issues, working patterns, and lessons learned.
> Reference this before implementing similar features to avoid repeating mistakes.

---

## Table of Contents
1. [Stripe: Trial Payment + Subscription](#stripe-trial-payment--subscription)
2. [Vercel Environment Variables](#vercel-environment-variables)

---

## Stripe: Trial Payment + Subscription

**Date:** 2026-01-07
**Status:** TESTING - Mixed cart approach deployed, fallback ready

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

#### Approach 3: Subscription Mode + Mixed Cart (TESTING)
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
- Stripe creates subscription automatically
- No webhook needed for subscription creation
- Simpler flow

**Cons:**
- Uncertain if one-time item charges during trial or waits
- Less proven than Approach 1

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

*Last updated: 2026-01-07*
