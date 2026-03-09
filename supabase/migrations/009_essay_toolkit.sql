-- CollegeFind Phase 9: Generic Essay Toolkit Sessions
-- Run in Supabase SQL Editor after 008

CREATE TABLE IF NOT EXISTS essay_toolkit_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type   TEXT NOT NULL,
  inputs_json JSONB NOT NULL DEFAULT '{}',
  ai_output   JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE essay_toolkit_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own toolkit sessions" ON essay_toolkit_sessions;
CREATE POLICY "users manage own toolkit sessions"
  ON essay_toolkit_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_toolkit_sessions_user
  ON essay_toolkit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_toolkit_sessions_tool
  ON essay_toolkit_sessions(user_id, tool_type);
