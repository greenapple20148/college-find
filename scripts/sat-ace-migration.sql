-- ============================================================
-- SAT ACE — Database Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── SAT Questions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('math', 'reading', 'writing')),
  topic TEXT NOT NULL,
  subtopic TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  passage_text TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  active_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sat_questions_section ON sat_questions(section);
CREATE INDEX IF NOT EXISTS idx_sat_questions_difficulty ON sat_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_sat_questions_topic ON sat_questions(topic);
CREATE INDEX IF NOT EXISTS idx_sat_questions_subtopic ON sat_questions(subtopic);
CREATE INDEX IF NOT EXISTS idx_sat_questions_status ON sat_questions(status);
CREATE INDEX IF NOT EXISTS idx_sat_questions_active ON sat_questions(active_status);

-- ─── Practice Sessions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  total_questions INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0,
  time_spent INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sat_sessions_user ON sat_practice_sessions(user_id);

-- ─── Question Attempts ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES sat_questions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sat_practice_sessions(id) ON DELETE SET NULL,
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  time_spent INT NOT NULL DEFAULT 0,
  section TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sat_attempts_user ON sat_question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_sat_attempts_question ON sat_question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_sat_attempts_topic ON sat_question_attempts(topic);
CREATE INDEX IF NOT EXISTS idx_sat_attempts_date ON sat_question_attempts(created_at);

-- ─── Mock Tests ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  math_question_ids UUID[] NOT NULL DEFAULT '{}',
  rw_question_ids UUID[] NOT NULL DEFAULT '{}',
  math_time_minutes INT NOT NULL DEFAULT 64,
  rw_time_minutes INT NOT NULL DEFAULT 64,
  total_questions INT NOT NULL DEFAULT 98,
  active_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Mock Test Attempts ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_mock_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_test_id UUID NOT NULL REFERENCES sat_mock_tests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed')),
  current_section TEXT NOT NULL DEFAULT 'rw',
  current_question_index INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  math_score INT,
  rw_score INT,
  total_score INT,
  time_spent INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sat_mock_attempts_user ON sat_mock_test_attempts(user_id);

-- ─── Study Plans ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_score INT NOT NULL,
  target_score INT NOT NULL,
  exam_date DATE NOT NULL,
  hours_per_week INT NOT NULL DEFAULT 5,
  strongest_section TEXT NOT NULL,
  weakest_section TEXT NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sat_plans_user ON sat_study_plans(user_id);

-- ─── Study Tasks ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES sat_study_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week INT NOT NULL,
  day INT NOT NULL DEFAULT 0,
  task_type TEXT NOT NULL DEFAULT 'practice',
  section TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  quantity INT NOT NULL DEFAULT 10,
  description TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sat_tasks_plan ON sat_study_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_sat_tasks_user ON sat_study_tasks(user_id);

-- ─── Score History ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'calculator' CHECK (source IN ('calculator', 'mock_test', 'practice')),
  math_score INT NOT NULL,
  rw_score INT NOT NULL,
  total_score INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sat_scores_user ON sat_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sat_scores_date ON sat_score_history(created_at);

-- ─── AI Explanations ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sat_ai_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES sat_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  explanation_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sat_explanations_question ON sat_ai_explanations(question_id);
CREATE INDEX IF NOT EXISTS idx_sat_explanations_user ON sat_ai_explanations(user_id);

-- ─── RLS Policies ───────────────────────────────────────────
ALTER TABLE sat_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_mock_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_ai_explanations ENABLE ROW LEVEL SECURITY;

-- Questions are readable by everyone
CREATE POLICY "Questions are public" ON sat_questions FOR SELECT USING (true);

-- Mock tests are readable by everyone
CREATE POLICY "Mock tests are public" ON sat_mock_tests FOR SELECT USING (true);

-- User-owned data policies
CREATE POLICY "Users own their sessions" ON sat_practice_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their attempts" ON sat_question_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their mock attempts" ON sat_mock_test_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their plans" ON sat_study_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their tasks" ON sat_study_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their scores" ON sat_score_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their explanations" ON sat_ai_explanations
  FOR ALL USING (auth.uid() = user_id);

-- Service role can manage everything (for admin/API)
CREATE POLICY "Service manages questions" ON sat_questions
  FOR ALL USING (true) WITH CHECK (true);
