import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gpa   = searchParams.get('gpa')
  const state = searchParams.get('state')
  const major = searchParams.get('major')

  const supabase = createServiceClient()

  let query = supabase
    .from('scholarships')
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false })

  // Filter: only show scholarships student qualifies for (gpa_min <= student gpa)
  if (gpa) {
    const gpaNum = parseFloat(gpa)
    query = query.or(`gpa_min.is.null,gpa_min.lte.${gpaNum}`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let results = data ?? []

  // Post-filter: state eligibility
  if (state) {
    results = results.filter(s =>
      s.states.length === 0 || s.states.includes(state)
    )
  }

  // Post-filter: major eligibility
  if (major) {
    results = results.filter(s =>
      s.majors.length === 0 || s.majors.some((m: string) =>
        m.toLowerCase().includes(major.toLowerCase()) ||
        major.toLowerCase().includes(m.toLowerCase())
      )
    )
  }

  return NextResponse.json({ data: results, total: results.length })
}
