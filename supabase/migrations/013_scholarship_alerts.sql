-- ══════════════════════════════════════════════════════════════
-- Migration 013: Scholarship Alerts
-- ══════════════════════════════════════════════════════════════

-- Stores per-user scholarship alert preferences
CREATE TABLE IF NOT EXISTS scholarship_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    criteria JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- RLS
ALTER TABLE scholarship_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own alerts"
    ON scholarship_alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
    ON scholarship_alerts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
    ON scholarship_alerts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
    ON scholarship_alerts FOR DELETE
    USING (auth.uid() = user_id);

-- Service role bypass for API routes
CREATE POLICY "Service role full access on scholarship_alerts"
    ON scholarship_alerts FOR ALL
    USING (auth.role() = 'service_role');
