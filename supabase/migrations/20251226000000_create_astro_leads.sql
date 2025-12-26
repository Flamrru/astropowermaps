-- Create astro_leads table for quiz funnel email capture
CREATE TABLE IF NOT EXISTS public.astro_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  quiz_q1 text,
  quiz_q2 text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Add index on email for duplicate checking
CREATE INDEX IF NOT EXISTS idx_astro_leads_email ON public.astro_leads(email);

-- Add index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_astro_leads_created_at ON public.astro_leads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.astro_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from service role only (server-side API)
CREATE POLICY "Service role can insert leads"
  ON public.astro_leads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to read (for admin/export purposes)
CREATE POLICY "Service role can read leads"
  ON public.astro_leads
  FOR SELECT
  TO service_role
  USING (true);

-- Add table comment
COMMENT ON TABLE public.astro_leads IS 'Email leads from the 2026 Power Map astrology quiz funnel';
