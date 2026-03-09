-- College ROI Calculator — Database Schema
-- Migration 005: major_salary_data + roi_calculations tables

-- ============================================================
-- TABLE: major_salary_data
-- Median salary and growth data by major
-- ============================================================
CREATE TABLE IF NOT EXISTS major_salary_data (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  major               TEXT        NOT NULL UNIQUE,
  median_salary       INTEGER     NOT NULL,
  salary_growth_rate  FLOAT       DEFAULT 0.03,   -- Annual salary growth rate (e.g. 0.03 = 3%)
  salary_10yr         INTEGER,                     -- Salary 10 years post-graduation
  source              TEXT        DEFAULT 'bureau_of_labor_statistics',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_major_salary_major ON major_salary_data(major);

-- ============================================================
-- SEED: major_salary_data
-- Source: BLS / NCES estimates (approximate 2024–2025 medians)
-- ============================================================
INSERT INTO major_salary_data (major, median_salary, salary_growth_rate, salary_10yr) VALUES
  ('Agriculture',                 42000, 0.025, 54000),
  ('Architecture',                52000, 0.030, 70000),
  ('Arts & Design',               40000, 0.020, 49000),
  ('Biology & Life Sciences',     45000, 0.035, 63000),
  ('Business & Management',       58000, 0.040, 86000),
  ('Communications & Journalism', 42000, 0.025, 54000),
  ('Computer Science & IT',       78000, 0.050, 127000),
  ('Criminal Justice',            43000, 0.020, 52000),
  ('Education',                   40000, 0.020, 49000),
  ('Engineering',                 72000, 0.045, 112000),
  ('English & Literature',        38000, 0.020, 46000),
  ('Environmental Science',       46000, 0.030, 62000),
  ('Health Sciences',             52000, 0.035, 73000),
  ('History & Political Science', 42000, 0.025, 54000),
  ('Law',                         55000, 0.035, 77000),
  ('Mathematics',                 65000, 0.040, 96000),
  ('Medicine & Pre-Med',          55000, 0.040, 81000),
  ('Nursing',                     62000, 0.035, 87000),
  ('Psychology',                  42000, 0.025, 54000),
  ('Social Work',                 40000, 0.020, 49000),
  ('Science',                     50000, 0.035, 70000),
  ('Technology',                  72000, 0.045, 112000),
  ('Undecided',                   48000, 0.030, 65000)
ON CONFLICT (major) DO NOTHING;


-- ============================================================
-- TABLE: roi_calculations
-- Saved ROI calculation results per user
-- ============================================================
CREATE TABLE IF NOT EXISTS roi_calculations (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id        UUID        NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,

  -- Inputs
  major             TEXT        NOT NULL,
  years_of_study    INTEGER     DEFAULT 4,
  tuition_per_year  INTEGER     NOT NULL,
  scholarship_amount INTEGER   DEFAULT 0,
  living_cost_per_year INTEGER DEFAULT 12000,
  loan_interest_rate FLOAT     DEFAULT 0.05,
  is_in_state       BOOLEAN    DEFAULT false,

  -- Outputs
  total_cost        INTEGER     NOT NULL,
  net_cost          INTEGER     NOT NULL,
  loan_amount       INTEGER     NOT NULL,
  expected_salary   INTEGER     NOT NULL,
  monthly_payment   FLOAT       NOT NULL,
  repayment_years   FLOAT       NOT NULL,
  roi_score         FLOAT       NOT NULL,
  roi_category      TEXT        NOT NULL CHECK (roi_category IN ('high', 'medium', 'low')),

  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roi_user     ON roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_college  ON roi_calculations(college_id);


-- ============================================================
-- RLS Policies
-- ============================================================

-- major_salary_data: public read
ALTER TABLE major_salary_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for major salary data"
  ON major_salary_data FOR SELECT
  USING (true);


-- roi_calculations: users can read/write their own
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ROI calculations"
  ON roi_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ROI calculations"
  ON roi_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ROI calculations"
  ON roi_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Also allow anonymous reads for share links (via service role)
CREATE POLICY "Service role full access to ROI calculations"
  ON roi_calculations FOR ALL
  USING (auth.role() = 'service_role');
