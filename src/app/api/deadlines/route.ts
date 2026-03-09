import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

function isAdmin(email: string | undefined): boolean {
    if (!email) return false
    return ADMIN_EMAILS.includes(email)
}

/**
 * GET /api/deadlines
 * Query params:
 *   - college_id: UUID (single college)
 *   - cycle_year: number (default: current cycle)
 *   - status: verification status filter
 *   - limit: number (for admin list, default 50)
 *   - offset: number
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const collegeId = searchParams.get('college_id')
    const cycleYear = parseInt(searchParams.get('cycle_year') ?? '2026', 10)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const service = createServiceClient()

    if (collegeId) {
        // Single college lookup
        const { data, error } = await service
            .from('college_deadlines')
            .select('*, college:colleges(id, name, city, state, slug, website)')
            .eq('college_id', collegeId)
            .eq('cycle_year', cycleYear)
            .single()

        if (error && error.code !== 'PGRST116') {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data: data ?? null })
    }

    // List view (admin)
    let query = service
        .from('college_deadlines')
        .select('*, college:colleges(id, name, city, state, slug, website)', { count: 'exact' })
        .eq('cycle_year', cycleYear)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (status) {
        query = query.eq('verification_status', status)
    }

    const { data, error, count } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], total: count ?? 0 })
}

/**
 * POST /api/deadlines
 * Create or upsert deadline record (admin only)
 */
export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { college_id, cycle_year, ...deadlineFields } = body

    if (!college_id || !cycle_year) {
        return NextResponse.json({ error: 'college_id and cycle_year are required' }, { status: 400 })
    }

    // Validate dates
    const dateFields = [
        'early_action_deadline', 'early_decision_1_deadline', 'early_decision_2_deadline',
        'regular_decision_deadline', 'transfer_fall_deadline', 'transfer_spring_deadline',
        'scholarship_priority_deadline', 'fafsa_priority_deadline',
    ]

    for (const field of dateFields) {
        const val = deadlineFields[field]
        if (val && typeof val === 'string') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                return NextResponse.json({ error: `${field} must be in YYYY-MM-DD format` }, { status: 400 })
            }
        }
    }

    const service = createServiceClient()

    const { data, error } = await service
        .from('college_deadlines')
        .upsert(
            {
                college_id,
                cycle_year,
                ...deadlineFields,
                verified_by: user.email,
                last_verified_at: new Date().toISOString(),
            },
            { onConflict: 'college_id,cycle_year' }
        )
        .select('*, college:colleges(id, name, city, state, slug)')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
