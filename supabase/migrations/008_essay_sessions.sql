-- CollegeFind Phase 8: Essay Brainstorming Sessions
-- Run in Supabase SQL Editor after 007_checklists.sql

-- ─── 1. essay_sessions table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS essay_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  major             TEXT,
  activities        TEXT,
  leadership        TEXT,
  challenges        TEXT,
  achievements      TEXT,
  goals             TEXT,
  values            TEXT,
  essay_prompt      TEXT NOT NULL,
  generated_output  JSONB,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE essay_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own essay sessions" ON essay_sessions;
CREATE POLICY "users manage own essay sessions"
  ON essay_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_essay_sessions_user
  ON essay_sessions(user_id);
