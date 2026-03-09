import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

function isAdmin(email: string | undefined): boolean {
    if (!email) return false
    return ADMIN_EMAILS.includes(email)
}

/**
 * PATCH /api/deadlines/:id
 * Update a specific deadline record (admin only)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

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

    // Don't allow changing college_id or cycle_year via PATCH
    delete body.college_id
    delete body.cycle_year
    delete body.id

    // Validate date fields
    const dateFields = [
        'early_action_deadline', 'early_decision_1_deadline', 'early_decision_2_deadline',
        'regular_decision_deadline', 'transfer_fall_deadline', 'transfer_spring_deadline',
        'scholarship_priority_deadline', 'fafsa_priority_deadline',
    ]

    for (const field of dateFields) {
        const val = body[field]
        if (val !== undefined && val !== null && typeof val === 'string') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                return NextResponse.json({ error: `${field} must be in YYYY-MM-DD format` }, { status: 400 })
            }
        }
    }

    const service = createServiceClient()

    const { data, error } = await service
        .from('college_deadlines')
        .update({
            ...body,
            verified_by: user.email,
            last_verified_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, college:colleges(id, name, city, state, slug)')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

/**
 * DELETE /api/deadlines/:id
 * Delete a deadline record (admin only)
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const service = createServiceClient()

    const { error } = await service
        .from('college_deadlines')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
