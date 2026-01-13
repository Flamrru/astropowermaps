-- Add separate column for birth location rate limiting
-- This allows birth time and birth location to have independent monthly limits
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS birth_location_last_updated TIMESTAMPTZ DEFAULT NULL;

-- Rename existing column for clarity (birth_data -> birth_time)
ALTER TABLE user_profiles
RENAME COLUMN birth_data_last_updated TO birth_time_last_updated;
