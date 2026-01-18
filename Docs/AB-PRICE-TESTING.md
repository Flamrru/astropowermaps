# A/B Price Testing System

> Implementation guide for the price variant testing system.

## Overview

The A/B price testing system allows testing different price points via URL parameters. Users arriving with `?c=<code>` see a different price on the paywall.

## Current Variants

| Code | Price | Strikethrough | Plan ID | URL |
|------|-------|---------------|---------|-----|
| (none) | $19.99 | $49.00 | `one_time` | `astropowermap.com` |
| `x14ts` | $14.99 | $35.00 | `one_time_14` | `astropowermap.com/?c=x14ts` |
| `x24ts` | $24.99 | $59.00 | `one_time_24` | `astropowermap.com/?c=x24ts` |
| `x29ts` | $29.99 | $69.00 | `one_time_29` | `astropowermap.com/?c=x29ts` |

---

## How It Works

```
User visits /?c=x14ts
       ↓
QuizShell.tsx captures code → localStorage
       ↓
User completes quiz (screens 1-10)
       ↓
Screen10AutoConfirmation reads localStorage → appends &c=x14ts to reveal URL
       ↓
/reveal?sid=xxx&c=x14ts
       ↓
RevealScreen09Paywall reads ?c= from URL → maps to plan ID
       ↓
PricingSelector shows correct price + strikethrough
       ↓
Checkout API charges correct Stripe price
```

**Key behavior:** Visiting WITHOUT `?c=` clears any stale variant from localStorage (prevents cross-session contamination).

---

## Files to Modify (Adding a New Price Variant)

### 1. `src/lib/stripe-config.ts`
Add price ID to both `SANDBOX_PRICES` and `LIVE_PRICES`:
```typescript
ONE_TIME_XX: "price_xxx", // $XX.99 one-time (variant xXXts)
```

### 2. `src/lib/subscription-plans.ts`
1. Add to `PlanId` type:
```typescript
export type PlanId = "..." | "one_time_XX" | "...";
```

2. Add to `PLAN_TO_PRICE_KEY`:
```typescript
one_time_XX: "ONE_TIME_XX",
```

3. Add plan definition to `SUBSCRIPTION_PLANS`:
```typescript
one_time_XX: {
  id: "one_time_XX",
  name: "Full Access",
  trialPriceCents: XXXX, // e.g., 1499 for $14.99
  trialPriceDisplay: "$XX.99",
  trialDays: 0,
  monthlyPriceCents: 0,
  monthlyPriceDisplay: "$0",
  stripePriceKey: "ONE_TIME_XX",
  description: "One-time purchase, lifetime access",
},
```

### 3. `src/components/QuizShell.tsx`
Add code to valid codes array (~line 225):
```typescript
if (variantCode && ["x14ts", "x24ts", "x29ts", "xXXts"].includes(variantCode)) {
```

### 4. `src/components/reveal/screens/RevealScreen09Paywall.tsx`
Add to `VARIANT_TO_PLAN` mapping (~line 89):
```typescript
const VARIANT_TO_PLAN: Record<string, PlanId> = {
  "xXXts": "one_time_XX",
  // ...
};
```

### 5. `src/components/reveal/paywall/PricingSelector.tsx`
Add strikethrough price in `getStrikethroughPrice()` (~line 76):
```typescript
one_time_XX: { display: "$YY.00", cents: YY00 }, // $XX.99 → ZZ% off
```

Also add to `isValidOneTimePlan` check (~line 411):
```typescript
const isValidOneTimePlan = ["one_time", "one_time_14", "one_time_24", "one_time_29", "one_time_XX"].includes(selectedPlan);
```

### 6. `src/app/api/stripe/create-checkout-session/route.ts`
1. Add to `isOneTimePayment` check (~line 69):
```typescript
const isOneTimePayment = ["one_time", "one_time_14", "one_time_24", "one_time_29", "one_time_XX", "winback"].includes(planId);
```

2. Add to `priceIdMap` (~line 77):
```typescript
one_time_XX: prices.ONE_TIME_XX,
```

3. Add to line_items price selection (~line 169):
```typescript
price: planId === "one_time_XX" ? prices.ONE_TIME_XX
  : // ...
```

### 7. `scripts/create-ab-test-prices.ts`
Add to `AB_TEST_PRICES` array:
```typescript
{
  name: "$XX.99 One-Time",
  nickname: "stella_one_time_XX",
  priceCents: XXXX,
  variantCode: "xXXts",
  configKey: "ONE_TIME_XX",
},
```

### 8. Create Stripe Prices
```bash
# Sandbox
STRIPE_MODE=sandbox npx tsx scripts/create-ab-test-prices.ts

# Live (requires confirmation)
STRIPE_MODE=live npx tsx scripts/create-ab-test-prices.ts
```

Copy the output price IDs back to `stripe-config.ts`.

### 9. Update Documentation
- `docs/AB-PRICE-TEST-CAMPAIGNS.md` - Add campaign links
- `docs/AB-PRICE-TESTING.md` - Update current variants table

---

## Calculating Strikethrough Price

To maintain ~57-59% savings perception:

```
strikethrough = price / (1 - savings_percent)

Example for $14.99 with 57% savings:
strikethrough = 14.99 / 0.43 = $34.86 ≈ $35.00
```

| Price | 57% off | 58% off | 59% off |
|-------|---------|---------|---------|
| $14.99 | $35.00 | $36.00 | $37.00 |
| $19.99 | $47.00 | $48.00 | $49.00 |
| $24.99 | $58.00 | $59.00 | $61.00 |
| $29.99 | $70.00 | $71.00 | $73.00 |

---

## Tracking & Analytics

### Database
- `astro_leads.price_variant_code` — Stores variant code at lead capture
- `astro_purchases.metadata.plan_id` — Stores which plan was purchased
- `astro_purchases.metadata.variant_code` — Stores variant code at purchase

### Meta Attribution
Each variant sends:
- `content_ids: [planId]` (e.g., `one_time_14`)
- `value: XX.99` (actual price)

### SQL Queries
See `docs/AB-PRICE-TEST-CAMPAIGNS.md` for analytics queries.

---

## Testing Checklist

1. [ ] Visit `/?c=xXXts` → verify localStorage is set
2. [ ] Complete quiz → verify redirect URL has `&c=xXXts`
3. [ ] Paywall shows correct price and strikethrough
4. [ ] Savings percentage displays correctly
5. [ ] Checkout charges correct amount
6. [ ] Visit without `?c=` → verify default $19.99 shows
7. [ ] Meta pixel fires with correct `content_ids` and `value`
