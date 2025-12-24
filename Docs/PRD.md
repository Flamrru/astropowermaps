PRD — 2026 Power Map (Astro Quiz Funnel, Mobile-First)
0) Hard constraints

Copy is locked. Every headline/subhead/button label/option text must match the “2026 Power Map — Quiz Funnel Brief” exactly (verbatim, punctuation included). No rewrites, no “improvements”, no shortening.

V1 is test-only. No full user accounts, no birth details collection, no personalization engine.

No database required. We only need email capture (plus optionally passing quiz answers + UTM data to a webhook).

Look & feel must match the mockups you provided: dark cosmic/nebula background, gold accents, glassmorphism cards, pill CTAs, subtle glow.

1) Goal

Create a multi-screen quiz funnel optimized for Meta ads traffic (mobile-first), that:

builds intrigue and belief,

asks 2 questions,

shows interstitial proof/insight screens,

gates results behind email capture, and

confirms signup.

2) Success metrics (V1)

Landing → Email submit conversion rate

Step completion rate (Screen 1 → Screen 9)

Drop-off per screen

Lead quality proxy (deliverability, low fake emails)

3) Scope
In scope (V1)

10-screen quiz flow (exact copy below)

Screen transitions + loading animation screen (3 seconds auto-advance)

Email capture (webhook-based, no DB)

Basic validation + anti-spam (honeypot)

Meta Pixel + GA4 (optional but recommended for ads testing)

UTM capture and forwarding with the lead payload

Out of scope (V1)

Storing leads in an internal DB

Birth details capture

Personalized map generation

Payments/subscriptions

4) Tech recommendation (Claude Code build target)

Next.js (App Router) + TypeScript + Tailwind + Framer Motion

UI speed: easy full-screen mobile layouts + animations

Deploy: Vercel

Email capture: /api/lead route forwarding to a webhook (Zapier/Make/n8n/Mailchimp/ConvertKit) via LEAD_WEBHOOK_URL env var

No DB needed

You can switch providers without changing UI

5) Visual design spec (match mockups)
Overall aesthetic

Background: full-screen nebula/cosmic image with a dark overlay (top-to-bottom gradient), plus subtle gold “dust” accents.

Typography: large, bold, high-contrast headlines (white), smaller supporting text (soft white/gray).

Glassmorphism surfaces: option cards + credibility bar with blur, translucent background, soft border.

Gold CTAs: pill-shaped button with gold gradient + soft outer glow.

Motion: gentle fade/slide transitions; selected options glow gold.

Layout rules (mobile-first)

Max content width: ~360–420px on mobile, centered.

Safe-area padding for iOS notch: env(safe-area-inset-*).

CTA pinned near bottom with enough breathing room (like mockups).

Option cards stacked, large tap targets (min 48px height, ideally 56–64px).

Components (visual tokens)

Colors (approximate targets)

Background base: near-black navy

Primary text: #FFFFFF

Secondary text: white at ~70–80% opacity

Card bg: white at ~8–12% opacity + blur

Card border: white at ~10–15% opacity

Gold accent: warm gold gradient (two-stop: darker gold → lighter gold)

Glow: gold at low opacity

Radii

Buttons: fully pill (9999px)

Cards: ~14–18px

Shadows / glow

CTA: subtle outer glow (gold) + faint inner highlight

Selected option: gold stroke + glow halo

Navigation / progress (like mockups)

On screens after entry: top bar with back arrow (left), title centered: “2026 Power Map”

Progress indicator: thin gold line under the header (advance with steps)

6) Asset guidance (graphics + loading)
Background + “gold dust”

Fastest high-quality approach:

Generate 1 nebula background (webp) + 1 gold particle overlay (webp/png with transparency).

Combine via CSS layers:

background-image: linear-gradient(...), url(nebula.webp), url(gold-dust.webp);

Loading animation (Screen 8)

Options (pick one):

Lottie (recommended): spinning constellation / globe / orbit lines

Use lottie-react and a single JSON file.

Pure CSS: animated progress bar + subtle shimmer (no external asset).

7) Copy source of truth (LOCKED, verbatim)

Implement as a single file content/copy.ts (or JSON) and render from it. No inline strings in components.

SCREEN 1 — Entry

Headline: There are 3 months and 3 places that will define your 2026.
Subhead: Based on your birth chart, there's a map for your year. Most people never see it.
Credibility bar: As seen in: [Cosmopolitan] [Well+Good] [mindbodygreen] [Refinery29]
Button: See My Map →

SCREEN 2 — Insight (no interaction)

Text:
You're going to travel somewhere in 2026. A trip, a vacation, maybe a few.
But where you go matters more than you think. Not just for the photos — for what happens after.
Button: Next →

SCREEN 3 — Question

Question: Have you ever visited a place that just felt... right?
Supporting text:
A city where ideas started flowing. A trip where you came back different.
Options:

Yes, definitely

Maybe once or twice

Not sure

SCREEN 4 — Social Proof Interstitial (no interaction)

Stat (large): 73% of people say the same thing.
Text:
That wasn't random.
Based on your birth chart, there are specific locations on Earth where your energy amplifies. Where clarity comes easier. Where the right people and opportunities appear.
You don't need to move there. You just need to visit — at the right time.
Button: Next →

SCREEN 5 — Question

Question: What do you want 2026 to be about?
Options:

Career / business growth

Creativity / new ideas

Love / relationships

Clarity / finding direction

Adventure / feeling alive

SCREEN 6 — Insight (no interaction)

Text:
Timing matters as much as location.
You have 3 months in 2026 where everything you start gains traction. Push during those windows, and momentum builds.
Push outside them? It feels like dragging a boulder uphill.
Button: Next →

SCREEN 7 — Testimonial (no interaction)

Quote:
"I booked a trip to Lisbon during my power month. Within 2 weeks of being there, I met my now-business partner and closed my first 5-figure client."
Attribution: — Sarah M., London
Button: Next →

SCREEN 8 — Loading/Processing Screen

Animation: Progress bar or spinning globe/constellation animation
Text sequence (rotate every 1 second):

"Checking if your map is ready..."

"Scanning 2026 windows..."

"Almost there..."
Behavior: Auto-advances to Screen 9 after 3 seconds

SCREEN 9 — Results Gate + Email Capture

Headline: Your map exists. You just haven't seen it yet.
Subhead:
In 48 hours, the 2026 Power Map goes live. Enter your birth details, and you'll get:
→ Your 3 power months — when to launch, take risks, make moves → Your 3 power destinations — where to travel for breakthroughs → Your rest windows — when to recharge instead of force
Social proof: 12,847 people already on the waitlist
Input placeholder: "Enter your email"
Button: Get Early Access

SCREEN 10 — Confirmation

Headline: You're on the list.
Text: We'll email you the moment it's live. You'll enter your birth details then and get your personalized map.
Optional: Social share buttons or "Share with a friend" link

8) Interaction + state machine
State to store (in-memory; optionally mirrored to localStorage)

stepIndex (1–10)

answer_q1 (Screen 3)

answer_q2 (Screen 5)

email

utm object: utm_source, utm_campaign, utm_adset, utm_content, utm_term (capture if present)

session_id (random UUID on first load)

Navigation rules

Next buttons advance by 1 screen.

Back arrow (top-left) goes to previous screen (except Screen 1, hidden).

Screen 8 auto-advances after 3 seconds (no back while processing).

Disable “Next” on question screens until an option is selected.

On Screen 9, disable submit while posting.

Validation

Email: basic format validation.

Honeypot hidden field must remain empty.

If webhook fails: show a small inline error + allow retry (do not lose entered email).

9) Email capture (no DB)
Default implementation (recommended)

POST to /api/lead → server forwards to LEAD_WEBHOOK_URL.

Payload example

{
  "email": "user@example.com",
  "quiz": {
    "q1": "Yes, definitely",
    "q2": "Creativity / new ideas"
  },
  "utm": { "utm_source": "...", "utm_campaign": "..." },
  "session_id": "uuid",
  "timestamp": "ISO-8601"
}

Where the webhook can go

Zapier / Make / n8n → Mailchimp/ConvertKit/Google Sheets/Airtable

Direct ESP API (Mailchimp/ConvertKit) later, without changing UI

10) Analytics (recommended for paid traffic)
Meta Pixel events

PageView on load

ViewContent on Screen 1

Custom: QuizStepView (step number)

Lead on successful email submit (Screen 9 → 10)

GA4

page_view

quiz_step_view

quiz_complete (on Screen 10)

11) File structure (guidance for Claude Code)

app/(quiz)/page.tsx (host)

components/QuizShell.tsx (layout + background)

components/ProgressHeader.tsx (back + title + progress)

components/GlassCard.tsx, components/GoldButton.tsx, components/OptionCard.tsx

components/screens/Screen01Entry.tsx … Screen10Confirmation.tsx

content/copy.ts (locked strings)

app/api/lead/route.ts (webhook forwarder)

lib/analytics.ts (pixel/ga wrappers)

lib/utm.ts (parse + persist)

Copy lock requirement: screens must render only from content/copy.ts.

12) Acceptance criteria checklist

 All 10 screens match the provided copy exactly

 Mobile UI visually matches mockups: nebula bg, glass cards, gold glow CTAs, header/progress

 Smooth transitions; no layout jumps

 Screen 8 rotates the 3 lines and auto-advances after 3 seconds

 Email submit posts to webhook and lands on confirmation screen

 UTM + answers included in lead payload

 Meta Pixel Lead fires only on successful submit

 Works on iOS Safari + Android Chrome