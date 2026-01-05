-- Add subscription and profile columns to user_profiles
-- These columns support the profile page subscription management features

-- Stripe subscription tracking
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';

-- Birth time tracking (to know if user can edit birth time later)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_time_unknown BOOLEAN DEFAULT false;

-- Timestamps
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer
ON user_profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.subscription_status IS 'Stripe subscription status: none, trialing, active, cancelling, cancelled, past_due';
COMMENT ON COLUMN user_profiles.birth_time_unknown IS 'True if user selected "I dont know my birth time" during setup';
