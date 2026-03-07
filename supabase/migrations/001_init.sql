-- CollegeMatch — Initial Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run

-- ============================================================
-- TABLE: colleges
-- ============================================================
CREATE TABLE IF NOT EXISTS colleges (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id           TEXT        UNIQUE NOT NULL,
  name              TEXT        NOT NULL,
  city              TEXT,
  state             TEXT,
  zip               TEXT,
  website           TEXT,

  -- Institutional characteristics
  control           TEXT,       -- 'public' | 'private_nonprofit' | 'private_forprofit'
  level             TEXT,       -- 'four_year' | 'two_year' | 'less_than_two_year'
  enrollment        INTEGER,
  size_category     TEXT,       -- 'small' | 'medium' | 'large'

  -- Cost
  tuition_in_state  INTEGER,
  tuition_out_state INTEGER,
  net_price         INTEGER,

  -- Admissions
  acceptance_rate   FLOAT,
  sat_math_25       INTEGER,
  sat_math_50       INTEGER,
  sat_math_75       INTEGER,
  sat_read_25       INTEGER,
  sat_read_50       INTEGER,
  sat_read_75       INTEGER,
  act_25            INTEGER,
  act_50            INTEGER,
  act_75            INTEGER,

  -- Outcomes
  graduation_rate   FLOAT,
  median_earnings   INTEGER,

  -- Programs
  programs          TEXT[]      DEFAULT '{}',

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_colleges_state           ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_control         ON colleges(control);
CREATE INDEX IF NOT EXISTS idx_colleges_acceptance_rate ON colleges(acceptance_rate);
CREATE INDEX IF NOT EXISTS idx_colleges_tuition_out     ON colleges(tuition_out_state);
CREATE INDEX IF NOT EXISTS idx_colleges_size            ON colleges(size_category);
CREATE INDEX IF NOT EXISTS idx_colleges_net_price       ON colleges(net_price);
CREATE INDEX IF NOT EXISTS idx_colleges_name_search     ON colleges USING GIN(to_tsvector('english', name));

-- ============================================================
-- TABLE: saved_colleges
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_colleges (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  TEXT        NOT NULL,
  college_id  UUID        NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  deadline    DATE,
  status      TEXT        DEFAULT 'not_started'
              CHECK (status IN ('not_started','in_progress','submitted','accepted','rejected','waitlisted')),
  notes       TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE(session_id, college_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_session    ON saved_colleges(session_id);
CREATE INDEX IF NOT EXISTS idx_saved_college    ON saved_colleges(college_id);

-- ============================================================
-- TABLE: scholarships
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarships (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  provider     TEXT,
  amount       INTEGER,
  amount_type  TEXT        DEFAULT 'fixed'
               CHECK (amount_type IN ('fixed','per_year','full_tuition','varies')),
  gpa_min      FLOAT,
  states       TEXT[]      DEFAULT '{}',
  majors       TEXT[]      DEFAULT '{}',
  deadline     DATE,
  website      TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scholarships_gpa    ON scholarships(gpa_min);
CREATE INDEX IF NOT EXISTS idx_scholarships_states ON scholarships USING GIN(states);
CREATE INDEX IF NOT EXISTS idx_scholarships_majors ON scholarships USING GIN(majors);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE colleges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_colleges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships    ENABLE ROW LEVEL SECURITY;

-- Public read-only for colleges
DROP POLICY IF EXISTS "colleges_public_read" ON colleges;
CREATE POLICY "colleges_public_read"
  ON colleges FOR SELECT USING (true);

-- Public read-only for scholarships
DROP POLICY IF EXISTS "scholarships_public_read" ON scholarships;
CREATE POLICY "scholarships_public_read"
  ON scholarships FOR SELECT USING (true);

-- saved_colleges: server-side only via service role (bypasses RLS)
DROP POLICY IF EXISTS "saved_select_own" ON saved_colleges;
CREATE POLICY "saved_select_own"
  ON saved_colleges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "saved_insert_own" ON saved_colleges;
CREATE POLICY "saved_insert_own"
  ON saved_colleges FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "saved_update_own" ON saved_colleges;
CREATE POLICY "saved_update_own"
  ON saved_colleges FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "saved_delete_own" ON saved_colleges;
CREATE POLICY "saved_delete_own"
  ON saved_colleges FOR DELETE
  USING (true);

-- ============================================================
-- SEED: Scholarships
-- ============================================================
INSERT INTO scholarships (name, provider, amount, amount_type, gpa_min, states, majors, deadline, website, description)
VALUES
  (
    'Gates Scholarship',
    'Gates Foundation',
    NULL, 'full_tuition', 3.3, '{}', '{}',
    '2026-09-15',
    'https://www.thegatesscholarship.org',
    'Full scholarship for high-achieving minority students from low-income households. Covers full cost of attendance at any accredited U.S. college.'
  ),
  (
    'Coca-Cola Scholars Program',
    'Coca-Cola Scholars Foundation',
    20000, 'fixed', 3.0, '{}', '{}',
    '2025-10-31',
    'https://www.coca-colascholarsfoundation.org',
    '$20,000 scholarship awarded to 150 high school seniors annually. Based on leadership, service, and academic achievement.'
  ),
  (
    'Questbridge National College Match',
    'QuestBridge',
    NULL, 'full_tuition', 3.5, '{}', '{}',
    '2025-09-26',
    'https://www.questbridge.org',
    'Full four-year scholarship to 45+ partner colleges for high-achieving, low-income students. Covers tuition, room, board, and fees.'
  ),
  (
    'Jack Kent Cooke Foundation College Scholarship',
    'Jack Kent Cooke Foundation',
    55000, 'per_year', 3.5, '{}', '{}',
    '2026-11-15',
    'https://www.jkcf.org',
    'Up to $55,000/year for high-achieving students with financial need transferring from community college to a four-year institution.'
  ),
  (
    'Dell Scholars Program',
    'Michael & Susan Dell Foundation',
    20000, 'fixed', 2.4, '{}', '{}',
    '2026-12-01',
    'https://www.dellscholars.org',
    '$20,000 scholarship plus laptop, resources, and ongoing support for students overcoming significant obstacles.'
  ),
  (
    'Ron Brown Scholar Program',
    'Ron Brown Scholar Fund',
    40000, 'fixed', 3.0, '{}', '{}',
    '2026-01-09',
    'https://www.ronbrown.org',
    '$10,000/year (4 years) for African American students who demonstrate academic excellence, leadership, and service.'
  ),
  (
    'Hispanic Scholarship Fund',
    'Hispanic Scholarship Fund',
    5000, 'per_year', 3.0, '{}', '{}',
    '2026-02-15',
    'https://www.hsf.net',
    '$500–$5,000 awards for Hispanic American students pursuing undergraduate degrees. Based on merit and financial need.'
  ),
  (
    'UNCF Scholarships',
    'United Negro College Fund',
    3000, 'per_year', 2.5, '{}', '{}',
    NULL,
    'https://scholarships.uncf.org',
    'Multiple scholarship programs for African American students. Awards range from $3,000–$10,000. Rolling deadlines vary by program.'
  ),
  (
    'Elks National Foundation Most Valuable Student',
    'Elks National Foundation',
    4000, 'per_year', 3.0, '{}', '{}',
    '2026-11-15',
    'https://www.elks.org/scholars',
    '$1,000–$4,000/year for high school seniors who demonstrate scholarship, leadership, and financial need. Must apply through local Elks lodge.'
  ),
  (
    'Regeneron Science Talent Search',
    'Society for Science',
    250000, 'fixed', 3.5, '{}',
    ARRAY['Science', 'Technology', 'Engineering', 'Mathematics'],
    '2025-11-13',
    'https://www.societyforscience.org/regeneron-sts',
    'Top prize of $250,000 for high school seniors who complete original science research projects. One of the most prestigious STEM competitions.'
  ),
  (
    'National Merit Scholarship',
    'National Merit Scholarship Corporation',
    2500, 'fixed', NULL, '{}', '{}',
    NULL,
    'https://www.nationalmerit.org',
    '$2,500 one-time award for National Merit Finalists. Must take PSAT and score in top percentile. Additional corporate-sponsored awards available.'
  ),
  (
    'Nursing Scholarship Program',
    'Health Resources & Services Administration (HRSA)',
    NULL, 'full_tuition', 2.0, '{}',
    ARRAY['Nursing', 'Health Sciences'],
    '2026-05-01',
    'https://bhw.hrsa.gov/nursing-workforce',
    'Full tuition, fees, and monthly stipend for nursing students who commit to working in underserved areas after graduation.'
  ),
  (
    'American Indian College Fund',
    'American Indian College Fund',
    3000, 'per_year', 2.0, '{}', '{}',
    NULL,
    'https://collegefund.org',
    'Scholarships from $500–$3,000 for Native American students attending tribal colleges or universities. Rolling deadlines.'
  ),
  (
    'Daughters of the American Revolution Scholarship',
    'National Society DAR',
    3000, 'fixed', 3.25, '{}', '{}',
    '2026-01-31',
    'https://www.dar.org/national-society/scholarships',
    'Multiple scholarship programs including nursing, medical, and general academic awards for U.S. citizens.'
  ),
  (
    'College JumpStart Scholarship',
    'College JumpStart Scholarship Fund',
    1000, 'fixed', NULL, '{}', '{}',
    '2026-04-15',
    'https://www.jumpstart-scholarship.net',
    '$1,000 scholarship open to 10th–12th graders and college students. Based on commitment to education and personal statement.'
  ),
  (
    'California Student Aid Commission Cal Grant',
    'California Student Aid Commission',
    9220, 'per_year', 3.0, ARRAY['CA'], '{}',
    '2026-03-02',
    'https://www.csac.ca.gov',
    'Up to $9,220/year for California residents attending California colleges. Need-based and merit criteria. Must file FAFSA/CADAA.'
  ),
  (
    'New York State Tuition Assistance Program (TAP)',
    'New York State Higher Education Services Corporation',
    5665, 'per_year', NULL, ARRAY['NY'], '{}',
    NULL,
    'https://www.hesc.ny.gov/pay-for-college/financial-aid/types-of-financial-aid/grants/tap.html',
    'Up to $5,665/year for New York residents attending NY colleges full-time. Need-based. File FAFSA and TAP application.'
  ),
  (
    'Texas Public Education Grant',
    'Texas Higher Education Coordinating Board',
    6000, 'per_year', NULL, ARRAY['TX'], '{}',
    NULL,
    'https://www.thecb.state.tx.us',
    'Need-based grant for Texas residents attending Texas public universities. Award amounts vary by institution.'
  ),
  (
    'Florida Bright Futures Scholarship',
    'Florida Department of Education',
    3400, 'per_year', 3.5, ARRAY['FL'], '{}',
    NULL,
    'https://www.floridastudentfinancialaidsg.org',
    'Merit-based scholarship for Florida high school graduates attending Florida colleges. Florida Academic Scholars: 100% tuition. Florida Medallion: 75% tuition.'
  ),
  (
    'STEM Education Coalition Scholarship',
    'STEM Education Coalition',
    5000, 'fixed', 3.0, '{}',
    ARRAY['Computer Science', 'Engineering', 'Mathematics', 'Science', 'Technology'],
    '2026-04-01',
    'https://www.stemedcoalition.org',
    '$5,000 award for students pursuing degrees in STEM fields. Based on academic achievement, essay, and demonstrated interest in STEM.'
  )
ON CONFLICT DO NOTHING;
