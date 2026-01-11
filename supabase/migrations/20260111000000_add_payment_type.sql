-- Migration: Add payment_type column to user_profiles
-- Distinguishes between one-time purchasers and subscribers
-- Idempotent: can run multiple times safely

-- Add payment_type column
-- Values: "none" | "one_time" | "subscription" | "grandfathered"
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'none';

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.payment_type IS 'Payment model: none (unpaid), one_time ($19.99 lifetime), subscription (recurring $19.99/mo), grandfathered (free early supporters)';

-- Create index for filtering by payment type
CREATE INDEX IF NOT EXISTS idx_user_profiles_payment_type
ON user_profiles(payment_type);

-- Backfill existing data based on current state
-- Logic:
-- 1. Grandfathered users (35 early supporters) -> grandfathered
-- 2. Users with subscription_id -> subscription
-- 3. Active users without subscription_id -> one_time (they paid but no recurring)
-- 4. Everyone else -> none
UPDATE user_profiles
SET payment_type = CASE
  -- Grandfathered users (35 early supporters with free lifetime access)
  WHEN subscription_status = 'grandfathered' THEN 'grandfathered'
  -- Subscribers have a subscription_id from Stripe
  WHEN subscription_id IS NOT NULL THEN 'subscription'
  -- Active users without subscription_id are one-time purchasers
  WHEN subscription_status = 'active' AND subscription_id IS NULL THEN 'one_time'
  -- Trialing without subscription_id could be legacy data, treat as subscription
  WHEN subscription_status = 'trialing' AND subscription_id IS NULL THEN 'subscription'
  -- Cancelled without subscription_id - was a subscriber
  WHEN subscription_status = 'cancelled' AND subscription_id IS NULL THEN 'subscription'
  -- Everyone else defaults to none
  ELSE 'none'
END
WHERE payment_type = 'none' OR payment_type IS NULL;
