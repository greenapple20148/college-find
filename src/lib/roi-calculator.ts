// College ROI Calculator — Enhanced calculation functions
// Includes: salary growth, graduation probability, employment rate,
// 10-year projections, cumulative earnings vs. loan balance

import type { ROIInputs, ROIResult, ROICategory, YearlyProjection } from '@/lib/types'

const HIGH_SCHOOL_BASELINE_SALARY = 30000  // HS diploma avg annual earnings
const HS_GROWTH_RATE = 0.015               // 1.5% annual growth for HS grads

// BLS data: ~85% of college graduates are employed within a year
// Varies by major — STEM tends to be higher
const DEFAULT_EMPLOYMENT_RATE = 0.85
const EMPLOYMENT_RATES: Record<string, number> = {
    'Computer Science & IT': 0.93,
    'Engineering': 0.92,
    'Nursing': 0.95,
    'Health Sciences': 0.90,
    'Business & Management': 0.88,
    'Mathematics': 0.89,
    'Technology': 0.91,
    'Medicine & Pre-Med': 0.88,
    'Education': 0.90,
    'Law': 0.86,
    'Science': 0.85,
    'Biology & Life Sciences': 0.82,
    'Environmental Science': 0.82,
    'Psychology': 0.78,
    'Communications & Journalism': 0.80,
    'History & Political Science': 0.78,
    'English & Literature': 0.76,
    'Arts & Design': 0.74,
    'Criminal Justice': 0.82,
    'Social Work': 0.84,
    'Agriculture': 0.83,
    'Architecture': 0.84,
    'Undecided': 0.82,
}

/**
 * Calculate monthly loan payment using standard amortization formula.
 */
export function calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    termYears: number = 10
): number {
    if (principal <= 0) return 0
    if (annualRate <= 0) return principal / (termYears * 12)

    const monthlyRate = annualRate / 12
    const n = termYears * 12
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1)

    return Math.round(payment * 100) / 100
}

/**
 * Calculate years to repay loans, assuming 15% of gross salary allocated.
 * Uses growing salary over time for more realistic projection.
 */
export function calculateRepaymentYears(
    loanAmount: number,
    startingSalary: number,
    annualRate: number,
    salaryGrowthRate: number = 0.03
): number {
    if (loanAmount <= 0) return 0
    if (startingSalary <= 0) return 99

    let balance = loanAmount
    let salary = startingSalary
    let years = 0
    const maxYears = 30

    while (balance > 0 && years < maxYears) {
        const yearlyPayment = salary * 0.15
        const interest = balance * annualRate
        const principalPaid = yearlyPayment - interest

        if (principalPaid <= 0) return 99 // can't cover interest

        balance -= principalPaid
        salary *= (1 + salaryGrowthRate)
        years++
    }

    if (balance > 0) return 99

    // Interpolate partial last year
    return Math.round(years * 10) / 10
}

/**
 * Classify ROI score into High / Medium / Low.
 */
export function classifyROI(adjustedScore: number): ROICategory {
    if (adjustedScore >= 1.5) return 'high'
    if (adjustedScore >= 0.8) return 'medium'
    return 'low'
}

/**
 * Generate year-by-year projections for 10 years post-graduation.
 */
export function generateProjections(
    startingSalary: number,
    salaryGrowthRate: number,
    loanAmount: number,
    loanRate: number,
    yearsOfStudy: number
): YearlyProjection[] {
    const projections: YearlyProjection[] = []
    let cumulativeEarnings = 0
    let loanBalance = loanAmount
    let cumulativeLoanPaid = 0
    const monthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, 10)
    const annualPayment = monthlyPayment * 12

    // Also track HS baseline for comparison
    let hsSalary = HIGH_SCHOOL_BASELINE_SALARY * Math.pow(1 + HS_GROWTH_RATE, yearsOfStudy)
    let hsEarnings = HIGH_SCHOOL_BASELINE_SALARY * yearsOfStudy // they earned during college years

    for (let year = 1; year <= 10; year++) {
        const salary = startingSalary * Math.pow(1 + salaryGrowthRate, year - 1)
        cumulativeEarnings += salary

        // Loan balance reduction
        const loanPaymentThisYear = Math.min(annualPayment, loanBalance + loanBalance * loanRate)
        const interest = loanBalance * loanRate
        const principalPaid = Math.max(0, loanPaymentThisYear - interest)
        loanBalance = Math.max(0, loanBalance - principalPaid)
        cumulativeLoanPaid += loanPaymentThisYear

        // HS comparison
        hsSalary *= (1 + HS_GROWTH_RATE)
        hsEarnings += hsSalary

        // Net earnings = cumulative salary - cumulative loan payments
        const netEarnings = cumulativeEarnings - cumulativeLoanPaid

        projections.push({
            year,
            salary: Math.round(salary),
            cumulative_earnings: Math.round(cumulativeEarnings),
            loan_balance: Math.round(loanBalance),
            cumulative_loan_paid: Math.round(cumulativeLoanPaid),
            net_earnings: Math.round(netEarnings),
            hs_cumulative_earnings: Math.round(hsEarnings),
        })
    }

    return projections
}

/**
 * Core ROI calculation — enhanced with all requested features.
 */
export function calculateROI(
    inputs: ROIInputs,
    medianSalary: number,
    salary10yr: number | null,
    salaryGrowthRate: number,
    graduationRate: number | null,
    collegeName: string
): ROIResult {
    // 1. Total tuition
    const totalTuition = inputs.tuition_per_year * inputs.years_of_study

    // 2. Total cost of attendance
    const totalCost = totalTuition + (inputs.living_cost_per_year * inputs.years_of_study)

    // 3. Adjust for scholarships
    const netCost = Math.max(0, totalCost - inputs.scholarship_amount)

    // 4. Loan amount
    const loanAmount = netCost

    // 5. Expected starting salary
    const expectedSalary = medianSalary

    // 6. Employment rate adjustment
    const employmentRate = EMPLOYMENT_RATES[inputs.major] ?? DEFAULT_EMPLOYMENT_RATE

    // 7. Graduation probability adjustment
    const gradRate = graduationRate ?? 0.60  // national avg ~60%

    // 8. Risk-adjusted expected salary =
    //    salary × probability_of_graduating × probability_of_employment
    const adjustedSalary = Math.round(expectedSalary * gradRate * employmentRate)

    // 9. Monthly loan payment (standard 10yr repayment)
    const monthlyPayment = calculateMonthlyPayment(loanAmount, inputs.loan_interest_rate)

    // 10. Repayment years (at 15% of salary, with salary growth)
    const repaymentYears = calculateRepaymentYears(
        loanAmount, expectedSalary, inputs.loan_interest_rate, salaryGrowthRate
    )

    // 11. Generate salary growth trajectory
    const salaryByYear: number[] = []
    for (let y = 0; y <= 10; y++) {
        salaryByYear.push(Math.round(expectedSalary * Math.pow(1 + salaryGrowthRate, y)))
    }

    // 12. ROI score (adjusted for graduation + employment probability)
    //     Score = (expected_10yr_earnings × grad_rate × employment_rate) / net_cost
    const totalEarnings10yr = salaryByYear.reduce((sum, s) => sum + s, 0)
    const adjustedEarnings10yr = totalEarnings10yr * gradRate * employmentRate
    const roiScore = netCost > 0
        ? Math.round((adjustedEarnings10yr / netCost) * 100) / 100
        : 99
    const roiCategory = classifyROI(netCost > 0 ? adjustedSalary / (netCost / inputs.years_of_study) : 99)

    // 13. Lifetime earnings premium (30yr career vs high school baseline, with growth)
    let lifetimeCollege = 0
    let lifetimeHS = HIGH_SCHOOL_BASELINE_SALARY * inputs.years_of_study // HS earns during college
    for (let y = 0; y < 30; y++) {
        lifetimeCollege += expectedSalary * Math.pow(1 + salaryGrowthRate, y)
        lifetimeHS += HIGH_SCHOOL_BASELINE_SALARY * Math.pow(1 + HS_GROWTH_RATE, inputs.years_of_study + y)
    }
    const lifetimePremium = Math.round(lifetimeCollege - lifetimeHS - netCost)

    // 14. Year-by-year projections
    const projections = generateProjections(
        expectedSalary, salaryGrowthRate, loanAmount, inputs.loan_interest_rate, inputs.years_of_study
    )

    // 15. 10-year net earnings
    const netEarnings10yr = projections.length > 0
        ? projections[projections.length - 1].net_earnings
        : 0

    return {
        inputs,
        college_name: collegeName,
        total_tuition: totalTuition,
        total_cost: totalCost,
        net_cost: netCost,
        loan_amount: loanAmount,
        expected_salary: expectedSalary,
        monthly_payment: monthlyPayment,
        repayment_years: repaymentYears,
        roi_score: roiScore,
        roi_category: roiCategory,
        salary_10yr: salary10yr ?? salaryByYear[10] ?? null,
        lifetime_earnings_premium: lifetimePremium,

        // Enhanced fields
        salary_growth_rate: salaryGrowthRate,
        salary_by_year: salaryByYear,
        graduation_rate: gradRate,
        employment_rate: employmentRate,
        adjusted_salary: adjustedSalary,
        net_earnings_10yr: netEarnings10yr,
        projections,
    }
}
