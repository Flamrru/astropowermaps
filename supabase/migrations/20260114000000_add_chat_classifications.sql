-- Migration: Add chat classifications tables for AI-powered chat analysis
-- This enables caching of GPT-5.2 classifications for the tracking dashboard

-- Table: chat_classifications
-- Stores AI classification results for each stella message
CREATE TABLE IF NOT EXISTS chat_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to the original message
  message_id UUID REFERENCES stella_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Classification results
  primary_topic TEXT NOT NULL,
  secondary_topics TEXT[] DEFAULT '{}',
  confidence DECIMAL(3,2) DEFAULT 0.00,

  -- Review flags
  needs_review BOOLEAN DEFAULT FALSE,
  review_reason TEXT,

  -- Pain point extraction (for ad insights)
  pain_point TEXT,
  pain_point_category TEXT,

  -- Metadata
  classified_at TIMESTAMPTZ DEFAULT NOW(),
  classifier_version TEXT DEFAULT 'v1',

  -- Prevent duplicate classifications
  CONSTRAINT unique_message_classification UNIQUE(message_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_chat_classifications_topic ON chat_classifications(primary_topic);
CREATE INDEX idx_chat_classifications_review ON chat_classifications(needs_review) WHERE needs_review = TRUE;
CREATE INDEX idx_chat_classifications_user ON chat_classifications(user_id);
CREATE INDEX idx_chat_classifications_date ON chat_classifications(classified_at DESC);
CREATE INDEX idx_chat_classifications_pain_point ON chat_classifications(pain_point_category) WHERE pain_point_category IS NOT NULL;

-- Table: chat_analysis_jobs
-- Tracks analysis job runs (daily cron and manual triggers)
CREATE TABLE IF NOT EXISTS chat_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job metadata
  job_type TEXT NOT NULL CHECK (job_type IN ('daily', 'manual')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Results
  messages_analyzed INTEGER DEFAULT 0,
  messages_classified INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT
);

CREATE INDEX idx_chat_analysis_jobs_status ON chat_analysis_jobs(status, started_at DESC);

-- RLS policies
ALTER TABLE chat_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access to classifications"
  ON chat_classifications
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to jobs"
  ON chat_analysis_jobs
  FOR ALL
  USING (auth.role() = 'service_role');
