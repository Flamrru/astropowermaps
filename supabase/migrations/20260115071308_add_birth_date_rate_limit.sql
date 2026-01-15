-- Add column for birth date rate limiting
-- This allows birth date to have an independent 3-month limit like time and location
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS birth_date_last_updated TIMESTAMPTZ DEFAULT NULL;
