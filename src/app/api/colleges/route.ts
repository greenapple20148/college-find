import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  // Validate required env vars before attempting DB connection
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing Supabase environment variables.' },
      { status: 503 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)

    const q = searchParams.get('q') ?? ''
    const state = searchParams.get('state') ?? ''
    const control = searchParams.get('control') ?? ''
    const size = searchParams.get('size') ?? ''
    const major = searchParams.get('major') ?? ''
    const tuitionMax = searchParams.get('tuition_max')
    const acceptanceMin = searchParams.get('acceptance_min')
    const acceptanceMax = searchParams.get('acceptance_max')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const supabase = createServiceClient()

    let query = supabase
      .from('colleges')
      .select('*', { count: 'exact' })
      .not('name', 'is', null)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (q) query = query.ilike('name', `%${q}%`)

    if (state) {
      const states = state.split(',').map(s => s.trim()).filter(Boolean)
      if (states.length === 1) query = query.eq('state', states[0])
      else if (states.length > 1) query = query.in('state', states)
    }

    if (control) query = query.eq('control', control)
    if (size) query = query.eq('size_category', size)
    if (major) query = query.contains('programs', [major])

    if (tuitionMax) query = query.lte('tuition_out_state', parseInt(tuitionMax))
    if (acceptanceMin) query = query.gte('acceptance_rate', parseFloat(acceptanceMin) / 100)
    if (acceptanceMax) query = query.lte('acceptance_rate', parseFloat(acceptanceMax) / 100)

    const { data, error, count } = await query

    if (error) {
      console.error('[/api/colleges] Supabase error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/colleges] Unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
