import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateROI } from '@/lib/roi-calculator'
import type { ROIInputs } from '@/lib/types'

/**
 * POST /api/roi/calculate
 * Calculate ROI for a given college + major combination.
 * Enhanced: includes salary growth, graduation probability, employment rate.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            college_id,
            major,
            years_of_study = 4,
            scholarship_amount = 0,
            living_cost_per_year = 12000,
            loan_interest_rate = 0.05,
            is_in_state = false,
        } = body

        if (!college_id || !major) {
            return NextResponse.json(
                { error: 'college_id and major are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Fetch college data (including graduation_rate)
        const { data: college, error: colErr } = await supabase
            .from('colleges')
            .select('id, name, tuition_in_state, tuition_out_state, graduation_rate, median_earnings')
            .eq('id', college_id)
            .single()

        if (colErr || !college) {
            return NextResponse.json(
                { error: 'College not found' },
                { status: 404 }
            )
        }

        // Fetch salary data for the major (including growth rate)
        const { data: salaryData } = await supabase
            .from('major_salary_data')
            .select('median_salary, salary_growth_rate, salary_10yr')
            .eq('major', major)
            .single()

        const medianSalary = salaryData?.median_salary ?? college.median_earnings ?? 48000
        const salaryGrowthRate = salaryData?.salary_growth_rate ?? 0.03
        const salary10yr = salaryData?.salary_10yr ?? null
        const graduationRate = college.graduation_rate ?? null

        // Determine tuition
        const tuitionPerYear = is_in_state
            ? (college.tuition_in_state ?? college.tuition_out_state ?? 20000)
            : (college.tuition_out_state ?? college.tuition_in_state ?? 35000)

        const inputs: ROIInputs = {
            college_id,
            major,
            years_of_study,
            tuition_per_year: tuitionPerYear,
            scholarship_amount,
            living_cost_per_year,
            loan_interest_rate,
            is_in_state,
        }

        const result = calculateROI(
            inputs,
            medianSalary,
            salary10yr,
            salaryGrowthRate,
            graduationRate,
            college.name
        )

        return NextResponse.json({ data: result })
    } catch {
        return NextResponse.json(
            { error: 'Failed to calculate ROI' },
            { status: 500 }
        )
    }
}
