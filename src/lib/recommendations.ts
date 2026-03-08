/**
 * CollegeFind — Personalized Recommendation Engine
 *
 * Computes a composite fit_score (0–100) based on:
 *   0.35 × admission_probability
 *   0.25 × major_match
 *   0.20 × cost_fit
 *   0.10 × location_match
 *   0.10 × graduation_rate
 *
 * Returns the top 10 colleges with:
 *   - fit_score, admission probability, tuition estimate
 *   - human-readable recommendation reason
 */

import type { College, StudentProfile } from './types'
import { estimateAdmissionChance } from './matching'

export interface Recommendation {
    college: College
    fit_score: number
    admission_probability: number
    tuition_estimate: number
    major_match_score: number
    cost_fit_score: number
    location_match_score: number
    graduation_score: number
    reasons: string[]
}

/* ── Sub-scores ────────────────────────────────────────────────── */

function majorMatchScore(student: StudentProfile, college: College): { score: number; matched: boolean } {
    if (!student.intended_major || college.programs.length === 0) {
        return { score: 0.5, matched: false } // neutral when unknown
    }

    const majorLower = student.intended_major.toLowerCase()
    const exactMatch = college.programs.some(p => {
        const pLower = p.toLowerCase()
        return pLower.includes(majorLower) || majorLower.includes(pLower)
    })

    if (exactMatch) return { score: 1.0, matched: true }

    // Partial keyword overlap (e.g. "Computer Science" ↔ "Science")
    const majorWords = majorLower.split(/\s+/)
    const partialMatch = college.programs.some(p =>
        majorWords.some(w => w.length > 3 && p.toLowerCase().includes(w))
    )

    return partialMatch
        ? { score: 0.65, matched: false }
        : { score: 0.2, matched: false }
}

function costFitScore(college: College, budgetMax: number | null): { score: number; withinBudget: boolean } {
    if (budgetMax === null) return { score: 0.7, withinBudget: true }

    const price = college.net_price ?? college.tuition_in_state ?? college.tuition_out_state
    if (price === null) return { score: 0.5, withinBudget: true }

    if (price <= budgetMax * 0.7) return { score: 1.0, withinBudget: true }
    if (price <= budgetMax) return { score: 0.8, withinBudget: true }
    if (price <= budgetMax * 1.2) return { score: 0.4, withinBudget: false }
    if (price <= budgetMax * 1.5) return { score: 0.2, withinBudget: false }
    return { score: 0.05, withinBudget: false }
}

function locationMatchScore(college: College, preferredStates: string[]): number {
    if (preferredStates.length === 0) return 0.5
    if (!college.state) return 0.3
    return preferredStates.includes(college.state) ? 1.0 : 0.2
}

function graduationScore(college: College): number {
    if (college.graduation_rate === null) return 0.5
    return college.graduation_rate // already 0.0–1.0
}

/* ── Reason builder ────────────────────────────────────────────── */

function buildReasons(
    college: College,
    student: StudentProfile,
    admissionProb: number,
    majorMatched: boolean,
    withinBudget: boolean,
    locationMatch: number,
    gradRate: number | null
): string[] {
    const reasons: string[] = []

    // Admission
    if (admissionProb >= 0.7) {
        reasons.push(`Strong admission chance (${Math.round(admissionProb * 100)}%)`)
    } else if (admissionProb >= 0.45) {
        reasons.push(`Good admission chance (${Math.round(admissionProb * 100)}%)`)
    }

    // Major
    if (majorMatched && student.intended_major) {
        reasons.push(`Offers ${student.intended_major} program`)
    }

    // Cost
    if (withinBudget && student.budget_max) {
        const price = college.net_price ?? college.tuition_in_state
        if (price) {
            reasons.push(`Net cost ~$${price.toLocaleString()}/yr — within budget`)
        }
    }

    // Location
    if (locationMatch === 1.0 && college.state) {
        reasons.push(`Located in ${college.state}, one of your preferred states`)
    }

    // Graduation
    if (gradRate !== null && gradRate >= 0.75) {
        reasons.push(`${Math.round(gradRate * 100)}% graduation rate`)
    }

    // Campus size
    if (student.campus_size !== 'any' && college.size_category === student.campus_size) {
        reasons.push(`${student.campus_size.charAt(0).toUpperCase() + student.campus_size.slice(1)} campus — matches your preference`)
    }

    // Fallback
    if (reasons.length === 0) {
        reasons.push('Solid overall academic and financial fit')
    }

    return reasons
}

/* ── Main engine ───────────────────────────────────────────────── */

export function generateRecommendations(
    student: StudentProfile,
    colleges: College[],
    limit = 10
): Recommendation[] {
    const scored: Recommendation[] = []

    for (const college of colleges) {
        // 1. Admission probability
        const admission = estimateAdmissionChance(student, college)

        // 2. Major match
        const major = majorMatchScore(student, college)

        // 3. Cost fit
        const cost = costFitScore(college, student.budget_max)

        // 4. Location match
        const locScore = locationMatchScore(college, student.preferred_states)

        // 5. Graduation rate
        const gradScore = graduationScore(college)

        // Weighted composite
        const fitScore = Math.round(
            (
                0.35 * admission.probability +
                0.25 * major.score +
                0.20 * cost.score +
                0.10 * locScore +
                0.10 * gradScore
            ) * 100
        )

        const tuition = college.net_price
            ?? college.tuition_in_state
            ?? college.tuition_out_state
            ?? 0

        const reasons = buildReasons(
            college,
            student,
            admission.probability,
            major.matched,
            cost.withinBudget,
            locScore,
            college.graduation_rate
        )

        scored.push({
            college,
            fit_score: fitScore,
            admission_probability: admission.probability,
            tuition_estimate: tuition,
            major_match_score: Math.round(major.score * 100),
            cost_fit_score: Math.round(cost.score * 100),
            location_match_score: Math.round(locScore * 100),
            graduation_score: Math.round(gradScore * 100),
            reasons,
        })
    }

    // Sort by fit_score desc, then by admission probability desc
    scored.sort((a, b) => b.fit_score - a.fit_score || b.admission_probability - a.admission_probability)

    return scored.slice(0, limit)
}
