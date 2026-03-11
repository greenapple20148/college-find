import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/lib/feature-gate'

/**
 * Scholarship Alerts — save search criteria for matching notifications
 * GET — retrieve saved alerts
 * POST — save/update alert preferences
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const access = await checkFeatureAccess(user.id, 'scholarship_alerts')
        if (!access.allowed) {
            return NextResponse.json({ error: 'upgrade_required', message: access.message, upgrade_required: true }, { status: 403 })
        }

        const service = createServiceClient()
        const { data: alerts } = await service
            .from('scholarship_alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        return NextResponse.json({ alerts: alerts || [] })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const access = await checkFeatureAccess(user.id, 'scholarship_alerts')
        if (!access.allowed) {
            return NextResponse.json({ error: 'upgrade_required', message: access.message, upgrade_required: true }, { status: 403 })
        }

        const { criteria } = await req.json()
        // criteria: { minAmount, maxAmount, gpaMin, state, major, deadline_after, keywords }

        const service = createServiceClient()
        const { data, error } = await service
            .from('scholarship_alerts')
            .upsert({
                user_id: user.id,
                criteria,
                active: true,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ alert: data, message: 'Alert preferences saved! You\'ll be notified when matching scholarships are found.' })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
    }
}
