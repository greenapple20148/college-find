-- CollegeFind Phase 4: College Deadlines Ingestion System
-- Run in Supabase SQL Editor after 001, 002, 003

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: college_deadlines
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS college_deadlines (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id                UUID        NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,

  -- Application deadlines
  early_action_deadline     DATE,
  early_decision_1_deadline DATE,
  early_decision_2_deadline DATE,
  regular_decision_deadline DATE,

  -- Rolling & transfer
  rolling_admission         BOOLEAN     DEFAULT false,
  transfer_fall_deadline    DATE,
  transfer_spring_deadline  DATE,

  -- Financial aid deadlines
  scholarship_priority_deadline DATE,
  fafsa_priority_deadline      DATE,

  -- Source tracking
  source_url                TEXT        NOT NULL,
  source_type               TEXT        NOT NULL DEFAULT 'official'
                            CHECK (source_type IN ('official', 'commonapp', 'manual')),

  -- Verification
  verification_status       TEXT        NOT NULL DEFAULT 'needs_review'
                            CHECK (verification_status IN (
                              'official_verified',
                              'commonapp_verified',
                              'needs_review'
                            )),
  last_verified_at          TIMESTAMPTZ,
  verified_by               TEXT,       -- admin email or 'scraper'

  -- Cycle year (e.g. 2026 for 2025-2026 application cycle)
  cycle_year                INTEGER     NOT NULL DEFAULT 2026,

  -- Admin notes
  admin_notes               TEXT        DEFAULT '',

  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now(),

  -- One record per college per cycle
  UNIQUE(college_id, cycle_year)
);

-- ─── Indexes ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deadlines_college
  ON college_deadlines(college_id);

CREATE INDEX IF NOT EXISTS idx_deadlines_cycle
  ON college_deadlines(cycle_year);

CREATE INDEX IF NOT EXISTS idx_deadlines_verification
  ON college_deadlines(verification_status);

CREATE INDEX IF NOT EXISTS idx_deadlines_ea
  ON college_deadlines(early_action_deadline)
  WHERE early_action_deadline IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deadlines_rd
  ON college_deadlines(regular_decision_deadline)
  WHERE regular_decision_deadline IS NOT NULL;

-- ─── Row-Level Security ────────────────────────────────────────────
ALTER TABLE college_deadlines ENABLE ROW LEVEL SECURITY;

-- Public read-only for all users
DROP POLICY IF EXISTS "deadlines_public_read" ON college_deadlines;
CREATE POLICY "deadlines_public_read"
  ON college_deadlines FOR SELECT
  USING (true);

-- Admin write via service role (bypasses RLS)
-- No INSERT/UPDATE/DELETE policies for anon — all writes go through API with service key

-- ─── Auto-update trigger ───────────────────────────────────────────
DROP TRIGGER IF EXISTS college_deadlines_updated_at ON college_deadlines;
CREATE TRIGGER college_deadlines_updated_at
  BEFORE UPDATE ON college_deadlines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Drop legacy columns from colleges table ──────────────────────
-- (these existed from migration 003 — now superseded by college_deadlines)
ALTER TABLE colleges
  DROP COLUMN IF EXISTS early_action_deadline,
  DROP COLUMN IF EXISTS regular_deadline;

-- ─── Verify ────────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'college_deadlines';
