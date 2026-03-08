import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { DEFAULT_TASKS } from '@/lib/types'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { college_id } = body as { college_id: string }

    if (!college_id) {
        return NextResponse.json({ error: 'college_id is required' }, { status: 400 })
    }

    const service = createServiceClient()

    // Check if tasks already exist for this college
    const { data: existing } = await service
        .from('application_checklists')
        .select('id')
        .eq('user_id', user.id)
        .eq('college_id', college_id)
        .limit(1)

    if (existing && existing.length > 0) {
        return NextResponse.json({ message: 'Checklist already exists' }, { status: 200 })
    }

    // Insert default tasks
    const tasks = DEFAULT_TASKS.map((name, i) => ({
        user_id: user.id,
        college_id,
        task_name: name,
        task_status: 'pending' as const,
        sort_order: i,
        is_custom: false,
    }))

    const { data, error } = await service
        .from('application_checklists')
        .insert(tasks)
        .select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data ?? [] }, { status: 201 })
}
