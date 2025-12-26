# Changelog

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
