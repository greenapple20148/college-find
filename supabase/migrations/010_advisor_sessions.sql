-- ============================================================================
-- 010: Advisor Sessions
-- Stores AI advisor conversations for logged-in users
-- ============================================================================

CREATE TABLE IF NOT EXISTS advisor_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title       TEXT,                                          -- auto-generated from first message
    messages    JSONB NOT NULL DEFAULT '[]'::jsonb,            -- [{role, content, timestamp}]
    recommended_colleges_json JSONB DEFAULT NULL,              -- snapshot of recommended colleges
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_advisor_sessions_user    ON advisor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_sessions_updated ON advisor_sessions(user_id, updated_at DESC);

-- RLS
ALTER TABLE advisor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor sessions"
    ON advisor_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
