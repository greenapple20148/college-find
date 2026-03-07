# Database Schema
## CollegeMatch — Supabase (PostgreSQL)

---

## Tables

### `colleges`

Primary store for all U.S. institution data, seeded from College Scorecard API.

```sql
CREATE TABLE colleges (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id           TEXT        UNIQUE NOT NULL,           -- IPEDS unitid
  name              TEXT        NOT NULL,
  city              TEXT,
  state             TEXT,                                   -- 2-letter abbreviation
  zip               TEXT,
  website           TEXT,

  -- Institutional characteristics
  control           TEXT,       -- 'public' | 'private_nonprofit' | 'private_forprofit'
  level             TEXT,       -- 'four_year' | 'two_year' | 'less_than_two_year'
  enrollment        INTEGER,    -- Total undergraduate enrollment
  size_category     TEXT,       -- 'small' | 'medium' | 'large'

  -- Cost
  tuition_in_state  INTEGER,    -- Annual in-state tuition (dollars)
  tuition_out_state INTEGER,    -- Annual out-of-state tuition (dollars)
  net_price         INTEGER,    -- Average annual net price, all students

  -- Admissions
  acceptance_rate   FLOAT,      -- 0.0–1.0 (null = not reported / open admission)
  sat_math_25       INTEGER,
  sat_math_50       INTEGER,    -- SAT Math median
  sat_math_75       INTEGER,
  sat_read_25       INTEGER,
  sat_read_50       INTEGER,    -- SAT Reading & Writing median
  sat_read_75       INTEGER,
  act_25            INTEGER,
  act_50            INTEGER,    -- ACT Composite median
  act_75            INTEGER,

  -- Outcomes
  graduation_rate   FLOAT,      -- 4-year graduation rate (0.0–1.0)
  median_earnings   INTEGER,    -- Median earnings 10 years post-entry (dollars)

  -- Programs (CIP categories)
  programs          TEXT[],     -- e.g. ['Computer Science', 'Nursing', 'Business']

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common filter queries
CREATE INDEX idx_colleges_state           ON colleges(state);
CREATE INDEX idx_colleges_control         ON colleges(control);
CREATE INDEX idx_colleges_acceptance_rate ON colleges(acceptance_rate);
CREATE INDEX idx_colleges_tuition_out     ON colleges(tuition_out_state);
CREATE INDEX idx_colleges_size            ON colleges(size_category);
CREATE INDEX idx_colleges_name_search     ON colleges USING GIN(to_tsvector('english', name));
```

---

### `saved_colleges`

Tracks a student's saved list. Session-scoped (anonymous session ID from localStorage).

```sql
CREATE TABLE saved_colleges (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  TEXT        NOT NULL,                         -- UUID from localStorage
  college_id  UUID        NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  deadline    DATE,                                         -- Application deadline
  status      TEXT        DEFAULT 'not_started',
              -- ENUM: 'not_started' | 'in_progress' | 'submitted'
              --        | 'accepted' | 'rejected' | 'waitlisted'
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE(session_id, college_id)
);

CREATE INDEX idx_saved_session ON saved_colleges(session_id);
```

---

### `scholarships`

Pre-curated list of national and state scholarships. Hand-seeded.

```sql
CREATE TABLE scholarships (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  provider     TEXT,
  amount       INTEGER,                                     -- dollars per year
  amount_type  TEXT,       -- 'fixed' | 'per_year' | 'full_tuition' | 'varies'
  gpa_min      FLOAT,      -- Minimum GPA required (null = no requirement)
  states       TEXT[],     -- Eligible states (empty array = all states)
  majors       TEXT[],     -- Eligible major areas (empty array = all majors)
  deadline     DATE,       -- null = rolling
  website      TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scholarships_gpa    ON scholarships(gpa_min);
CREATE INDEX idx_scholarships_states ON scholarships USING GIN(states);
CREATE INDEX idx_scholarships_majors ON scholarships USING GIN(majors);
```

---

## Row Level Security

```sql
-- Enable RLS
ALTER TABLE colleges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_colleges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships    ENABLE ROW LEVEL SECURITY;

-- colleges: public read-only
CREATE POLICY "colleges_public_read" ON colleges
  FOR SELECT USING (true);

-- saved_colleges: session-scoped read/write
-- Note: session_id is passed as a query param and validated server-side
-- API routes use service role key, so RLS is bypassed server-side.
-- For direct client access (future auth), add:
CREATE POLICY "saved_own_session" ON saved_colleges
  FOR ALL USING (session_id = current_setting('app.session_id', true));

-- scholarships: public read-only
CREATE POLICY "scholarships_public_read" ON scholarships
  FOR SELECT USING (true);
```

---

## Size Category Logic

Applied at seed time based on `enrollment`:

| Range | Category |
|-------|----------|
| < 2,000 | small |
| 2,000 – 14,999 | medium |
| ≥ 15,000 | large |

---

## Field Source Mapping (College Scorecard API → Schema)

| Schema Field | Scorecard API Field |
|---|---|
| unit_id | id |
| name | school.name |
| city | school.city |
| state | school.state |
| zip | school.zip |
| website | school.school_url |
| control | school.ownership (1=public, 2=private_nonprofit, 3=private_forprofit) |
| level | school.institutional_characteristics.level (1=four_year, 2=two_year) |
| enrollment | latest.student.size |
| tuition_in_state | latest.cost.tuition.in_state |
| tuition_out_state | latest.cost.tuition.out_of_state |
| net_price | latest.cost.avg_net_price.overall |
| acceptance_rate | latest.admissions.admission_rate.overall |
| sat_math_25/50/75 | latest.admissions.sat_scores.25th_percentile.math / midpoint.math / 75th_percentile.math |
| sat_read_25/50/75 | latest.admissions.sat_scores.25th_percentile.read_write / midpoint.read_write / 75th_percentile.read_write |
| act_25/50/75 | latest.admissions.act_scores.25th_percentile.cumulative / midpoint.cumulative / 75th_percentile.cumulative |
| graduation_rate | latest.completion.rate_suppressed.overall |
| median_earnings | latest.earnings.10_yrs_after_entry.median |
