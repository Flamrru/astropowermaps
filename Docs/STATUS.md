# Project Status

## Milestones
- [x] MVP Quiz Flow — Complete
- [x] Email Capture + Supabase — Complete
- [x] Admin Dashboard — Complete
- [x] Meta Pixel Integration — Complete
- [x] Funnel Analytics — Complete
- [ ] Conversions API (server-side tracking) — Future

## What's Done (Recent)
- **City Star Rating System** (Dec 31, 2025)
  - 3-5 star range (all shown cities are on beneficial lines)
  - Scoring formula: proximity × line type × planet relevance + multi-line bonus
  - Custom 4-pointed celestial star SVG with half-star support
- **City Popup Redesign** (Dec 31, 2025)
  - Dark glassmorphic theme matching app aesthetic
  - Shows: flag + city name, star rating, planet badge, distance, interpretation
  - Category-colored theming (love=#E8A4C9, career=#E8C547, growth=#9B7ED9, home=#C4C4C4)
- **Yearly Power Score** (Dec 31, 2025)
  - Optimistic benefic-focused scoring (range 50-100, never below 50)
  - Formula: 50 + (yearlyAverage × 0.5) + peakBonus + beneficBonus
  - Labels: Exceptional Year (85+), Powerful Year (70+), Strong Year (55+), Foundation Year (50+)
- **2026 Report Panel** - Desktop panel with yearly forecast insights
- Meta Pixel tracking (PageView + Lead events)
- Funnel step tracking to Supabase
- Admin dashboard with:
  - Lead table with badge styling
  - Q1/Q2 answer distribution charts
  - Funnel analytics chart
  - Real-time refresh (30s)
- Fixed video background edge gaps (scale 1.15)

## What's Next (Near-term)
- Monitor conversion rates from Meta ads
- Potentially add Conversions API for better tracking accuracy
- A/B testing different quiz questions

## Where We Left Off
- **Branch**: feature/astrocartography
- **Last task**: Implemented city star ratings, city popup redesign, and yearly power score
- **Next step**: Complete documentation, merge to main

## Known Issues / Risks
- ~25-30% of users have ad blockers (pixel won't track them)
- Video backgrounds require scale(1.15) hack for edge coverage
- Copy is locked — any text changes need source file update

## URLs
- **Production**: https://astropowermaps.vercel.app
- **Admin**: https://astropowermaps.vercel.app/admin
- **Vercel**: https://vercel.com/flamrrus-projects/astropowermaps
- **Supabase**: Check dashboard for project
- **Meta Events Manager**: business.facebook.com/events_manager
