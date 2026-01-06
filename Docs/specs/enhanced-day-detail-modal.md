# Enhanced Day Detail Modal - Feature Spec

## Overview
Transform the basic day detail modal into a rich, personalized cosmic insight experience with tabbed navigation.

---

## Requirements Summary

### Core Experience
| Aspect | Decision |
|--------|----------|
| **Depth** | Medium detail (~30 second read) |
| **Personalization** | Fully personalized to user's birth chart |
| **User Level** | Progressive disclosure - simple first, tap for more |
| **Visual Focus** | Score-first design |

### Content Scope
| Feature | Details |
|---------|---------|
| **Planets tracked** | Core 5 (Sun, Moon, Mercury, Venus, Mars) + Outer (Jupiter, Saturn) |
| **Transit display** | Top 2-3 most significant, "See more" for rest |
| **Aspect format** | Symbols + English ("☉ △ ♃ Sun trine Jupiter") |
| **Activities** | Best For list + Avoid list |
| **Rituals** | AI-generated, pre-cached daily |
| **Timing windows** | Skipped for V1 |

### UI/UX Decisions
| Aspect | Decision |
|--------|----------|
| **Layout** | Tabbed view with 4 tabs |
| **Tab names** | Energy \| Cosmos \| Actions \| Soul |
| **Empty days** | Minimal view (score + moon only) |
| **Actions** | View only + "Ask Stella" button |

---

## Tab Structure

### Tab 1: Energy (Overview)
The hero tab - first thing users see.

```
┌─────────────────────────────────────────┐
│  Saturday, January 4                    │
│                                         │
│        ┌─────────────┐                  │
│        │     78      │                  │
│        │   ────────  │  ← Big score     │
│        │  HIGH POWER │                  │
│        └─────────────┘                  │
│                                         │
│  "Jupiter amplifies your confidence     │
│   while Venus softens interactions"     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🌔 Waxing Gibbous in Scorpio    │   │
│  │ Deep emotions, transformation    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [💬 Ask Stella about this day]        │
└─────────────────────────────────────────┘
```

**Content:**
- Large score display (0-100 scale)
- Score label (Power Day / Balanced / Rest Day)
- 1-2 sentence personalized summary
- Moon phase + sign with brief meaning
- "Ask Stella" button

---

### Tab 2: Cosmos (Transits)
The astrological details for curious users.

```
┌─────────────────────────────────────────┐
│  ACTIVE TRANSITS                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ☉ △ ♃                           │   │
│  │ Sun trine your Jupiter          │   │
│  │ ─────────────────────────────── │   │
│  │ Expansion, optimism, confidence │   │
│  │ boosted today. Good for bold    │   │
│  │ moves and big-picture thinking. │   │
│  │                     [Tap for more]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ♀ ☌ ☿                           │   │
│  │ Venus conjunct your Mercury     │   │
│  │ ─────────────────────────────── │   │
│  │ Sweet words flow easily.        │   │
│  │ Great for heartfelt talks.      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [See 3 more transits ↓]               │
└─────────────────────────────────────────┘
```

**Content:**
- Top 2-3 significant transits by default
- Each transit shows:
  - Aspect symbols (☉ △ ♃)
  - Plain English label ("Sun trine your Jupiter")
  - 2-3 sentence interpretation
  - Expandable for deeper explanation
- "See more" to reveal additional transits

---

### Tab 3: Actions (Activities)
Practical guidance for the day.

```
┌─────────────────────────────────────────┐
│  ✨ BEST FOR TODAY                      │
│                                         │
│  • Starting new creative projects       │
│  • Important conversations              │
│  • Networking and social events         │
│  • Making bold decisions                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ⚠️ APPROACH WITH CARE                  │
│                                         │
│  • Major financial commitments          │
│  • Rushing through details              │
│  • Ignoring your intuition              │
│                                         │
└─────────────────────────────────────────┘
```

**Content:**
- 3-4 "Best For" activities (green accent)
- 2-3 "Approach with Care" items (amber accent)
- Derived from active transits + moon phase

---

### Tab 4: Soul (Rituals)
AI-generated personalized practices.

```
┌─────────────────────────────────────────┐
│  🕯️ TODAY'S PRACTICE                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Jupiter Expansion Ritual        │   │
│  │                                  │   │
│  │  With Sun trine your Jupiter,   │   │
│  │  this is a day to dream big.    │   │
│  │                                  │   │
│  │  Take 5 minutes to:             │   │
│  │  1. Write down 3 things you     │   │
│  │     want to expand in your life │   │
│  │  2. Speak them aloud            │   │
│  │  3. Feel the possibility        │   │
│  │                                  │   │
│  │  Best done: Morning, facing     │   │
│  │  sunlight if possible           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ✦ Journaling Prompt                   │
│  "What would I do if I knew I          │
│   couldn't fail?"                       │
│                                         │
└─────────────────────────────────────────┘
```

**Content:**
- AI-generated ritual based on day's transits
- Includes:
  - Ritual name
  - Context (why this ritual today)
  - Steps (actionable)
  - Timing suggestion
- Journaling prompt

---

## Technical Implementation

### Data Structure

```typescript
interface EnhancedDayData {
  date: string;

  // Energy tab
  score: number;                    // 0-100
  scoreLabel: "power" | "balanced" | "rest";
  summary: string;                  // AI-generated 1-2 sentences

  moon: {
    phase: string;                  // "Waxing Gibbous"
    sign: string;                   // "Scorpio"
    meaning: string;                // "Deep emotions..."
  };

  // Cosmos tab
  transits: {
    planet1: string;                // "sun"
    aspect: string;                 // "trine"
    planet2: string;                // "jupiter"
    planet2IsNatal: boolean;        // true = hitting user's natal planet
    symbol: string;                 // "☉ △ ♃"
    label: string;                  // "Sun trine your Jupiter"
    shortInterpretation: string;    // 1 sentence
    fullInterpretation: string;     // 3-4 sentences (expanded)
    significance: number;           // 1-10 for sorting
  }[];

  // Actions tab
  bestFor: string[];                // 3-4 items
  avoidToday: string[];             // 2-3 items

  // Soul tab (pre-generated daily)
  ritual: {
    title: string;
    context: string;
    steps: string[];
    timing: string;
  };
  journalPrompt: string;
}
```

### API Endpoint

```
GET /api/content/day-detail?date=2025-01-04
```

Returns `EnhancedDayData` for the requested date.

### Ritual Pre-generation

- Background job runs daily (or on-demand first access)
- Generates ritual + journal prompt for each day of current month
- Stores in Supabase `daily_rituals` table
- Cached per user per date

---

## Empty Day Handling

When no significant transits:

```
┌─────────────────────────────────────────┐
│  Saturday, January 4                    │
│                                         │
│        ┌─────────────┐                  │
│        │     52      │                  │
│        │   ────────  │                  │
│        │  BALANCED   │                  │
│        └─────────────┘                  │
│                                         │
│  🌙 Waning Crescent in Pisces          │
│                                         │
│  A quiet day cosmically. Trust your    │
│  own rhythm and inner guidance.        │
│                                         │
└─────────────────────────────────────────┘
```

- Only show Energy tab
- Hide other tabs or show "No active transits today"

---

## "Ask Stella" Integration

Button opens Stella chat with pre-filled context:

```typescript
// When user taps "Ask Stella about this day"
openStellaChat({
  prefillContext: `Today is ${date}. My score is ${score}.
    Active transits: ${transits.map(t => t.label).join(", ")}.
    Moon is ${moon.phase} in ${moon.sign}.`,
  suggestedQuestions: [
    "Why is today a power day for me?",
    "How can I make the most of this energy?",
    "What should I watch out for?"
  ]
});
```

---

## Out of Scope (V1)

- Timing windows / void-of-course moon
- Sharing day insights
- Saving favorite days
- Push notifications for special days
- Comparison with past days

---

## Visual Design Notes

- Maintain existing dark theme + gold accents
- Glass morphism for cards
- Tab bar should use sliding gold indicator (like CalendarTabs)
- Score display should feel premium (glow effect, gradient)
- Transit cards should be expandable with smooth animation

---

## Implementation Order

1. Create new API endpoint `/api/content/day-detail`
2. Build data generation logic for transits + activities
3. Create tabbed modal component structure
4. Implement Energy tab (score + moon + summary)
5. Implement Cosmos tab (transit cards)
6. Implement Actions tab (best for / avoid)
7. Set up ritual pre-generation system
8. Implement Soul tab
9. Add "Ask Stella" integration
10. Polish animations and empty states
