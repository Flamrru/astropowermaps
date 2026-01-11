# Changelog

## 2026-01-11

### Stella AI Chat Improvements
- **Critical Fixes**
  - Fixed rate limit message showing "50" instead of actual limit (200)
  - Removed artificial 3-second delay after API response (was causing sluggish UX)
  - Increased `max_completion_tokens` from 2000 to 4000 (large system prompt was hitting limits)
- **Retry Logic for Failed Messages**
  - Failed messages stay visible (grayed out) instead of disappearing
  - "Retry" button appears below failed messages
  - Tracks hidden context for "Ask Stella about this day" retries
- **Network Timeout**
  - Added 30-second timeout with AbortController
  - Shows "Request timed out" error instead of infinite loading
- **Safety & Validation**
  - Hidden context length capped at 2000 chars (prevents token abuse)
  - Safety guardrails in system prompt (deflects questions about instructions)
  - Life transits null handling: guides users to Life Transits tab instead of hallucinating dates
- **Accessibility**
  - Added `role="log"` and `aria-live="polite"` to chat container
  - Added `role="alert"` to error messages
  - Added `aria-label="Send message"` to send button
- **Bug Fixes**
  - Fixed ordinal formatting: "4rd" → "4th" for Saturn Returns
  - Birth time unknown now communicated to AI (prevents false precision about rising/houses)

### Product Analytics Tracking Dashboard (`/tracking`)
- **New Dashboard** - Separate analytics dashboard for understanding user behavior
  - Independent authentication (TRACKING_PASSWORD env var)
  - 4 tabs: Overview, Stella Insights, Users, Revenue
  - Auto-refresh every 45 seconds with date range filtering
- **Event Tracking System**
  - New `app_events` table in Supabase for tracking feature usage
  - `useTrack()` hook for easy event tracking in components
  - Page views tracked automatically on dashboard pages
- **User Analytics**
  - Full user list with search, filters (payment type, engagement, topics)
  - User detail modal shows: profile, payment info, activity timeline, conversations
  - Engagement classification: High (20+ chats), Medium (5-19), Low (0-4)
- **Topic Categorization**
  - Auto-categorizes Stella messages: Love, Career, Saturn Return, Jupiter, Timing, Home, Growth
  - Topic breakdown charts and filters
- **Revenue Segmentation**
  - Segment by payment type, engagement level, or interest topics
  - Shows revenue per segment with comparison charts

### Stella Astrocartography Fix
- **Bug Fix** - Stella was giving generic answers on map page ("I can't see your lines")
  - Root cause: View context mismatch (`power-map` vs `map`)
  - Root cause: No line data being passed to AI
- **350-City Database Integration**
  - Stella now receives pre-computed distances from all 350 cities to all planetary lines
  - Uses existing `MAJOR_CITIES` array and Haversine distance calculation
  - Data grouped by region (Europe, Americas, Asia, etc.)
- **Example Output to AI**:
  ```
  EUROPE:
  Zurich, Switzerland: Venus MC (127km), Jupiter AC (342km)
  Geneva, Switzerland: Venus MC (89km), Moon IC (456km)
  ```
- **Distance Guide** - `<100km=very strong, 100-300km=strong, 300-600km=moderate`
- **System Prompt Updates**
  - Added astrocartography guidance section
  - Explicit constraint: "DO NOT ask users to upload screenshots"
  - Map-specific response hints for location questions

### Admin Dashboard - Stripe API Integration
- **Real-time Data** - Dashboard now fetches subscription and payment data directly from Stripe
  - Subscription status pulled from `stripe.subscriptions.list()` (Trialing, Active, Canceling, Canceled, Past Due)
  - Payment amounts pulled from `stripe.charges.list()` (actual trial fees: $2.99, $5.99, $9.99)
  - LTV calculated from sum of all payments per customer
- **Caching** - 5-minute in-memory cache prevents excessive API calls
  - "Sync Stripe" button forces refresh from Stripe
- **Badge Updates** - Status badges now prioritize Stripe data
  - Shows correct subscription status even if user doesn't have a profile entry
  - Added "Canceling" status for scheduled cancellations
- **Amount/LTV Columns** - Now show real Stripe payment data
  - Amount: Last payment from Stripe (or purchase_amount as fallback)
  - LTV: Total paid from Stripe (shows payment count if > 1)
- **Lead Detail Modal** - Enhanced payment section
  - Shows last payment, LTV with payment count
  - Shows subscription monthly rate and status

### Admin Dashboard - Payment Type Distinction
- **Database** - Added `payment_type` column to `user_profiles` table
  - Values: `none`, `one_time`, `subscription`, `grandfathered`
  - Backfill migration automatically categorizes existing users
- **Webhook Update** - Sets `payment_type` when creating user profiles
  - One-time purchases → `payment_type = "one_time"`
  - Subscriptions → `payment_type = "subscription"`
- **Dashboard Redesign** - Clear distinction between payment types
  - Renamed "Subscription Status" → "Customers" section
  - New stat cards: One-Time, Subscribers, Cancelled, Past Due, Free Access, Leads Only
  - Added `PaymentTypeBadge` component with icons: ⚡ One-Time, 🔄 Subscribed, ⏱ Trialing, ✕ Cancelled, 🎁 Free
  - Milestones simplified: Quiz → Leads → Paid (combines one-time + subscription)
  - Lead table shows: Email, Status, Amount, LTV, Source, Date (removed Q1/Q2 columns)
  - Lead detail modal shows "Payment & Access" section with amount paid and access type

### Admin Dashboard - Date Filtering Fix
- **API** - Added `purchaseStats` endpoint that respects date range filter
  - `purchaseStats.total` now correctly filters by selected date range
  - Previously, "Paid" count showed all-time regardless of date filter
- **Badge Logic** - Fixed paid users showing "Lead" instead of "One-Time"
  - Badge now defaults to "One-Time" for any paid user
  - Only shows subscription status if profile has subscription data
- **Terminology** - Renamed "Lifetime" → "One-Time" throughout
- **Table Columns** - Simplified to essential data only
  - New columns: Email, Status (badge), Amount, LTV, Source, Date
  - Removed: Q1 Answer, Q2 Answer, Payment columns

## 2026-01-07
### Critical Bug Fix: Astronomical Calculations
- **Rising Sign Fix** - Was showing wrong sign (e.g., Leo instead of Libra)
  - Root cause: `sidereal.mean()` returns seconds, code treated it as radians
  - Fixed in `zodiac.ts` and `houses.ts`
  - All calculations now verified against astro.com (within 0.5° accuracy)
- **House Cusps Fix** - Same bug affected MC, IC, and all house positions
- **Transit Timezone Fix** - Changed `dateToJulianDay()` to use UTC methods
  - Ensures consistent power day calculations regardless of server timezone
- **Documentation** - Added warning in ARCHITECTURE.md about astronomia library units

### Stella+ Launch
- **Subscription System** - Trial + monthly subscription model
  - Mixed cart checkout: one-time trial fee ($2.99/$5.99/$9.99) + recurring ($19.99/mo)
  - Stripe subscription mode with `trial_period_days`
  - Customer reuse prevents duplicate Stripe customers on re-purchase
  - Automatic subscription creation (no webhook dependency)
- **Grandfathered Customers** - 35 early supporters get free lifetime access
  - Invite emails sent with setup link
  - `subscription_status = 'grandfathered'` on account creation
- **Email Improvements**
  - Changed sender from `noreply@` to `Stella <stella@astropowermap.com>`
  - Added `replyTo: support@astropowermap.com`
  - Fixed invisible buttons in Outlook (solid color fallback)
  - Improved footer with support contact box
- **Stripe Customer ID Fix**
  - Added Stripe API fallback lookup when database doesn't have customer ID
  - Ensures "Manage billing" portal always works
- **Auth System** - Production mode enabled
  - `BYPASS_AUTH = false` - real authentication required
  - Setup page with password requirements (8+ chars, uppercase, lowercase, number)

## 2025-12-28
### Added
- **Stripe Payment Integration** - $27 one-time payment for 2026 Power Map
  - Embedded Checkout (stays on paywall page)
  - Webhook handler for payment confirmation
  - Updates `astro_purchases` table on success
  - Sets `has_purchased = true` on `astro_leads`
  - Auto-redirect to `/map` after successful payment
  - Dark theme with gold accent (via Stripe Dashboard branding)
- **Reveal Flow** (`/reveal`) - 10-screen guided onboarding after quiz
  - Birth data entry with location search and timezone detection
  - Astrocartography map generation (planetary lines calculation)
  - Auto-animated map reveal (globe pan → fly to birth location)
  - Onboarding screens explaining astrocartography, lines, and power places
  - 2026 Power Forecast generation with power months and avoid months
  - Paywall with blurred preview of power months/cities
  - Confirmation screen with unlocked data
- **AstroMap background mode** for reveal flow integration
  - Dimmed opacity during onboarding screens
  - Line highlight support (glow specific planets/line types)
  - City highlight with map pan and pulse animation
  - Single teaser city marker display
- **localStorage persistence** for user session
  - Astro data saved after calculation
  - `/map` auto-loads saved data (no re-entry needed after payment)
  - 30-day expiry with clear on reset
- **Timezone support** (`tz-lookup` package)
  - Auto-detect timezone from birth city coordinates

### Technical
- Integrated AstroMap into reveal flow (replaced broken MapBackground)
- Fixed type system alignment between reveal-state and astro/types
- Added `astro-storage.ts` utility for localStorage operations

## 2025-12-26
### Added
- Meta Pixel integration (Pixel ID: 848967188002206)
  - PageView tracking on page load
  - Lead event on email submission
- Funnel analytics tracking
  - New `astro_funnel_events` table in Supabase
  - Tracks: quiz_start, q1_answered, q2_answered, email_screen
  - API endpoint: `/api/funnel-event`
- Admin dashboard enhancements
  - Funnel chart with drop-off percentages
  - Q1/Q2 answer distribution bar charts
  - Badge styling for quiz answers in lead table
  - Real-time auto-refresh every 30 seconds
  - "Last updated" timestamp

### Fixed
- Black strips on video background edges (entry + nebula screens)
  - Applied `scale(1.15)` to cover aspect ratio gaps

## 2025-12-25
### Added
- Admin dashboard with password protection
- Lead database view with search and CSV export
- Stats cards (Total, Today, Sources, This Week)

## Earlier
- Initial quiz flow (10 screens)
- Email capture to Supabase
- Video backgrounds with crossfade transitions
- Mobile-first responsive design
- UTM parameter capture
