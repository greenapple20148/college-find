-- CollegeFind Phase 7: Application Checklists
-- Run in Supabase SQL Editor after 006_subscriptions.sql

-- ─── 1. application_checklists table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_checklists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id  UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  task_name   TEXT NOT NULL,
  task_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (task_status IN ('pending', 'completed')),
  due_date    DATE,
  is_custom   BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate tasks per user/college
  UNIQUE(user_id, college_id, task_name)
);

ALTER TABLE application_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own checklists" ON application_checklists;
CREATE POLICY "users manage own checklists"
  ON application_checklists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 2. Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_checklists_user
  ON application_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_user_college
  ON application_checklists(user_id, college_id);

-- ─── Verify ──────────────────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'application_checklists';
