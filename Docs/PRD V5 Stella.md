AstroPowerMaps – Stella+ Subscription Spec (Decision Document)

Date: 2026-01-02
Status: Agreed decisions + implementation spec (ready for coding AI)

1) Context
Current product (baseline)

AstroPowerMaps is a mobile-first astrology webapp that sells a $19 one-time “2026 Power Map” and delivers permanent access via an emailed link that loads the map using sid=<session_id> (no traditional account required today). 

APP-OVERVIEW

 

APP-OVERVIEW

Current flow (baseline)

Quiz (/) → Email capture + birth data (Screen 9) → Reveal flow (/reveal) → Paywall (Step 9) → Stripe embedded checkout → Webhook updates DB + sends email → Redirect to /map?sid=<session_id>. 

APP-OVERVIEW

 

APP-OVERVIEW

 

APP-OVERVIEW

Important guardrail: quiz copy in content/copy.ts is locked and must not be changed. 

APP-OVERVIEW

2) Decision: Introduce subscription (Stella+)
Target pricing

Stella+ subscription: ~$6.99–$7.99/month (exact price configurable in Stripe)

Keep $19 one-time purchase available (no forced subscription)

Baseline one-time pricing + payment flow already exists. 

APP-OVERVIEW

3) Decision: Feature bundle for Stella+

Stella+ includes the following subscriber-only features:

Stella Chat (Personal Guide)

A guided chat experience that answers questions using the user’s chart outputs (map/lines + power months + interpretations).

Stores chat history per user.

Weekly Forecast

A weekly summary: theme, top power days, caution/rest emphasis, suggested actions.

Daily Power Score

Daily score (0–100 or similar) + a short “today is for X / avoid Y” message.

Calendar Feed (ICS)

Private calendar feed that includes:

Power Days

Rest Windows

Key cosmic events (as defined in product scope below)

Best Day Picker (by goal)

User chooses a goal category (e.g., love/career/creativity/clarity/adventure) and gets best days in next 14/30 days.

Stella Rituals + Journaling

Ritual/prompts tied to the weekly/daily forecast.

Journal entries stored per user.

Non-goal (explicit): no location tracking / “radar” features; no background geo features.

4) Decision: Accounts are required (but introduced softly)
Why accounts are needed

Subscription + journal + calendar feed require persistent identity beyond a single SID link.

Account approach

Implement real user accounts in the webapp.

Recommended UX: passwordless email login (magic link or OTP) to minimize friction (still counts as an “account” from the user perspective).

Where to introduce accounts in the flow (agreed)

We will introduce accounts at a place that feels natural, without hurting quiz conversion:

A) “Soft account creation” at Email Capture (Quiz Screen 9)

Screen 9 already captures email + birth data (conversion point). 

APP-OVERVIEW

On submit (POST /api/lead), create/associate a user record behind the scenes.

B) “Activate your account” after payment (Reveal Step 10)

Step 10 is the moment of high intent (they just paid). 

APP-OVERVIEW

Show a small panel: “Secure access to your dashboard” → send login code/link.

C) Keep legacy /map?sid=... working

Do not break existing permanent-access links. Current access control behavior must remain. 

APP-OVERVIEW

Add a clear upgrade path inside /map for Stella+.

5) Product surface & routes
Existing routes (unchanged)

/ quiz funnel

/reveal reveal/paywall

/map map experience

/admin/dashboard analytics 

APP-OVERVIEW

New/expanded subscriber surfaces

/dashboard (new): main Stella+ hub (weekly, daily, rituals, journal)

/stella (optional): focused chat route (or embed in /dashboard)

/best-day (optional): dedicated tool page (or embed in /dashboard)

/calendar (settings page): shows “Copy calendar feed link”, regenerate token

GET /api/calendar/:token.ics (new): ICS feed endpoint

6) Paywall changes (Step 9)
Current paywall

Designed to convert $19 one-time with Stripe embedded checkout. 

APP-OVERVIEW

New paywall requirement

Add a second option: Stella+ subscription.

Must be implemented without changing locked quiz copy in copy.ts. 

APP-OVERVIEW

Allowed: add new UI blocks/components with new copy outside locked content.

Stripe

Add a new subscription product in Stripe.

Keep one-time purchase product intact.

7) Data model updates (Supabase/Postgres)

Current tables: astro_leads, astro_purchases, astro_funnel_events. 

APP-OVERVIEW

New tables / fields (spec)

users

id (uuid, pk)

email (unique)

created_at

optional: default_profile_id

user_profiles (supports future multi-profile without rework)

id (uuid, pk)

user_id (fk)

birth data fields (same shape as astro_leads birth fields) 

APP-OVERVIEW

label (e.g., “Me”)

subscriptions

id (uuid, pk)

user_id (fk)

stripe_customer_id

stripe_subscription_id

status (active, past_due, canceled, etc.)

current_period_end

forecasts_weekly

id, user_id, week_start_date

content_json (theme, power days, rest emphasis, etc.)

generated_at

scores_daily

id, user_id, date

score (int)

summary_text

generated_at

journal_entries

id, user_id, created_at

prompt_id (nullable)

entry_text

ritual_prompts

id, type (daily/weekly)

content, goal_category (nullable)

calendar_tokens

id, user_id

token (unique, long random)

is_active

rotated_at

Linking current tables (minimal disruption)

Add user_id column to:

astro_leads

astro_purchases 

APP-OVERVIEW

8) Gating rules
One-time buyers

/map?sid=xxx continues to work as permanent access if purchase is completed. 

APP-OVERVIEW

They do not get Stella+ features unless subscribed.

Subscribers (Stella+)

Access to /dashboard and all subscriber features requires:

logged in user AND

subscriptions.status = active (or equivalent)

Mixed access (recommended UX)

A user can be both:

a one-time buyer (map access) and

a subscriber (Stella+ dashboard + tools)

9) API endpoints (high-level)

Existing API routes include /api/lead, /api/stripe/webhook, etc. 

APP-OVERVIEW

New endpoints

Auth

POST /api/auth/request-code (or magic link)

POST /api/auth/verify-code

Subscription

POST /api/stripe/create-subscription-session

POST /api/stripe/customer-portal

Webhook: extend existing /api/stripe/webhook to handle subscription events. 

APP-OVERVIEW

Forecast & Score

GET /api/forecast/weekly?week=YYYY-MM-DD

GET /api/score/daily?date=YYYY-MM-DD

Stella Chat

POST /api/stella/chat (stores messages; returns response)

Best Day Picker

GET /api/best-day?goal=love&range=30

Calendar

GET /api/calendar/:token.ics

POST /api/calendar/rotate-token

10) “Key cosmic events” scope (for calendar feed)

Calendar feed must include:

Power Days and Rest Windows derived from your existing timing logic (power months / rest windows). 

APP-OVERVIEW

A curated set of “key events” (define as a short list to avoid complexity), e.g.:

New Moon / Full Moon days

Mercury retrograde windows
(Exact event list is configurable; keep MVP minimal.)

11) Analytics & tracking additions

Current funnel events exist (quiz screens + purchase). 

APP-OVERVIEW

Add new events:

subscription_checkout_opened

subscription_started

subscription_canceled

dashboard_viewed

stella_message_sent

weekly_forecast_viewed

daily_score_viewed

best_day_picker_used

calendar_feed_copied

journal_entry_created

12) Rollout plan
Phase 1 (MVP subscription)

Add accounts (passwordless)

Add Stripe subscription product + webhook handling

Add /dashboard with:

weekly forecast

daily score

rituals + journal

Stella chat (basic)

Add calendar feed (ICS) minimal set

Phase 2 (Retention & polish)

Best Day Picker UI improvements

Better caching + pre-generation of forecasts/scores

“Claim your account” flow from legacy SID links

Explicitly out of scope for now

Location tracking / radar

Additional astrology systems (Chinese horoscope, numerology) as a core paid pillar