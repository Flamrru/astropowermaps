-- Migration: Create user_profiles table for Stella+ subscribers
-- Stores birth data, account status, and personalization preferences
-- Idempotent: can run multiple times safely

-- Create table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Display info
  display_name TEXT,

  -- Account status
  account_status TEXT DEFAULT 'pending_setup',
  setup_completed_at TIMESTAMPTZ,

  -- Birth data (from quiz/reveal flow)
  birth_date DATE NOT NULL,
  birth_time TIME, -- NULL if unknown
  birth_time_unknown BOOLEAN DEFAULT false,
  birth_place TEXT NOT NULL,
  birth_lat NUMERIC(10, 7) NOT NULL,
  birth_lng NUMERIC(10, 7) NOT NULL,
  birth_timezone TEXT NOT NULL,

  -- Subscription (linked from Stripe)
  subscription_status TEXT DEFAULT 'none',
  stripe_customer_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- Users can read their own profile
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile (during setup)
CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role full access (for API routes)
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger (for idempotency)
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();

COMMENT ON TABLE user_profiles IS 'Stella+ subscriber profiles with birth data and account status';
