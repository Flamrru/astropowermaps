# AstroPowerMaps - Complete App Documentation

> **For Copywriter Reference**
> Last Updated: December 31, 2025
> This document contains ALL copy, timings, CTAs, and screen details for the entire app.

---

## Table of Contents

1. [App Overview](#app-overview)
2. [User Journey Flow](#user-journey-flow)
3. [Part 1: Quiz Funnel (10 Screens)](#part-1-quiz-funnel-10-screens)
4. [Part 2: Reveal Flow (12 Steps)](#part-2-reveal-flow-12-steps)
5. [Part 3: Map Interface](#part-3-map-interface)
6. [Loading Screens Summary](#loading-screens-summary)
7. [Personalization Points](#personalization-points)
8. [Copy Style Guide](#copy-style-guide)

---

## App Overview

**AstroPowerMaps** is a mobile-first astrology web app that helps users discover their "power places" (best cities to visit) and "power months" (best times to take action) based on their birth chart.

### Three Main Flows

| Flow | Route | Screens | Purpose |
|------|-------|---------|---------|
| **Quiz Funnel** | `/` | 10 screens | Lead capture + email collection |
| **Reveal Flow** | `/reveal` | 12 steps | Birth data → Map reveal → Onboarding → Paywall |
| **Map Interface** | `/map` | 1 page | Full interactive astrocartography map |

### Total Screens: 22 unique screens + map interface

---

## User Journey Flow

```
QUIZ FUNNEL (/)
┌─────────────────────────────────────────────────────────────────────┐
│ Screen 1  →  Screen 2  →  Screen 3  →  Screen 4  →  Screen 5       │
│ (Entry)      (Insight)    (Q1)         (Proof)      (Q2)           │
│                                                                     │
│ Screen 6  →  Screen 7  →  Screen 8  →  Screen 9  →  Screen 10      │
│ (Insight)    (Testimonial) (Loading)   (Email)      (Confirmation) │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        Click "See My Birth Chart"
                                    │
                                    ▼
REVEAL FLOW (/reveal)
┌─────────────────────────────────────────────────────────────────────┐
│ Step 1   →  Step 2      →  Step 3     →  Steps 4-9                 │
│ (Form)      (Generate)     (Map Reveal)  (Onboarding x6)           │
│                                                                     │
│ Step 10     →  Step 11   →  Step 12                                │
│ (Generate 2)   (Paywall)    (Success)                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            After payment
                                    │
                                    ▼
MAP INTERFACE (/map)
┌─────────────────────────────────────────────────────────────────────┐
│ Interactive Map + Power Places Panel + Power Months Panel          │
│ + Category Filters + Planetary Line Controls                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

# Part 1: Quiz Funnel (10 Screens)

> **Route:** `/` (root page)
> **Files:** `/src/components/screens/Screen01Entry.tsx` through `Screen10Confirmation.tsx`
> **Copy Source:** `/src/content/copy.ts` (LOCKED - do not modify)

---

## Screen 1: Entry

**Purpose:** Hook the user and get them to start the quiz
**Background:** Video (`/question-bg.mp4`) with scale(1.15), fallback poster image
**Duration:** Manual (user clicks CTA)

### Visual Elements
- Crescent moon icon (gold) at top
- Title badge: "2026 Power Map"
- Main headline with gold-highlighted words
- Subheadline with italic emphasis
- Credibility bar (publication logos)
- Glowing CTA button with pulse animation

### Copy (EXACT)

**Header Badge:**
```
[Moon Icon] 2026 Power Map
```
*(uppercase, letter-spaced)*

**Headline:**
```
There are 3 months and 3 places that will define your 2026.
```
- "3 months" = gold/bold
- "3 places" = gold/bold
- "2026" = gold/bold

**Subheadline:**
```
Based on your birth chart, there's a map for your year. Most people never see it.
```
- "Most people never see it." = gold/italic

**Credibility Bar:**
```
As featured in:
- The New York Times (serif, italic)
- WIRED (blocky uppercase)
- Forbes (serif, bold)
- healthline (sans-serif)
- girlboss (sans-serif, bold, lowercase)
```

**CTA Button:**
```
See My Map →
```
*(Gold gradient, animated glow/pulse)*

### Interaction
- Click button → 400ms visual feedback delay → advances to Screen 2
- No back button (this is the start)

---

## Screen 2: Insight Interstitial

**Purpose:** Build intrigue about location-based experiences
**Background:** Video (`/globe-bg.mp4`) rotating globe
**Duration:** Manual (user clicks "Next")

### Copy (EXACT)

**Paragraph 1 (Large headline style):**
```
You're going to travel somewhere in 2026. A trip, a vacation, maybe a few.
```
- "2026" = gold

**Paragraph 2 (Body text):**
```
But where you go matters more than you think. Not just for the photos — for what happens after.
```
- "more than you think" = bold white
- "for what happens after." = italic

**Button:**
```
Next →
```

### Funnel Event
`quiz_start` fires when entering this screen

---

## Screen 3: Question 1 (Single-Select)

**Purpose:** First engagement question about location experiences
**Background:** Two videos crossfading (`/orb-question-bg.mp4`)
**Duration:** Auto-advances 400ms after selection

### Copy (EXACT)

**Question:**
```
Have you ever visited a place that just felt... right?
```
- "right" = gold/bold

**Supporting Text:**
```
A city where ideas started flowing. A trip where you came back different.
```

**Options (3 cards):**
```
1. "Yes, definitely"
2. "Maybe once or twice"
3. "Not sure"
```

### Interaction
- Click option → shows gold selection highlight
- 400ms delay → auto-advances to Screen 4
- NO "Next" button on this screen

### Data Captured
`answer_q1` = selected option text (string)

### Funnel Event
`q1_answered` fires when advancing to Screen 4

---

## Screen 4: Social Proof

**Purpose:** Validate the "feeling different in certain places" with statistics
**Background:** Video (`/nebula-bg.mp4`)
**Duration:** Manual (user clicks "Next")

### Visual Elements
- Large "87%" statistic in gold
- World map with 6 floating location pins (profile pictures)
- Pin locations: USA West (CA), USA East (NY), Europe, Africa, Asia (India), Australia
- Pins have golden glow and float animation

### Copy (EXACT)

**Stat Block:**
```
87%
of people feel the difference
```
- "87%" = 56-64px gold
- "of people feel the difference" = 20-24px white

**Paragraph 1:**
```
That isn't random.
```
*(Bold white)*

**Paragraph 2:**
```
Based on your birth chart, there are specific locations on Earth where your energy amplifies. Where clarity comes easier. Where the right people and opportunities appear.
```
- "specific locations" = bold white
- "appear" = bold white

**Paragraph 3:**
```
You don't need to move there. You just need to visit — at the right time.
```
*(Muted/italic)*

**Button:**
```
Next →
```

---

## Screen 5: Question 2 (Multi-Select)

**Purpose:** Capture user goals for personalization later
**Background:** Nebula video (same as Screen 4)
**Duration:** Manual (user selects 1+ options, then clicks "Next")

### Copy (EXACT)

**Question:**
```
What do you want 2026 to be about?
```
- "2026" = gold

**Helper Text:**
```
Select all that apply
```
*(13px, muted)*

**Options (5 cards with icons):**
```
1. [Briefcase Icon] "Career / business growth"
2. [Lightbulb Icon] "Creativity / new ideas"
3. [Heart Icon] "Love / relationships"
4. [Compass Icon] "Clarity / finding direction"
5. [Mountain Icon] "Adventure / feeling alive"
```

**Button:**
```
Next →
```
*(Disabled/grayed until 1+ option selected)*

### Data Captured
`answer_q2` = array of selected option texts

### Funnel Event
`q2_answered` fires when advancing to Screen 6

---

## Screen 6: Insight Interstitial

**Purpose:** Introduce the timing concept (not just location)
**Background:** Nebula video
**Duration:** Manual (user clicks "Next")

### Copy (EXACT)

**Headline:**
```
Timing matters as much as location.
```
*(Bold white, 24-28px)*

**Body:**
```
You have 3 months in 2026 where everything you start gains traction. Push during those windows, and momentum builds.
```
- "3 months" = gold
- "momentum builds" = bold white

**Last Line:**
```
Push outside them? It feels like dragging a boulder uphill.
```
*(Muted/italic)*

**Button:**
```
Next →
```

---

## Screen 7: Testimonial

**Purpose:** Social proof via personal story
**Background:** Nebula video
**Duration:** Manual (user clicks "Next")

### Visual Elements
- Circular face image (Sarah M.) with gold ring border
- Outer glow rings and halo effect
- 6 decorative stars with staggered animations
- Dark glass quote card with quotation marks

### Copy (EXACT)

**Quote:**
```
"I booked a trip to Lisbon during my power month. Within 2 weeks of being there, I met my now-business partner and closed my first 5-figure client."
```
- "Lisbon" = bold
- "2 weeks" = gold/bold
- "5-figure client" = bold

**Attribution:**
```
— Sarah M., London
```
*(14px, white/60%, with horizontal line dividers on both sides)*

**Button:**
```
Next →
```

---

## Screen 8: Loading/Processing

**Purpose:** Build anticipation while "calculating"
**Background:** Nebula video
**Duration:** 5 SECONDS (auto-advances, no user interaction)

### Visual Elements
- Cosmic orbital animation: 3 rotating rings (speeds: 15s, 10s, 6s)
- 3 orbiting particles (speeds: 4s, 6s, 8s)
- Pulsing gold core at center
- Decorative twinkling stars
- Progress bar at bottom (0% → 100% over 5 seconds)
- Percentage counter

### Copy (EXACT)

**Rotating Text (cycles every 1 second):**
```
1. "Checking if your map is ready..."
2. "Scanning 2026 windows..."
3. "Almost there..."
```

**Progress Bar:**
- Gold gradient fill
- Percentage text: "0%" → "100%"

### Timing
- Text rotates every 1000ms
- Progress fills over 5000ms
- Auto-advances after 5000ms

### Funnel Event
`email_screen` fires when advancing to Screen 9

---

## Screen 9: Email Capture

**Purpose:** Capture email address (main conversion)
**Background:** Nebula video
**Duration:** Manual (user enters email and clicks CTA)

### Visual Elements
- 6 floating celebration stars with animations
- Badge at top
- Benefits list with icons (Calendar, MapPin, Moon)
- Animated waitlist counter (starts at 12,847, increments randomly every 3-15 seconds)
- 3 overlapping profile avatar circles
- Email input with gold glow on focus
- Hidden honeypot field for spam prevention

### Copy (EXACT)

**Badge:**
```
✨ You're almost there
```
*(12px, gold, uppercase)*

**Headline:**
```
Your map exists. See it first.
```
- "See it first." = gold/bold

**Subhead:**
```
The 2026 Power Map launches in 48 hours.
Enter your email to unlock:
```
- "48 hours" = gold/semibold

**Benefits Card (with icons):**
```
[Calendar Icon] 3 power months — when to launch, take risks, make moves
[MapPin Icon]   3 power destinations — where to travel for breakthroughs
[Moon Icon]     Rest windows — when to recharge instead of force
```

**Social Proof:**
```
12,847 people on the waitlist
```
- Number = animated counter, gold/semibold
- Shows 3 profile avatar circles

**Input Placeholder:**
```
Enter your email
```

**CTA Button:**
```
Get Early Access
```
*(Disabled until email entered)*

**Privacy Note:**
```
No spam. Unsubscribe anytime.
```
*(11px, white/30%)*

### Validation Errors
```
"Please enter your email"
"Please enter a valid email"
```

### Data Captured
- `email`: User's email address
- Submitted to `/api/lead` endpoint with quiz answers, UTM params, session ID

---

## Screen 10: Confirmation

**Purpose:** Celebrate signup and direct to reveal flow
**Background:** Nebula video
**Duration:** Manual (user can click either CTA)

### Visual Elements
- Star burst animation (12 stars radiating from center)
- 20 floating particles with upward drift
- Gold checkmark icon in glowing circle
- 2 outer glow rings
- "What happens next" card with 2 steps
- Bottom decorative divider (line—dot—line)

### Copy (EXACT)

**Headline:**
```
You're In.
```
- "In" = gold (34-40px, bold)

**Confirmation Text:**
```
Your spot on the waitlist is confirmed
```
*(15px, white/60%)*

**Card Header:**
```
✨ What happens next
```
*(13px, gold, uppercase)*

**Step 1:**
```
[Mail Icon] Check your inbox
We'll email you the moment 2026 Power Map goes live
```

**Step 2:**
```
[Sparkles Icon] Enter your birth details
Date, time, and place of birth for your personalized map
```

**Primary CTA Button:**
```
[Map Icon] See My Birth Chart [Arrow Icon]
```
*(Navigates to `/reveal?sid={session_id}`)*

**Secondary CTA Text:**
```
Know someone who needs their map?
```
*(13px, white/40%)*

**Secondary Button:**
```
[Share Icon] Share with a friend
```
*(Uses Web Share API or clipboard fallback)*

---

# Part 2: Reveal Flow (12 Steps)

> **Route:** `/reveal`
> **Files:** `/src/components/reveal/RevealScreen01BirthData.tsx` through `RevealScreen12Confirmation.tsx`

---

## Step 1: Birth Data Entry

**Purpose:** Collect birth details for astrocartography calculation
**Background:** None (map page shell)
**Duration:** Manual (user fills form and submits)

### Visual Elements
- Sparkles icon in gold gradient circle
- Frosted glass panel with gold border
- Form fields with dark theme styling
- Time window selector (appears when "I don't know" checked)

### Copy (EXACT)

**Icon:** ✨ (Sparkles in gold circle)

**Headline:**
```
You're in! Now the exciting part:
```

**Subheadline:**
```
Let's find your specific map.
```

**Body:**
```
Enter your birth details below. The more precise, the more accurate your power places and power months will be.
```

**Form Fields:**

| Field | Label | Type |
|-------|-------|------|
| Date | "Date of Birth" | Date picker (max = today) |
| Time | "Time of Birth" | Time picker |
| Checkbox | "I don't know my exact time" | Checkbox |
| Time Window | "Do you remember roughly when?" | 4 options (see below) |
| Location | "Birth City" | Autocomplete search |

**Time Window Options (when "I don't know" checked):**
```
🌅 Morning (6am-12pm)
☀️ Afternoon (12pm-6pm)
🌙 Evening (6pm-12am)
✨ Not sure (use full day)
```

**Submit Button:**
```
Generate my power map
```

**Privacy Note:**
```
Your data is used only to calculate your chart.
```

### Validation Errors
```
"Please enter your birth date"
"Please enter your birth time"
"Please select your birth city"
```

---

## Step 2: Astrocartography Generation

**Purpose:** Animated loading while calculating astro data
**Background:** Deep space with stars, observatory frame
**Duration:** 5.6 SECONDS (auto-advances)

### Visual Elements
- 3D wireframe globe rotating
- Latitude/longitude lines fading in
- 4 colored planetary lines drawing across globe:
  - Sun = gold
  - Venus = pink
  - Jupiter = purple
  - Mars = red
- Calculation readout (top left)
- Mapping coordinates cycling (top right)
- Progress bar (gold gradient, 0% → 100%)

### Copy (EXACT)

**Rotating Messages (every 0.8 seconds):**
```
1. "Converting birth time to UTC..."
2. "Calculating planetary positions at your birth..."
3. "Most people never see this map."
4. "Mapping celestial bodies to geographic lines..."
5. "Finding where your energy naturally amplifies..."
6. "Matching your lines to 100+ world cities..."
7. "Discovering what you've been missing..."
```

**Calculation Readout (Top Left):**
```
PLANETARY POSITIONS
☉ Sun 14°23' Taurus
♀ Venus 23°42' Gemini
♃ Jupiter 8°17' Pisces
♂ Mars 19°55' Aries
☽ Moon 2°08' Cancer
♄ Saturn 27°31' Aquarius
```

**Progress Text:**
```
0% complete → 100% complete
```

### Timing
- Messages rotate every 800ms
- Progress fills over 5600ms
- Auto-advances when complete

---

## Step 3: Map Reveal

**Purpose:** Dramatic reveal of the user's astrocartography map
**Background:** Full map fills screen
**Duration:** 3.5 seconds until button appears, then manual

### Visual Elements
- Full interactive map (Mapbox)
- Lines animate/draw from birth location outward
- All planetary lines illuminate
- City markers appear for all matched cities
- "Continue" button fades in after animation

### Copy (EXACT)

**Button (appears after 3.5 seconds):**
```
Continue
```

### Interaction
- No back button on this screen
- Map is non-interactive (auto-animation mode)
- Button click advances to Step 4

---

## Step 4: Onboarding A - "Recognition"

**Purpose:** Connect the map to feelings they've already had
**Background:** Map dimmed (20% opacity) behind slide-up panel
**Duration:** Manual

### Visual Elements
- Compass icon in gold box
- Slide-up frosted glass panel (80% height)
- Progress bar showing step 1 of 6 (0%)

### Copy (EXACT)

**Icon:** 🧭 (Compass in gold circle)

**Headline:**
```
You already know this feeling.
```

**Body Paragraph 1:**
```
A city where your mind went quiet. A trip where strangers became collaborators. A place you left... different than when you arrived.
```

**Body Paragraph 2:**
```
You couldn't explain it. You just felt it.
```

**Body Paragraph 3:**
```
That feeling has a map.
```
*(This line in GOLD)*

**Body Paragraph 4:**
```
What you're looking at right now is why certain places land differently for you than for anyone else.
```

**Button:**
```
Why do some places feel different?
```

---

## Step 5: Onboarding B - "Legitimacy + Lines"

**Purpose:** Establish credibility (not horoscope) and explain the 3 key lines
**Background:** Map dimmed with Venus, Jupiter, Sun lines highlighted
**Duration:** Manual

### Visual Elements
- Shield/Lock icon
- "ASTRONOMICAL PRECISION" highlighted box
- 3 planet cards (Venus, Jupiter, Sun) with symbols and colors
- Progress bar: step 2 of 6 (16.7%)

### Copy (EXACT)

**Headline:**
```
This isn't your horoscope.
```

**Credibility Block:**
```
🔒 ASTRONOMICAL PRECISION

At the exact moment you were born, ten planets occupied specific positions in the sky. That's not mystical — it's astronomy.

Astrocartography takes those positions and maps them onto Earth's geography. The calculations use VSOP87 algorithms — the same data NASA and observatories use to track planetary movement.

The result: 40 lines across the globe where each planet's influence is strongest — for you specifically.
```

**Section Header:**
```
Three lines matter most
```

**Planet Card 1 - Venus:**
```
♀ Venus
Color: #E8A4C9 (pink)

"Where connection, creativity, and attraction come easier. Relationships tend to spark here."
```

**Planet Card 2 - Jupiter:**
```
♃ Jupiter
Color: #9B7ED9 (purple)

"Where doors open. Expansion, opportunity, and luck concentrate along this line."
```

**Planet Card 3 - Sun:**
```
☉ Sun
Color: #FFD700 (gold)

"Where you feel most like yourself. Confidence, visibility, and energy peak here."
```

**Footer Note:**
```
You have 40 lines total. Some places amplify you. Others quietly drain you.
```

**Button:**
```
Where do my lines cross?
```

---

## Step 6: Onboarding C - "Tribe + Gap"

**Purpose:** Social proof + highlight what they're missing
**Background:** Map dimmed
**Duration:** Manual

### Visual Elements
- Large "73%" stat box
- "THINK ABOUT IT" highlighted box
- Testimonial quote card
- Progress bar: step 3 of 6 (33.3%)

### Copy (EXACT)

**Headline:**
```
You're not imagining it.
```

**Stat Box:**
```
73%
of 2,400 people
```

**Body Paragraph 1:**
```
In a study of 2,400 people, 73% reported feeling noticeably different in specific locations — more clarity, more energy, more "things clicking."
```

**Body Paragraph 2:**
```
Most assumed it was coincidence. It wasn't.
```
*(Last sentence lighter/muted)*

**"Think About It" Box:**
```
THINK ABOUT IT

Think about how you've chosen where to go until now.

What was trending. What was affordable. What someone else recommended.

Meanwhile, the places that actually resonate with your specific chart? They've been sitting there. Unmarked. Unvisited.
```
*(Last sentence in GOLD)*

**Testimonial:**
```
"I'd been to 30 countries and never understood why Tokyo felt like home and Paris felt like static. Then I saw my Jupiter line."

— M.K., Berlin
```

**Button:**
```
Is location the only factor?
```

---

## Step 7: Onboarding D - "Timing"

**Purpose:** Introduce the timing concept (power months)
**Background:** Map dimmed
**Duration:** Manual

### Visual Elements
- Calendar icon in gold box
- Green metaphor box (swimming with current)
- Red metaphor box (swimming against current)
- Progress bar: step 4 of 6 (50%)

### Copy (EXACT)

**Icon:** 📅 (Calendar in gold circle)

**Headline:**
```
Location is half the equation.
```

**Body Paragraph 1:**
```
The sky didn't freeze when you were born. Planets kept moving.
```

**Body Paragraph 2:**
```
Right now, they're forming new angles with your birth chart — and those angles change month to month.
```

**Green Box (Positive):**
```
Some months, you're swimming with the current. Launch something, and it catches. Decide something, and it sticks. The right people appear without effort.
```

**Red Box (Cautionary):**
```
Other months, you're swimming against it. Same energy, same work — but everything takes twice as long and lands half as well.
```

**Bridge Paragraph 1:**
```
You have power windows. Stretches where momentum compounds.
```
- "power windows" = GOLD highlight

**Bridge Paragraph 2:**
```
Miss them, and you're not failing — you're just forcing.
```
*(Italicized)*

**Button:**
```
When are my windows?
```

---

## Step 8: Onboarding E - "Pivot" (PERSONALIZED)

**Purpose:** Transition to the 2026 forecast, using their quiz answer
**Background:** Map dimmed
**Duration:** Manual

### Visual Elements
- Clock icon in gold box
- Blue-tinted credibility box
- Questions quote box
- PERSONALIZED box (uses quiz Q2 answer)
- Progress bar: step 5 of 6 (66.7%)

### Copy (EXACT)

**Icon:** 🕐 (Clock in gold circle)

**Headline:**
```
But here's what you don't have yet.
```

**Credibility Box:**
```
What you just saw is your birth chart. Your permanent blueprint. Where your energy lives on the map.

But it's frozen.
```
*(Last line "But it's frozen." in GOLD)*

**Body Paragraph 1:**
```
It doesn't tell you what happens when Saturn crosses your Venus line in March. Or when Jupiter lights up your Sun line in September.
```

**Body Paragraph 2:**
```
It doesn't answer the real questions:
```

**Questions Box:**
```
"When should you launch? When should you wait? When does your power city become a power month?"
```

**Bridge Text:**
```
For that, you need your 2026 transits — how the moving sky interacts with YOUR chart, month by month, location by location.
```

**PERSONALIZED Box (based on quiz Q2):**

*If user selected:*
- "Career / business growth" → shows "career"
- "Creativity / new ideas" → shows "creativity"
- "Love / relationships" → shows "love"
- "Clarity / finding direction" → shows "clarity"
- "Adventure / feeling alive" → shows "adventure"

```
You said you want 2026 to be about [PERSONALIZATION].

Your 2026 map shows exactly when and where that becomes most possible.
```

**Button:**
```
Generate My 2026 Map
```

---

## Step 9: Onboarding F - "Urgency"

**Purpose:** Create urgency with countdown to 2026
**Background:** Map dimmed
**Duration:** Manual

### Visual Elements
- Large countdown number in gold box
- Red warning box
- Progress bar: step 6 of 6 (83.3%)

### Copy (EXACT)

**Countdown Box:**
```
[DYNAMIC NUMBER]
days until 2026
```
*(Or "days into 2026" if after Jan 1, 2026)*

**Headline (Dynamic):**
```
If days > 0: "2026 is [X] days away."
If days ≤ 0: "We're [X] days into 2026."
```

**Body Paragraph 1:**
```
Your first power window could be January.
```

**Body Paragraph 2:**
```
A month where something you start gains traction. A trip that shifts something. A decision that finally sticks.
```

**Red Warning Box:**
```
Or it could pass — unmarked, unused — because you didn't know it was there.
```

**Body Paragraph 3:**
```
The windows open whether you're watching or not.
```

**Final CTA Text:**
```
See which months are yours.
```
*(Gold, larger text)*

**Button:**
```
Generate My 2026 Map →
```
*(With arrow icon)*

---

## Step 10: 2026 Forecast Generation

**Purpose:** Loading animation while "calculating" forecast
**Background:** Deep space, observatory frame
**Duration:** 4 SECONDS (auto-advances)

### Visual Elements
- Circular calendar wheel (12 month segments)
- Months scan/light up randomly
- Power months (3) glow gold when discovered
- Transit calculation readout cycling
- Scanning beam sweeping around wheel
- Planetary ring rotating opposite direction
- Center: "2026 FORECAST" in large gold text
- Progress bar (0% → 100%)

### Copy (EXACT)

**Rotating Messages (every 0.8 seconds):**
```
1. "Scanning 2026 planetary transits..."
2. "This is the year everything can shift."
3. "Finding your power months..."
4. "Calculating when to move vs. when to wait..."
5. "Your first power window might be sooner than you think..."
```

**Transit Readout Examples (cycling):**
```
MAR 2026
Jupiter trine Sun ▲ HIGH
Processing transit aspects...

JUL 2026
Venus conjunct MC ★ PEAK
Processing transit aspects...
```

**Center Display:**
```
2026 FORECAST
```

### Timing
- Messages rotate every 800ms
- Progress fills over 4000ms
- Auto-advances when complete

---

## Step 11: Paywall

**Purpose:** Convert user to paid customer
**Background:** None (full paywall page)
**Duration:** Manual (user completes payment)

### Visual Elements
- Price display with strikethrough
- Checklist with 10 items
- Trust indicators
- Blurred report preview
- Social proof stats
- Publication logos
- With vs. Without comparison
- FAQ accordion
- Testimonials section
- Final CTA section

### Copy (EXACT)

**Headline:**
```
Unlock Your 2026 Map
```
- "2026 Map" = gold

**Price:**
```
$49 (strikethrough)
$19 (large gold)

One-time payment
No subscription. Instant access. Yours forever.
```

**"What You Get" Checklist (10 items):**
```
✓ Your 3 Power Months — Know exactly when to launch, decide, and move
✓ Your 3 Power Cities — Where to travel for breakthroughs and clarity
✓ Best Month for Money Moves — Time your financial decisions with precision
✓ Best Month for Love & Relationships — When connection comes easier
✓ Best Month for Major Decisions — When your clarity peaks — decide here
✓ Months to Avoid — Stop wasting energy fighting the current
✓ All 12 Months Ranked — See your entire year at a glance
✓ Full Location Analysis — 338 cities matched to your chart
✓ 2026 Calendar Overview — Color-coded month-by-month energy map
✓ Locations That Drain You — Know where NOT to go
```

**Primary CTA:**
```
🔒 Unlock My 2026 Map — $19
```

**Trust Indicators:**
```
🛡 Secure payment
⚡ Instant access
```

**"As Featured In" Section:**
```
Cosmopolitan | Well+Good | mindbodygreen | Refinery29
```

**Final CTA Section:**
```
2026 is [X] days away.
(or "We're [X] days into 2026")

Your first power window could be January.
Don't you want to know?

$49 (strikethrough)
$19 (large)
One-time payment

🔒 Unlock My 2026 Map — $19

30-day money-back guarantee
If the map doesn't resonate, email us for a full refund.
```

---

## Step 12: Confirmation/Success

**Purpose:** Celebrate purchase and show summary
**Background:** None (success page)
**Duration:** Manual (user clicks to go to map)

### Visual Elements
- Gold checkmark animation with celebration effect (1.5s)
- Green "Unlocked" badge
- 3 sections: Power Months, Power Cities, Months to Avoid
- Warning icon for avoid section
- CTA button to map

### Copy (EXACT)

**Celebration (1.5s animation):**
```
Your Map is Ready!
```
*(With gold checkmark and radiating stars)*

**Header Badge:**
```
🎉 Unlocked
```
*(Green badge styling)*

**Title:**
```
Your 2026 Power Map
Your personalized cosmic timing guide
```

**Section 1: Your 3 Power Months**
```
[Calendar Icon]

Your 3 Power Months

1️⃣ [MONTH] 2026 — Peak energy window
2️⃣ [MONTH] 2026 — Peak energy window
3️⃣ [MONTH] 2026 — Peak energy window
```
*(Months populated from forecast data, e.g., March, July, October)*

**Section 2: Your 3 Power Cities**
```
[MapPin Icon]

Your 3 Power Cities

1️⃣ [CITY], [COUNTRY] — [CATEGORY]
2️⃣ [CITY], [COUNTRY] — [CATEGORY]
3️⃣ [CITY], [COUNTRY] — [CATEGORY]
```
*(Cities from astrocartography data, e.g., Barcelona, Spain — Career)*

**Section 3: Months to Avoid**
```
[Warning Icon] Months to avoid major decisions

[MONTH], [MONTH], [MONTH] 2026

Good for rest, reflection, and tying up loose ends
```

**CTA Button:**
```
📍 Explore Your Full Map
```

**Footer:**
```
Your map is saved to your account. Check your email for a copy.
```

---

# Part 3: Map Interface

> **Route:** `/map`
> **Files:** `/src/app/map/page.tsx`, `/src/components/astro-map/*.tsx`

---

## Map Page Entry

**Views:** Form → Loading → Map

### Form View Copy

**Title:**
```
Your Astrocartography Map
```
- "Astrocartography" = highlighted/gold

**Subtitle:**
```
Enter your birth details to discover where your stars align around the world.
```

**Form Fields:**
Same as Reveal Step 1

**Submit Button:**
```
Generate My Astro Map
```

**Privacy Note:**
```
Your data is used only to calculate your map and is not stored.
```

### Loading View Copy

**Rotating Messages (2 second intervals):**
```
1. "Calculating planetary positions..."
2. "Mapping your celestial lines..."
3. "Discovering your power places..."
```

**Subtitle:**
```
This may take a moment...
```

---

## Power Places Panel

**Location:** Bottom-right (desktop) / Bottom sheet (mobile)
**Purpose:** Show best cities for each life category

### Copy (EXACT)

**Panel Header:**
```
✨ Power Places
```

**Collapsed Subtitle:**
```
Discover your destinations
```

**Category Tabs:**
```
💕 Love
💼 Career
🌟 Growth
🏠 Home
```
*(Each shows count of places in that category)*

**City Card Format:**
```
[Country Flag] [City Name]
[Star Rating: 3.0 - 5.0 stars]
[Planet Symbol] [Line Type Badge]
[Interpretation text]
[Fly To button]
```

### Star Rating System

All cities shown are on beneficial planetary lines, so ratings range from 3-5 stars:

| Stars | Meaning |
|-------|---------|
| ★★★★★ (5.0) | Exceptional alignment — very close to powerful lines |
| ★★★★☆ (4.5) | Strong alignment — close to beneficial lines |
| ★★★★ (4.0) | Good alignment — moderate proximity |
| ★★★☆ (3.5) | Positive alignment — farther but still beneficial |
| ★★★ (3.0) | Baseline beneficial — on a line but at distance |

**Scoring factors:**
- Proximity to planetary line (closer = higher score)
- Line type (MC/Midheaven = highest, then AC, DC, IC)
- Planet relevance to category (Venus for Love, Jupiter for Career)
- Multi-line bonus (city near multiple lines)

**Empty State:**
```
[MapPin Icon]
No cities found near your [category] lines.
Try zooming out on the map to explore more.
```

---

## City Popup/Tooltip (Map Marker Click)

**Location:** Appears when clicking city marker pins on map
**Purpose:** Show detailed city information with visual star rating
**Style:** Dark glassmorphic design matching app aesthetic

### Visual Elements
- Country flag emoji + city name (white text)
- 4-pointed celestial star rating (gold, with half-star support)
- Planet symbol + line type badge (category-colored)
- Distance in km from user's birth location
- Interpretation text (2-3 sentences)
- Close button (X) styled for dark theme

### Category Colors
```
Love:   #E8A4C9 (pink)
Career: #E8C547 (gold)
Growth: #9B7ED9 (purple)
Home:   #C4C4C4 (silver)
```

### Popup Format
```
[Close X]
[Flag] [City Name]
[★★★★☆] (star rating with glow)
[Planet Badge] [Line Type]  |  [Distance] km
─────────────────────────────
[Interpretation text...]
```

### Styling
- Background: `rgba(15, 15, 35, 0.95)` with blur backdrop
- Border: `1px solid [category color with 30% opacity]`
- Box shadow: subtle glow in category color
- Max width: 240px (mobile-friendly)

---

## Power Months Panel

**Location:** Top-left (desktop) / Bottom sheet (mobile)
**Purpose:** Show 2026 forecast by category

### Copy (EXACT)

**Panel Header:**
```
2026 Forecast
```

**Collapsed Subtitle:**
```
Your power months
```

**Confidence Notice (if unknown birth time):**
```
Results show confidence ratings based on time window
```

**Category Tabs:**
Same as Power Places (Love, Career, Growth, Home)

**Month Card Format:**
```
[Month Abbreviation]
[Power Bar 0-100%]
[Score Number]
[Star if "best month"]
```

---

## 2026 Report Panel (Desktop)

**Location:** Top-left on desktop (absolute positioned)
**Purpose:** Show yearly power score and forecast insights
**Style:** Dark glassmorphic with purple accent (#9B7ED9)

### Visual Elements
- Collapsible panel with header button
- Sparkles icon with animated glow
- "2026 Report" title with subtitle
- Chevron for expand/collapse
- Scrollable content area with custom scrollbar

### Yearly Power Score

The power score uses an **optimistic benefic-focused algorithm** (range 50-100):

| Score | Label | Meaning |
|-------|-------|---------|
| 85-100 | Exceptional Year | Many benefic aspects, Jupiter/Venus activity |
| 70-84 | Powerful Year | Strong cosmic support throughout |
| 55-69 | Strong Year | Good overall planetary alignment |
| 50-54 | Foundation Year | Building/preparation time (never "bad") |

**Scoring Philosophy:**
- Everyone starts with base 50 (cosmic potential)
- No one gets below 50 — all years have value
- Labels are ALL positive (Foundation Year frames low as preparation)
- Jupiter/Venus (benefic planets) provide bonus points

### Panel States

**Loading State:**
```
[Spinning Sparkles Icon]
Generating your
2026 Report
```

**Collapsed State (header only):**
```
[Sparkles Icon] 2026 Report
Tap to view your cosmic forecast
[Chevron Down]
```

**Expanded State:**
```
[Sparkles Icon] 2026 Report
Personal forecast & insights
[Chevron Up]
─────────────────────────────
[Scrollable Report Content]
- Radial power gauge (50-100%)
- Monthly breakdowns
- Key insights
─────────────────────────────
```

---

## Category Filters

**Location:** Top-center
**Purpose:** Filter planetary lines by life area

### Copy (EXACT)

**Filter Buttons:**
```
✨ All Lines
💕 Love
💼 Career
🧭 Adventure
🏠 Home
```

---

## Map Controls (Planetary Lines Panel)

**Location:** Left side (desktop only)

### Copy (EXACT)

**Panel Title:**
```
Planetary Lines
```

**Quick Actions:**
```
Show All | Hide All
```

**Planet List (10 planets):**
```
☉ Sun
☽ Moon
☿ Mercury
♀ Venus
♂ Mars
♃ Jupiter
♄ Saturn
♅ Uranus
♆ Neptune
♇ Pluto
```

**Footer Buttons:**
```
Legend | New Map
```

---

## Legend Modal

**Purpose:** Explain line types

### Copy (EXACT)

**Line Types:**

```
MC - Midheaven
Where you're recognized for your talents and hard work.
Your public identity, career success, and how you're perceived in the world.

IC - Foundation
Where you feel rooted, safe, and at home.
Your private world, family, and inner peace.

AC - Rising / Ascendant
How you're perceived when you first meet someone.
Your self-expression, first impressions, and personality.

DC - Descendant / Setting
Who you attract and how you relate in partnerships.
Your relationships, romantic connections, and close bonds.
```

---

## Line Tooltip (Click on Line)

**Purpose:** Explain what a planetary line means for the user

### Copy Structure

**Header:**
```
[Planet Symbol] [Planet Name]
[Line Type Badge]
```

**Plain Summary Box:**
```
✨ [Plain language interpretation 1-2 sentences]
```

**Line Type Description:**
```
[What this line type means in general]
```

**Expanded Content (Learn More):**
```
[Full detailed interpretation paragraph]

💡 How to use this energy
• [Tip 1]
• [Tip 2]
• [Tip 3]
• [Tip 4]
```

---

## Welcome Tutorial (First Visit)

**Purpose:** Guide new users through the map
**Trigger:** First visit to `/map` only

### Initial Prompt Copy

**Title:**
```
First time here?
```

**Description:**
```
Want a quick tour of your astrocartography map? It only takes 30 seconds.
```

**Buttons:**
```
Skip | Show me!
```

### Tutorial Step 1

**Title:**
```
Your Astrocartography Map
```

**Content:**
```
This map shows where the planets were rising, setting, and at their highest point at the exact moment you were born...
```

### Tutorial Step 2

**Title:**
```
Understanding the Lines
```

**Content:**
Shows 3 example planets:
```
☉ Sun = Fame & Identity
♀ Venus = Love & Beauty
♃ Jupiter = Luck & Growth
```

### Tutorial Step 3

**Title:**
```
Four Types of Lines
```

**Content (2×2 grid):**
```
MC - Midheaven (solid line)
IC - Foundation (dashed line)
AC - Ascendant (solid line)
DC - Descendant (dashed line)
```

### Tutorial Step 4

**Title:**
```
Explore Your Map
```

**Content:**
```
Tap any line to see what it means for you. Use the filters at the top...
```

**Buttons:**
```
Back | Start Exploring
```

**Checkbox (last step only):**
```
☐ Don't show this again
```

---

# Loading Screens Summary

## Quiz Screen 8 (5 seconds)
| Time | Message |
|------|---------|
| 0s | "Checking if your map is ready..." |
| 1s | "Scanning 2026 windows..." |
| 2s | "Almost there..." |
| 3s | "Checking if your map is ready..." |
| 4s | "Scanning 2026 windows..." |
| 5s | Auto-advance to Screen 9 |

## Reveal Step 2 (5.6 seconds)
| Time | Message |
|------|---------|
| 0.0s | "Converting birth time to UTC..." |
| 0.8s | "Calculating planetary positions at your birth..." |
| 1.6s | "Most people never see this map." |
| 2.4s | "Mapping celestial bodies to geographic lines..." |
| 3.2s | "Finding where your energy naturally amplifies..." |
| 4.0s | "Matching your lines to 100+ world cities..." |
| 4.8s | "Discovering what you've been missing..." |
| 5.6s | Auto-advance to Step 3 |

## Reveal Step 10 (4 seconds)
| Time | Message |
|------|---------|
| 0.0s | "Scanning 2026 planetary transits..." |
| 0.8s | "This is the year everything can shift." |
| 1.6s | "Finding your power months..." |
| 2.4s | "Calculating when to move vs. when to wait..." |
| 3.2s | "Your first power window might be sooner than you think..." |
| 4.0s | Auto-advance to Step 11 |

## Map Page Loading (variable)
| Order | Message |
|-------|---------|
| 1 | "Calculating planetary positions..." |
| 2 | "Mapping your celestial lines..." |
| 3 | "Discovering your power places..." |
*(Cycles every 2 seconds until API returns)*

---

# Personalization Points

These are the places where user data affects displayed content:

| Screen | Data Used | How It's Used |
|--------|-----------|---------------|
| Reveal Step 8 | Quiz Q2 answer | Box says "You said you want 2026 to be about [career/love/etc]" |
| Reveal Step 9 | Current date | Dynamic countdown to/from Jan 1, 2026 |
| Reveal Step 11 | Current date | Same countdown in final CTA section |
| Reveal Step 12 | Forecast data | Shows actual power months and cities calculated |
| Map Interface | All birth data | Entire map is personalized to user |

---

# Copy Style Guide

## Typography Hierarchy

| Element | Size | Style |
|---------|------|-------|
| Headlines | 24-40px | Bold, key words in gold |
| Body text | 14-17px | Regular, white or white/80% |
| Muted text | 12-14px | Regular, white/60% or white/40% |
| Button text | 15-16px | Semibold |
| Helper text | 12-13px | Regular, white/40% |

## Color Coding

- **Gold/Yellow (`#E8C547`, `#C9A227`)** — Important terms, CTAs, numbers
- **White (100%)** — Headlines, primary text
- **White (80%)** — Body text
- **White (60%)** — Secondary text
- **White (40%)** — Muted notes, privacy text
- **Pink (`#E8A4C9`)** — Love category, Venus
- **Purple (`#9B7ED9`)** — Growth category, Jupiter
- **Red/Orange** — Cautionary messaging, Mars

## Key Metaphors Used

- **"Map"** — Personalized guide to optimal places/timing
- **"Power months/destinations"** — Best windows for action
- **"Energy amplifies"** — Things flow easier at certain places
- **"Momentum"** — Results from right timing
- **"Swimming with/against the current"** — Timing alignment metaphor
- **"Windows"** — Time periods of opportunity

## Tone

- **Conversational** — Direct address, "you" language
- **Mystical but grounded** — Astrology terms without being too esoteric
- **Aspirational** — Focus on possibilities and outcomes
- **Credible** — Specific numbers (87%, 73%, 2,400 people)
- **Urgent but not pushy** — FOMO through missed opportunities, not scarcity

---

# File Reference

| Component | File Path |
|-----------|-----------|
| Quiz Screens | `/src/components/screens/Screen01Entry.tsx` - `Screen10Confirmation.tsx` |
| Reveal Screens | `/src/components/reveal/RevealScreen01BirthData.tsx` - `RevealScreen12Confirmation.tsx` |
| Copy Source | `/src/content/copy.ts` (LOCKED) |
| AstroMap | `/src/components/astro-map/AstroMap.tsx` |
| Power Places Panel | `/src/components/astro-map/PowerPlacesPanel.tsx` |
| Power Months Panel | `/src/components/astro-map/PowerMonthsPanel.tsx` |
| Birth Data Form | `/src/components/astro-map/BirthDataForm.tsx` |
| Line Tooltip | `/src/components/astro-map/LineTooltip.tsx` |
| Category Filters | `/src/components/astro-map/CategoryFilters.tsx` |
| Welcome Tutorial | `/src/components/astro-map/WelcomeTutorial.tsx` |
| 2026 Report Panel | `/src/components/astro-map/report/Report2026Panel.tsx` |
| 2026 Report Desktop Wrapper | `/src/components/astro-map/report/Report2026DesktopPanel.tsx` |
| City Scoring Logic | `/src/lib/astro/power-places.ts` |
| Yearly Power Score | `/src/lib/astro/report-derivations.ts` (calculatePowerScore function) |

---

**End of Documentation**

*This document captures all user-facing copy, timings, and interactions as of December 30, 2025.*
