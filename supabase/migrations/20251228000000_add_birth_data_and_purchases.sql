-- Migration: Add birth data columns to astro_leads and create astro_purchases table
-- For the Post-Quiz Conversion Flow feature

-- ============================================
-- Part 1: Add birth data columns to astro_leads
-- ============================================

-- Birth date (just the date, no time)
ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_date date;

-- Birth time (HH:MM format, or null if unknown)
ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_time time;

-- Flag for unknown birth time (defaults to false)
ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_time_unknown boolean DEFAULT false;

-- Time window when unknown (morning, afternoon, evening, unknown)
ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_time_window text;

-- Birth location details
ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_location_name text;

ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_location_lat numeric(10, 7);

ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_location_lng numeric(10, 7);

ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_location_timezone text;

-- UTC datetime computed from birth data
ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS birth_datetime_utc timestamptz;

-- Track if user has completed a purchase
ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS has_purchased boolean DEFAULT false;

-- ============================================
-- Part 2: Create astro_purchases table
-- ============================================

CREATE TABLE IF NOT EXISTS public.astro_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the lead
  lead_id uuid REFERENCES public.astro_leads(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  email text NOT NULL,

  -- Stripe payment details
  stripe_payment_intent_id text NOT NULL,
  stripe_customer_id text,
  amount_cents integer NOT NULL,
  currency text DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',

  -- Idempotency for duplicate prevention
  idempotency_key text UNIQUE NOT NULL,

  -- Product info
  product_type text DEFAULT '2026_power_map',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,

  -- Metadata (JSON for flexibility)
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Index on session_id for lookups
CREATE INDEX IF NOT EXISTS idx_astro_purchases_session_id
ON public.astro_purchases(session_id);

-- Index on Stripe payment intent for webhook lookups
CREATE INDEX IF NOT EXISTS idx_astro_purchases_stripe_pi
ON public.astro_purchases(stripe_payment_intent_id);

-- Index on idempotency key for deduplication
CREATE INDEX IF NOT EXISTS idx_astro_purchases_idempotency
ON public.astro_purchases(idempotency_key);

-- Index on email for customer lookups
CREATE INDEX IF NOT EXISTS idx_astro_purchases_email
ON public.astro_purchases(email);

-- Enable Row Level Security
ALTER TABLE public.astro_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from service role only (server-side via webhook)
CREATE POLICY "Service role can insert purchases"
  ON public.astro_purchases
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to read and update
CREATE POLICY "Service role can read purchases"
  ON public.astro_purchases
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update purchases"
  ON public.astro_purchases
  FOR UPDATE
  TO service_role
  USING (true);

-- Add table comment
COMMENT ON TABLE public.astro_purchases IS 'Stripe purchases for 2026 Power Map unlock ($27)';

-- ============================================
-- Part 3: Add index on session_id for reveals
-- ============================================

CREATE INDEX IF NOT EXISTS idx_astro_leads_session_id
ON public.astro_leads(session_id);
