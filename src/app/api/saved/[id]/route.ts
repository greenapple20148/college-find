import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function verifyOwnership(id: string, req: NextRequest): Promise<boolean> {
  const service = createServiceClient()
  const { data: row } = await service
    .from('saved_colleges')
    .select('user_id, session_id')
    .eq('id', id)
    .single()

  if (!row) return false

  // Check auth user ownership
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user && row.user_id === user.id) return true

  // Check anonymous session ownership
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  if (!user && row.user_id === null && sessionId && row.session_id === sessionId) return true

  return false
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: { deadline?: string | null; status?: string; notes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!(await verifyOwnership(id, req))) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('deadline' in body) updates.deadline = body.deadline
  if ('status' in body) updates.status = body.status
  if ('notes' in body) updates.notes = body.notes

  const service = createServiceClient()

  const { data, error } = await service
    .from('saved_colleges')
    .update(updates)
    .eq('id', id)
    .select('*, college:colleges(*)')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Saved college not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!(await verifyOwnership(id, req))) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const service = createServiceClient()

  const { error } = await service
    .from('saved_colleges')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
