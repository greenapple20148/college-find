import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { task_id, task_status } = body as { task_id: string; task_status: 'pending' | 'completed' }

    if (!task_id || !task_status) {
        return NextResponse.json({ error: 'task_id and task_status are required' }, { status: 400 })
    }

    const service = createServiceClient()

    const { data, error } = await service
        .from('application_checklists')
        .update({ task_status })
        .eq('id', task_id)
        .eq('user_id', user.id) // ensure ownership
        .select('*')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
