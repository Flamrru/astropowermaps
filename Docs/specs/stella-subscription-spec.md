# Stella+ Subscription Spec

> **Status:** Ready for implementation
> **Branch:** `Stella+Subscriptions`
> **Date:** 2026-01-02

---

## 1. Executive Summary

Transform AstroPowerMaps from a $19 one-time purchase model to a **$7.99/month subscription** (Stella+) that includes the full map experience plus AI-powered personalized guidance.

### Key Changes
- **Remove** $19 one-time purchase for new users
- **Introduce** $7.99/month Stella+ subscription (everything included)
- **Grandfather** existing $19 buyers: lifetime map + 5 months free Stella+
- **Add** user accounts via Supabase Auth (magic links)

---

## 2. Feature Requirements

### 2.1 Stella Chat (AI Guide)

| Requirement | Specification |
|-------------|---------------|
| AI Model | GPT-5.2 (premium quality for conversations) |
| Personality | Mystical & wise guide ("The stars reveal...") |
| Message limit | 50 messages/day |
| History | Persistent (stored in DB, visible across sessions) |
| Context | Full: birth chart + current transits + weekly forecast + chat history |
| Quick replies | Personalized to user's chart (love, career, life purpose) |
| UI | Floating button → modal/drawer → expandable to full page |
| Avatar | Reuse existing Stella image (`/public/images/stella.png`) |

**Quick Reply Examples (personalized):**
- "Your Venus in Scorpio suggests... ask about deep connections"
- "With Mars transiting your 10th house, ask about career moves"
- "Your Moon phase today is perfect for... ask about intuition"

---

### 2.2 Weekly Forecast

| Requirement | Specification |
|-------------|---------------|
| AI Model | GPT-5 Mini (cost-effective) |
| Generation | Fresh each time user views (no caching) |
| Content | Theme, top power days, caution/rest emphasis, suggested actions |
| Display | Card on /dashboard |
| Regeneration | Not available |

---

### 2.3 Daily Power Score

| Requirement | Specification |
|-------------|---------------|
| AI Model | GPT-5 Mini |
| Generation | Fresh each time user views |
| Score | 0-100 scale |
| Content | Score + "today is for X / avoid Y" message |
| Display | Prominent card at top of /dashboard |

---

### 2.4 Best Day Picker

| Requirement | Specification |
|-------------|---------------|
| Calculation | **Advanced** - full transit analysis against natal chart |
| Range | Next 30 days |
| Goal categories | Love, Career, Creativity, Clarity, Adventure |
| Output | Ranked list of best days for selected goal |
| Display | Interactive picker on /dashboard |

---

### 2.5 Calendar Feed (ICS)

| Requirement | Specification |
|-------------|---------------|
| Format | Standard ICS file |
| Endpoint | `GET /api/calendar/:token.ics` |
| Token | Private, rotatable per user |
| Events available | Power Days, Rest Windows, Moon Phases, Mercury Retrograde, Eclipses |
| User control | Checkboxes to select which event types to include |
| Management | `/calendar` settings page with copy link + regenerate token |

---

### 2.6 Rituals & Journaling

| Requirement | Specification |
|-------------|---------------|
| Prompts | Static base library + AI personalization to user's chart |
| Journal storage | Per-user, unlimited entries |
| Display | Card on /dashboard with daily prompt |
| Prompt rotation | Changes based on weekly forecast themes |

---

## 3. User Accounts & Authentication

### 3.1 Auth System
- **Provider:** Supabase Auth
- **Method:** Passwordless magic links
- **Session:** Managed by Supabase (automatic refresh)

### 3.2 Account Creation Flow

| Step | Where | What Happens |
|------|-------|--------------|
| 1 | Quiz Screen 9 (email capture) | Soft account creation - user record created behind scenes |
| 2 | Reveal Step 10 (after payment) | "Secure your account" prompt - send magic link |
| 3 | Email click | User authenticated, session established |

### 3.3 Legacy Support
- Keep `/map?sid=<session_id>` working for existing buyers
- Show upgrade banner to Stella+ on legacy map access

---

## 4. Subscription & Billing

### 4.1 Pricing
| Product | Price | What's Included |
|---------|-------|-----------------|
| Stella+ Monthly | $7.99/mo | Full map + all Stella+ features |

### 4.2 Payment Flow
1. Replace current $19 paywall at Reveal Step 9
2. Stripe subscription checkout (embedded)
3. Webhook handles `customer.subscription.created`
4. User redirected to `/dashboard`

### 4.3 Existing $19 Buyers (Grandfather)
| What They Get | Duration |
|---------------|----------|
| Lifetime map access | Forever |
| Full Stella+ features | 5 months free |
| After 5 months | Must subscribe to keep Stella+ |

### 4.4 Subscription Management
| Scenario | Behavior |
|----------|----------|
| Payment fails | 3-7 day grace period (Stripe retry) |
| Grace period expires | Downgrade: show last forecast, blur new content |
| Cancel | Access until period ends, no refund |
| Resubscribe | Immediate full access |

---

## 5. Routes & Navigation

### 5.1 Existing Routes (unchanged behavior)
| Route | Purpose |
|-------|---------|
| `/` | Quiz funnel |
| `/reveal` | Reveal flow (paywall at step 9) |
| `/map` | Full astrocartography map |
| `/admin` | Analytics dashboard |

### 5.2 New Routes
| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/dashboard` | Main Stella+ hub (forecasts, score, chat, journal) | Yes |
| `/calendar` | Calendar feed settings (copy link, regenerate token) | Yes |
| `/api/calendar/:token.ics` | ICS feed endpoint | Token auth |
| `/api/auth/callback` | Supabase magic link callback | No |

### 5.3 Dashboard Layout (Mobile-First)
```
┌─────────────────────────────┐
│  Today's Power Score        │  <- Prominent top card
│  78/100 - "Focus on..."     │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Weekly Forecast            │  <- Expandable card
│  Theme: Transformation      │
│  [Read more]                │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Best Days This Week        │  <- Quick view
│  Wed: Career | Fri: Love    │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Today's Ritual             │  <- Journal prompt
│  "Reflect on..."            │
│  [Write in journal]         │
└─────────────────────────────┘
          ┌───────┐
          │ Stella│  <- Floating chat button
          │   💬  │
          └───────┘
```

---

## 6. Data Model

### 6.1 New Tables

```sql
-- Users (via Supabase Auth, extended)
-- Note: Supabase creates auth.users automatically

-- User profiles (birth data)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT NOT NULL,
  birth_lat DECIMAL(10, 7),
  birth_lng DECIMAL(10, 7),
  birth_timezone TEXT,
  label TEXT DEFAULT 'Me',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- Single profile per user for MVP
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- active, past_due, canceled, trialing, etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE stella_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES ritual_prompts(id),
  entry_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ritual prompts (static + AI-enhanced)
CREATE TABLE ritual_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'daily', 'weekly'
  category TEXT, -- 'reflection', 'gratitude', 'intention', etc.
  base_content TEXT NOT NULL, -- Static template
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar tokens
CREATE TABLE calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  event_types JSONB DEFAULT '["power_days", "rest_windows", "moon_phases"]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grandfathered users (existing $19 buyers)
CREATE TABLE grandfathered_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_purchase_id UUID REFERENCES astro_purchases(id),
  stella_free_until TIMESTAMPTZ NOT NULL, -- 5 months from migration
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Updated Existing Tables

```sql
-- Add user_id to existing tables
ALTER TABLE astro_leads ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE astro_purchases ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

---

## 7. API Endpoints

### 7.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/magic-link` | Request magic link email |
| GET | `/api/auth/callback` | Handle magic link redirect |
| POST | `/api/auth/logout` | End session |

### 7.2 Subscription
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/create-subscription-session` | Start Stripe checkout |
| POST | `/api/stripe/customer-portal` | Open Stripe billing portal |
| POST | `/api/stripe/webhook` | Handle subscription events (extend existing) |

### 7.3 Stella Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stella/messages` | Get chat history |
| POST | `/api/stella/chat` | Send message, get response |
| GET | `/api/stella/quick-replies` | Get personalized quick reply options |

### 7.4 Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forecast/weekly` | Get weekly forecast (generates fresh) |
| GET | `/api/score/daily` | Get daily power score (generates fresh) |
| GET | `/api/best-day?goal=love&range=30` | Get best days for goal |
| GET | `/api/ritual/today` | Get today's ritual prompt (personalized) |

### 7.5 Journal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journal` | List journal entries |
| POST | `/api/journal` | Create journal entry |

### 7.6 Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/:token.ics` | ICS feed (token auth) |
| GET | `/api/calendar/settings` | Get calendar preferences |
| PUT | `/api/calendar/settings` | Update event type selections |
| POST | `/api/calendar/rotate-token` | Generate new token |

---

## 8. Gating Rules

| User Type | Map Access | Stella+ Features |
|-----------|------------|------------------|
| Not logged in | No | No |
| Logged in, no subscription | No | No |
| Active subscriber | Yes | Yes |
| Past due (grace period) | Yes | Yes |
| Canceled (until period end) | Yes | Yes |
| Subscription expired | No | No |
| Grandfathered (within 5 mo) | Yes | Yes |
| Grandfathered (after 5 mo) | Yes | No |
| Legacy SID link (no account) | Map only | No |

---

## 9. Analytics Events

Add these to `astro_funnel_events`:

| Event | When |
|-------|------|
| `subscription_checkout_opened` | User clicks subscribe |
| `subscription_started` | Successful payment |
| `subscription_canceled` | User cancels |
| `subscription_expired` | Grace period ended |
| `dashboard_viewed` | User visits /dashboard |
| `stella_message_sent` | Chat message sent |
| `weekly_forecast_viewed` | Forecast card opened |
| `daily_score_viewed` | Score viewed |
| `best_day_picker_used` | Best day query made |
| `calendar_feed_copied` | User copied ICS link |
| `journal_entry_created` | New journal entry |

---

## 10. Implementation Phases

### Phase 1: MVP (This Branch)
1. [ ] Supabase Auth setup (magic links)
2. [ ] Database migrations (new tables)
3. [ ] Stripe subscription product + webhook
4. [ ] Replace paywall (Step 9) with subscription
5. [ ] `/dashboard` page with card-based layout
6. [ ] Daily Power Score (GPT-5 Mini)
7. [ ] Weekly Forecast (GPT-5 Mini)
8. [ ] Stella Chat with GPT-5.2
9. [ ] Quick replies (personalized)
10. [ ] Rituals + Journal
11. [ ] Calendar feed (ICS)
12. [ ] Best Day Picker (30 days, transit analysis)
13. [ ] Grandfather existing $19 buyers

### Phase 2: Polish (Future)
- [ ] Better onboarding for new subscribers
- [ ] Push notifications / email digests
- [ ] "Claim your account" flow for legacy SID users
- [ ] Improved Best Day Picker UI
- [ ] Subscription analytics dashboard

---

## 11. Out of Scope

- Location tracking / radar features
- Multi-profile support (Phase 2+)
- Palm reader integration (separate branch)
- Additional astrology systems (Chinese, numerology)
- Native mobile app
- Annual subscription option (consider later)

---

## 12. Open Questions

None remaining - all clarified during interview.

---

## 13. Reference Files

| Asset | Location |
|-------|----------|
| Stella avatar | `/public/images/stella.png` (in palm-reader branch) |
| StellaPersona component | `src/features/palm-reader/components/StellaPersona.tsx` |
| Existing paywall | `src/components/reveal/` |
| Stripe webhook | `src/app/api/stripe/webhook/route.ts` |
| Power months logic | `src/lib/astro/` |

---

*Spec created: 2026-01-02*
*Ready for implementation*
