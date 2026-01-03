-- Migration: Add daily_content table for AI-generated content caching
-- This table stores daily scores, weekly forecasts, and ritual prompts
-- to avoid regenerating AI content on every page load.

-- Create daily_content table
CREATE TABLE IF NOT EXISTS daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_date DATE NOT NULL,
  content_type TEXT NOT NULL, -- 'daily_score' | 'weekly_forecast' | 'ritual'
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_date, content_type)
);

-- Enable Row Level Security
ALTER TABLE daily_content ENABLE ROW LEVEL SECURITY;

-- Users can only read their own content
CREATE POLICY "Users read own content" ON daily_content
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own content (via API)
CREATE POLICY "Users insert own content" ON daily_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for API routes using supabaseAdmin)
CREATE POLICY "Service role full access" ON daily_content
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast lookups by user + date + type
CREATE INDEX IF NOT EXISTS idx_daily_content_lookup
  ON daily_content(user_id, content_date, content_type);

-- Comment on table
COMMENT ON TABLE daily_content IS 'Caches AI-generated daily content (scores, forecasts, rituals) per user per day';
