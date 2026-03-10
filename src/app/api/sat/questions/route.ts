import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const section = searchParams.get('section') ?? ''
        const difficulty = searchParams.get('difficulty') ?? ''
        const topic = searchParams.get('topic') ?? ''
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
        const offset = parseInt(searchParams.get('offset') ?? '0')

        const supabase = createServiceClient()

        let query = supabase
            .from('sat_questions')
            .select('*', { count: 'exact' })
            .eq('active_status', true)
            .eq('status', 'published')
            .range(offset, offset + limit - 1)

        if (section) query = query.eq('section', section)
        if (difficulty) query = query.eq('difficulty', difficulty)
        if (topic) query = query.eq('topic', topic)

        const { data, error, count } = await query

        if (error) {
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
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

