import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { FEATURES, type PlanId, getFeatureLimit } from '@/lib/feature-config'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceClient()

  if (user) {
    // Auth user: fetch by user_id
    const { data, error } = await service
      .from('saved_colleges')
      .select('*, college:colleges(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  }

  // Anonymous: fetch by session_id
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  const { data, error } = await service
    .from('saved_colleges')
    .select('*, college:colleges(*)')
    .eq('session_id', sessionId)
    .is('user_id', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(req: NextRequest) {
  let body: {
    session_id?: string
    college_id?: string
    deadline?: string | null
    status?: string
    notes?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { session_id, college_id, deadline, status, notes } = body
  if (!college_id) return NextResponse.json({ error: 'college_id is required' }, { status: 400 })

  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceClient()

  if (user) {
    // ── Feature gate: check saved colleges limit ──────────
    const { data: profile } = await service
      .from('user_profiles')
      .select('plan')
      .eq('user_id', user.id)
      .single()

    const plan = (profile?.plan ?? 'free') as PlanId
    const limitDef = getFeatureLimit('saved_colleges', plan)

    if (limitDef && limitDef.limit !== Infinity) {
      const { count } = await service
        .from('saved_colleges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count ?? 0) >= limitDef.limit) {
        return NextResponse.json({
          error: 'limit_reached',
          message: FEATURES.saved_colleges.upgradeMessage,
          remaining: 0,
          upgrade_required: true,
        }, { status: 403 })
      }
    }

    // Auth user: save with user_id
    const { data, error } = await service
      .from('saved_colleges')
      .insert({
        user_id: user.id,
        session_id: session_id ?? `user_${user.id}`,
        college_id,
        deadline: deadline ?? null,
        status: status ?? 'not_started',
        notes: notes ?? '',
      })
      .select('*, college:colleges(*)')
      .single()
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'College already saved' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  }

  // Anonymous: require session_id
  if (!session_id) return NextResponse.json({ error: 'session_id is required' }, { status: 400 })

  const { data, error } = await service
    .from('saved_colleges')
    .insert({
      session_id,
      college_id,
      deadline: deadline ?? null,
      status: status ?? 'not_started',
      notes: notes ?? '',
    })
    .select('*, college:colleges(*)')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'College already saved' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
