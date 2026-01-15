-- Add email link click tracking columns to astro_leads
-- Tracks when someone clicks their personalized email link and which offer type

ALTER TABLE astro_leads
ADD COLUMN IF NOT EXISTS email_link_clicked_at timestamptz,
ADD COLUMN IF NOT EXISTS email_link_offer_type text;

-- Add comment for documentation
COMMENT ON COLUMN astro_leads.email_link_clicked_at IS 'Timestamp of first email link click';
COMMENT ON COLUMN astro_leads.email_link_offer_type IS 'Which email link was clicked: full (initial funnel) or win (winback)';
