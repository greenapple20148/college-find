import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('saved_colleges')
    .select('*, college:colleges(*)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

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

  if (!session_id) return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  if (!college_id) return NextResponse.json({ error: 'college_id is required' }, { status: 400 })

  const supabase = createServiceClient()

  const { data, error } = await supabase
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
    if (error.code === '23505') {
      return NextResponse.json({ error: 'College already saved' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
