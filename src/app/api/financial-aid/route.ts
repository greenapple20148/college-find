import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/lib/feature-gate'

/**
 * Financial Aid Estimator — estimates EFC and potential aid
 * Uses simplified federal methodology (FAFSA EFC formula)
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const access = await checkFeatureAccess(user.id, 'financial_aid_estimator')
        if (!access.allowed) {
            return NextResponse.json({
                error: 'upgrade_required', message: access.message, upgrade_required: true
            }, { status: 403 })
        }

        const {
            householdIncome = 0,
            householdSize = 4,
            numberInCollege = 1,
            parentAssets = 0,
            studentIncome = 0,
            studentAssets = 0,
            filingStatus = 'married', // married | single | separated
            stateResidence = 'CA',
            targetTuition = 0,
        } = await req.json()

        // ── Simplified EFC Calculation (Federal Methodology) ──
        // Income Protection Allowance by family size
        const ipaTable: Record<number, number> = {
            2: 19540, 3: 24330, 4: 30030, 5: 35420, 6: 41440,
        }
        const ipa = ipaTable[Math.min(Math.max(householdSize, 2), 6)] ?? 30030

        // Employment expense allowance
        const employmentAllowance = filingStatus === 'married'
            ? Math.min(householdIncome * 0.35, 4500)
            : 0

        // Parent income contribution
        const taxRate = householdIncome > 100000 ? 0.22 : householdIncome > 50000 ? 0.12 : 0.10
        const estimatedTax = householdIncome * taxRate
        const socialSecurity = Math.min(householdIncome * 0.0765, 10000)

        const availableIncome = Math.max(0,
            householdIncome - estimatedTax - socialSecurity - employmentAllowance - ipa
        )

        // Progressive contribution rate on available income
        let parentIncomeContribution = 0
        if (availableIncome > 0) {
            const brackets = [
                { limit: 3000, rate: 0.22 },
                { limit: 5000, rate: 0.25 },
                { limit: 5000, rate: 0.29 },
                { limit: 5000, rate: 0.34 },
                { limit: 5000, rate: 0.40 },
                { limit: Infinity, rate: 0.47 },
            ]
            let remaining = availableIncome
            for (const b of brackets) {
                const chunk = Math.min(remaining, b.limit)
                parentIncomeContribution += chunk * b.rate
                remaining -= chunk
                if (remaining <= 0) break
            }
        }

        // Asset contribution (5.64% of net assets above protection)
        const assetProtection = filingStatus === 'married' ? 30000 : 15000
        const parentAssetContribution = Math.max(0, (parentAssets - assetProtection) * 0.0564)

        // Student contribution
        const studentIncomeContribution = Math.max(0, (studentIncome - 7040)) * 0.50
        const studentAssetContribution = studentAssets * 0.20

        // Total EFC
        const totalParentContribution = (parentIncomeContribution + parentAssetContribution) / numberInCollege
        const totalStudentContribution = studentIncomeContribution + studentAssetContribution
        const efc = Math.round(totalParentContribution + totalStudentContribution)

        // ── Estimate Aid Eligibility ──
        const financialNeed = Math.max(0, targetTuition - efc)

        // Pell Grant estimate (2025-26 max: $7,395)
        const pellMax = 7395
        const pellEligible = efc < 7000
        const pellEstimate = pellEligible
            ? Math.round(Math.max(0, pellMax - efc * 0.8))
            : 0

        // Federal loan limits
        const subsidizedLimit = 3500 // Freshman
        const unsubsidizedLimit = 2000 // Dependent
        const subsidizedEligible = efc < targetTuition

        // Institutional aid estimate (rough — varies widely)
        const institutionalAidEstimate = targetTuition > 40000
            ? Math.round(financialNeed * 0.55) // Private school avg
            : Math.round(financialNeed * 0.25) // Public school avg

        // Work-study estimate
        const workStudy = pellEligible ? 2500 : 0

        const totalEstimatedAid = pellEstimate + (subsidizedEligible ? subsidizedLimit : 0) + unsubsidizedLimit + institutionalAidEstimate + workStudy
        const estimatedOutOfPocket = Math.max(0, targetTuition - totalEstimatedAid)

        return NextResponse.json({
            efc,
            financialNeed,
            breakdown: {
                parentIncomeContribution: Math.round(totalParentContribution),
                parentAssetContribution: Math.round(parentAssetContribution / numberInCollege),
                studentIncomeContribution: Math.round(studentIncomeContribution),
                studentAssetContribution: Math.round(studentAssetContribution),
            },
            aidEstimate: {
                pellGrant: pellEstimate,
                pellEligible,
                subsidizedLoan: subsidizedEligible ? subsidizedLimit : 0,
                unsubsidizedLoan: unsubsidizedLimit,
                institutionalAid: institutionalAidEstimate,
                workStudy,
                totalEstimatedAid: Math.min(totalEstimatedAid, targetTuition),
            },
            summary: {
                targetTuition,
                estimatedOutOfPocket: Math.max(0, estimatedOutOfPocket),
                coveragePercent: targetTuition > 0
                    ? Math.min(100, Math.round((totalEstimatedAid / targetTuition) * 100))
                    : 0,
            },
            disclaimer: 'This is an estimate based on simplified federal methodology. Actual aid depends on individual college policies, FAFSA filing, and institutional decisions.',
        })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
    }
}
