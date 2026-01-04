# Map V5 Redesign Specification

> Integrating the astrocartography map into the V5 dashboard experience

---

## Overview

Transform the standalone V1 map experience into an integrated V5 dashboard tab with consistent styling, navigation, and Stella integration.

**Scope:** Layout integration + essential restyling + Stella context
**Platform Priority:** Mobile-first, desktop inherits same layout

---

## Requirements

### Layout & Navigation

| # | Requirement |
|---|-------------|
| 1 | Map fills entire screen (full-screen experience) |
| 2 | Bottom navigation overlays map with auto-hide behavior |
| 3 | Nav fades out when user pans/zooms, reappears after 2-3 seconds of inactivity |
| 4 | Map tab shows map immediately (no animation for logged-in users) |
| 5 | Birth data comes from dashboard context (guaranteed to exist) |
| 6 | Remove standalone `/map` page entirely |

### Power Places

| # | Requirement |
|---|-------------|
| 7 | Keep floating pill approach (tap to open power places sheet) |
| 8 | Restyle city cards to V5 glass morphism style |
| 9 | Tap city → map flies to location + opens popup |
| 10 | Power places sheet opens from floating pill |

### Category Filters

| # | Requirement |
|---|-------------|
| 11 | Show Love/Career/Growth/Home as vertical connected pills |
| 12 | Position on left side of map (vertical stack) |
| 13 | No individual planet toggles on mobile |
| 14 | Filters affect which lines and cities are shown |

### Line Interactions

| # | Requirement |
|---|-------------|
| 15 | Tap planetary line to open styled modal |
| 16 | Modal shows brief interpretation (2-3 sentences) |
| 17 | Modal includes "Ask Stella" button for deeper insight |
| 18 | Modal styled with V5 glass morphism |

### Stella Integration

| # | Requirement |
|---|-------------|
| 19 | Stella FAB in bottom-right (same position as dashboard) |
| 20 | FAB positioned above auto-hiding nav |
| 21 | Contextual "Ask Stella about [city]" on city popups |
| 22 | Contextual "Ask Stella" in line modal |
| 23 | Stella receives context about what user is viewing |

### Visual Theming

| # | Requirement |
|---|-------------|
| 24 | Full element theming (Fire/Earth/Air/Water) |
| 25 | Controls and accents use user's element colors |
| 26 | Glass morphism on all panels and modals |
| 27 | Match V5 dashboard visual language |

---

## Technical Approach

### Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `/src/app/map/page.tsx` | DELETE | Remove standalone page |
| `/src/app/dashboard/map/page.tsx` | CREATE | New dashboard-integrated map page |
| `/src/components/astro-map/AstroMap.tsx` | MODIFY | Add nav-aware layout, element theming |
| `/src/components/astro-map/MobileFloatingPill.tsx` | MODIFY | V5 glass styling |
| `/src/components/astro-map/PowerPlacesPanel.tsx` | MODIFY | Glass card styling for cities |
| `/src/components/astro-map/CategoryFilters.tsx` | MODIFY | Vertical connected pills |
| `/src/components/astro-map/LineTooltip.tsx` | REPLACE | Convert to modal with Stella button |
| `/src/components/dashboard/BottomNav.tsx` | MODIFY | Auto-hide behavior on map |

### New Components to Create

| Component | Purpose |
|-----------|---------|
| `LineModal.tsx` | Full modal for line tap (replaces tooltip) |
| `VerticalCategoryPills.tsx` | Vertical stacked category filter |
| `MapStellaContext.tsx` | Context provider for Stella location awareness |

### Data Flow

```
DashboardShell (has birth data + element)
  ↓
/dashboard/map/page.tsx (new route)
  ↓
AstroMap (receives birthData, element from context)
  ↓
BottomNav (auto-hide on map tab)
  ↓
StellaFloatingButton (receives map context)
```

### Auto-Hide Nav Logic

```typescript
// In BottomNav or map page
const [navVisible, setNavVisible] = useState(true);
const hideTimeoutRef = useRef<NodeJS.Timeout>();

const handleMapInteraction = () => {
  setNavVisible(false);
  clearTimeout(hideTimeoutRef.current);
  hideTimeoutRef.current = setTimeout(() => {
    setNavVisible(true);
  }, 3000); // Reappear after 3 seconds
};
```

### Element Theming Application

```typescript
// AstroMap receives element from context
const { element } = useDashboard();

// Apply to controls
style={{
  borderColor: `var(--element-primary)`,
  boxShadow: `0 0 12px var(--element-glow)`,
}}
```

---

## UI/UX Details

### Map Screen Layout (Mobile)

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────┐                                    │
│  │Love │  ← Vertical category pills (left)  │
│  ├─────┤                                    │
│  │Work │                                    │
│  ├─────┤     MAPBOX MAP                     │
│  │Grow │     (planetary lines visible)      │
│  ├─────┤                                    │
│  │Home │                                    │
│  └─────┘                                    │
│                                             │
│                              ┌────────────┐ │
│                              │ 🌟 Stella  │ │
│                              └────────────┘ │
│                                             │
│            ┌──────────────────────┐         │
│            │ ✨ Power Places (12) │         │
│            └──────────────────────┘         │
│                                             │
│  ─────────────────────────────────────────  │
│  [Home] [Map*] [Calendar] [Profile]         │  ← Auto-hides
│  ─────────────────────────────────────────  │
└─────────────────────────────────────────────┘
```

### Vertical Category Pills

```
┌─────────┐
│  💗     │  Love - pink accent
│  Love   │
├─────────┤
│  ⭐     │  Career - gold accent
│ Career  │
├─────────┤
│  🌱     │  Growth - green accent
│ Growth  │
├─────────┤
│  🏠     │  Home - silver accent
│  Home   │
└─────────┘

- Glass morphism background
- Connected with subtle dividers
- Active state: element glow + scale
- Position: Left side, vertically centered
```

### Line Modal Design

```
┌─────────────────────────────────────────────┐
│                                             │
│  ♀ Venus on Ascendant Line                  │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  This line enhances your natural charm      │
│  and attractiveness. Places along this      │
│  line can bring meaningful connections.     │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ✨ Ask Stella for deeper insight   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│              [ Close ]                      │
│                                             │
└─────────────────────────────────────────────┘

- Glass morphism background with blur
- Planet symbol with element-colored glow
- Brief 2-3 sentence interpretation
- Prominent "Ask Stella" CTA button
- Close button or tap outside to dismiss
```

### City Card Design (V5 Glass Style)

```
┌─────────────────────────────────────────────┐
│                                             │
│  Paris, France                 ⭐⭐⭐⭐⭐    │
│  ♀ Venus on AC • 52km away                  │
│                                             │
│  [ Ask Stella about Paris ]                 │
│                                             │
└─────────────────────────────────────────────┘

- Glass morphism: rgba(255,255,255,0.05) + blur(16px)
- Element-colored accent on category icon
- Star rating with subtle glow
- Distance shown in user-friendly format
- "Ask Stella" button on expand/detail view
```

### Auto-Hide Nav Behavior

```
User taps/drags map
  ↓
Nav fades out (300ms)
  ↓
User stops interacting
  ↓
3 second timer starts
  ↓
Nav fades back in (300ms)

Note: Stella FAB stays visible always
      Floating pill stays visible always
      Only bottom nav auto-hides
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User without birth data | Not possible - required before reaching dashboard |
| Map fails to load | Show error state with retry button |
| Mapbox token invalid | Graceful error, suggest contacting support |
| No power places found | Show message: "No power places in this category" |
| Slow connection | Loading state on map, skeleton on panels |

---

## Out of Scope

- Desktop-specific layouts (side panels) - use mobile layout for both
- Individual planet toggles on mobile
- Save/favorite cities feature
- 2026 forecast report (keep on dashboard home if exists)
- Offline map support
- Map search functionality

---

## Open Questions

1. **Nav reappear trigger:** Should tapping anywhere (not just waiting) bring nav back?
2. **Stella context depth:** How much map context should Stella receive? (current city? visible lines? selected category?)
3. **Animation polish:** Any specific transitions desired between states?

---

## Implementation Order

### Phase 1: Layout Integration (Core)
1. Create `/dashboard/map/page.tsx` route
2. Connect to DashboardShell context for birth data
3. Implement auto-hide nav behavior
4. Position Stella FAB correctly

### Phase 2: Essential Restyling
5. Convert CategoryFilters to vertical pills
6. Restyle floating pill with V5 glass
7. Restyle city cards with V5 glass
8. Add element theming to controls

### Phase 3: Line Modal
9. Replace LineTooltip with LineModal component
10. Add brief interpretation + "Ask Stella" button
11. Style with glass morphism

### Phase 4: Stella Context
12. Create MapStellaContext for location awareness
13. Add "Ask Stella about [city]" on popups
14. Pass context to Stella when opened from map

### Phase 5: Cleanup
15. Delete old `/map/page.tsx`
16. Update any links pointing to old route
17. Test full flow end-to-end

---

## Success Criteria

- [ ] Map tab opens immediately with user's birth data
- [ ] Bottom nav auto-hides during map interaction
- [ ] Category filters work as vertical pills
- [ ] City cards match V5 glass style
- [ ] Line tap opens modal (not tooltip)
- [ ] Stella FAB present and functional
- [ ] "Ask Stella" buttons work with context
- [ ] Element theming applied throughout
- [ ] Old /map route removed
- [ ] Mobile-first, works on desktop too
