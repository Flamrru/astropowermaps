# Profile Page Spec

**Feature:** Stella+ Profile Page (`/profile` or `/dashboard/profile`)
**Date:** 2026-01-05
**Status:** Ready for implementation

---

## Overview

Standard profile page for Stella+ subscribers with personal info, birth data management, subscription status with self-serve cancellation, and user preferences.

---

## Requirements

### 1. Personal Info Section
- [ ] Display name (editable)
- [ ] Email address (read-only, shows masked: `f***@gmail.com`)
- [ ] Profile photo/avatar (optional, can upload or use default zodiac-based avatar)

### 2. Birth Data Section
- [ ] Display birth date (read-only)
- [ ] Display birth time (editable **only if originally marked as "unknown"**)
- [ ] Display birth location (read-only)
- [ ] "Update Birth Time" button appears only when `birth_time_unknown = true`
- [ ] When updated, recalculates chart data via API

### 3. Subscription Section
- [ ] Show current plan name ("Stella+ Monthly")
- [ ] Show subscription status badge (Active, Trialing, Cancelled)
- [ ] If trialing: show trial end date ("Trial ends Jan 15, 2026")
- [ ] If active: show next billing date
- [ ] "Manage Billing" link → Stripe Customer Portal
- [ ] "Cancel Subscription" button → multi-step cancellation flow

### 4. Multi-Step Cancellation Flow
**Step 1: Survey**
- "Why are you cancelling?" (single-select)
  - Too expensive
  - Not using it enough
  - Found another app
  - Missing features I need
  - Technical issues
  - Other

**Step 2: Show What You'll Lose**
- Visual list of features they'll lose access to:
  - Daily cosmic guidance
  - Power days calendar
  - Stella AI assistant
  - Astrocartography map
- Emotional copy: "Your personalized cosmic guidance will end on [date]"

**Step 3: Offer Alternatives**
- "Before you go..."
- Option A: "Pause for 1 month" (if Stripe supports pause)
- Option B: "Get 50% off next month" (apply coupon)
- Option C: "Continue to cancel"

**Step 4: Final Confirmation**
- Red "Cancel Subscription" button
- Copy: "Are you sure? This cannot be undone."
- Success: Show cancellation confirmation, when access ends

### 5. Preferences Section
- [ ] Theme toggle: Dark / Light (default: Dark)
- [ ] Distance units: km / miles (default: km)
- [ ] Language: English only for now (disabled dropdown showing "English")

### 6. Account Actions
- [ ] "Log Out" button
- [ ] "Delete Account" link (small, at bottom)
  - Confirmation modal with warning
  - Deletes Supabase auth user, profile, anonymizes lead data

---

## UI/UX Design

### Layout
```
┌─────────────────────────────────────┐
│  ← Profile                          │  (header with back button)
├─────────────────────────────────────┤
│  ┌─────┐                            │
│  │ 📷  │  Display Name              │  (avatar + name)
│  └─────┘  f***@gmail.com            │
├─────────────────────────────────────┤
│  BIRTH CHART                        │  (section header)
│  ─────────────────────────────────  │
│  📅 May 5, 1988                     │
│  🕐 5:00 PM                [Edit]   │  (edit only if was unknown)
│  📍 Bratislava, Slovakia            │
├─────────────────────────────────────┤
│  SUBSCRIPTION                       │
│  ─────────────────────────────────  │
│  Stella+ Monthly     [Active] 🟢    │
│  Next billing: Feb 5, 2026          │
│                                     │
│  [Manage Billing]  [Cancel]         │
├─────────────────────────────────────┤
│  PREFERENCES                        │
│  ─────────────────────────────────  │
│  Theme          [Dark ▼]            │
│  Units          [km ▼]              │
│  Language       [English ▼]         │
├─────────────────────────────────────┤
│  [Log Out]                          │
│                                     │
│  Delete Account                     │  (small link, destructive)
└─────────────────────────────────────┘
```

### Visual Style
- Match existing dashboard aesthetic (dark cosmic theme)
- Gold accent color for active states
- Section headers in muted white/gray
- Cards with subtle glass effect

---

## Technical Approach

### API Endpoints Needed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/profile` | GET | Fetch user profile data |
| `/api/profile` | PATCH | Update display name, preferences |
| `/api/profile/birth-time` | PATCH | Update birth time (only if unknown) |
| `/api/stripe/portal` | POST | Generate Stripe Customer Portal link |
| `/api/stripe/cancel` | POST | Initiate cancellation flow |
| `/api/stripe/pause` | POST | Pause subscription (if offered) |
| `/api/stripe/discount` | POST | Apply retention discount |
| `/api/account/delete` | DELETE | Delete user account |

### Database Changes

**user_profiles table additions:**
```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
-- preferences: { theme: "dark", units: "km", language: "en" }
```

### Components to Create

```
src/app/profile/page.tsx           -- Main profile page
src/components/profile/
  ├── ProfileHeader.tsx            -- Avatar + name + email
  ├── BirthDataSection.tsx         -- Birth info + edit time modal
  ├── SubscriptionSection.tsx      -- Plan status + actions
  ├── CancellationFlow.tsx         -- Multi-step cancel modal
  ├── PreferencesSection.tsx       -- Theme, units, language
  └── AccountActions.tsx           -- Logout + delete
```

### State Management
- Use React Query or SWR for profile data fetching
- Local state for modal visibility
- Optimistic updates for preferences

---

## Edge Cases

1. **User has no subscription** (edge case: webhook failed)
   - Show "No active subscription" with "Contact Support" link

2. **Birth time edit fails**
   - Show error toast, keep modal open for retry

3. **Stripe portal unavailable**
   - Fallback to "Contact support to manage billing" message

4. **Cancellation during trial**
   - Immediate access loss vs end-of-trial access? (Need to decide)
   - **Decision:** Access until trial end date

5. **Delete account with active subscription**
   - Must cancel subscription first before deleting account

---

## Out of Scope (v1)

- Profile photo upload (use default zodiac avatar for now)
- Notification settings (no push notifications yet)
- Two-factor authentication
- Password change (use Supabase magic link for now)
- Multiple chart profiles (partner, children)

---

## Open Questions

1. **Pause subscription:** Does Stripe allow pausing? Need to check if enabled.
2. **Retention discount:** What percentage? 50%? For how long?
3. **Avatar:** Generate based on Sun sign, or use generic placeholder?

---

## Success Metrics

- Profile page load time < 1s
- Cancellation flow completion rate (track drop-offs at each step)
- Retention offer acceptance rate
