import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/scholarships/universities
 * Returns colleges that have at least one linked scholarship, with scholarship count.
 */
export async function GET() {
    const supabase = createServiceClient()

    // Fetch all scholarships that have a college_id, with joined college data
    const { data, error } = await supabase
        .from('scholarships')
        .select('college_id, colleges!inner(id, name, city, state, slug)')
        .not('college_id', 'is', null)

    if (error) {
        // If the college_id column doesn't exist yet (migration not run), return empty
        console.error('Scholarships universities API error:', error.message)
        return NextResponse.json({ data: [], total: 0 })
    }

    // Group by college and count scholarships
    const collegeMap = new Map<string, {
        id: string
        name: string
        city: string | null
        state: string | null
        slug: string | null
        scholarship_count: number
    }>()

    for (const row of data ?? []) {
        const college = row.colleges as unknown as {
            id: string
            name: string
            city: string | null
            state: string | null
            slug: string | null
        }
        if (!college) continue

        const existing = collegeMap.get(college.id)
        if (existing) {
            existing.scholarship_count++
        } else {
            collegeMap.set(college.id, {
                ...college,
                scholarship_count: 1,
            })
        }
    }

    const universities = Array.from(collegeMap.values())
        .sort((a, b) => b.scholarship_count - a.scholarship_count)

    return NextResponse.json({ data: universities, total: universities.length })
}
