-- CollegeFind Phase 6: Stripe subscriptions and billing
-- Run in Supabase SQL Editor after 005_roi_calculator.sql

-- ─── 1. Add stripe_customer_id to user_profiles ──────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'
    CHECK (plan IN ('free', 'student-pro', 'prep-pro-plus', 'toolkit', 'bundle'));

-- ─── 2. Subscriptions table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id  TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id     TEXT,
  plan_id             TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'unpaid')),
  billing_cycle       TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'one_time')),
  current_period_start TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  cancel_at           TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
DROP POLICY IF EXISTS "users read own subscriptions" ON subscriptions;
CREATE POLICY "users read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhook handler)
DROP POLICY IF EXISTS "service role manage subscriptions" ON subscriptions;
CREATE POLICY "service role manage subscriptions"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── 3. One-time purchases table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS one_time_purchases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  plan_id           TEXT NOT NULL,
  amount_paid       INTEGER NOT NULL,  -- cents
  expires_at        TIMESTAMPTZ,       -- when access expires (e.g. 6 months)
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE one_time_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own purchases" ON one_time_purchases;
CREATE POLICY "users read own purchases"
  ON one_time_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- ─── 4. Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user
  ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub
  ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user
  ON one_time_purchases(user_id);

-- ─── 5. Updated-at trigger ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
