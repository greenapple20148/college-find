-- ============================================================
-- SAT ACE — ALTER TABLE: Add subtopic & status to sat_questions
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add subtopic column (nullable, for granular categorization)
ALTER TABLE sat_questions
  ADD COLUMN IF NOT EXISTS subtopic TEXT;

-- Add status column (draft → review → published → archived)
ALTER TABLE sat_questions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'review', 'published', 'archived'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sat_questions_subtopic ON sat_questions(subtopic);
CREATE INDEX IF NOT EXISTS idx_sat_questions_status ON sat_questions(status);

-- Set existing rows to 'published' (they were already active)
UPDATE sat_questions SET status = 'published' WHERE status = 'draft';
