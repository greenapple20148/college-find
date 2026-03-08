import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/saved/export
 * Returns a CSV download of the user's saved college list.
 */
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check plan level — export requires Student Pro+
    const service = createServiceClient()
    const { data: profile } = await service
        .from('user_profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single()

    const plan = profile?.plan || 'free'
    const PAID_PLANS = ['student-pro', 'prep-pro-plus', 'toolkit', 'bundle']
    if (!PAID_PLANS.includes(plan)) {
        return NextResponse.json({ error: 'Upgrade to Student Pro to export your college list' }, { status: 403 })
    }

    // Fetch saved colleges with full college data
    const { data: saved, error } = await service
        .from('saved_colleges')
        .select('*, college:colleges(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!saved || saved.length === 0) {
        return NextResponse.json({ error: 'No saved colleges to export' }, { status: 404 })
    }

    // Build CSV
    const headers = [
        'College Name',
        'State',
        'Type',
        'Acceptance Rate',
        'Tuition (In-State)',
        'Tuition (Out-of-State)',
        'Graduation Rate',
        'SAT Midpoint',
        'Application Status',
        'Deadline',
        'Notes',
    ]

    const rows = saved.map((s: Record<string, unknown>) => {
        const c = s.college as Record<string, unknown> | null
        return [
            c?.name ?? '',
            c?.state ?? '',
            c?.control ?? '',
            c?.acceptance_rate != null ? `${(Number(c.acceptance_rate) * 100).toFixed(1)}%` : '',
            c?.tuition_in_state != null ? `$${Number(c.tuition_in_state).toLocaleString()}` : '',
            c?.tuition_out_state != null ? `$${Number(c.tuition_out_state).toLocaleString()}` : '',
            c?.graduation_rate != null ? `${(Number(c.graduation_rate) * 100).toFixed(0)}%` : '',
            c?.sat_50 != null ? String(c.sat_50) : '',
            String(s.status ?? 'not_started'),
            s.deadline ? new Date(s.deadline as string).toLocaleDateString() : '',
            String(s.notes ?? '').replace(/"/g, '""'),
        ]
    })

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return new Response(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="college-list-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    })
}
