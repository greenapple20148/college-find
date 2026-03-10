import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkFeatureAccess, recordUsage } from '@/lib/feature-gate'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const section = searchParams.get('section') ?? ''
        const difficulty = searchParams.get('difficulty') ?? ''
        const topic = searchParams.get('topic') ?? ''
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
        const offset = parseInt(searchParams.get('offset') ?? '0')

        // ── Feature gate: check SAT question limit ────────────
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const access = await checkFeatureAccess(user.id, 'sat_questions')
            if (!access.allowed) {
                return NextResponse.json({
                    error: 'limit_reached',
                    message: access.message,
                    remaining: access.remaining,
                    upgrade_required: access.upgrade_required,
                }, { status: 403 })
            }
        }

        const service = createServiceClient()

        let query = service
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
