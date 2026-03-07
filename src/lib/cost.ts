/**
 * College Cost Calculator Logic
 *
 * Estimates the Student Aid Index (SAI) using a simplified version of the
 * FAFSA methodology (Federal Methodology, dependent/independent students).
 *
 * Reference: Federal Student Aid Handbook 2024–25
 * https://fsapartners.ed.gov/knowledge-center/fsa-handbook
 *
 * DISCLAIMER: These are estimates only. Actual aid packages vary by institution
 * and are determined through the official FAFSA process.
 */

import type { College, FinancialProfile, CostEstimate, CostLineItem } from './types'

// ─── Constants ────────────────────────────────────────────────────────────────

// Income Protection Allowance (IPA) by family size (2024–25 values)
const IPA_TABLE: Record<number, number> = {
  2: 20_182,
  3: 25_122,
  4: 31_163,
  5: 36_812,
  6: 41_608,
}
const IPA_ABOVE_6 = 46_674

// Progressive parental contribution rate schedule (2024–25)
const CONTRIBUTION_BRACKETS = [
  { limit: 17_900, rate: 0.22 },
  { limit: 22_500, rate: 0.25 },
  { limit: 26_900, rate: 0.29 },
  { limit: 31_200, rate: 0.34 },
  { limit: 35_700, rate: 0.40 },
  { limit: Infinity, rate: 0.47 },
]

// Maximum Pell Grant 2024–25
const MAX_PELL = 7_395

// Estimated room & board (annual) by control type
const ROOM_BOARD_ESTIMATE: Record<string, number> = {
  public:            12_000,
  private_nonprofit: 15_500,
  private_forprofit: 13_000,
}
const ROOM_BOARD_DEFAULT = 13_000

// Books, supplies, transportation, personal — standard estimate
const BOOKS_FEES_ESTIMATE = 3_200

// ─── SAI Calculation ─────────────────────────────────────────────────────────

function getIPA(familySize: number): number {
  return IPA_TABLE[Math.min(familySize, 6)] ?? IPA_ABOVE_6
}

/**
 * Apply the progressive parental contribution rate schedule.
 * Returns the total parental contribution before dividing by num_in_college.
 */
function applyRateSchedule(assessableIncome: number): number {
  let contribution = 0
  let remaining = assessableIncome
  let prevLimit = 0

  for (const { limit, rate } of CONTRIBUTION_BRACKETS) {
    const bracketSize = limit === Infinity ? remaining : Math.min(remaining, limit - prevLimit)
    if (bracketSize <= 0) break
    contribution += bracketSize * rate
    remaining -= bracketSize
    prevLimit = limit
    if (remaining <= 0) break
  }

  return contribution
}

/**
 * Estimate the Student Aid Index (SAI) for a dependent student.
 * Simplified: uses income only (omits asset assessment for MVP transparency).
 */
function calcDependentSAI(profile: FinancialProfile): number {
  const ipa = getIPA(profile.family_size)
  const assessableIncome = Math.max(0, profile.annual_income - ipa)
  const parentalContribution = applyRateSchedule(assessableIncome)
  const perStudentContribution = parentalContribution / Math.max(1, profile.num_in_college)
  return Math.round(Math.max(0, perStudentContribution))
}

/**
 * Estimate the SAI for an independent student.
 * Uses student income with a lower IPA (fixed $11,000 per 2024–25).
 */
function calcIndependentSAI(profile: FinancialProfile): number {
  const studentIncome = profile.student_income ?? 0
  const ipa = 11_000
  const assessableIncome = Math.max(0, studentIncome - ipa)
  return Math.round(Math.max(0, assessableIncome * 0.50))
}

export function estimateSAI(profile: FinancialProfile): number {
  return profile.dependency_status === 'independent'
    ? calcIndependentSAI(profile)
    : calcDependentSAI(profile)
}

// ─── Pell Grant Estimate ─────────────────────────────────────────────────────

/**
 * Estimate federal Pell Grant based on SAI.
 * Simplified linear interpolation from the official Pell schedule.
 */
export function estimatePellGrant(sai: number): number {
  if (sai < 0) return MAX_PELL
  if (sai === 0) return MAX_PELL
  // Pell phases out around SAI = 6,500
  if (sai >= 6_500) return 0
  const pell = MAX_PELL - Math.round((sai / 6_500) * MAX_PELL)
  return Math.max(0, pell)
}

// ─── Institutional Aid Estimate ──────────────────────────────────────────────

/**
 * Estimate institutional need-based aid.
 * Uses two proxies from public data:
 *   1. College selectivity (acceptance rate) — more selective schools tend to have larger endowments
 *   2. The gap between sticker price and avg net_price — indicates the school's aid generosity
 *
 * This is a rough heuristic and is clearly labeled as an estimate.
 */
export function estimateInstitutionalAid(
  college: College,
  sai: number,
  tuition: number
): number {
  // If we have net_price data, use the gap between sticker and average net price as the
  // institution's typical aid generosity baseline, then scale by the student's need.
  const sticker = tuition + (ROOM_BOARD_ESTIMATE[college.control ?? ''] ?? ROOM_BOARD_DEFAULT) + BOOKS_FEES_ESTIMATE
  const avgNetPrice = college.net_price ?? sticker

  // Aid gap = how much the school typically discounts on average
  const avgAidGap = Math.max(0, sticker - avgNetPrice)

  // Student's need relative to average: scale if student's SAI is below median (assume $25k)
  const needFactor = sai < 25_000 ? 1.1 : sai < 50_000 ? 0.9 : 0.6
  const estimated = Math.round(avgAidGap * needFactor)

  // Institutional aid can't exceed student's demonstrated need
  const demonstratedNeed = Math.max(0, sticker - sai)
  return Math.min(estimated, demonstratedNeed)
}

// ─── Full Cost Estimate ───────────────────────────────────────────────────────

export function estimateCollegeCost(
  college: College,
  profile: FinancialProfile
): CostEstimate {
  const isInState = college.state === profile.home_state && college.control === 'public'
  const tuition = isInState
    ? (college.tuition_in_state ?? college.tuition_out_state ?? 0)
    : (college.tuition_out_state ?? college.tuition_in_state ?? 0)

  const roomBoard = ROOM_BOARD_ESTIMATE[college.control ?? ''] ?? ROOM_BOARD_DEFAULT
  const totalCOA = tuition + roomBoard + BOOKS_FEES_ESTIMATE

  const sai = estimateSAI(profile)
  const pellGrant = estimatePellGrant(sai)
  const institutionalAid = estimateInstitutionalAid(college, sai, tuition)
  const totalGrants = pellGrant + institutionalAid
  const estimatedNetPrice = Math.max(0, totalCOA - totalGrants)

  const aidBreakdown: CostLineItem[] = []
  if (pellGrant > 0) {
    aidBreakdown.push({
      label: 'Federal Pell Grant',
      amount: pellGrant,
      note: 'Need-based federal grant — does not need to be repaid',
    })
  }
  if (institutionalAid > 0) {
    aidBreakdown.push({
      label: 'Estimated Institutional Aid',
      amount: institutionalAid,
      note: "Based on school's average aid generosity and your financial need",
    })
  }

  return {
    college,
    tuition,
    room_board_estimate: roomBoard,
    books_fees_estimate: BOOKS_FEES_ESTIMATE,
    total_coa: totalCOA,
    sai,
    pell_grant: pellGrant,
    institutional_aid_estimate: institutionalAid,
    total_grants: totalGrants,
    estimated_net_price: estimatedNetPrice,
    comparison_net_price: college.net_price,
    is_in_state: isInState,
    aid_breakdown: aidBreakdown,
  }
}
