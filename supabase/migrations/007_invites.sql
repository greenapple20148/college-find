CREATE TABLE IF NOT EXISTS invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inviter_email TEXT NOT NULL,
    invitee_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_invites_inviter ON invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_invitee ON invites(invitee_email);

-- Unique constraint: prevent duplicate invites
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_unique
    ON invites(inviter_id, invitee_email);

-- RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Users can see their own sent invites
CREATE POLICY "Users can read own invites"
    ON invites FOR SELECT
    USING (inviter_id = auth.uid());

-- Only service role can insert (via API)
CREATE POLICY "Service role inserts invites"
    ON invites FOR INSERT
    WITH CHECK (true);
