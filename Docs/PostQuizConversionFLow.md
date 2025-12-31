# 2026 Power Map — Post-Quiz Conversion Flow
## Product Requirements Document v1.0

---

## Document Purpose

This document outlines the user journey from email capture through purchase for the 2026 Power Map product. It serves as a blueprint for development, defining each screen's purpose, emotional outcomes, visual elements, and content direction.

---

## Flow Philosophy

### Core Principle
Take the user on an emotional journey that makes purchasing feel like the obvious and only logical conclusion — not through pressure, but through genuine value delivery that creates a gap only the paid product can fill.

### Emotional Arc
```
Anticipation → Wow/Overwhelm → Understanding → "Aha" → New Problem → Curiosity/Need → Purchase
```

### The Three-Layer Visual System
Throughout the flow, we use a layered visual approach:
- **Layer 1 (Background):** The user's actual birth chart/map — always present, establishing ownership
- **Layer 2 (Middle):** Content screens that slide up from bottom — storytelling and education
- **Layer 3 (Foreground):** Action elements — CTAs, checkout, key reveals

This creates a feeling of depth and that "their stuff" is always there, waiting.

---

## Summary Flow

```
[QUIZ COMPLETE]
      ↓
[1] Email Capture (reframed)
      ↓
[2] Birth Data Collection
      ↓
[3] Generation Animation
      ↓
[4] The Reveal — Static Birth Chart
      ↓
[5] Onboarding Story — Part 1: The Concept
      ↓
[6] Onboarding Story — Part 2: The Lines
      ↓
[7] Onboarding Story — Part 3: Places & Timing
      ↓
[8] The Pivot — "But It's Static"
      ↓
[9] 2026 Generation Animation
      ↓
[10] The Paywall — Blurred Report + Checkout
      ↓
[11] Purchase Confirmation + Full Reveal
```

---

## Screen-by-Screen Specification

---

### SCREEN 1 — Email Capture (Modified)

#### Emotional Outcome
**Anticipation + Commitment**
User feels they're about to receive something personalized and valuable. The email feels like a fair exchange, not a gate.

#### Visual Elements
- Continues quiz visual style (dark cosmic background, gold accents)
- Single email input field
- Clear CTA button
- Possibly: subtle preview/teaser of what's coming ("Your personal chart awaits")

#### Content Direction
- Frame as "unlock" not "join waitlist"
- Implication: something is being generated FOR them specifically
- Example direction: "Enter your email to unlock your personal birth chart"

#### Key Elements
- Email input field
- CTA: "Unlock My Chart" or "Continue"
- Optional: small reassurance text ("We'll send your results here too")

#### Transition
On submit → Slide to Screen 2

---

### SCREEN 2 — Birth Data Collection

#### Emotional Outcome
**Anticipation Building + Investment**
User is actively participating in creating something personalized. Each field they fill increases psychological investment.

#### Visual Elements
- Clean, simple form — doesn't feel like bureaucracy
- Same cosmic styling as quiz
- Fields should feel like part of the experience, not a separate form
- Possibly: subtle visual feedback as they complete each field

#### Content Direction
- Frame as necessary for personalization, not data collection
- Make it feel like the final step before magic happens
- Example direction: "To map your birth sky, we need to know when and where you arrived"

#### Key Elements
- **Birth Date:** Date picker (Month / Day / Year)
- **Birth Time:** Time picker with prominent "I don't know my exact time" option
  - If unknown: brief reassurance that chart will still work, just slightly less precise
- **Birth Location:** City search with autocomplete
  - Should include Kaunas, Vilnius, Bratislava, and major world cities
- **CTA Button:** "Generate My Chart" or "Map My Birth Sky"

#### Transition
On submit → Slide to Screen 3 (loading animation begins)

---

### SCREEN 3 — Generation Animation

#### Emotional Outcome
**Anticipation Peak + Legitimacy**
User feels real calculation is happening. This isn't instant = it must be real/complex. Excitement builds.

#### Visual Elements
- Dark background with cosmic/star elements
- Animated progress indicator (not a simple spinner — something more mystical)
- Text messages that rotate/change, implying steps in calculation
- Possibly: subtle visualization of planets/lines being calculated

#### Content Direction
Messages should feel technical and legitimate — revealing the actual complexity of what's happening. Mix accessible with impressive technical detail:

**Message sequence (rotate through):**
- "Converting birth time to UTC..."
- "Accessing NASA-grade ephemeris database..."
- "Calculating planetary positions at your birth moment..."
- "Computing Earth's rotation at coordinates..."
- "Determining house cusps and angles..."
- "Mapping celestial bodies to geographic lines..."
- "Matching your lines to 100+ world cities..."
- "Rendering your personal birth sky..."

**Purpose:** Show skeptics this is real astronomical calculation, not generic horoscope stuff. Reveal the curtain — the process IS complex, let them see that.

#### Key Elements
- Animated loading visualization
- 3-5 rotating status messages
- Duration: 4-6 seconds (long enough to feel real, short enough not to frustrate)
- Auto-advances when complete

#### Transition
Auto-advance → Screen 4 with reveal animation

---

### SCREEN 4 — The Reveal (Static Birth Chart)

#### Emotional Outcome
**Wow → Positive Overwhelm**
This is the "holy shit" moment. User sees their actual chart for the first time. It should feel:
- Beautiful and complex
- Clearly personalized (their data reflected)
- Slightly overwhelming in a good way — "there's so much here"

**Emotional Sequence:**
1. Initial wow/excitement (first 2-3 seconds)
2. Curiosity (exploring the visual)
3. Positive overwhelm ("this is complex, there's a lot to unpack")

#### Visual Elements
- **Full-screen map reveal** — their birth chart with all lines rendered
- Multiple line colors representing different planets
- Lines crossing the world map — some straight, some curved
- Intersection points possibly highlighted
- Their birth location possibly marked
- **Auto-animation:** Map slowly moves/rotates/pans on its own over ~3-4 seconds
  - Shows the full globe, different regions where their lines cross
  - Creates sense of scope and complexity
  - User watches, doesn't interact — they're taking it in
- This becomes **Layer 1** that persists in background going forward

#### Content Direction
- Minimal text — let the visual speak
- Headline: "Your Birth Chart" or "Your Astrological Blueprint"
- Subhead: Something like "The sky at your birth — mapped to Earth"
- **No CTA button** — Screen 5 auto-advances after the map animation completes

#### Key Elements
- Map component (Mapbox) with their personal lines
- All 40 lines visible (10 planets × 4 line types)
- Color coding by planet
- Auto-pan/rotation animation (~3-4 seconds)
- Headline + subhead
- No button — auto-advances

#### Transition
After map animation completes (~3-4 seconds of letting them absorb) → Screen 5 automatically slides up from bottom (Layer 2), map remains visible behind at ~20-30% visibility

---

### SCREEN 5 — Onboarding Story, Part 1: The Concept

#### Emotional Outcome
**Grounding + Legitimacy + Beginning of Understanding**
Take the overwhelm and start channeling it into comprehension. User should feel:
- "Oh, there's actually a logic to this"
- "This is based on real astronomy"
- "These people know what they're talking about"

#### Visual Elements
- **Slide-up panel** (Layer 2) covering ~70-80% of screen
- Map still visible behind, slightly dimmed
- Clean, readable typography
- Possibly: simple diagram or illustration supporting the concept
- Glassmorphism/translucent card aesthetic

#### Content Direction
Tell the origin story of astrocartography in simple terms:
- What it is: mapping planetary positions at your birth to locations on Earth
- Why it's legitimate: based on actual astronomical data (NASA-grade coordinates)
- The core premise: certain places on Earth resonate with your specific birth energy
- Keep it SHORT — this is overview, not deep education

**Key points to convey:**
1. This is real astronomy mapped to geography
2. It's not generic — it's calculated from YOUR exact birth moment
3. The concept: different places = different energies for you specifically

**Implicit pain/desire threading:**
- "Most people travel randomly, not knowing some places naturally amplify their energy"
- "Some trips change you. Others are just... trips. This is why."

#### Key Elements
- 2-3 short paragraphs max
- Possibly one simple visual/diagram
- "Continue" or "Next" button
- Progress indicator (subtle — shows they're in a flow)

#### Transition
On continue → Brief animation where Layer 2 slides down, a specific LINE on the map (Layer 1) gets highlighted/animated, then Screen 6 slides up

---

### SCREEN 6 — Onboarding Story, Part 2: The Lines

#### Emotional Outcome
**Understanding + Personalization + "Aha"**
User starts connecting the abstract concept to the visual they saw. "Oh, THAT'S what those lines mean."

#### Visual Elements
- Same slide-up panel format
- Behind it: their map with ONE line type highlighted (e.g., their Sun line or Venus line)
- Line should be visually emphasized (glowing, thicker, or other lines dimmed)
- Possibly: small legend or icon showing which planet

#### Content Direction
Explain what the lines actually represent:
- Each line = where a specific planet's energy is strongest for you
- Different planets = different life areas
- Give 2-3 concrete examples they can relate to:

**Examples to include:**
- **Venus line:** Where love, beauty, and creativity flow easier
- **Jupiter line:** Where luck, expansion, and opportunity are amplified
- **Sun line:** Where you feel most yourself, most vital, most recognized
- **Saturn line:** Where you build lasting structures (can be challenging but rewarding)

**Implicit threading:**
- Connect to real desires: career, love, clarity, adventure
- "Your Venus line passes through [general region]. People often find romance or creative breakthroughs near their Venus line."

#### Key Elements
- Explanation of 2-4 key line types
- Visual highlight of actual line on their map
- Each line tied to real-life outcomes (love, money, career, growth)
- Continue button

#### Transition
On continue → Line highlight releases, different element highlights (maybe city intersections), Screen 7 slides up

---

### SCREEN 7 — Onboarding Story, Part 3: Places & Timing

#### Emotional Outcome
**Actionability + Relevance + Pre-pivot Setup**
User understands HOW this translates to real decisions. And we plant the seed that TIMING matters too.

#### Visual Elements
- Slide-up panel
- Behind: map with specific CITIES highlighted where their lines intersect
- Show that lines + cities = actionable locations

#### Content Direction
Two key concepts to land:

**Concept 1: Power Places**
- Where your lines cross major cities = where that energy is accessible
- You don't need to move there — even a short visit can activate the energy
- "A weekend in your Jupiter city might open doors that months elsewhere wouldn't"

**Concept 2: Timing Matters (The Seed)**
- Introduce that planetary positions CHANGE over time
- "The planets didn't stop moving after you were born"
- Some months are better for action, others for rest
- This is setup for the pivot — don't go too deep yet

**Implicit threading:**
- "You've probably had trips that changed something in you. And trips that were just... nice. The difference might be in your lines."
- "Timing your big moves to your personal power windows can be the difference between grinding and flowing"

#### Key Elements
- Places explanation with visual tie-in
- Timing teaser (brief)
- Continue button

#### Transition
On continue → Panel slides down, brief pause, Screen 8 (Pivot) slides up with slightly different visual treatment (signaling shift)

---

### SCREEN 8 — The Pivot

#### Emotional Outcome
**New Problem Creation + Desire Activation**
User has just learned something valuable. Now we reframe: what they have is interesting but INCOMPLETE. A new gap opens.

The feeling: "Oh wait... this is cool but it doesn't tell me what to DO in 2026."

#### Visual Elements
- Different visual treatment to signal shift (slightly different card style, or new color accent)
- Map still behind but we're clearly transitioning mentally
- More direct, punchy typography
- Possibly: visual metaphor (static snapshot vs. moving timeline)

#### Content Direction
The rhetorical move:
1. Acknowledge what they have: "This is your birth chart — a snapshot of your cosmic blueprint"
2. Introduce the limitation: "But it's static. Frozen in time."
3. Raise the real question: "What about 2026? Where should you be? When should you move?"
4. Bridge to solution: "For that, you need your transits — how the moving planets interact with YOUR chart THIS year"

**Problem framing options:**
- "Your birth chart shows who you are. Your 2026 chart shows what to do."
- "This is the map. But where's the route for THIS year?"
- "Knowing your lines is step one. Knowing WHEN to use them is everything."
- "Without your 2026 transits, you're planning your year blind"

**Desire amplification:**
- Reference their quiz answer: "You said you want 2026 to be about [career/love/clarity]..."
- "Your 2026 Power Map shows you exactly when and where to focus on that"

#### Key Elements
- Punchy copy creating the "but..." moment
- Clear articulation of what's missing
- CTA: "Generate My 2026 Map" or "See My 2026 Power Windows"
- This button should feel like the next natural step, not a sales push

#### Transition
On CTA → Screen 9 (new generation animation)

---

### SCREEN 9 — 2026 Generation Animation

#### Emotional Outcome
**Renewed Anticipation + Heightened Stakes**
Second loading sequence, but now they KNOW what they're waiting for. Stakes feel higher.

#### Visual Elements
- Similar to Screen 3 but with 2026/transit-specific messaging
- Possibly: year "2026" featured visually
- More anticipation-building language

#### Content Direction
Messages focused on 2026 calculation:
- "Calculating 2026 planetary transits..."
- "Mapping your power windows..."
- "Identifying optimal months and locations..."
- "Generating your personal year ahead..."

#### Key Elements
- Loading animation
- 2026-specific status messages
- Duration: 4-5 seconds
- Auto-advances

#### Transition
Auto-advance → Screen 10 with the big reveal/paywall

---

### SCREEN 10 — The Paywall (Blurred Report + Checkout)

#### Emotional Outcome
**Painful Curiosity + Urgency + "It's Right There"**
This is the peak tension moment. Everything they want is RIGHT THERE, visible but inaccessible. The only barrier is the purchase.

**Emotional sequence:**
1. "Oh wow, it's generated" (seeing the report structure)
2. "Wait, I can't see the details" (noticing the blur)
3. "But I NEED to know if January is good or bad" (painful curiosity)
4. "It's right here, I just need to unlock it" (purchase as relief, not transaction)

#### Visual Elements — THE THREE LAYERS IN FULL EFFECT

**Layer 1 (Deep Background — ~20% visible):**
- Their original birth chart map
- Very dimmed but present
- Reminds them: "My chart exists, I've seen it"

**Layer 2 (Middle — the report):**
- Their "2026 Power Map Report" — looks like a real document/dashboard
- Shows the STRUCTURE clearly:
  - Section: "Your 3 Power Months" — with three month slots, BLURRED
  - Section: "Your 3 Power Cities" — with three city name slots, BLURRED
  - Section: "Months to Avoid" — visible category, content BLURRED
  - Section: "Month-by-Month Energy" — visual chart/graph visible but details BLURRED
  - Possibly: "Best times for [Love/Career/Decisions]" — categories visible, specifics BLURRED
- Blur should be JUST enough that they can tell it's real, personalized, specific — but can't read it

**Layer 3 (Foreground — Checkout Panel):**
- Slide-up checkout card
- Price prominently displayed
- Payment form
- CTA button

#### Content Direction — Checkout Panel

**Headline options:**
- "Your 2026 Power Map is Ready"
- "Unlock Your Year"
- "See What 2026 Has in Store"

**What's included (brief list):**
- Your 3 power months — when to move, launch, decide
- Your 3 power cities — where to travel for breakthroughs
- Months to avoid — when to rest, not force
- Month-by-month energy forecast
- [Any bonuses]

**Price display:**
- Main price clearly shown
- Optional: anchor price crossed out (e.g., ~~$47~~ $27)
- Or: "Launch price" / "Early access price" framing

**Urgency elements (choose appropriate):**
- "2026 is [X] days away"
- "Your first power window might be January — you'd want to know"
- Limited time pricing (if using)

**Trust/risk reduction:**
- Secure payment indicator
- Possibly: "Instant access" or "Delivered immediately"
- Optional: money-back guarantee

#### Key Elements
- Three-layer visual system fully active
- Blurred report showing real structure
- Checkout form: card number, expiry, CVC
- CTA: "Unlock My 2026 Map" or "Get Full Access"
- Price + any discount/anchor
- Brief "what's included" list
- Trust indicators

#### Scroll Behavior (Optional Extended Pitch)
If user scrolls past checkout without purchasing:
- More detailed breakdown of what's included
- Testimonials/social proof
- Deeper feature explanations
- Second CTA at bottom

#### Transition
On successful payment → Screen 11

---

### SCREEN 11 — Purchase Confirmation + Full Reveal

#### Emotional Outcome
**Relief + Excitement + Satisfaction**
The tension releases. They got what they wanted. Immediate delivery of value validates their purchase.

#### Visual Elements
- Celebration moment (subtle — gold sparkles, confetti, glow — not cheesy)
- The blur LIFTS — report becomes fully visible
- Their 2026 map revealed in full
- Clear, readable presentation of all the information

#### Content Direction
- "Your 2026 Power Map is Unlocked"
- Deliver the actual content immediately
- Make the information scannable and clear
- Possibly: brief orientation ("Here's how to use your map...")

#### Key Elements
- Success message
- Full report revealed — no more blurs
- All sections now readable:
  - Power months with actual months shown
  - Power cities with actual city names
  - Avoid months/places
  - Month-by-month breakdown
- Option to save/download/access later
- Possibly: prompt to share or next steps

---

## Content & Copy Principles

### Voice Throughout
- Confident but not arrogant
- Mystical but grounded
- Personal ("your", "you") not generic
- Direct, not fluffy
- Modern, not new-age cliché

### Implicit Pain Threading
Throughout onboarding, weave in the cost of NOT knowing:
- "Most people plan their year blind"
- "Random travel vs. intentional travel"
- "Grinding vs. flowing"
- "Some years everything clicks, others feel like swimming upstream"

### Desire Connection
Tie features to real desires:
- Career momentum → "When to launch, pitch, negotiate"
- Love → "Where romance flows easier"
- Clarity → "When to make big decisions"
- Rest → "When forcing it backfires"

### Credibility Markers
Sprinkle in legitimacy:
- "Based on NASA-precision ephemeris data"
- "Swiss Ephemeris calculations"
- "Your exact birth coordinates"
- Avoid: "ancient wisdom" clichés unless balanced with science

---

## Technical Notes for Developer

### Map Component (Layer 1)
- Use existing Mapbox implementation
- Must persist in background during onboarding flow
- Needs opacity control (100% on reveal, ~20-30% during later screens)
- **Auto-animation on reveal:** Smooth pan/rotate across globe (~3-4 seconds)
  - Should show different regions where their lines cross
  - User does NOT interact — just watches
  - Animation completes, then triggers Screen 5 auto-advance
- Line highlight capability for onboarding animations

### Onboarding Panels (Layer 2)
- Slide-up animation from bottom
- Should cover ~70-80% of screen at rest
- Glassmorphism/translucent aesthetic
- Smooth transitions between panels
- Needs to coordinate with map highlights

### Blurred Report (Screen 10)
- Real content generated and rendered
- CSS blur filter on content areas
- Structure/layout visible, text/specifics blurred
- Blur intensity: enough to obscure, not enough to hide structure
- De-blur animation on purchase success

### Checkout Integration
- Payment form fields
- Connect to Stripe or preferred processor
- Success webhook to trigger Screen 11
- Error handling for failed payments

### Animation Timing
- Loading screens: 4-6 seconds
- Panel transitions: 300-400ms
- Map highlights: coordinate with panel exits/entries
- Blur lift: satisfying reveal animation (500ms+)

---

## Success Metrics

### Primary
- **Conversion Rate:** % of email captures that complete purchase
- **Target:** [To be determined based on price point]

### Secondary
- **Flow Completion:** % reaching Screen 10 (paywall)
- **Drop-off Points:** Which screens lose users
- **Time in Flow:** How long users spend (too short = not engaged, too long = friction)

---

## Open Questions / Decisions Needed

1. **Price point:** $27? $37? $47? Affects urgency tactics and pitch length needed
2. **Anchor pricing:** Show crossed-out higher price or not?
3. **One free reveal:** Give them one real insight (e.g., #1 power city) before paywall?
4. **Guarantee:** Money-back guarantee or no?
5. **Bonuses:** Any additional items included to increase perceived value?
6. **Urgency mechanism:** Time-limited pricing, natural 2026 urgency, or both?
7. **Testimonials:** Do we have them ready? Where do they live in the flow?

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial document |

---

*End of document*