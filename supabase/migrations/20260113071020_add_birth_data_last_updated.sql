-- Add column to track when birth data was last updated
-- Used for rate limiting (once per month)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS birth_data_last_updated TIMESTAMPTZ DEFAULT NULL;
