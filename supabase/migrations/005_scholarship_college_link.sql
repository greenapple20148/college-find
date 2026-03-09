-- Migration: Link scholarships to specific colleges
-- Adds a college_id FK so university-specific scholarships can be browsed per college

ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scholarships_college ON scholarships(college_id);
