-- ============================================
-- Migration: Security fixes for AstroPowerMaps
-- ============================================

-- 1. Add UPDATE policy to astro_leads (for Stripe webhook updates)
CREATE POLICY "Service role can update leads"
  ON public.astro_leads
  FOR UPDATE
  TO service_role
  USING (true);

-- 2. Create astro_funnel_events table (was missing!)
CREATE TABLE IF NOT EXISTS public.astro_funnel_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  event_name text NOT NULL,
  step_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE public.astro_funnel_events IS 'Tracks quiz funnel step completion for analytics';

-- Create index for efficient queries by session
CREATE INDEX IF NOT EXISTS idx_astro_funnel_events_session_id
  ON public.astro_funnel_events(session_id);

-- Create index for event analysis
CREATE INDEX IF NOT EXISTS idx_astro_funnel_events_event_name
  ON public.astro_funnel_events(event_name);

-- 3. Enable RLS on funnel_events
ALTER TABLE public.astro_funnel_events ENABLE ROW LEVEL SECURITY;

-- 4. Add policies for service_role access
CREATE POLICY "Service role can insert funnel events"
  ON public.astro_funnel_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read funnel events"
  ON public.astro_funnel_events
  FOR SELECT
  TO service_role
  USING (true);
