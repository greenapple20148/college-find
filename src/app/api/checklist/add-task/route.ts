import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { college_id, task_name, due_date } = body as {
        college_id: string
        task_name: string
        due_date?: string | null
    }

    if (!college_id || !task_name) {
        return NextResponse.json({ error: 'college_id and task_name are required' }, { status: 400 })
    }

    const service = createServiceClient()

    // Get the max sort_order for this college's tasks
    const { data: maxRow } = await service
        .from('application_checklists')
        .select('sort_order')
        .eq('user_id', user.id)
        .eq('college_id', college_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

    const nextOrder = (maxRow?.sort_order ?? -1) + 1

    const { data, error } = await service
        .from('application_checklists')
        .insert({
            user_id: user.id,
            college_id,
            task_name: task_name.trim(),
            task_status: 'pending',
            due_date: due_date ?? null,
            is_custom: true,
            sort_order: nextOrder,
        })
        .select('*')
        .single()

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Task already exists' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
