import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { session_id } = await request.json()
  if (!session_id || typeof session_id !== 'string') {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  const service = createServiceClient()

  // Get all anonymous saves for this session that don't have a user_id yet
  const { data: anonSaves } = await service
    .from('saved_colleges')
    .select('id, college_id')
    .eq('session_id', session_id)
    .is('user_id', null)

  if (!anonSaves || anonSaves.length === 0) {
    return NextResponse.json({ merged: 0 })
  }

  // Get college_ids already saved by this user to avoid unique constraint violations
  const { data: existingSaves } = await service
    .from('saved_colleges')
    .select('college_id')
    .eq('user_id', user.id)

  const existingCollegeIds = new Set((existingSaves ?? []).map((s: { college_id: string }) => s.college_id))

  const toMerge = anonSaves.filter((s: { id: string; college_id: string }) => !existingCollegeIds.has(s.college_id))
  const toDrop = anonSaves.filter((s: { id: string; college_id: string }) => existingCollegeIds.has(s.college_id))

  // Update non-duplicate rows to belong to user
  let merged = 0
  if (toMerge.length > 0) {
    const ids = toMerge.map((s: { id: string }) => s.id)
    const { error } = await service
      .from('saved_colleges')
      .update({ user_id: user.id })
      .in('id', ids)
    if (!error) merged = toMerge.length
  }

  // Delete duplicate anon rows (user already has these saved)
  if (toDrop.length > 0) {
    const ids = toDrop.map((s: { id: string }) => s.id)
    await service.from('saved_colleges').delete().in('id', ids)
  }

  return NextResponse.json({ merged })
}
