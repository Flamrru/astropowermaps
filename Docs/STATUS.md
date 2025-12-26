# Project Status

## Milestones
- [x] MVP Quiz Flow — Complete
- [x] Email Capture + Supabase — Complete
- [x] Admin Dashboard — Complete
- [x] Meta Pixel Integration — Complete
- [x] Funnel Analytics — Complete
- [ ] Conversions API (server-side tracking) — Future

## What's Done (Recent)
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
- **Branch**: main
- **Last task**: Fixed black strips on video backgrounds
- **Next step**: Launch Meta ads and monitor funnel

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
