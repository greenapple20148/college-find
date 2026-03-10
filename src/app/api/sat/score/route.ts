import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/** POST — save a score entry */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { user_id, source, math_score, rw_score, total_score } = body

        if (!user_id || !math_score || !rw_score || !total_score) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createServiceClient()

        const { data, error } = await supabase
            .from('sat_score_history')
            .insert({
                user_id,
                source: source || 'calculator',
                math_score,
                rw_score,
                total_score,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

/** GET — retrieve score history for a user */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const user_id = searchParams.get('user_id')
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 })
        }

        const supabase = createServiceClient()

        const { data, error } = await supabase
            .from('sat_score_history')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data: data ?? [] })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
