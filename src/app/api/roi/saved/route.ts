import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/roi/saved  — Fetch saved ROI calculations for the authenticated user.
 * POST /api/roi/saved — Save a new ROI calculation.
 * DELETE /api/roi/saved?id=xxx — Delete a saved calculation.
 */

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('roi_calculations')
            .select(`
        *,
        college:colleges(id, name, slug, state, tuition_in_state, tuition_out_state)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error

        return NextResponse.json({ data: data ?? [] })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch saved calculations' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const {
            college_id, major, years_of_study, tuition_per_year,
            scholarship_amount, living_cost_per_year, loan_interest_rate,
            is_in_state, total_cost, net_cost, loan_amount,
            expected_salary, monthly_payment, repayment_years,
            roi_score, roi_category,
        } = body

        if (!college_id || !major) {
            return NextResponse.json({ error: 'college_id and major are required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('roi_calculations')
            .insert({
                user_id: user.id,
                college_id,
                major,
                years_of_study: years_of_study ?? 4,
                tuition_per_year,
                scholarship_amount: scholarship_amount ?? 0,
                living_cost_per_year: living_cost_per_year ?? 12000,
                loan_interest_rate: loan_interest_rate ?? 0.05,
                is_in_state: is_in_state ?? false,
                total_cost,
                net_cost,
                loan_amount,
                expected_salary,
                monthly_payment,
                repayment_years,
                roi_score,
                roi_category,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch {
        return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('roi_calculations')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Failed to delete calculation' }, { status: 500 })
    }
}
