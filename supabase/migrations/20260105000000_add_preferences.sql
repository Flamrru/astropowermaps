-- Add preferences column to user_profiles
-- Stores user preferences like theme, units, language

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences JSON: { theme: "dark"|"light", units: "km"|"miles" }';
