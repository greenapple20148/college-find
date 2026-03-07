/**
 * CollegeMatch — Admissions Probability Engine v2
 *
 * Algorithm: Weighted additive adjustment model
 *
 * estimated_probability = clamp(base + gpa_adj + test_adj + fit_adj, 0.05, 0.95)
 *
 * Where:
 *   base      = school acceptance rate
 *   gpa_adj   = ±adjustment based on GPA vs. estimated school norm
 *   test_adj  = ±adjustment based on SAT/ACT vs. school midpoint (0.00 if test-optional/missing)
 *   fit_adj   = bonuses for in-state public school and major alignment
 *
 * Rule layer (applied after scoring):
 *   - Open admission schools (no acceptance rate data) → 0.90
 *   - Sub-5% accept rate → cap at 0.50  (prevents elite schools from ever being Safety/Match)
 *   - Sub-10% accept rate → cap at 0.74 (prevents elite schools from ever being Safety)
 *
 * References:
 *   - NCES IPEDS institutional data
 *   - College Scorecard admitted student profile data
 *   - Public descriptions of Niche, CollegeVine, and Common App probability tools
 *
 * DISCLAIMER: Estimates only. Does not account for essays, recommendations,
 * extracurriculars, legacy, athletics, demonstrated interest, or institutional priorities.
 */

import type {
  College,
  StudentProfile,
  MatchCategory,
  MatchResult,
  ScoreBreakdown,
} from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function categorize(probability: number): MatchCategory {
  if (probability >= 0.75) return 'safety'
  if (probability >= 0.40) return 'match'
  return 'reach'
}

function formatProbability(probability: number): string {
  return `${Math.round(probability * 100)}% estimated chance`
}

// ─── GPA Norm Lookup ─────────────────────────────────────────────────────────

/**
 * Estimate the median GPA of admitted students from a school's acceptance rate.
 * Derived from IPEDS/Scorecard aggregate data.
 */
function schoolGpaEstimate(rate: number): number {
  if (rate < 0.10) return 3.90   // MIT, Stanford tier
  if (rate < 0.20) return 3.75   // Highly selective
  if (rate < 0.35) return 3.50   // Selective
  if (rate < 0.50) return 3.25   // Moderately selective
  if (rate < 0.70) return 3.00   // Less selective
  return 2.70                     // Broad/open access
}

// ─── Step A: GPA Adjustment ──────────────────────────────────────────────────

/**
 * 5-bucket GPA fit adjustment.
 * Threshold: ±0.30 GPA points = "significantly" above/below, ±0.10 = "slightly"
 */
function calcGpaAdj(
  studentGpa: number,
  schoolGpa: number
): { adj: number; label: string } {
  const diff = studentGpa - schoolGpa
  if (diff >= 0.30)  return { adj:  0.20, label: `GPA ${studentGpa.toFixed(2)} well above estimated school avg ${schoolGpa.toFixed(2)}` }
  if (diff >= 0.10)  return { adj:  0.10, label: `GPA ${studentGpa.toFixed(2)} slightly above estimated school avg ${schoolGpa.toFixed(2)}` }
  if (diff >= -0.10) return { adj:  0.00, label: `GPA ${studentGpa.toFixed(2)} near estimated school avg ${schoolGpa.toFixed(2)}` }
  if (diff >= -0.30) return { adj: -0.15, label: `GPA ${studentGpa.toFixed(2)} slightly below estimated school avg ${schoolGpa.toFixed(2)}` }
  return               { adj: -0.30, label: `GPA ${studentGpa.toFixed(2)} well below estimated school avg ${schoolGpa.toFixed(2)}` }
}

// ─── Step B: Test Score Adjustment ───────────────────────────────────────────

/**
 * 3-bucket test score adjustment.
 * ±60 SAT points / ±2 ACT points from midpoint = "near" band.
 * Returns 0.00 if no student scores OR no school data (test-optional treatment).
 */
function calcTestAdj(
  student: StudentProfile,
  college: College
): { adj: number; label: string } {
  const hasSatData = college.sat_math_50 !== null && college.sat_read_50 !== null
  const hasActData = college.act_50 !== null

  // SAT path
  if (student.sat_total !== null && hasSatData) {
    const mid = college.sat_math_50! + college.sat_read_50!
    const diff = student.sat_total - mid
    if (diff >= 60)  return { adj:  0.15, label: `SAT ${student.sat_total} above school midpoint ${mid} (+)` }
    if (diff >= -60) return { adj:  0.00, label: `SAT ${student.sat_total} near school midpoint ${mid}` }
    return             { adj: -0.10, label: `SAT ${student.sat_total} below school midpoint ${mid} (−)` }
  }

  // ACT path
  if (student.act !== null && hasActData) {
    const mid = college.act_50!
    const diff = student.act - mid
    if (diff >= 2)  return { adj:  0.15, label: `ACT ${student.act} above school midpoint ${mid} (+)` }
    if (diff >= -2) return { adj:  0.00, label: `ACT ${student.act} near school midpoint ${mid}` }
    return            { adj: -0.10, label: `ACT ${student.act} below school midpoint ${mid} (−)` }
  }

  // No test scores submitted or school has no test data → treat as test-optional (neutral)
  const reason = student.sat_total === null && student.act === null
    ? 'No test scores submitted — treated as test-optional (neutral)'
    : 'School test score data unavailable — score not factored'
  return { adj: 0.00, label: reason }
}

// ─── Step C: Fit Adjustments ─────────────────────────────────────────────────

/**
 * Bonus adjustments for fit signals:
 *   +0.05 for in-state public school (preferred_states overlap with school state)
 *   +0.05 for major program alignment
 */
function calcFitAdj(
  student: StudentProfile,
  college: College
): { adj: number; reasons: string[] } {
  let adj = 0
  const reasons: string[] = []

  // In-state bonus: school is public and its state is in student's preferred states
  if (
    college.control === 'public' &&
    college.state &&
    student.preferred_states.includes(college.state)
  ) {
    adj += 0.05
    reasons.push(`In-state public school (${college.state}) bonus (+0.05)`)
  }

  // Major alignment bonus
  if (student.intended_major && college.programs.length > 0) {
    const majorLower = student.intended_major.toLowerCase()
    const hasMatch = college.programs.some(p => {
      const pLower = p.toLowerCase()
      return pLower.includes(majorLower) || majorLower.includes(pLower)
    })
    if (hasMatch) {
      adj += 0.05
      reasons.push(`Program match for "${student.intended_major}" (+0.05)`)
    }
  }

  return { adj, reasons }
}

// ─── Rule Layer ───────────────────────────────────────────────────────────────

/**
 * Post-score rule overrides to prevent unrealistic category assignments.
 *
 * Very selective schools (< 10% accept rate) should never appear as Safety.
 * Even the strongest applicant has significant uncertainty at these schools.
 */
function applyRules(
  probability: number,
  rate: number,
  explanation: string[]
): { probability: number; rule_cap: number | null } {
  if (rate < 0.05) {
    // Sub-5%: highly selective — cap at 0.50 (at best a "match" even for top students)
    if (probability > 0.50) {
      explanation.push('Rule: Sub-5% acceptance rate — probability capped at 50% (very selective school)')
      return { probability: 0.50, rule_cap: 0.50 }
    }
  } else if (rate < 0.10) {
    // Sub-10%: very selective — cap at 0.74 so it never categorizes as Safety
    if (probability > 0.74) {
      explanation.push('Rule: Sub-10% acceptance rate — probability capped at 74% (selective school; rarely a true safety)')
      return { probability: 0.74, rule_cap: 0.74 }
    }
  }
  return { probability, rule_cap: null }
}

// ─── Main Entry Points ────────────────────────────────────────────────────────

export function estimateAdmissionChance(
  student: StudentProfile,
  college: College
): {
  probability: number
  category: MatchCategory
  score_breakdown: ScoreBreakdown
  explanation: string[]
} {
  const explanation: string[] = []

  // Open admission / no acceptance rate data
  if (college.acceptance_rate === null) {
    explanation.push('Open admission or acceptance rate not reported — assumed broad access')
    return {
      probability: 0.90,
      category: 'safety',
      score_breakdown: { base: 0.90, gpa_adj: 0, test_adj: 0, fit_adj: 0, rule_cap: null },
      explanation,
    }
  }

  const rate = college.acceptance_rate
  explanation.push(`Acceptance rate: ${Math.round(rate * 100)}% — ${
    rate < 0.10 ? 'highly selective' :
    rate < 0.20 ? 'very selective' :
    rate < 0.40 ? 'selective' :
    rate < 0.65 ? 'moderately selective' : 'less selective'
  }`)

  // Step A: GPA
  const schoolGpa = schoolGpaEstimate(rate)
  const { adj: gpa_adj, label: gpaLabel } = calcGpaAdj(student.gpa, schoolGpa)
  explanation.push(gpaLabel + (gpa_adj !== 0 ? ` (${gpa_adj > 0 ? '+' : ''}${gpa_adj.toFixed(2)})` : ''))

  // Step B: Test scores
  const { adj: test_adj, label: testLabel } = calcTestAdj(student, college)
  explanation.push(testLabel + (test_adj !== 0 ? ` (${test_adj > 0 ? '+' : ''}${test_adj.toFixed(2)})` : ''))

  // Step C: Fit
  const { adj: fit_adj, reasons: fitReasons } = calcFitAdj(student, college)
  explanation.push(...fitReasons)

  // Compute raw probability
  const raw = clamp(rate + gpa_adj + test_adj + fit_adj, 0.05, 0.95)

  // Apply rule layer
  const { probability, rule_cap } = applyRules(raw, rate, explanation)

  return {
    probability,
    category: categorize(probability),
    score_breakdown: { base: rate, gpa_adj, test_adj, fit_adj, rule_cap },
    explanation,
  }
}

function buildBudgetNote(
  college: College,
  budgetMax: number | null
): { fit: boolean; note: string | null } {
  if (budgetMax === null) return { fit: true, note: null }
  if (college.net_price === null) return { fit: true, note: 'Net price data unavailable' }
  const fit = college.net_price <= budgetMax
  const price = `$${college.net_price.toLocaleString()}`
  const budget = `$${budgetMax.toLocaleString()}`
  return fit
    ? { fit: true,  note: `Net price ${price} — within your ${budget} budget` }
    : { fit: false, note: `Net price ${price} — exceeds your ${budget} budget` }
}

function buildSizeNote(
  college: College,
  preferredSize: StudentProfile['campus_size']
): string | null {
  if (preferredSize === 'any' || college.size_category === null) return null
  if (college.size_category === preferredSize) return null
  const label = {
    small:  `Small campus (${(college.enrollment ?? 0).toLocaleString()} students)`,
    medium: `Medium campus (${(college.enrollment ?? 0).toLocaleString()} students)`,
    large:  `Large campus (${(college.enrollment ?? 0).toLocaleString()} students)`,
  }[college.size_category] ?? 'Campus size unknown'
  return `${label} — outside your ${preferredSize} preference`
}

export function runMatch(
  student: StudentProfile,
  colleges: College[]
): { safety: MatchResult[]; match: MatchResult[]; reach: MatchResult[] } {
  const safety: MatchResult[] = []
  const match: MatchResult[]  = []
  const reach: MatchResult[]  = []

  for (const college of colleges) {
    const { probability, category, score_breakdown, explanation } =
      estimateAdmissionChance(student, college)

    const { fit: budget_fit, note: budget_note } = buildBudgetNote(college, student.budget_max)
    const size_note = buildSizeNote(college, student.campus_size)

    const result: MatchResult = {
      college,
      probability,
      category,
      probability_label: formatProbability(probability),
      budget_fit,
      budget_note,
      size_note,
      score_breakdown,
      explanation,
    }

    if (category === 'safety') safety.push(result)
    else if (category === 'match') match.push(result)
    else reach.push(result)
  }

  const byProbDesc = (a: MatchResult, b: MatchResult) => b.probability - a.probability
  safety.sort(byProbDesc)
  match.sort(byProbDesc)
  reach.sort(byProbDesc)

  return { safety, match, reach }
}

/**
 * Apply student preference filters. Relaxes state filter if too few results.
 */
export function applyPreferenceFilters(
  colleges: College[],
  student: StudentProfile
): { filtered: College[]; statesRelaxed: boolean; budgetRelaxed: boolean } {
  let filtered = colleges
  let statesRelaxed = false
  const budgetRelaxed = false

  if (student.preferred_states.length > 0) {
    const stateFiltered = filtered.filter(
      c => c.state && student.preferred_states.includes(c.state)
    )
    if (stateFiltered.length >= 5) {
      filtered = stateFiltered
    } else {
      statesRelaxed = true
    }
  }

  if (student.campus_size !== 'any') {
    const sizeFiltered = filtered.filter(c => c.size_category === student.campus_size)
    if (sizeFiltered.length >= 5) filtered = sizeFiltered
  }

  return { filtered, statesRelaxed, budgetRelaxed }
}
