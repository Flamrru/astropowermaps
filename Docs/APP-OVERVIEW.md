# AstroPowerMaps - Complete App Reference

> **What is this app?** A mobile-first astrology quiz funnel that captures email leads from Meta ads, then shows users a personalized "astrocartography" map revealing their most powerful places and times in 2026.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [The Quiz Funnel (10 Screens)](#2-the-quiz-funnel-10-screens)
3. [The Astrocartography Map](#3-the-astrocartography-map)
4. [How Data Flows](#4-how-data-flows)
5. [Admin Dashboard](#5-admin-dashboard)
6. [Tech Stack](#6-tech-stack)
7. [File Organization](#7-file-organization)
8. [Environment Variables](#8-environment-variables)
9. [Important Rules & Guardrails](#9-important-rules--guardrails)

---

## 1. The Big Picture

### What Problem Does This Solve?

People are curious about astrology but don't know where to travel or when to make important decisions. This app promises to reveal:
- **3 Power Months** in 2026 when cosmic energies favor them
- **3 Power Places** around the world where they'll thrive

### The User Journey

```
📱 User sees Meta ad → Clicks to landing page
    ↓
🔮 Takes engaging 10-screen quiz (builds curiosity)
    ↓
📧 Enters email to "unlock" their personalized results
    ↓
🗺️ Sees interactive map with their power places
    ↓
💰 (Future) Offered premium features or detailed report
```

### Why This Works (Marketing Psychology)

| Element | Purpose |
|---------|---------|
| **"3 months & 3 places"** | Specific promise creates curiosity |
| **Quiz format** | Interactive = higher engagement than static page |
| **Progress through screens** | Sunk cost fallacy keeps users moving forward |
| **Email gate** | Value exchange - results for contact info |
| **Personalized map** | Delivers on promise, builds trust |

---

## 2. The Quiz Funnel (10 Screens)

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
| 9 | **Email Capture** | "Get your personalized map" | THE CONVERSION POINT |
| 10 | **Confirmation** | "You're on the list" | Thank you + next steps |

### Question 1 Options
- ✓ "Yes, definitely"
- ✓ "Maybe once or twice"
- ✓ "Not sure"

### Question 2 Options (Multi-select)
- Career momentum
- Creativity / new ideas
- Love and connection
- Inner clarity
- Adventure

### Visual Design

- **Background Videos**: Different cosmic videos for different screens
- **Colors**: Dark navy (#050510) + Gold accents (#C9A227)
- **Style**: Glassmorphism cards with blur effects
- **Mobile-first**: Max-width 768px container

---

## 3. The Astrocartography Map

After email capture, users can see their personalized world map showing where planetary energies are strongest for them.

### What is Astrocartography?

```
Astrocartography = Where you were born + Where planets were at that moment
                   ↓
                   Creates invisible "power lines" around Earth
                   ↓
                   Living/visiting near these lines amplifies their energy
```

### The 4 Line Types

| Line | Name | What It Means |
|------|------|---------------|
| **MC** | Midheaven | Career, public recognition, success |
| **IC** | Imum Coeli | Home, family, roots, inner peace |
| **AC** | Ascendant | New beginnings, how others see you |
| **DC** | Descendant | Relationships, partnerships, love |

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

### Power Places Feature

The app calculates the **best cities** for each life category:

| Category | Key Planets | What User Gets |
|----------|-------------|----------------|
| **Love** | Venus, Moon | Cities near Venus/Moon lines for romance |
| **Career** | Sun, Jupiter, Saturn | Cities near MC lines for success |
| **Growth** | Jupiter | Cities near Jupiter lines for expansion |
| **Home** | Moon | Cities near IC lines for peace |

### How the Calculation Works

```
User enters birth details:
  - Date (YYYY-MM-DD)
  - Time (HH:MM) or "Unknown"
  - Location (city search → coordinates)
       ↓
Backend calculates:
  1. Convert birth moment to Julian Day number
  2. Use VSOP87 theory to get planet positions
  3. Calculate 40 lines (10 planets × 4 line types)
  4. Check 100+ world cities against these lines
  5. Rank cities by proximity to beneficial lines
       ↓
Returns: Personalized map + Power Places list
```

---

## 4. How Data Flows

### Lead Capture Flow

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
│  3. User enters email on Screen 9                           │
│     → Honeypot field checked (spam prevention)              │
│     → Email validated (regex)                               │
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
│       email: "user@example.com",                            │
│       quiz: { q1: "Yes", q2: ["Career", "Love"] },          │
│       utm: { utm_source: "fb", utm_campaign: "..." },       │
│       session_id: "uuid-here"                               │
│     }                                                       │
│                                                             │
│  6. Insert into Supabase `astro_leads` table               │
│                                                             │
│  7. Return success → User sees Screen 10                    │
└─────────────────────────────────────────────────────────────┘
```

### Funnel Tracking Flow

Every screen transition is tracked:

```
Screen 2 → Event: "quiz_start"
Screen 4 → Event: "q1_answered"
Screen 6 → Event: "q2_answered"
Screen 9 → Event: "email_screen"
Screen 10 → Lead captured (in astro_leads table)
```

This lets you see **where users drop off** in the funnel.

### Meta Pixel Events

| Event | When Fired | Purpose |
|-------|------------|---------|
| `PageView` | Page load | Track visitors |
| `ViewContent` | Screen 1 | Track ad landing |
| `Lead` | Email submitted | Track conversions |

---

## 5. Admin Dashboard

**URL**: `/admin/dashboard` (password-protected)

### Features

| Feature | Description |
|---------|-------------|
| **Stats Cards** | Total leads, Today's leads, Lead sources, This week |
| **Leads Table** | Searchable, sortable, exportable to CSV |
| **Funnel Chart** | Shows conversion % at each step |
| **Q1 Chart** | Distribution of Q1 answers |
| **Q2 Chart** | Distribution of Q2 answers |
| **Auto-refresh** | Updates every 30 seconds |

### What You Can See

```
Funnel Example:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quiz Started:    1,000 visitors (100%)
Q1 Answered:       850 visitors (85%)
Q2 Answered:       720 visitors (72%)
Email Screen:      600 visitors (60%)
Lead Captured:     180 visitors (18%)  ← Your conversion rate!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 6. Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | Next.js 15 + React 19 | Modern, fast, server-side rendering |
| **Styling** | Tailwind CSS 4 | Rapid development, mobile-first |
| **Animations** | Framer Motion 12 | Smooth transitions between screens |
| **Maps** | Mapbox GL v3 | Beautiful, interactive world maps |
| **Astronomy** | astronomia library | Accurate planetary calculations |
| **Database** | Supabase (PostgreSQL) | Easy setup, realtime capabilities |
| **Hosting** | Vercel | Auto-deploys from Git, fast CDN |
| **Analytics** | Meta Pixel | Track ad conversions |

---

## 7. File Organization

```
/src
  /app                          ← Pages & API routes
    page.tsx                    ← Main quiz page (/)
    /map/page.tsx               ← Astrocartography map (/map)
    /admin                      ← Admin pages
      page.tsx                  ← Login page
      /dashboard/page.tsx       ← Analytics dashboard
    /api                        ← Backend endpoints
      /lead/route.ts            ← Email capture API
      /funnel-event/route.ts    ← Tracking API
      /astrocartography/route.ts← Map calculation API
      /admin/...                ← Dashboard APIs

  /components
    /screens                    ← Quiz screens (Screen01 - Screen10)
    /astro-map                  ← Map components
      AstroMap.tsx              ← Main map
      BirthDataForm.tsx         ← Birth details form
      PowerPlacesPanel.tsx      ← City recommendations
    QuizShell.tsx               ← Quiz layout + video backgrounds
    GoldButton.tsx              ← Reusable button
    GlassCard.tsx               ← Glassmorphism card

  /lib
    quiz-state.ts               ← Quiz state management
    /astro                      ← Astrology calculations
      calculations.ts           ← Core planetary math
      power-places.ts           ← City matching
      cities.ts                 ← 100+ world cities

  /content
    copy.ts                     ← 🔒 LOCKED - All quiz text

/docs                           ← Documentation
/public                         ← Static files (videos, images)
```

---

## 8. Environment Variables

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Server-only!

# Maps (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# Analytics (Meta)
NEXT_PUBLIC_META_PIXEL_ID=848967188002206

# Admin
ADMIN_PASSWORD=your-secret-password

# Optional
LEAD_WEBHOOK_URL=https://hooks.zapier.com/...
```

---

## 9. Important Rules & Guardrails

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
| **Check honeypot** | Spam prevention |

### Security

| Item | Status |
|------|--------|
| Email validation | ✅ Regex check |
| Honeypot field | ✅ Spam bot prevention |
| Admin password | ✅ Dashboard protected |
| Service role key | ✅ Server-side only |

---

## Quick Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Check for code issues
```

---

## Database Tables

### `astro_leads` - Captured Emails

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | varchar | User's email |
| quiz_q1 | varchar | Answer to Q1 |
| quiz_q2 | JSON | Answers to Q2 (array) |
| utm_source | varchar | Traffic source (fb, ig, null) |
| utm_campaign | varchar | Ad campaign name |
| session_id | UUID | User's session |
| created_at | timestamp | When captured |

### `astro_funnel_events` - Tracking

| Column | Type | Description |
|--------|------|-------------|
| session_id | UUID | Links to user |
| event_name | varchar | quiz_start, q1_answered, etc. |
| step_number | int | Which screen (1-10) |
| created_at | timestamp | When event fired |

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

*Last updated: December 2024*
