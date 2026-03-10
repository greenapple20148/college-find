-- CollegeFind: Feature usage tracking + plan update
-- Run in Supabase SQL Editor

-- ─── 1. Usage Tracking Table ──────────────────────────────────────────────────
-- Records each feature usage event for enforcing daily/monthly/total limits.
-- Queries filter by (user_id, feature, created_at >= period_start).

CREATE TABLE IF NOT EXISTS usage_tracking (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
DROP POLICY IF EXISTS "users read own usage" ON usage_tracking;
CREATE POLICY "users read own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage (for API routes recording usage)
DROP POLICY IF EXISTS "service manage usage" ON usage_tracking;
CREATE POLICY "service manage usage"
  ON usage_tracking FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── 2. Indexes ───────────────────────────────────────────────────────────────
-- Composite index for the primary query pattern:
-- WHERE user_id = ? AND feature = ? AND created_at >= ?
CREATE INDEX IF NOT EXISTS idx_usage_user_feature_date
  ON usage_tracking(user_id, feature, created_at DESC);

-- ─── 3. Auto-cleanup of old usage records ─────────────────────────────────────
-- Purge records older than 60 days (daily limits only need today; monthly need 31 days)
-- Run as a Supabase scheduled function or cron job
-- Example: SELECT cron.schedule('cleanup-usage', '0 3 * * *',
--   $$DELETE FROM usage_tracking WHERE created_at < now() - interval '60 days'$$);

-- ─── 4. Update plan CHECK constraint to include new plan IDs ──────────────────
-- The existing constraint only allows: free, student-pro, prep-pro-plus, toolkit, bundle
-- We need to also allow: pro, premium

-- Drop the old constraint and recreate with expanded values
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_plan_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_plan_check
  CHECK (plan IN ('free', 'pro', 'premium', 'student-pro', 'prep-pro-plus', 'toolkit', 'bundle'));

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'usage_tracking';
