-- Add price variant tracking to astro_leads for A/B price testing
-- Codes: x24ts ($24.99), x29ts ($29.99), null (default $19.99)

ALTER TABLE public.astro_leads
ADD COLUMN IF NOT EXISTS price_variant_code TEXT;

COMMENT ON COLUMN astro_leads.price_variant_code IS
  'A/B test variant code from URL: x24ts ($24.99), x29ts ($29.99), null (default $19.99)';

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_astro_leads_price_variant
  ON public.astro_leads(price_variant_code);
