-- ================================================
-- Flagged Conversation Reviews Table
-- ================================================
-- Tracks read/review status per user for the inbox-like
-- flagged messages feature in the tracking dashboard.
--
-- Since the app has no session/conversation concept,
-- we track reviews at the user level.
-- ================================================

CREATE TABLE IF NOT EXISTS flagged_conversation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Read tracking
  last_read_at TIMESTAMPTZ DEFAULT NULL,  -- NULL = never read
  last_flagged_message_at TIMESTAMPTZ,    -- Latest flagged message timestamp

  -- Status workflow
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'snoozed')),
  manually_flagged BOOLEAN DEFAULT FALSE, -- Admin can flag to not forget

  -- Notes
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint on user_id
  CONSTRAINT unique_user_review UNIQUE(user_id)
);

-- ================================================
-- Indexes
-- ================================================

-- Fast filtering by status
CREATE INDEX idx_fcr_status ON flagged_conversation_reviews(status);

-- Fast unread detection (conversations where last_read_at < last_flagged_message_at)
CREATE INDEX idx_fcr_unread ON flagged_conversation_reviews(last_read_at, last_flagged_message_at);

-- Fast lookup by user
CREATE INDEX idx_fcr_user ON flagged_conversation_reviews(user_id);

-- ================================================
-- RLS Policies (Admin only via service role)
-- ================================================

ALTER TABLE flagged_conversation_reviews ENABLE ROW LEVEL SECURITY;

-- No policies needed - accessed only via service role key in tracking dashboard

-- ================================================
-- Seed existing flagged conversations
-- ================================================
-- Insert a review record for each user who has flagged messages

INSERT INTO flagged_conversation_reviews (user_id, last_flagged_message_at, status)
SELECT DISTINCT
  cc.user_id,
  MAX(cc.classified_at) as last_flagged_message_at,
  'new' as status
FROM chat_classifications cc
WHERE cc.needs_review = true
GROUP BY cc.user_id
ON CONFLICT (user_id) DO UPDATE
SET last_flagged_message_at = EXCLUDED.last_flagged_message_at;
