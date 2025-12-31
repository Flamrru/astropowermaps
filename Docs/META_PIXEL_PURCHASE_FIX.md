# Meta Pixel Purchase Event Fix

**Date:** December 31, 2025

---

## The Problem

The Meta Pixel `Purchase` event was never firing after successful payments.

### Why It Wasn't Working

The original code tracked Purchase in Stripe's `onComplete` callback:

```javascript
// StripeCheckout.tsx
<EmbeddedCheckoutProvider
  options={{
    onComplete: handleComplete,  // ← This never fired!
  }}
>
```

**The issue:** Stripe's embedded checkout has a `return_url` configured:

```javascript
// create-checkout-session/route.ts
return_url: `${origin}/reveal?payment_status=complete&session_id={CHECKOUT_SESSION_ID}`
```

When a user completes payment, Stripe **redirects the browser** to this URL. The page unloads before React can execute the `onComplete` callback. It's a race condition — the redirect wins.

---

## The Fix

Track the Purchase event when the user **returns** to the app with `?payment_status=complete` in the URL.

### Where It's Tracked Now

**File:** `src/components/reveal/RevealShell.tsx` (lines 137-154)

```javascript
// PAYMENT SUCCESS: Redirect from Stripe after successful payment
const paymentStatus = searchParams.get("payment_status");
if (paymentStatus === "complete") {
  console.log("✅ Payment completed - tracking Purchase event");

  // Track Purchase event (client-side pixel)
  trackMetaEvent("Purchase", {
    value: 0.70,  // Keep in sync with PRICE_CENTS
    currency: "USD",
    content_type: "product",
    content_name: "2026 Astro Power Map",
  });

  // Then redirect to map
  window.location.href = "/map?payment=success";
  return;
}
```

### Flow After Fix

1. User clicks "Unlock Everything" on paywall
2. User enters payment details in Stripe embedded checkout
3. Payment succeeds → Stripe redirects to `/reveal?payment_status=complete`
4. `RevealShell.tsx` detects `payment_status=complete` in URL
5. **Purchase event fires** via `trackMetaEvent()`
6. User is redirected to `/map?payment=success`

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/reveal/RevealShell.tsx` | Added Purchase tracking on return URL |
| `src/components/reveal/StripeCheckout.tsx` | Old location (still fires but unreliable) |

---

## Price Sync Reminder

The Purchase event value must match the actual price. Update in **3 places** for production:

1. `src/app/api/stripe/create-checkout-session/route.ts` → `PRICE_CENTS = 1900`
2. `src/components/reveal/StripeCheckout.tsx` → `value: 19.0`
3. `src/components/reveal/RevealShell.tsx` → `value: 19.0`

---

## Server-Side Backup (CAPI)

There's also a server-side Purchase event via Meta Conversions API:

**File:** `src/app/api/stripe/webhook/route.ts`

This fires when Stripe sends the `checkout.session.completed` webhook. It requires `META_CAPI_ACCESS_TOKEN` in Vercel environment variables.

Benefits:
- Not blocked by ad blockers
- More reliable (server-side)
- Uses actual Stripe amount (not hardcoded)

---

## Testing

1. Complete a purchase on the live site
2. Check Meta Events Manager for:
   - **Purchase** from **Browser** (client-side pixel)
   - **Purchase** from **Server** (CAPI, if configured)
