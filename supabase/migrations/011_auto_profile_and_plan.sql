-- CollegeFind: Auto-create user_profiles on signup + fix plan column
-- Run in Supabase SQL Editor

-- ─── 1. Ensure plan column exists ──────────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- ─── 2. Auto-create profile on signup ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. Backfill: create profiles for existing users who don't have one ────
INSERT INTO user_profiles (user_id, plan)
SELECT id, 'free' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ─── 4. Verify ─────────────────────────────────────────────────────────────
-- SELECT user_id, plan FROM user_profiles;
