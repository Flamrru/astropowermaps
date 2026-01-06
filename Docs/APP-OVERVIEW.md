# AstroPowerMaps - Complete App Reference

> **What is this app?** A mobile-first astrology web app that helps users discover their **3 Power Months** and **3 Power Places** for 2026 based on their birth chart. Users are captured through an engaging quiz funnel, then guided through a premium reveal experience before purchasing their personalized astrocartography map.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [User Flows Overview](#2-user-flows-overview)
3. [The Quiz Funnel (10 Screens)](#3-the-quiz-funnel-10-screens)
4. [The Reveal Flow (10 Steps)](#4-the-reveal-flow-10-steps)
5. [The Astrocartography Map](#5-the-astrocartography-map)
6. [Power Months & Yearly Score](#6-power-months--yearly-score)
7. [How Data Flows](#7-how-data-flows)
8. [Payment & Monetization](#8-payment--monetization)
9. [Admin Dashboard](#9-admin-dashboard)
10. [Tech Stack & Integrations](#10-tech-stack--integrations)
11. [File Organization](#11-file-organization)
12. [Database Schema](#12-database-schema)
13. [Environment Variables](#13-environment-variables)
14. [Important Rules & Guardrails](#14-important-rules--guardrails)

---

## 1. The Big Picture

### What Problem Does This Solve?

People are curious about astrology but don't know **where to travel** or **when to make important decisions**. This app promises to reveal:

- **3 Power Months** in 2026 — When cosmic energies favor them for launching projects, taking risks, and making moves
- **3 Power Places** around the world — Geographic locations where their energy amplifies and breakthroughs are more likely
- **Rest Windows** — Periods to recharge rather than force

### The Core Insight

Based on a user's birth chart, there are specific geographic locations and time windows where they have better odds of success. The app calculates planetary positions relative to their birth data and generates a personalized astrocartography map showing celestial lines.

### The Complete User Journey

```
📱 User sees Meta ad → Clicks to landing page
    ↓
🔮 Takes engaging 10-screen quiz (builds curiosity)
    ↓
📧 Enters email + birth data to "unlock" results
    ↓
✨ Enters Reveal Flow (10-step onboarding)
    ↓
🗺️ Sees preview of their personalized map
    ↓
📚 Learns about power months, power cities, timing
    ↓
💰 Reaches paywall ($19 one-time purchase)
    ↓
💳 Pays via Stripe embedded checkout
    ↓
🎉 Gets permanent access to interactive map + email with link
```

### Why This Works (Marketing Psychology)

| Element | Purpose |
|---------|---------|
| **"3 months & 3 places"** | Specific promise creates curiosity |
| **Quiz format** | Interactive = higher engagement than static page |
| **Progress through screens** | Sunk cost fallacy keeps users moving forward |
| **Email gate** | Value exchange - results for contact info |
| **Reveal flow** | Builds anticipation and educates before asking for payment |
| **Personalized map preview** | Shows value before paywall |
| **$19 one-time price** | Low barrier, no subscription commitment |

---

## 2. User Flows Overview

The app has three main routes, each serving a specific purpose:

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Quiz Funnel | Public - lead capture from ads |
| `/reveal` | Reveal Flow | After quiz - onboarding + paywall |
| `/map` | Full Map | Purchased users only (or with birth data form) |
| `/admin` | Dashboard | Password-protected analytics |

### How Routes Connect

```
Landing Page (/)
    ↓
Quiz (10 screens) → Email captured → Redirect to /reveal
    ↓
Reveal Flow (/reveal)
    ↓
Steps 1-8 (preview + onboarding) → Step 9 (paywall)
    ↓
Stripe Payment → Step 10 (confirmation)
    ↓
Redirect to /map?sid=xxx (full map access)
```

---

## 3. The Quiz Funnel (10 Screens)

The quiz is designed to build intrigue and emotional investment before asking for the email.

### Screen-by-Screen Breakdown

| # | Screen Type | What User Sees | What It Does |
|---|-------------|----------------|--------------|
| 1 | **Entry** | "3 months & 3 places will define your 2026" | Hook - creates curiosity |
| 2 | **Insight** | Info about travel and destiny | Builds belief in the concept |
| 3 | **Question 1** | "Have you visited a place that felt right?" | Engages them personally |
| 4 | **Social Proof** | "87% of people feel the difference" | Validates their answer |
| 5 | **Question 2** | "What do you want 2026 to be about?" | Captures their goals |
| 6 | **Insight** | "Timing matters as much as location" | Deepens belief |
| 7 | **Testimonial** | Customer success story | Social proof |
| 8 | **Loading** | 3 rotating messages (auto-advances) | Builds anticipation |
| 9 | **Email Capture** | Email + birth data form | THE CONVERSION POINT |
| 10 | **Confirmation** | "You're on the list" | Thank you + next steps |

### Question 1 Options
- "Yes, definitely"
- "Maybe once or twice"
- "Not sure"

### Question 2 Options (Multi-select)
- Career momentum
- Creativity / new ideas
- Love and connection
- Inner clarity
- Adventure

### What Data is Captured (Screen 9)

| Field | Required | Example |
|-------|----------|---------|
| Email | Yes | user@example.com |
| Birth Date | Yes | May 15, 1990 |
| Birth Time | No* | 2:30 PM |
| Birth Location | Yes | New York, NY |

*If time unknown, user can select "I don't know" and choose a window (morning/afternoon/evening/unknown)

### Visual Design

- **Background Videos**: Different cosmic videos for different screens
- **Colors**: Dark navy (#050510) + Gold accents (#C9A227)
- **Style**: Glassmorphism cards with blur effects
- **Mobile-first**: Max-width 768px container

---

## 4. The Reveal Flow (10 Steps)

After the quiz, users enter the **Reveal Flow** - a guided onboarding experience that educates them before the paywall.

### Step-by-Step Breakdown

| Step | Content | Purpose |
|------|---------|---------|
| 1 | **Map Reveal** | Shows their calculated astrocartography map preview |
| 2 | **Onboarding A** | Educational: Explains what they're seeing |
| 3 | **Onboarding B** | Power months concept introduction |
| 4 | **Onboarding C** | Power cities explanation |
| 5 | **Onboarding D** | How timing works |
| 6 | **Onboarding E** | Why some places feel right |
| 7 | **Onboarding F** | The 2026 opportunity |
| 8 | **Generation** | Final educational content |
| 9 | **Paywall** | $19 pricing, FAQ, testimonials, media logos |
| 10 | **Confirmation** | Payment successful, redirecting to map |

### The Paywall Screen (Step 9)

The paywall is designed to convert with:

| Element | Purpose |
|---------|---------|
| **Price display** | $19 one-time (no subscription) |
| **FAQ accordion** | Answers common objections |
| **Testimonials** | Social proof from previous users |
| **Media logos** | Credibility (NYT, Wired, Forbes, etc.) |
| **Stripe checkout** | Embedded form - no redirect |

### Dev Mode (For Testing)

The reveal flow has a dev mode for quick testing that bypasses normal user flow:

| URL | What it does |
|-----|--------------|
| `/reveal?d=9` | Jump to paywall (step 9) with fake birth data |
| `/reveal?d=3` | Jump to map reveal (step 3) |
| `/reveal?d=1` | Start at step 1 (normal) |

**Dev mode uses hardcoded test data** - NOT real user data!

---

## 5. The Astrocartography Map

The interactive map is the core product - showing where planetary energies are strongest for the user.

### What is Astrocartography?

```
Astrocartography = Where you were born + Where planets were at that moment
                   ↓
                   Creates invisible "power lines" around Earth
                   ↓
                   Living/visiting near these lines amplifies their energy
```

### The 4 Line Types

| Line | Name | Meaning | Multiplier |
|------|------|---------|------------|
| **MC** | Midheaven | Career, public recognition, success | 1.2x |
| **AC** | Ascendant | New beginnings, how others see you | 1.1x |
| **DC** | Descendant | Relationships, partnerships, love | 1.0x |
| **IC** | Imum Coeli | Home, family, roots, inner peace | 0.9x |

### The 10 Planets Tracked

| Planet | Energy | Best For |
|--------|--------|----------|
| ☉ **Sun** | Vitality, purpose | Career, recognition |
| ☽ **Moon** | Emotions, intuition | Home, nurturing |
| ☿ **Mercury** | Communication | Learning, networking |
| ♀ **Venus** | Love, beauty | Romance, creativity |
| ♂ **Mars** | Action, drive | Ambition, competition |
| ♃ **Jupiter** | Luck, expansion | Growth, opportunity |
| ♄ **Saturn** | Discipline | Career building |
| ♅ **Uranus** | Change | Innovation, freedom |
| ♆ **Neptune** | Spirituality | Creativity, healing |
| ♇ **Pluto** | Transformation | Deep change |

### Map Features

| Feature | Description |
|---------|-------------|
| **Interactive globe** | Mapbox GL with zoom, pan, rotate |
| **Planetary lines** | 40 lines (10 planets × 4 types) rendered |
| **City markers** | Clickable dots on beneficial cities |
| **Power places panel** | Sidebar showing ranked cities with stars |
| **Planet toggles** | Show/hide specific planet lines |
| **City details popup** | Star rating, interpretation, distance to line |

### Power Places Scoring

Cities are scored 3-5 stars based on:

| Factor | How It Works |
|--------|--------------|
| **Proximity to line** | Closer = higher score |
| **Line type** | MC lines score highest |
| **Planet relevance** | Venus for love, Jupiter for career, etc. |
| **Multi-line bonus** | Cities near multiple lines score higher |

### How the Calculation Works

```
User enters birth details:
  - Date (YYYY-MM-DD)
  - Time (HH:MM) or "Unknown"
  - Location (city search → coordinates + timezone)
       ↓
Backend calculates:
  1. Convert birth moment to Julian Day number
  2. Use VSOP87 theory to get planet positions
  3. Calculate 40 lines (10 planets × 4 line types)
  4. Check 100+ world cities against these lines
  5. Rank cities by proximity to beneficial lines
       ↓
Returns: Personalized map + Power Places list + Power Months
```

---

## 6. Power Months & Yearly Score

Beyond locations, the app calculates **when** is best for the user.

### Power Months

The app analyzes monthly transits for 2026 and identifies:

- **3 Power Months** — Best times for launching initiatives, taking risks
- **Rest Windows** — Times to recharge rather than push

| What's Analyzed | Purpose |
|-----------------|---------|
| Jupiter transits | Expansion and opportunity windows |
| Saturn transits | Structure and achievement periods |
| Benefic aspects | When planets support growth |

### Yearly Power Score

Each user gets a yearly power score (50-100 range) with optimistic framing:

| Score Range | Label |
|-------------|-------|
| 85-100 | "Exceptional Year" |
| 70-84 | "Powerful Year" |
| 55-69 | "Strong Year" |
| 50-54 | "Foundation Year" |

**Formula**: 50 base + yearly bonus + peak bonus + benefic bonus

---

## 7. How Data Flows

### Quiz → Lead Capture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                          │
├─────────────────────────────────────────────────────────────┤
│  1. User lands on page                                      │
│     → UTM params parsed from URL (?utm_source=fb...)        │
│     → Stored in localStorage                                │
│                                                             │
│  2. User progresses through quiz                            │
│     → State managed in React Context                        │
│     → Each screen change triggers funnel event              │
│                                                             │
│  3. User enters email + birth data on Screen 9              │
│     → Honeypot field checked (spam prevention)              │
│     → Email validated (regex)                               │
│     → Location → Timezone resolved                          │
│                                                             │
│  4. Submit button clicked                                   │
│     → POST /api/lead                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     SERVER (API Route)                      │
├─────────────────────────────────────────────────────────────┤
│  5. /api/lead receives:                                     │
│     {                                                       │
│       email, session_id, quiz answers,                      │
│       birth_date, birth_time, birth_location,               │
│       utm params                                            │
│     }                                                       │
│                                                             │
│  6. Insert/update `astro_leads` table                       │
│  7. Add to MailerLite "Leads" group                         │
│  8. Return success → Redirect to /reveal                    │
└─────────────────────────────────────────────────────────────┘
```

### Funnel Tracking Events

Every screen transition is tracked for analytics:

| Screen | Event Name |
|--------|------------|
| 2 | `quiz_start` |
| 4 | `q1_answered` |
| 6 | `q2_answered` |
| 9 | `email_screen` |
| 10 | `lead_captured` |
| Purchase | `purchase` |

### Meta Pixel Events

| Event | When Fired | Purpose |
|-------|------------|---------|
| `PageView` | Page load | Track visitors |
| `ViewContent` | Screen 1 | Track ad landing |
| `Lead` | Email submitted | Track lead conversions |
| `Purchase` | Payment completed | Track revenue (server-side) |

---

## 8. Payment & Monetization

### Pricing

| Status | Price | Notes |
|--------|-------|-------|
| **Test Mode** | $0.70 | For development testing |
| **Production** | $19.00 | One-time purchase |

### Product

**"2026 Power Map"** - One-time purchase, no subscription. Includes:
- Full interactive map access
- All 40 planetary lines
- Power places recommendations
- Power months calendar
- Permanent access (saved to their email)

### Payment Flow

```
1. User reaches paywall (reveal step 9)
       ↓
2. Stripe embedded checkout loads with user's email
       ↓
3. User enters card details in modal
       ↓
4. Stripe processes payment
       ↓
5. Webhook fires to /api/stripe/webhook
       ↓
6. Webhook handler:
   - Updates `astro_purchases` → status: "completed"
   - Sets `astro_leads` → has_purchased: true
   - Moves user from "Leads" to "Customers" in MailerLite
   - Sends purchase event to Meta Conversions API
   - Sends confirmation email via Resend
       ↓
7. User redirected to /map?sid=<session_id>
       ↓
8. Permanent access - can always return via link in email
```

### Access Control

| Scenario | What Happens |
|----------|--------------|
| `/map` (no params) | Shows birth data form |
| `/map?sid=xxx` (purchased) | Loads their saved map |
| `/map?sid=xxx` (not purchased) | Shows "Unlock Your Map" modal |

---

## 9. Admin Dashboard

**URL**: `/admin/dashboard` (password-protected)

### Dashboard Sections

#### Revenue Metrics
| Metric | Description |
|--------|-------------|
| Total Revenue | Sum of all purchases |
| Purchase Count | Number of completed payments |
| Conversion Rate | Leads → Purchases percentage |
| Average Order Value | Revenue / Purchases |

#### Funnel Analytics

```
Funnel Example:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quiz Started:    1,000 visitors (100%)
Q1 Answered:       850 visitors (85%)  ← 15% drop
Q2 Answered:       720 visitors (72%)  ← 13% drop
Email Screen:      600 visitors (60%)  ← 12% drop
Lead Captured:     180 visitors (18%)  ← 42% drop
Purchased:          36 visitors (3.6%) ← 80% drop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Lead Analytics

| Chart | Shows |
|-------|-------|
| Q1 Distribution | Pie chart of Q1 answers |
| Q2 Distribution | Bar chart of multi-select answers |
| Zodiac Signs | Sun sign distribution of leads |
| Age Groups | Age breakdown |
| Top Countries | Geographic distribution |

#### Email Marketing (MailerLite)

| Metric | Description |
|--------|-------------|
| Leads Group | Non-purchasers in nurture sequence |
| Customers Group | Purchasers in welcome automation |
| Open Rate | Average email open percentage |
| Click Rate | Average link click percentage |

#### Lead Database

- Searchable, filterable table
- Status badges (Paid/Lead)
- CSV export
- Click to view detailed modal with:
  - Birth data (date, time, zodiac, age)
  - Quiz answers
  - UTM attribution
  - Purchase status and amount
  - Timeline (capture date, purchase date)

**Auto-refresh**: Every 30 seconds

---

## 10. Tech Stack & Integrations

### Core Technologies

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | Next.js 15 + React 19 | Modern, fast, server-side rendering |
| **Styling** | Tailwind CSS 4 | Rapid development, mobile-first |
| **Animations** | Framer Motion 12 | Smooth transitions between screens |
| **Maps** | Mapbox GL v3 | Beautiful, interactive world maps |
| **Astronomy** | astronomia library | Accurate planetary calculations |
| **Database** | Supabase (PostgreSQL) | Easy setup, realtime capabilities |
| **Hosting** | Vercel | Auto-deploys from Git, fast CDN |
| **Payments** | Stripe | Embedded checkout, webhooks |

### Integrations

| Service | Purpose | How Used |
|---------|---------|----------|
| **Meta Pixel** | Ad tracking (client) | PageView, Lead events |
| **Meta CAPI** | Ad tracking (server) | Purchase events (bypasses ad blockers) |
| **MailerLite** | Email marketing | Lead nurture + customer automation |
| **Resend** | Transactional email | Purchase confirmation with map link |
| **Mapbox** | Maps | Interactive globe with planetary lines |

---

## 11. File Organization

```
/src
  /app                          ← Pages & API routes
    page.tsx                    ← Main quiz page (/)
    /map/page.tsx               ← Astrocartography map (/map)
    /reveal/page.tsx            ← Reveal flow (/reveal)
    /admin                      ← Admin pages
      page.tsx                  ← Login page
      /dashboard/page.tsx       ← Analytics dashboard
    /api                        ← Backend endpoints
      /lead/route.ts            ← Email/birth data capture
      /funnel-event/route.ts    ← Tracking API
      /astrocartography/route.ts← Map calculation API
      /stripe
        /create-checkout-session/route.ts
        /lookup-session/route.ts
        /webhook/route.ts       ← Payment handler
      /admin/...                ← Dashboard APIs

  /components
    /screens                    ← Quiz screens (Screen01 - Screen10)
    /reveal
      /screens                  ← Reveal screens (RevealScreen01 - 10)
      RevealShell.tsx           ← Reveal layout + navigation
      StripeCheckout.tsx        ← Embedded payment form
    /astro-map                  ← Map components
      AstroMap.tsx              ← Main map component
      BirthDataForm.tsx         ← Birth details form
      PowerPlacesPanel.tsx      ← City recommendations
      PowerMonthsPanel.tsx      ← Monthly timing
    QuizShell.tsx               ← Quiz layout + video backgrounds
    GoldButton.tsx              ← Reusable button
    GlassCard.tsx               ← Glassmorphism card

  /lib
    quiz-state.ts               ← Quiz state management
    reveal-state.ts             ← Reveal step tracking
    supabase-admin.ts           ← Server-side DB access
    stripe.ts                   ← Stripe client
    resend.ts                   ← Email sending
    mailerlite.ts               ← Email marketing
    meta-capi.ts                ← Server-side conversion tracking
    utm.ts                      ← UTM parameter parsing
    /astro                      ← Astrology calculations
      calculations.ts           ← Core planetary math
      power-places.ts           ← City matching & scoring
      power-months.ts           ← Monthly transit analysis
      report-derivations.ts     ← Yearly power score
      interpretations.ts        ← Text explanations
      timezone-utils.ts         ← Timezone validation
      cities.ts                 ← 100+ world cities
      types.ts                  ← TypeScript interfaces

  /content
    copy.ts                     ← LOCKED - All quiz text

/Docs                           ← Documentation
/public                         ← Static files (videos, images)
```

---

## 12. Database Schema

### `astro_leads` - Lead/Customer Data

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User's email (unique with session_id) |
| session_id | UUID | Unique session identifier |
| created_at | TIMESTAMP | When lead was captured |
| **Quiz Data** | | |
| quiz_q1 | TEXT | Q1 answer |
| quiz_q2 | JSON | Q2 answers (array) |
| **Birth Data** | | |
| birth_date | DATE | "1990-05-15" |
| birth_time | TIME | "14:30" (nullable) |
| birth_time_unknown | BOOLEAN | If user doesn't know time |
| birth_time_window | TEXT | "morning", "afternoon", etc. |
| birth_location_name | TEXT | "New York, NY, USA" |
| birth_location_lat | DECIMAL | Latitude |
| birth_location_lng | DECIMAL | Longitude |
| birth_location_timezone | TEXT | "America/New_York" |
| birth_datetime_utc | TIMESTAMP | Full UTC timestamp |
| **Status** | | |
| has_purchased | BOOLEAN | Default false |
| **Attribution** | | |
| utm_source | TEXT | "fb", "ig", or null (direct) |
| utm_medium | TEXT | "cpc", "paid", etc. |
| utm_campaign | TEXT | Campaign name |
| utm_content | TEXT | Ad creative |
| utm_term | TEXT | Keywords |

### `astro_purchases` - Payment Records

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | FK → astro_leads |
| email | TEXT | Customer email |
| stripe_payment_intent_id | TEXT | Stripe reference |
| amount_cents | INTEGER | 1900 for $19 |
| currency | TEXT | "usd" |
| status | TEXT | "pending", "completed", "expired" |
| product_type | TEXT | "2026_power_map" |
| created_at | TIMESTAMP | When checkout started |
| completed_at | TIMESTAMP | When payment completed |
| stripe_customer_id | TEXT | Stripe customer reference |

### `astro_funnel_events` - Funnel Tracking

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | FK → astro_leads |
| event_name | TEXT | "quiz_start", "q1_answered", etc. |
| step | INTEGER | Screen number (1-10) |
| created_at | TIMESTAMP | When event fired |

---

## 13. Environment Variables

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Server-only!

# Maps (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# Analytics (Meta)
NEXT_PUBLIC_META_PIXEL_ID=848967188002206
META_CONVERSIONS_API_TOKEN=...        # Server-side tracking

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # or pk_live_
STRIPE_SECRET_KEY=sk_test_...                    # or sk_live_
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...                 # Transactional email
MAILERLITE_API_KEY=...                # Marketing automation

# Admin
ADMIN_PASSWORD=your-secret-password
```

---

## 14. Important Rules & Guardrails

### DO NOT Change

| Rule | Reason |
|------|--------|
| **Copy in `copy.ts`** | Text is locked - matches approved marketing |
| **Video `scale(1.15)`** | Prevents edge gaps on different screens |
| **Mobile max-width 768px** | Design is mobile-first |

### Always Do

| Rule | Reason |
|------|--------|
| **Test on mobile viewport** | Primary users are from mobile ads |
| **Update CHANGELOG.md** | Track all changes |
| **Use preview deploys first** | Never deploy to prod without testing |

### Security

| Item | Status |
|------|--------|
| Email validation | Regex check |
| Honeypot field | Spam bot prevention |
| Admin password | Dashboard protected |
| Service role key | Server-side only |
| Stripe webhook | Signature verification |

### Pre-Launch Checklist

Before going live with payments:

- [ ] Change price from $0.70 to $19 in 3 places
- [ ] Switch Stripe keys from test to live
- [ ] Set up production webhook in Stripe Dashboard
- [ ] Add live keys to Vercel environment variables
- [ ] Test full flow with real payment

---

## Quick Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Check for code issues
```

---

## Visual Design Summary

```
┌─────────────────────────────────────┐
│         COSMIC DARK THEME          │
├─────────────────────────────────────┤
│  Background:  #050510 (dark navy)  │
│  Primary:     #FFFFFF (white text) │
│  Accent:      #C9A227 (gold)       │
│  Cards:       Glass blur effect    │
│  Glow:        Soft gold shadows    │
└─────────────────────────────────────┘
```

---

## Production URL

**Live Site**: https://astropowermaps.vercel.app

---

*Last updated: January 2026*
