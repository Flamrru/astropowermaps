# Reveal Flow: Complete Documentation

> **Purpose**: This document provides a comprehensive breakdown of the reveal flow — the 10-screen journey users experience after completing the quiz and entering their email. This flow bridges free content with paid conversion.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Flow Architecture](#flow-architecture)
3. [Screen 1: Birth Data Entry](#screen-1-birth-data-entry)
4. [Screen 2: Birth Chart Generation](#screen-2-birth-chart-generation)
5. [Screen 3: Map Reveal](#screen-3-map-reveal)
6. [Screen 4: Astrocartography Education](#screen-4-astrocartography-education)
7. [Screen 5: Planetary Lines Explained](#screen-5-planetary-lines-explained)
8. [Screen 6: Power Places & Timing](#screen-6-power-places--timing)
9. [Screen 7: The Pivot (2026 Teaser)](#screen-7-the-pivot-2026-teaser)
10. [Screen 8: 2026 Forecast Generation](#screen-8-2026-forecast-generation)
11. [Screen 9: Paywall](#screen-9-paywall)
12. [Screen 10: Confirmation](#screen-10-confirmation)
13. [Timing Reference](#timing-reference)
14. [Visual Design System](#visual-design-system)
15. [Component Reference: SlideUpPanel](#component-reference-slideuppanel)

---

## Executive Summary

### What Is the Reveal Flow?

The reveal flow is a 10-screen onboarding journey that:
1. **Collects birth data** to generate a personalized astrocartography map
2. **Educates users** about what astrocartography is and why it matters
3. **Builds anticipation** for their personalized 2026 forecast
4. **Converts users** with a $27 one-time purchase

### User Journey Overview

```
Quiz Complete → Email Captured → REVEAL FLOW BEGINS
                                        ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREEN 1: Birth Data Entry (Manual)                             │
│  User enters: Date, Time, Location                               │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREEN 2: Generation Loading (Auto - 5 seconds)                 │
│  "Calculating planetary positions at your birth..."              │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREEN 3: Map Reveal (Auto - animation completes)               │
│  Full-screen map with dramatic reveal animation                  │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREENS 4-6: Education Onboarding (Manual - user clicks)        │
│  SlideUpPanel cards teaching astrocartography concepts           │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREEN 7: The Pivot (Manual)                                    │
│  "But Here's the Thing..." - introduces 2026 forecast need       │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREEN 8: 2026 Generation Loading (Auto - 4 seconds)            │
│  "Scanning 2026 planetary alignments..."                         │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREEN 9: Paywall (Manual)                                      │
│  Blurred preview + $27 purchase offer                            │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│  SCREEN 10: Confirmation (After payment)                         │
│  Celebration + unlocked content revealed                         │
└──────────────────────────────────────────────────────────────────┘
```

### Quick Reference Table

| Screen | Name | Type | Duration | User Action |
|--------|------|------|----------|-------------|
| 1 | Birth Data Entry | Manual | Until submit | Fill form + tap "Generate" |
| 2 | Birth Chart Generation | Auto | 5 seconds minimum | Watch loading |
| 3 | Map Reveal | Auto | ~8-10 seconds | Watch animation |
| 4 | Astrocartography Education | Manual | User-controlled | Tap "Understand My Lines" |
| 5 | Planetary Lines Explained | Manual | User-controlled | Tap "See My Power Places" |
| 6 | Power Places & Timing | Manual | User-controlled | Tap "Continue" |
| 7 | The Pivot (2026 Teaser) | Manual | User-controlled | Tap "Generate My 2026 Map" |
| 8 | 2026 Forecast Generation | Auto | 4 seconds minimum | Watch loading |
| 9 | Paywall | Manual | User-controlled | Tap "Unlock My 2026 Map" + pay |
| 10 | Confirmation | Auto + Manual | 2s celebration | Tap "Explore Your Full Map" |

---

## Flow Architecture

### Background Map Behavior

The astrocartography map is always rendered behind the UI, but its opacity changes based on the current screen:

| Screen | Map Opacity | Reason |
|--------|-------------|--------|
| 1 (Birth Data) | 30% | Subtle background, focus on form |
| 2 (Generation) | 40% | Slightly more visible during loading |
| 3 (Map Reveal) | 100% | Full visibility for the reveal moment |
| 4-7 (Onboarding) | 25% | Dimmed behind SlideUpPanels |
| 8+ (Paywall) | 20% | Very dimmed, focus on purchase |

### Navigation

- **Back button**: Appears from Screen 2 onwards (top-left corner)
- **Progress bar**: Visible only during Screens 4-7 (onboarding education)
  - Screen 4: 0%
  - Screen 5: 33%
  - Screen 6: 67%
  - Screen 7: 100%

### Special Back Navigation Rules

- From Screen 4 → Goes to Screen 1 (skips loading screens)
- From Screen 9 (Paywall) → Goes to Screen 7 (can re-read pivot)
- All other screens → Goes to previous screen

---

## Screen 1: Birth Data Entry

### Purpose
Collect the user's birth information needed to calculate their personal astrocartography map.

### Visual Layout

```
┌─────────────────────────────────────┐
│           [Sparkle Icon]            │  ← Gold sparkle in rounded box
│                                     │
│    Map Your Birth Sky               │  ← Main heading (26px, bold)
│    We need your birth details...    │  ← Subheading (15px, white/60%)
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Calendar] Date of Birth    │    │  ← Form card with glass effect
│  │ ┌─────────────────────────┐ │    │
│  │ │ [Date picker input]     │ │    │
│  │ └─────────────────────────┘ │    │
│  │                             │    │
│  │ [Clock] Time of Birth       │    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ [Time picker input]     │ │    │
│  │ └─────────────────────────┘ │    │
│  │ ☐ I don't know my birth time│    │  ← Checkbox
│  │                             │    │
│  │ [MapPin] Birth City         │    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ Search for your birth...│ │    │  ← Location autocomplete
│  │ └─────────────────────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   Generate My Birth Chart   │    │  ← Gold button (full width)
│  └─────────────────────────────┘    │
│                                     │
│  Your data is used only to          │  ← Privacy note (12px, white/40%)
│  calculate your chart.              │
└─────────────────────────────────────┘
```

### All Copy/Text

**Header Icon Badge**: Sparkles icon (Lucide) in a gold gradient box with glow effect

**Main Heading**:
> Map Your **Birth Sky**

(Note: "Birth Sky" is in gold color)

**Subheading**:
> We need your birth details to calculate where your cosmic lines cross the Earth.

**Form Labels**:
1. `Date of Birth` (with Calendar icon, gold color)
2. `Time of Birth` (with Clock icon, gold color)
3. `Birth City` (with MapPin icon, gold color)

**Checkbox Label**:
> I don't know my birth time

**Time Window Helper** (appears when checkbox is checked):
> Do you remember approximately when?

**Time Window Options** (2x2 grid when birth time unknown):
| Option | Icon | Time Range |
|--------|------|------------|
| Morning | 🌅 | 6am - 12pm |
| Afternoon | ☀️ | 12pm - 6pm |
| Evening | 🌙 | 6pm - 12am |
| No idea | ✨ | Full day |

**Location Input Placeholder**:
> Search for your birth city...

**Button Text**:
> Generate My Birth Chart

**Privacy Note**:
> Your data is used only to calculate your chart.

**Validation Error Messages**:
- "Please enter your birth date"
- "Please enter your birth time"
- "Please select your birth city"

### Visual Elements

- **Form card**: Glassmorphism effect (5% white background, 20px blur, 8% white border)
- **Input fields**: 10% white background, 20% white border, rounded-xl corners
- **Error state**: Red border (red-400/50%) + red error text below field
- **Checkbox**: Custom styled, gold fill when checked with black checkmark
- **Time window buttons**: Highlighted with gold when selected

### Timing/Duration
- User-controlled (no auto-advance)
- Form fade-in animation: 0.5s total
  - Header icon: 0.2s delay
  - Form: 0.3s delay

### Progression Trigger
User submits valid form → advances to Screen 2

### Map State
- Opacity: 30%
- Interaction: Disabled (visual only)

---

## Screen 2: Birth Chart Generation

### Purpose
Display a premium loading experience while the birth chart API calculates the user's planetary lines. Creates anticipation through technical-sounding messages.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│      ✦              ✦               │  ← Decorative pulsing stars
│                                     │
│         ┌───────────────┐           │
│      ┌──┤   ○   ●   ○   ├──┐        │  ← Orbital animation
│      │  │   ◯       ◯   │  │        │     (3 rings + center)
│      │  │       ●       │  │        │
│      │  │   ◯       ◯   │  │        │
│      └──┤   ○   ●   ○   ├──┘        │
│         └───────────────┘           │
│                                     │
│    Calculating planetary            │  ← Rotating message (14px)
│    positions at your birth...       │
│                                     │
│    ┌────────────────────┐           │
│    │████████████░░░░░░░░│           │  ← Progress bar (gold gradient)
│    └────────────────────┘           │
│            67%                      │  ← Percentage (tabular-nums)
│                                     │
│      ✦              ✦               │  ← More decorative stars
└─────────────────────────────────────┘
```

### All Copy/Text

**Loading Messages** (rotate every 900ms):

1. > Converting birth time to UTC...
2. > Accessing planetary ephemeris database...
3. > Calculating planetary positions at your birth...
4. > Computing Earth's rotation at coordinates...
5. > Determining house cusps and angles...
6. > Mapping celestial bodies to geographic lines...
7. > Matching your lines to 100+ world cities...
8. > Rendering your personal birth sky...

**Progress Indicator**:
- Shows percentage: `0%` → `100%` (animated over 5 seconds)

### Visual Elements

**Orbital Animation** (centered, 128x128px):
- **Outer ring**: Rotates clockwise over 15 seconds, gold-25% opacity border
- **Middle ring**: Rotates counter-clockwise over 10 seconds, gold-35% opacity
- **Inner ring**: Rotates clockwise over 6 seconds, gold-50% opacity, 2px border
- **Center core**: Pulsing gold circle (20x20px), scales 1→1.2→1 over 2 seconds
- **Orbiting particles**: 3 small gold dots rotating at different speeds

**Decorative Stars** (4 total, positioned at corners):
- Pulse opacity 0.3→0.8→0.3 over 2 seconds
- Sizes: 1.5-2px
- Gold color with glow effect

**Card Container**:
- Rounded 3xl corners
- Background: 6% opacity dark (rgba(10, 10, 20, 0.6))
- Backdrop blur: 16px
- Border: 8% white
- Shadow: "0 20px 60px rgba(0, 0, 0, 0.3)"

**Progress Bar**:
- Container: 1.5px height, 10% white background, rounded-full
- Fill: Gold gradient (left to right: #8B6914 → #C9A227 → #E8C547)
- Glow: "0 0 10px rgba(201, 162, 39, 0.5)"

### Timing/Duration

- **Minimum duration**: 5 seconds (progress bar fills to 100%)
- **Message rotation**: Every 900ms (cycles through all 8 messages)
- **Auto-advance condition**: Progress reaches 100% AND API call completes
- **API being called**: `/api/astrocartography` (POST with birth data)

### Progression Trigger
Automatic when both conditions are met:
1. 5 seconds have elapsed
2. API response received

### Map State
- Opacity: 40%
- Interaction: Disabled

---

## Screen 3: Map Reveal

### Purpose
The dramatic reveal moment where the user sees their personal astrocartography map for the first time. The map performs an animated reveal sequence.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│     [Full Screen Map Animation]     │
│     (Planetary lines appearing,     │
│      camera flying to user's        │
│      birth location)                │
│                                     │
│                                     │
│                                     │
│                                     │
│    ─────────────────────────────    │  ← Gradient overlay (bottom)
│                                     │
│        Your Birth Chart             │  ← Main heading (32px, bold)
│                                     │     "Birth Chart" in gold
│    The sky at your birth —          │  ← Subheading (15px, white/70%)
│    mapped to Earth                  │
│                                     │
│    ══════════════════════           │  ← Decorative gold line
│                                     │
│           ● ● ●                     │  ← Auto-advance dots (pulsing)
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Main Heading**:
> Your **Birth Chart**

(Note: "Birth Chart" is in gold color)

**Subheading**:
> The sky at your birth — mapped to Earth

**Visual Only Elements**:
- Decorative gold gradient line (no text)
- Three pulsing dots indicating auto-advance (no text)

### Visual Elements

**Gradient Overlay** (bottom of screen):
- Covers bottom 40% of screen
- Gradient: Solid dark at bottom → transparent at top
- Allows text readability over map

**Decorative Line**:
- 96px width, 1px height
- Gold gradient: transparent → gold/60% → transparent
- Scales from 0 to 100% width (0.8s animation, 0.6s delay)

**Auto-Advance Indicator**:
- Three small dots (6px each)
- Pulse opacity 0.3→1→0.3 over 1.5 seconds
- Staggered delay: 0s, 0.2s, 0.4s per dot
- White at 60% opacity

**Text Shadow** (for readability):
- Heading: "0 0 40px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 0.5)"
- Subheading: "0 2px 10px rgba(0, 0, 0, 0.8)"

### Timing/Duration

- **Text appears**: After 2500ms (2.5 seconds) into the map animation
- **Heading animation**: 0.6s duration, 0.2s delay after text shows
- **Subheading animation**: 0.6s duration, 0.4s delay
- **Decorative line**: 0.8s scale animation, 0.6s delay
- **Auto-advance dots**: Appear after 1s delay, pulse continuously
- **Total screen duration**: ~8-10 seconds (controlled by map animation callback)

### Progression Trigger
Automatic when map animation completes (via `onAnimationComplete` callback from AstroMap component)

### Map State
- Opacity: 100% (full visibility)
- Interaction: Has `autoAnimation="reveal"` prop active
- Mode: Animated reveal sequence

---

## Screen 4: Astrocartography Education

### Purpose
First educational screen explaining what astrocartography is. Uses a SlideUpPanel component that slides up from the bottom of the screen.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│     [Map visible at 25% opacity]    │
│                                     │
├─────────────────────────────────────┤  ← SlideUpPanel (80% height)
│    ═══════════════════════════      │  ← Drag handle (gold gradient)
│                                     │
│           [Globe Icon]              │  ← Icon in gold gradient box
│                                     │
│   What Is Astrocartography?         │  ← Title (22px, bold)
│                                     │     "Astrocartography" in gold
│   Astrocartography maps the exact   │
│   positions of planets at your      │
│   birth moment onto Earth's         │
│   geography.                        │
│                                     │
│   Each line on your map represents  │
│   where a specific planet was       │
│   rising, setting, or at its peak   │  ← "rising, setting..." emphasized
│   at the moment you were born.      │
│                                     │
│   ┌─────────────────────────────┐   │  ← Gold callout box
│   │ ✦ These aren't random lines │   │
│   │ — they're calculated using  │   │
│   │ VSOP87 astronomical         │   │
│   │ algorithms, the same data   │   │
│   │ used by observatories       │   │
│   │ worldwide.                  │   │
│   └─────────────────────────────┘   │
│                                     │
│   Certain places on Earth resonate  │
│   with your specific birth energy.  │  ← "resonate with your..." in gold
│   When you travel to these          │
│   locations, you may notice life    │
│   flows differently.                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   Understand My Lines       │    │  ← Gold CTA button
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Title**:
> What Is **Astrocartography**?

(Note: "Astrocartography" is in gold color)

**Paragraph 1**:
> Astrocartography maps the exact positions of planets at your birth moment onto Earth's geography.

**Paragraph 2**:
> Each line on your map represents where a specific planet was **rising, setting, or at its peak** at the moment you were born.

(Note: "rising, setting, or at its peak" is emphasized in white/90%)

**Scientific Credibility Callout** (gold bordered box):
> These aren't random lines — they're calculated using VSOP87 astronomical algorithms, the same data used by observatories worldwide.

**Paragraph 3**:
> Certain places on Earth **resonate with your specific birth energy**. When you travel to these locations, you may notice life flows differently.

(Note: "resonate with your specific birth energy" is in gold)

**Button Text**:
> Understand My Lines

### Visual Elements

**Icon**: Globe (Lucide) in a 48x48px box with:
- Background: Gold gradient (135deg, gold-20% to gold-10%)
- Border: 1px solid gold-30%
- Box shadow: "0 0 30px rgba(201, 162, 39, 0.15)"

**Callout Box**:
- Background: Gold gradient (135deg, gold-10% to gold-5%)
- Border: 1px solid gold-20%
- Sparkles icon in gold (4x4, small)

**Map Highlight**: Sun, Moon, Venus lines pulse (benefic planets)

### Timing/Duration
- User-controlled
- Panel slides in with spring animation (damping: 28, stiffness: 300)
- Content fades in after 0.2s delay

### Progression Trigger
User taps "Understand My Lines" button

### Map State
- Opacity: 25%
- Highlight: Sun, Moon, Venus lines pulsing
- Interaction: Enabled (can see lines highlighted)

---

## Screen 5: Planetary Lines Explained

### Purpose
Teach the user about the three most beneficial planetary lines (Venus, Jupiter, Sun) and what each represents in their life.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│     [Map visible at 25% opacity]    │
│     [Venus line highlighted]        │
│                                     │
├─────────────────────────────────────┤  ← SlideUpPanel (80% height)
│    ═══════════════════════════      │
│                                     │
│   Your Planetary Lines              │  ← Title (22px, bold)
│                                     │     "Planetary Lines" in gold
│   Each line represents different    │  ← Subtitle (14px, white/50%)
│   life energies                     │
│                                     │
│   ┌─────────────────────────────┐   │  ← Venus card
│   │ [♀]  Venus Line             │   │     Pink icon box (#E8A4C9)
│   │      Where love, beauty,    │   │
│   │      and creativity flow    │   │
│   │      easier.                │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │  ← Jupiter card
│   │ [♃]  Jupiter Line           │   │     Purple icon box (#9B7ED9)
│   │      Where luck, expansion, │   │
│   │      and opportunity are    │   │
│   │      amplified.             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │  ← Sun card
│   │ [☉]  Sun Line               │   │     Gold icon box (#FFD700)
│   │      Where you feel most    │   │
│   │      yourself — vital and   │   │
│   │      confident.             │   │
│   └─────────────────────────────┘   │
│                                     │
│   You have 40 lines total —         │  ← Note (12px, white/40%)
│   10 planets × 4 angles each        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   See My Power Places       │    │  ← Gold CTA button
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Title**:
> Your **Planetary Lines**

(Note: "Planetary Lines" is in gold color)

**Subtitle**:
> Each line represents different life energies

**Line Type Cards**:

| Line | Symbol | Description |
|------|--------|-------------|
| Venus Line | ♀ | Where love, beauty, and creativity flow easier. |
| Jupiter Line | ♃ | Where luck, expansion, and opportunity are amplified. |
| Sun Line | ☉ | Where you feel most yourself — vital and confident. |

**Footer Note**:
> You have 40 lines total — 10 planets × 4 angles each

**Button Text**:
> See My Power Places

### Visual Elements

**Line Cards**:
- Background: 5% white (rgba(255, 255, 255, 0.05))
- Border: 1px solid [planet color at 30% opacity]
- Rounded corners: xl (12px)
- Staggered animation: 0.3s delay + 0.1s per card

**Planet Icon Boxes** (36x36px, rounded-lg):

| Planet | Background | Border | Text Color |
|--------|------------|--------|------------|
| Venus | #E8A4C9 at 25%→10% gradient | #E8A4C9 at 40% | #E8A4C9 |
| Jupiter | #9B7ED9 at 25%→10% gradient | #9B7ED9 at 40% | #9B7ED9 |
| Sun | #FFD700 at 25%→10% gradient | #FFD700 at 40% | #FFD700 |

**Map Highlight**: Only Venus line pulsing

### Timing/Duration
- User-controlled
- Cards animate in with staggered delay (0.3s + index × 0.1s)

### Progression Trigger
User taps "See My Power Places" button

### Map State
- Opacity: 25%
- Highlight: Venus line only (pulsing)

---

## Screen 6: Power Places & Timing

### Purpose
Show the user their top 3 personalized power places and introduce the concept that timing matters — setting up the pivot to 2026.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│     [Map visible at 25% opacity]    │
│     [Top power city highlighted]    │
│                                     │
├─────────────────────────────────────┤  ← SlideUpPanel (80% height)
│    ═══════════════════════════      │
│                                     │
│       Places & Timing               │  ← Title (24px, bold)
│                                     │     "Timing" in gold
│   Where your lines cross            │  ← Subtitle (14px, white/50%)
│   major cities                      │
│                                     │
│   ┌─────────────────────────────┐   │  ← Gold bordered box
│   │ [MapPin] Your Power Places  │   │
│   │                             │   │
│   │ Barcelona, Spain     Love   │   │  ← Dynamic: User's real cities
│   │ ─────────────────────────── │   │
│   │ Tokyo, Japan        Career  │   │
│   │ ─────────────────────────── │   │
│   │ Austin, USA         Growth  │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Calendar] Timing Matters Too     │  ← Section header
│                                     │
│   The planets didn't stop moving    │
│   after you were born. Some months  │
│   are better for action, others     │
│   for rest.                         │
│                                     │
│   ┌─────────────────────────────┐   │  ← Quote box (darker)
│   │ ✦ "You've probably had      │   │
│   │    trips that changed       │   │
│   │    something in you. And    │   │
│   │    trips that were just...  │   │
│   │    nice. The difference     │   │
│   │    might be in your lines   │   │
│   │    — and your timing."      │   │
│   └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │       Continue              │    │  ← Gold CTA button
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Title**:
> Places & **Timing**

(Note: "Timing" is in gold color)

**Subtitle**:
> Where your lines cross major cities

**Power Places Section Header**:
> [MapPin icon] Your Power Places

**Power Places List** (DYNAMIC - user's actual calculated cities):
Format: `[City], [Country]` + `[Category]`

Example output:
- Barcelona, Spain → Love
- Tokyo, Japan → Career
- Austin, USA → Growth

**Fallback if calculation fails**:
> Your power places will be calculated...

**Timing Section Header**:
> [Calendar icon] Timing Matters Too

**Timing Explanation**:
> The planets didn't stop moving after you were born. Some months are better for action, others for rest.

**Reflective Quote** (italicized):
> "You've probably had trips that changed something in you. And trips that were just... nice. The difference might be in your lines — and your timing."

**Button Text**:
> Continue

### Visual Elements

**Power Places Box**:
- Background: Gold gradient (135deg, gold-10% to gold-5%)
- Border: 1px solid gold-20%
- MapPin icon in gold

**Power Place Rows**:
- Bottom border: 5% white (except last row)
- City/Country: white/80%
- Category label: white/40%, capitalized

**Quote Box**:
- Background: 3% white (very subtle)
- Border: 8% white
- Sparkles icon in gold/70%
- Text is italicized

**Map Highlight**: User's #1 power city (pulsing marker)

### Timing/Duration
- User-controlled
- Content fades in after 0.2s delay

### Progression Trigger
User taps "Continue" button

### Map State
- Opacity: 25%
- Highlight: Top power city (kind: "city", pulsing)

---

## Screen 7: The Pivot (2026 Teaser)

### Purpose
The critical pivot point that transitions from free value (birth chart) to paid value (2026 forecast). Uses psychological hooks like "But Here's the Thing..." to create a pattern interrupt.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│     [Map visible at 25% opacity]    │
│                                     │
├─────────────────────────────────────┤  ← SlideUpPanel (90% height)
│    ═══════════════════════════      │
│                                     │
│           [Clock Icon]              │  ← Icon in gold gradient circle
│                                     │
│     But Here's the Thing...         │  ← Title (26px, bold)
│                                     │
│   ┌─────────────────────────────┐   │  ← Callout box (grey-blue)
│   │ This birth chart is a       │   │
│   │ snapshot.                   │   │     "snapshot" in gold
│   │                             │   │
│   │ It shows your cosmic        │   │
│   │ blueprint — where your      │   │
│   │ energies are strongest.     │   │
│   │ But the planets didn't      │   │
│   │ stop moving after you       │   │
│   │ were born.                  │   │
│   └─────────────────────────────┘   │
│                                     │
│   [⚡] The sky keeps moving         │  ← Section with Zap icon
│                                     │
│   In 2026, planets will form        │
│   new angles with your birth        │
│   chart. Some months will           │
│   supercharge your power places.    │
│   Others will require patience.     │
│                                     │
│   ┌─────────────────────────────┐   │  ← Gold bordered box
│   │     What about 2026?        │   │     Gold text, bold
│   │                             │   │
│   │  Where should you be?       │   │
│   │  When should you move?      │   │
│   │                             │   │
│   │  For that, you need your    │   │
│   │  2026 transits.             │   │     "2026 transits" emphasized
│   └─────────────────────────────┘   │
│                                     │
│   You said you want 2026 to be      │  ← Personalized hook
│   about growth...                   │     User's quiz answer in gold
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Generate My 2026 Map  →    │    │  ← Gold CTA button
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Icon**: Clock (Lucide) in gold gradient circle

**Title**:
> But Here's the Thing...

**Snapshot Callout** (grey-blue box):
> This birth chart is a **snapshot**.
>
> It shows your cosmic blueprint — where your energies are strongest. But the planets didn't stop moving after you were born.

(Note: "snapshot" is in gold)

**Section Header**:
> [Zap icon] **The sky keeps moving**

**Explanation**:
> In 2026, planets will form new angles with your birth chart. Some months will supercharge your power places. Others will require patience.

**Key Question Box** (gold bordered):
> **What about 2026?**
>
> Where should you be? When should you move?
>
> For that, you need your **2026 transits**.

(Note: "What about 2026?" is in gold and bold)

**Personalized Hook** (DYNAMIC):
> You said you want 2026 to be about **[userFocus]**...

(Note: `userFocus` comes from the user's quiz answer to Q2. If empty, defaults to "growth")

**Button Text**:
> Generate My 2026 Map →

(Note: Includes ArrowRight icon)

### Visual Elements

**Clock Icon Container** (64x64px, rounded-full):
- Background: Gold gradient (135deg, gold-20% to gold-10%)
- Border: 1px solid gold-30%
- Box shadow: "0 0 40px rgba(201, 162, 39, 0.2)"

**Snapshot Callout Box**:
- Background: Grey-blue gradient (135deg, rgba(100, 100, 150, 0.15) to rgba(60, 60, 100, 0.1))
- Border: 1px solid white/10%

**Zap Icon Container** (40x40px, rounded-xl):
- Background: gold-15%
- Border: 1px solid gold-30%

**Key Question Box**:
- Background: Gold gradient (135deg, gold-15% to gold-8%)
- Border: 1px solid gold-25%
- Box shadow: "0 0 40px rgba(201, 162, 39, 0.1)"

**Personalized Hook**:
- Fades in after 0.8s delay
- Text: white/50%
- User's focus word: gold color

### Timing/Duration
- User-controlled
- This is the longest onboarding screen (most copy)
- Panel height: 90% (taller than other onboarding screens)
- Personalized hook fades in after 0.8s

### Progression Trigger
User taps "Generate My 2026 Map" button

### Map State
- Opacity: 25%
- No specific highlight active

---

## Screen 8: 2026 Forecast Generation

### Purpose
Second loading screen that generates the 2026 forecast data. Shorter than Screen 2 and uses 2026-specific messaging.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│         ┌───────────┐               │  ← "2026" badge (gold)
│         │   2026    │               │
│         └───────────┘               │
│                                     │
│           ┌─────────┐               │  ← Smaller orbital animation
│        ┌──┤    ●    ├──┐            │
│        │  │         │  │            │
│        └──┤    ●    ├──┘            │
│           └─────────┘               │
│                                     │
│     Finding your power months...    │  ← Rotating message (14px)
│                                     │
│     ┌────────────────────┐          │
│     │████████████░░░░░░░░│          │  ← Progress bar
│     └────────────────────┘          │
│              78%                    │
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Badge Text**:
> 2026

**Loading Messages** (rotate every 800ms):

1. > Scanning 2026 planetary alignments...
2. > Finding your power months...
3. > Calculating transit intensities...
4. > Mapping optimal timing windows...
5. > Generating your year ahead...

**Progress Indicator**:
- Shows percentage: `0%` → `100%` (animated over 4 seconds)

### Visual Elements

**2026 Badge**:
- Background: Gold gradient (135deg, gold-20% to gold-10%)
- Border: 1px solid gold-30%
- Rounded-full (pill shape)
- Text: gold, 15px, semibold

**Orbital Animation** (smaller than Screen 2, 96x96px):
- **Outer ring**: Rotates clockwise over 10 seconds, gold-30% border
- **Inner ring**: Rotates counter-clockwise over 6 seconds, gold-50%, 2px border
- **Center core**: Pulsing (16x16px), scales 1→1.3→1 over 1.5 seconds

**Card Container**:
- Background: 7% opacity dark (rgba(10, 10, 20, 0.7))
- Backdrop blur: 20px
- Border: 10% white
- Shadow: "0 20px 60px rgba(0, 0, 0, 0.4)"

### Timing/Duration

- **Minimum duration**: 4 seconds (1 second shorter than Screen 2)
- **Message rotation**: Every 800ms (slightly faster than Screen 2)
- **Auto-advance condition**: Progress reaches 100% AND forecast data generated
- **Simulated API**: Currently generates mock data with 1500ms delay

### Progression Trigger
Automatic when both conditions are met:
1. 4 seconds have elapsed
2. Forecast data generated (currently mock data)

### Map State
- Opacity: 20% (more dimmed)
- No highlight active

---

## Screen 9: Paywall

### Purpose
The conversion screen. Shows a blurred preview of the 2026 report to demonstrate value, then presents the $27 offer with clear benefits.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│     [Map visible at 20% opacity]    │
│                                     │
│  ┌─────────────────────────────┐    │  ← Dark card (blurred preview)
│  │ Your 2026 Power Report [🔒] │    │
│  │                             │    │
│  │ [Calendar] Your 3 Power     │    │
│  │ Months                      │    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ #1  ████████  Peak energy│ │    │  ← Blurred month
│  │ │ #2  ████████  Peak energy│ │    │
│  │ │ #3  ████████  Peak energy│ │    │
│  │ └─────────────────────────┘ │    │
│  │                             │    │
│  │ [MapPin] Your 3 Power       │    │
│  │ Cities                      │    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ #1  ██████████   Career │ │    │  ← Blurred city
│  │ │ #2  ██████████   Growth │ │    │
│  │ │ #3  ██████████   Love   │ │    │
│  │ └─────────────────────────┘ │    │
│  │                             │    │
│  │ ┌─────────────────────────┐ │    │  ← Red warning box
│  │ │ Months to avoid major   │ │    │
│  │ │ decisions: ██████████   │ │    │
│  │ └─────────────────────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │  ← Gold checkout card
│  │                             │    │
│  │   Unlock Your 2026 Map      │    │
│  │                             │    │
│  │         $27                 │    │  ← Large gold price
│  │       one-time              │    │
│  │                             │    │
│  │ ✓ Your 3 power months —     │    │
│  │   when to move, launch,     │    │
│  │   decide                    │    │
│  │ ✓ Your 3 power cities —     │    │
│  │   where to travel for       │    │
│  │   breakthroughs             │    │
│  │ ✓ Months to avoid — when    │    │
│  │   to rest, not force        │    │
│  │ ✓ Month-by-month energy     │    │
│  │   forecast                  │    │
│  │                             │    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ 🔒 Unlock My 2026 Map   │ │    │  ← CTA button
│  │ └─────────────────────────┘ │    │
│  │                             │    │
│  │  [Shield] Secure   [Zap]    │    │  ← Trust indicators
│  │   payment     Instant access│    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│   2026 is just around the corner    │  ← Urgency note (12px)
│   — your first power window might   │
│   be January                        │
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Preview Card Header**:
> Your 2026 Power Report [Lock icon]

**Power Months Section**:
> [Calendar icon] Your 3 Power Months

**Power Month Items** (BLURRED):
Format: `#[1-3] [Month] 2026` — `Peak energy`

Example (values are blurred):
- #1 Mar 2026 — Peak energy
- #2 Jul 2026 — Peak energy
- #3 Oct 2026 — Peak energy

**Power Cities Section**:
> [MapPin icon] Your 3 Power Cities

**Power City Items** (BLURRED):
Format: `#[1-3] [City]` — `[Category]`

Fallback cities if no data:
- #1 Barcelona — Career
- #2 Tokyo — Growth
- #3 Miami — Love

**Months to Avoid** (red warning box, BLURRED):
> Months to avoid major decisions: Feb, Jun, Nov

---

**Checkout Card Title**:
> Unlock Your 2026 Map

**Price**:
> **$27** one-time

(Note: "$27" is large gold text, "one-time" is smaller grey text)

**What's Included** (4 bullet points with checkmarks):

1. > Your 3 power months — when to move, launch, decide

2. > Your 3 power cities — where to travel for breakthroughs

3. > Months to avoid — when to rest, not force

4. > Month-by-month energy forecast

**Button Text**:
> [Lock icon] Unlock My 2026 Map

**Trust Indicators**:
- [Shield icon] Secure payment
- [Zap icon] Instant access

**Urgency Note** (below card):
> 2026 is just around the corner — your first power window might be January

### Visual Elements

**Blurred Preview Card**:
- Background: 90% opacity dark (rgba(10, 10, 25, 0.9))
- Backdrop blur: 20px
- Border: 10% white
- Blur on text: 6px (CSS blur filter)
- Text is also `select-none` (cannot be copied)

**Preview Rows**:
- Background: 5% white
- Rounded-lg corners
- Gold numbered badges (#1, #2, #3)

**Red Warning Box**:
- Background: rgba(255, 100, 100, 0.1)
- Border: 1px solid rgba(255, 100, 100, 0.2)

**Checkout Card**:
- Background: Gold gradient (135deg, gold-15% to gold-8%)
- Border: 1px solid gold-30%
- Box shadow: "0 0 50px rgba(201, 162, 39, 0.1)"

**Trust Indicators**:
- Shield and Zap icons at 12px
- Text: white/40%, 12px

### Timing/Duration
- User-controlled
- Card animations: Staggered entrance (0.2s delay on checkout card)
- After clicking button: Shows Stripe checkout form inline

### Progression Trigger
User completes Stripe payment → Redirects to `/map?payment=success` (skips Screen 10 in current flow)

### Back Navigation
Goes to Screen 7 (pivot) — allows user to re-read the value proposition

### Map State
- Opacity: 20% (very dimmed)
- No highlight active

---

## Screen 10: Confirmation

### Purpose
Post-purchase celebration and revelation of the unlocked content. Shows the actual (non-blurred) 2026 forecast data.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│    ╔═══════════════════════════╗    │  ← Celebration overlay (1.5s)
│    ║                           ║    │
│    ║      [Gold Checkmark]     ║    │
│    ║                           ║    │
│    ║    Your Map is Ready!     ║    │
│    ║                           ║    │
│    ╚═══════════════════════════╝    │
│                                     │
│  (Overlay fades out after 1.5s)     │
│                                     │
├─────────────────────────────────────┤  (Main content appears at 2s)
│                                     │
│       ┌───────────────┐             │
│       │ ✦ Unlocked    │             │  ← Green badge
│       └───────────────┘             │
│                                     │
│     Your 2026 Power Map             │  ← Title (24px, bold)
│     Your personalized cosmic        │  ← Subtitle (14px, white/50%)
│     timing guide                    │
│                                     │
│  ┌─────────────────────────────┐    │  ← Gold bordered card
│  │ [Calendar] Your 3 Power     │    │
│  │ Months                      │    │
│  │                             │    │
│  │ [1] March 2026              │    │  ← REVEALED (not blurred!)
│  │     Peak energy window      │    │
│  │                             │    │
│  │ [2] July 2026               │    │
│  │     Peak energy window      │    │
│  │                             │    │
│  │ [3] October 2026            │    │
│  │     Peak energy window      │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │  ← Power cities card
│  │ [MapPin] Your 3 Power       │    │
│  │ Cities                      │    │
│  │                             │    │
│  │ [1] Barcelona, Spain        │    │
│  │         Career              │    │  ← Category in gold
│  │ [2] Tokyo, Japan            │    │
│  │         Growth              │    │
│  │ [3] Austin, USA             │    │
│  │         Love                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │  ← Red warning box
│  │ ⚠ Months to avoid major     │    │
│  │   decisions                 │    │
│  │                             │    │
│  │   February, June,           │    │
│  │   November 2026             │    │
│  │                             │    │
│  │   Good for rest, reflection,│    │
│  │   and tying up loose ends   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [MapPin] Explore Your       │    │  ← Gold CTA button
│  │          Full Map           │    │
│  └─────────────────────────────┘    │
│                                     │
│  Your map is saved to your account. │  ← Note (12px, white/40%)
│  Check your email for a copy.       │
│                                     │
└─────────────────────────────────────┘
```

### All Copy/Text

**Celebration Overlay**:
> Your Map is Ready!

**Unlocked Badge**:
> [Sparkles icon] Unlocked

(Green badge with sparkles)

**Title**:
> Your 2026 Power Map

**Subtitle**:
> Your personalized cosmic timing guide

**Power Months Section Header**:
> [Calendar icon] Your 3 Power Months

**Power Month Items** (REVEALED - full month names):
Format: `[#] [Full Month Name] 2026` — `Peak energy window`

Example:
- [1] March 2026 — Peak energy window
- [2] July 2026 — Peak energy window
- [3] October 2026 — Peak energy window

**Power Cities Section Header**:
> [MapPin icon] Your 3 Power Cities

**Power City Items** (REVEALED):
Format: `[#] [City], [Country]` — `[Category]`

Example:
- [1] Barcelona, Spain — Career
- [2] Tokyo, Japan — Growth
- [3] Austin, USA — Love

**Months to Avoid Section** (red box):
> [Alert icon] Months to avoid major decisions
>
> February, June, November 2026
>
> Good for rest, reflection, and tying up loose ends

**Button Text**:
> [MapPin icon] Explore Your Full Map

**Footer Note**:
> Your map is saved to your account. Check your email for a copy.

### Visual Elements

**Celebration Overlay**:
- Full screen with radial gradient (gold center → dark edges)
- Gold checkmark in 80x80px circle
- Spring animation (damping: 15, stiffness: 200)
- Fades out after 1.5 seconds

**Unlocked Badge**:
- Background: Green gradient (135deg, green-20% to green-10%)
- Border: 1px solid green-30%
- Sparkles icon in green-400
- Text: green-400

**Power Months Card**:
- Background: Gold gradient (135deg, gold-12% to gold-6%)
- Border: 1px solid gold-25%
- Numbered circles: Gold gradient fill, dark text

**Power Cities Card**:
- Background: 4% white
- Border: 10% white
- Category labels: gold/80%

**Months to Avoid Box**:
- Background: rgba(255, 100, 100, 0.08)
- Border: 1px solid rgba(255, 100, 100, 0.2)
- Alert icon: red-400/80%

### Timing/Duration

**Animation Sequence**:
1. **0ms**: Screen loads, celebration overlay visible
2. **1500ms**: Celebration fades out
3. **2000ms**: Main content fades in
4. **500ms + i×150ms**: Power months items stagger in
5. **800ms + i×150ms**: Power cities items stagger in
6. **1000ms**: Months to avoid section appears
7. **1200ms**: CTA button appears

### Progression Trigger
User taps "Explore Your Full Map" → Redirects to `/map`

### Map State
- Not visible (content takes full screen)

---

## Timing Reference

### Loading Screen Timings

| Screen | Minimum Duration | Message Rotation | Progress Update |
|--------|------------------|------------------|-----------------|
| 2 (Birth Chart) | 5000ms | Every 900ms | Every 50ms |
| 8 (2026 Forecast) | 4000ms | Every 800ms | Every 50ms |

### Animation Delays by Screen

| Screen | Element | Delay |
|--------|---------|-------|
| 1 | Header icon | 0.2s |
| 1 | Form card | 0.3s |
| 3 | Text overlay | 2.5s (after map starts) |
| 3 | Subheading | +0.2s from heading |
| 3 | Decorative line | +0.6s from heading |
| 3 | Auto-advance dots | +1.0s from text |
| 4-7 | Panel content | 0.2s |
| 5 | Line cards | 0.3s + (index × 0.1s) |
| 7 | Personalized hook | 0.8s |
| 9 | Checkout card | 0.2s |
| 10 | Celebration | 0ms (immediate) |
| 10 | Celebration fade | 1.5s |
| 10 | Content appear | 2.0s |
| 10 | Power months items | 0.5s + (index × 0.15s) |
| 10 | Power cities items | 0.8s + (index × 0.15s) |
| 10 | Avoid months | 1.0s |
| 10 | CTA button | 1.2s |

### Auto-Advance Conditions

| Screen | Condition 1 | Condition 2 | Both Required? |
|--------|-------------|-------------|----------------|
| 2 | 5s elapsed | API complete | Yes |
| 3 | Map animation done | N/A | N/A |
| 8 | 4s elapsed | Forecast generated | Yes |

---

## Visual Design System

### Color Palette

**Gold Colors** (Primary brand):
- Light Gold: `#E8C547`
- Medium Gold: `#C9A227`
- Dark Gold: `#8B6914`
- Gold at 10%: `rgba(201, 162, 39, 0.1)`
- Gold at 20%: `rgba(201, 162, 39, 0.2)`

**Backgrounds**:
- Card Dark: `rgba(10, 10, 20, 0.6)` to `rgba(10, 10, 25, 0.9)`
- Panel Gradient: `rgba(12, 12, 28, 0.97)` → `rgba(8, 8, 20, 0.98)` → `rgba(5, 5, 16, 0.99)`

**Text Colors**:
- Primary: `white` (100%)
- Secondary: `white/80%` (rgba(255, 255, 255, 0.8))
- Tertiary: `white/60%`
- Muted: `white/40%`
- Disabled: `white/30%`

**Accent Colors**:
- Venus Pink: `#E8A4C9`
- Jupiter Purple: `#9B7ED9`
- Sun Gold: `#FFD700`
- Success Green: `rgb(76, 175, 80)`
- Error Red: `rgba(255, 100, 100, *)`

### Typography Sizes

| Element | Size | Weight |
|---------|------|--------|
| Main heading (Screen 1, 3) | 26-32px | Bold |
| Section heading (Panels) | 22-24px | Bold |
| Body text | 14-15px | Regular |
| Small text | 12-13px | Regular |
| Button text | 16px | Semibold |
| Progress percentage | 12px | Regular (tabular-nums) |

### Border Radii

| Element | Radius |
|---------|--------|
| Cards | 2xl (24px) or 3xl (32px) |
| Buttons | xl (12px) |
| Input fields | xl (12px) |
| Icon containers | lg (8px) to 2xl (16px) |
| Progress bars | full (9999px) |
| SlideUpPanel top | 2rem (32px) |

### Shadows

**Card shadow**:
```css
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
```

**Gold glow**:
```css
box-shadow: 0 0 30px rgba(201, 162, 39, 0.2);
```

**Progress bar glow**:
```css
box-shadow: 0 0 10px rgba(201, 162, 39, 0.5);
```

### Gradients

**Gold button gradient**:
```css
background: linear-gradient(135deg, #E8C547, #C9A227);
```

**Progress bar gradient**:
```css
background: linear-gradient(90deg, #8B6914, #C9A227, #E8C547);
```

**Gold accent line**:
```css
background: linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.5), transparent);
```

---

## Component Reference: SlideUpPanel

### What It Is
A reusable bottom sheet component used for Screens 4-7 (and referenced in Screen 9). Slides up from the bottom of the screen with premium glassmorphism styling.

### Visual Characteristics

**Container**:
- Rounded top corners: 2rem (32px)
- Background: Three-layer gradient (dark blue tones)
- Backdrop blur: 24px
- Border: 1px solid white/6%
- Shadow: Multiple layers including gold accent glow

**Golden Accent Line**:
- Position: Top center
- Width: 128px (w-32)
- Height: 1px
- Gradient: transparent → gold/50% → transparent

**Drag Handle**:
- Position: Top center, below accent line
- Width: 48px (expands to 56px on hover, 64px on tap)
- Height: 4px
- Gradient: Gold tones

**Bottom Fade**:
- Height: 64px (h-16)
- Gradient: Solid dark at bottom → transparent at top
- Purpose: Indicates scrollable content

### Height Options

| Value | Actual Height |
|-------|---------------|
| "70%" | 70dvh |
| "80%" | 80dvh (default) |
| "90%" | 90dvh |
| "100%" | 100dvh |

### Drag-to-Dismiss Behavior

When `onBack` prop is provided:
- User can drag the panel downward
- Dismisses if: `offset.y > 120px` OR `velocity.y > 600px/s`
- Elastic drag: 40% at bottom edge

### Animation

**Entry**:
```javascript
initial: { y: "100%", opacity: 0 }
animate: { y: 0, opacity: 1 }
transition: { type: "spring", damping: 28, stiffness: 300 }
```

**Exit**:
```javascript
exit: { y: "100%", opacity: 0 }
```

### Usage in Reveal Flow

| Screen | Height | Has onBack |
|--------|--------|------------|
| 4 (Education) | 80% | No |
| 5 (Lines) | 80% | No |
| 6 (Places) | 80% | No |
| 7 (Pivot) | 90% | No |

---

## Summary for Copywriters

### Key Psychological Flow

1. **Build Trust** (Screens 1-3): Collect data, show impressive loading, reveal personalized map
2. **Educate** (Screens 4-6): Explain what they're seeing, make it feel valuable and scientific
3. **Create FOMO** (Screen 7): "But here's the thing..." — introduce the limitation and the solution
4. **Demonstrate Value** (Screen 8): Build anticipation with 2026-specific loading
5. **Convert** (Screen 9): Show blurred preview (prove it exists) + clear benefits + low price
6. **Celebrate** (Screen 10): Reinforce purchase decision, deliver promised value

### Copy Principles Used

- **Technical credibility**: "VSOP87 astronomical algorithms"
- **Personalization**: User's quiz answers referenced, actual calculated cities
- **Scarcity/Timing**: "2026 is just around the corner"
- **Pattern interrupt**: "But Here's the Thing..."
- **Social proof by association**: "same data used by observatories worldwide"
- **Loss aversion**: Blurred preview shows what they'd miss

### Tone

- Premium and mystical, but grounded in science
- Direct and clear in CTAs
- Never salesy or pushy — let the product demonstrate value
- Gold color = special/valuable (used strategically)
