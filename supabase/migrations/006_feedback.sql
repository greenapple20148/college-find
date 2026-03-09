-- Migration: Feedback table
-- Stores user feedback submissions

CREATE TABLE IF NOT EXISTS feedback (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT,                                 -- nullable (anonymous feedback allowed)
  category    TEXT        NOT NULL DEFAULT 'general'
              CHECK (category IN ('general','bug','feature','content','other')),
  rating      INTEGER     CHECK (rating >= 1 AND rating <= 5),
  message     TEXT        NOT NULL,
  page_url    TEXT,                                 -- which page the feedback was submitted from
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback
DROP POLICY IF EXISTS "feedback_insert" ON feedback;
CREATE POLICY "feedback_insert"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Only service role can read feedback (admin)
DROP POLICY IF EXISTS "feedback_select" ON feedback;
CREATE POLICY "feedback_select"
  ON feedback FOR SELECT
  USING (false);
