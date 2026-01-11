-- ============================================
-- App Events Table for Product Analytics
-- ============================================
-- Tracks user behavior in Stella+ app:
-- - Page views (which screens users visit)
-- - Feature usage (chat opens, button clicks)
-- - Session data (duration, flow)

CREATE TABLE IF NOT EXISTS public.app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (nullable for anonymous/pre-login events)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event identification
  event_name TEXT NOT NULL,         -- e.g., 'page_view', 'feature_use', 'stella_query'
  event_category TEXT NOT NULL,     -- e.g., 'navigation', 'engagement', 'stella'

  -- Flexible properties (screen name, duration, etc.)
  properties JSONB DEFAULT '{}'::jsonb,

  -- Session tracking (links events in same session)
  session_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

-- Service role full access (for API routes using supabaseAdmin)
CREATE POLICY "Service role full access on app_events"
  ON public.app_events
  FOR ALL
  TO service_role
  WITH CHECK (true);

-- ============================================
-- Indexes for Dashboard Queries
-- ============================================

-- User lookup (for user-specific analytics)
CREATE INDEX IF NOT EXISTS idx_app_events_user_id
  ON public.app_events(user_id);

-- Time-based queries (date range filtering)
CREATE INDEX IF NOT EXISTS idx_app_events_created_at
  ON public.app_events(created_at DESC);

-- Event type filtering
CREATE INDEX IF NOT EXISTS idx_app_events_name
  ON public.app_events(event_name);

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_app_events_category
  ON public.app_events(event_category);

-- Session grouping
CREATE INDEX IF NOT EXISTS idx_app_events_session_id
  ON public.app_events(session_id);

-- Composite index for common dashboard query pattern
CREATE INDEX IF NOT EXISTS idx_app_events_date_user_name
  ON public.app_events(created_at, user_id, event_name);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE public.app_events IS 'Product analytics event tracking for Stella+ dashboard insights';
COMMENT ON COLUMN public.app_events.event_name IS 'Event type: page_view, feature_use, stella_query, session_start, session_end';
COMMENT ON COLUMN public.app_events.event_category IS 'Category: navigation, engagement, stella, session';
COMMENT ON COLUMN public.app_events.properties IS 'Flexible JSON: { screen, feature, duration_ms, topics[], action }';
