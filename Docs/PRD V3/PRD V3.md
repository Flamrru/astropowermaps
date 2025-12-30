
REVEAL FLOW — COMPLETE REVISION SPEC
Global Note
All screens in the reveal flow should match the quiz styling:
Same font families and sizes
Same text color hierarchy (white, gold highlights, muted gray)
Same gold glow effects on key words
Nebula/cosmic background aesthetic where applicable

Step 1: Birth Data Entry
Screen: "You're in! Now the exciting part..."
Issues & Changes:
Issue
Fix
Missing background
Add nebula background (same as quiz)
Styling mismatch
Match all text styling to quiz
Blitz/sparkle icon at top
Replace with the golden alchemical sphere image from quiz Screen 1 (the armillary sphere), static (no rotation)
"I don't know my exact time" checkbox
Currently broken — needs to be functional and show time window options when checked


Step 2: First Loading Screen (Astrocartography Generation)
Screen: "Converting birth time to UTC..."
Issues & Changes:
Issue
Fix
Animation too fast
Slow down by 3x minimum (current ~5.6s → should be ~15-17 seconds)

Note: Longer loading time is fine because map generation/population can happen during this screen. This builds anticipation.

Step 3: Map Reveal
Screen: The big map reveal moment
Issues & Changes:
Issue
Fix
"Continue" button not visible on mobile
Button gets cut off — ensure it's visible in viewport or add scroll indicator
Map zoom level too close
Zoom out significantly so entire world map is visible at once
Not enough city pinpoints
Add more pinpoints (the more the better for visual impact)

Performance note: If adding more pinpoints causes lag, consider:
Generating and populating the map during the loading screen
Freezing/rendering it as a static image for the reveal
Then transitioning to interactive map after

 (Thats what it’s stuck at on mobile)

Step 4: Onboarding A — "You already know this feeling"
Screen: Recognition screen with compass icon
Issues & Changes:
Issue
Fix
Text styling
Match quiz styling (font, colors, gold highlights, glow effects)
Compass icon
Replace with golden cosmic compass image (see below)



Step 5: Onboarding B — "This isn't your horoscope"
Screen: Legitimacy + Lines explanation
Issues & Changes:
Issue
Fix
Text styling
Match quiz styling throughout
"Three lines matter most" header
Make brighter/more prominent
Venus/Jupiter/Sun planet cards
Make bigger, restructure layout: planet name ABOVE the icon, on the LEFT side. Description text fills the whole container width. Add gold highlights and glow effects on key words (quiz style)
Bottom line ("You have 40 lines total...")
Add color accents: GREEN on "amplify you" and RED on "drain you"


Step 6: Onboarding C — "You're not imagining it"
Screen: Social proof / 73% stat
Issues & Changes:
Issue
Fix
Text styling
Match quiz styling
Large "73%" box
Replace with golden dots/stars grid image (see placeholder below)
Testimonial quote attribution
Change "— M.K., Berlin" to "— M.K., Vancouver"
Testimonial
Add circular person photo for M.K. (same style as Sarah M. in quiz testimonial screen)



Step 7: Onboarding D — "Location is half the equation"
Screen: Timing introduction
Issues & Changes:
Issue
Fix
Text styling
Match quiz styling
Calendar icon
Replace with golden cosmic calendar image (see below)



Step 8: Onboarding E — "But here's what you don't have yet"
Screen: Pivot / Gap creation
Issues & Changes:
Issue
Fix
Text styling
Match quiz styling
Headline
Change from "But here's what you don't have yet" to "This is what's missing" with gold glow accent on "this"


Step 9: Onboarding F — Urgency
Screen: "2026 is X days away"
Issues & Changes:
Issue
Fix
Text styling
Match quiz styling

(No other specific changes noted)

Step 10: Second Loading Screen (2026 Forecast Generation)
Screen: "Scanning 2026 planetary transits..."
Issues & Changes:
Issue
Fix
Animation too fast
Slow down by 2-3x (more anticipation before paywall)






Step 11 — Paywall
Core Reframe
Old framing: "Unlock Your 2026 Map" New framing: "Unlock Your 2026 Map + Complete Birth Chart"
The user should feel they're getting TWO valuable things:
The 2026 Forecast — timing (power months, when to act)
Their Full Birth Chart — location (all 40 lines, 338 cities, lifetime map)

Updated Headline Block
Unlock Your Complete Map

Subhead:
Your 2026 forecast + your full birth chart — yours forever.


Updated Price Block
$49 (strikethrough)
$19

One-time payment
No subscription. Instant access. Yours forever.


Updated "What You Get" Section
Split into two clear sections with visual separation:

Section Header 1:
📅 YOUR 2026 FORECAST

Item
Description
✓ Your 3 Power Months
Know exactly when to launch, decide, and move
✓ Your 3 Power Cities
Where to travel for breakthroughs and clarity
✓ Best Month for Money Moves
Time your financial decisions with precision
✓ Best Month for Love
When connection comes easier
✓ Best Month for Major Decisions
When your clarity peaks
✓ Months to Avoid
Stop wasting energy fighting the current
✓ All 12 Months Ranked
See your entire year at a glance
✓ 2026 Calendar Overview
Color-coded month-by-month energy map


Section Header 2:
🗺️ YOUR COMPLETE BIRTH CHART

(Visual separator — maybe a subtle divider line or different card)
Item
Description
✓ All 40 Planetary Lines
Sun, Moon, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto — every line mapped
✓ 338 Cities Matched
See which cities align with each planet's energy
✓ Interactive World Map
Explore your lines anywhere on Earth
✓ 4 Life Categories
Love, Career, Growth, Home — filtered by what matters to you
✓ Line-by-Line Interpretations
Tap any line to understand what it means for you
✓ Locations That Drain You
Know where NOT to go
✓ Yours Forever
This is your lifetime map — it doesn't expire


Updated Value Positioning Copy
Add a small "what you're really getting" summary block between the checklist and CTA:
Two maps. One purchase.

Your 2026 Forecast tells you WHEN.
Your Birth Chart tells you WHERE.

Together, they show you exactly how to plan your year.


Updated Primary CTA
🔒 Unlock Everything — $19

or
🔒 Get My Full Map — $19


Updated Final CTA Section (Bottom of Page)
2026 is [X] days away.
(or "We're [X] days into 2026")

Your first power window could be January.
Your best city could be a flight away.

Don't plan blind.

$49 (strikethrough)
$19 (large)
One-time payment

🔒 Unlock Everything — $19

30-day money-back guarantee
If the map doesn't resonate, email us for a full refund.


Visual Notes for Developer
Two-section layout for "What You Get" — visually separate the 2026 Forecast items from the Birth Chart items (different background tint, divider, or two cards)


Icons — Use 📅 calendar icon for 2026 section header, 🗺️ map icon for birth chart section header


Birth chart items should feel "bonus" — Consider slightly different styling (e.g., gold accent on the header, or a "INCLUDED" badge) to make it feel like added value


Blurred preview — If showing blurred report preview, consider showing BOTH:


Blurred 2026 forecast (months)
Blurred map with lines (birth chart)
This reinforces visually that they're getting two things.



Copy Rationale
The psychology here:
User already SAW their birth chart (40 lines, impressive/complex)
They experienced that "wow" moment
Now we're saying: "That thing you saw? You get to KEEP it. Plus the 2026 timing."
"Yours forever" language makes the birth chart feel like a permanent asset, not just a preview
Splitting into two sections makes it feel like more value without adding anything new


