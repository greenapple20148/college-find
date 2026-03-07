import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runMatch, applyPreferenceFilters } from '@/lib/matching'
import type { StudentProfile } from '@/lib/types'

const DISCLAIMER =
  'These are statistical estimates based on publicly available U.S. Department of Education data. They are NOT guarantees of admission and do not account for holistic factors including essays, recommendations, extracurriculars, or institutional priorities. Always consult with a school counselor.'

export async function POST(req: NextRequest) {
  let body: Partial<StudentProfile>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { gpa, sat_total, act, intended_major, preferred_states, budget_max, campus_size } = body

  if (gpa === undefined || typeof gpa !== 'number' || gpa < 0 || gpa > 4) {
    return NextResponse.json({ error: 'gpa is required (0.0–4.0)' }, { status: 400 })
  }

  const student: StudentProfile = {
    gpa,
    sat_total: sat_total ?? null,
    act: act ?? null,
    intended_major: intended_major ?? null,
    preferred_states: Array.isArray(preferred_states) ? preferred_states : [],
    budget_max: budget_max ?? null,
    campus_size: (campus_size as StudentProfile['campus_size']) ?? 'any',
  }

  const supabase = createServiceClient()

  // Fetch four-year colleges (limit to 2000 for performance, ordered by enrollment desc)
  const { data: colleges, error } = await supabase
    .from('colleges')
    .select('*')
    .eq('level', 'four_year')
    .not('acceptance_rate', 'is', null)
    .order('enrollment', { ascending: false })
    .limit(2000)

  if (error) {
    console.error('match route DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!colleges || colleges.length === 0) {
    return NextResponse.json({ error: 'No college data found. Please run the seed script.' }, { status: 503 })
  }

  const { filtered, statesRelaxed, budgetRelaxed } = applyPreferenceFilters(colleges, student)
  const { safety, match, reach } = runMatch(student, filtered)

  return NextResponse.json({
    disclaimer: DISCLAIMER,
    profile: student,
    results: { safety, match, reach },
    counts: {
      safety: safety.length,
      match: match.length,
      reach: reach.length,
      total: safety.length + match.length + reach.length,
    },
    filters_applied: {
      preferred_states: student.preferred_states,
      budget_max: student.budget_max,
      campus_size: student.campus_size,
      states_relaxed: statesRelaxed,
      budget_relaxed: budgetRelaxed,
    },
    generated_at: new Date().toISOString(),
  })
}
