-- Migration: Create stella_messages table for Stella chat history
-- Stores conversation messages with rate limiting support
-- Idempotent: can run multiple times safely

CREATE TABLE IF NOT EXISTS stella_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE stella_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users read own messages" ON stella_messages;
DROP POLICY IF EXISTS "Service role full access" ON stella_messages;

-- Users can read their own messages
CREATE POLICY "Users read own messages" ON stella_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Service role full access (for API routes to insert messages)
CREATE POLICY "Service role full access" ON stella_messages
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast lookups by user (ordered by time for chat history)
CREATE INDEX IF NOT EXISTS idx_stella_messages_user_created ON stella_messages(user_id, created_at DESC);

-- Index for daily rate limiting queries (count messages per day)
CREATE INDEX IF NOT EXISTS idx_stella_messages_daily_count ON stella_messages(user_id, created_at);

COMMENT ON TABLE stella_messages IS 'Chat history for Stella AI conversations, used for context and rate limiting';
