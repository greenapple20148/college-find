-- CollegeFind Phase 2: Auth, user profiles, and deadline columns
-- Run in Supabase SQL Editor after 001_init.sql and 002_add_slug.sql

-- ─── 1. user_profiles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  gpa             FLOAT,
  sat_score       INTEGER,
  act_score       INTEGER,
  major           TEXT,
  preferred_states TEXT[] DEFAULT '{}',
  budget_max      INTEGER,
  campus_size     TEXT DEFAULT 'any'
    CHECK (campus_size IN ('small', 'medium', 'large', 'any')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own profile" ON user_profiles;
CREATE POLICY "users manage own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 2. Add user_id to saved_colleges (nullable — keeps anonymous saves) ─────
ALTER TABLE saved_colleges
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Unique index for authenticated saves (user-scoped, partial — ignores NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_user_college
  ON saved_colleges(user_id, college_id)
  WHERE user_id IS NOT NULL;

-- RLS policy for auth-scoped saved_colleges
-- (service role key still bypasses RLS for anonymous session-based saves)
DROP POLICY IF EXISTS "users manage own saved colleges" ON saved_colleges;
CREATE POLICY "users manage own saved colleges"
  ON saved_colleges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 3. Deadline columns on colleges ─────────────────────────────────────────
ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS early_action_deadline DATE,
  ADD COLUMN IF NOT EXISTS regular_deadline      DATE;

-- ─── 4. updated_at trigger for user_profiles ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'saved_colleges';
