import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateRecommendations } from '@/lib/recommendations'
import { applyPreferenceFilters } from '@/lib/matching'
import type { StudentProfile } from '@/lib/types'

export async function POST(req: NextRequest) {
    let body: Partial<StudentProfile>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { gpa, sat_total, act, intended_major, preferred_states, budget_max, campus_size } = body

    if (gpa === undefined || typeof gpa !== 'number' || gpa < 0 || gpa > 4) {
        return NextResponse.json({ error: 'gpa is required (0.0–4.0)' }, { status: 400 })
    }

    const student: StudentProfile = {
        gpa,
        sat_total: sat_total ?? null,
        act: act ?? null,
        intended_major: intended_major ?? null,
        preferred_states: Array.isArray(preferred_states) ? preferred_states : [],
        budget_max: budget_max ?? null,
        campus_size: (campus_size as StudentProfile['campus_size']) ?? 'any',
    }

    const supabase = createServiceClient()

    const { data: colleges, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('level', 'four_year')
        .not('acceptance_rate', 'is', null)
        .order('enrollment', { ascending: false })
        .limit(2000)

    if (error) {
        console.error('recommendations DB error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!colleges || colleges.length === 0) {
        return NextResponse.json({ error: 'No college data found' }, { status: 503 })
    }

    const { filtered } = applyPreferenceFilters(colleges, student)
    const recommendations = generateRecommendations(student, filtered, 10)

    return NextResponse.json({
        profile: student,
        recommendations,
        total_evaluated: filtered.length,
        generated_at: new Date().toISOString(),
    })
}
