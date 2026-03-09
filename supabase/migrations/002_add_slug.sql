-- CollegeFind: Add slug column for SEO-friendly college profile URLs
-- Run this in the Supabase SQL Editor after the initial 001_init.sql migration

-- 1. Add slug column
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Populate slug from name
--    Pattern: lowercase → remove non-alphanumeric (keep spaces) → spaces to hyphens → collapse double hyphens
UPDATE colleges
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-{2,}', '-', 'g'
  )
)
WHERE slug IS NULL;

-- 3. Disambiguate duplicate slugs by appending first 6 chars of unit_id for all but the largest enrollment
WITH ranked AS (
  SELECT
    id,
    slug,
    unit_id,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY enrollment DESC NULLS LAST) AS rn
  FROM colleges
  WHERE slug IN (
    SELECT slug FROM colleges GROUP BY slug HAVING COUNT(*) > 1
  )
)
UPDATE colleges c
SET slug = c.slug || '-' || lower(substring(c.unit_id, 1, 6))
FROM ranked r
WHERE c.id = r.id AND r.rn > 1;

-- 4. Add unique index on slug for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_colleges_slug ON colleges(slug);

-- 5. Add GIN index on programs[] for array containment queries
CREATE INDEX IF NOT EXISTS idx_colleges_programs ON colleges USING GIN(programs);

-- Verify: SELECT name, slug FROM colleges ORDER BY enrollment DESC NULLS LAST LIMIT 10;
