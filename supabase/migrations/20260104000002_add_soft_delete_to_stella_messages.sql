-- Migration: Add soft delete support to stella_messages
-- Messages are never truly deleted - just marked as deleted for the user's view
-- Allows preserving all chat history for analytics/debugging while giving users "new chat" experience

-- Add deleted_at column for soft delete
ALTER TABLE stella_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient filtering of non-deleted messages
CREATE INDEX IF NOT EXISTS idx_stella_messages_not_deleted
  ON stella_messages(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN stella_messages.deleted_at IS 'Soft delete timestamp - NULL means visible to user, set means hidden but preserved';
