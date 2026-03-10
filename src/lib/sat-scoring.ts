/**
 * SAT Score Conversion Logic
 *
 * Based on the Digital SAT format:
 * - Reading & Writing: 54 questions → scaled 200–800
 * - Math: 44 questions → scaled 200–800
 * - Total: 400–1600
 *
 * Uses approximate concordance tables from College Board practice tests.
 */

import type { SATScoreResult } from './sat-types'

// ─── Math Conversion Table ───────────────────────────────────────────────────
// [rawCorrect, scaledLow, scaledHigh]
const MATH_TABLE: [number, number, number][] = [
    [0, 200, 200], [1, 200, 210], [2, 210, 220], [3, 220, 240], [4, 240, 260],
    [5, 260, 280], [6, 280, 300], [7, 300, 310], [8, 310, 330], [9, 330, 350],
    [10, 350, 370], [11, 370, 380], [12, 380, 400], [13, 400, 410], [14, 410, 420],
    [15, 420, 440], [16, 440, 450], [17, 450, 460], [18, 460, 480], [19, 480, 490],
    [20, 490, 500], [21, 500, 510], [22, 510, 520], [23, 520, 530], [24, 530, 540],
    [25, 540, 550], [26, 550, 560], [27, 560, 570], [28, 570, 580], [29, 580, 590],
    [30, 590, 600], [31, 600, 620], [32, 620, 630], [33, 630, 640], [34, 640, 660],
    [35, 660, 670], [36, 670, 690], [37, 690, 700], [38, 700, 720], [39, 720, 740],
    [40, 740, 750], [41, 750, 770], [42, 770, 780], [43, 780, 790], [44, 790, 800],
]

// ─── Reading & Writing Conversion Table ──────────────────────────────────────
const RW_TABLE: [number, number, number][] = [
    [0, 200, 200], [1, 200, 210], [2, 210, 220], [3, 220, 230], [4, 230, 240],
    [5, 240, 260], [6, 260, 280], [7, 280, 290], [8, 290, 310], [9, 310, 320],
    [10, 320, 340], [11, 340, 350], [12, 350, 360], [13, 360, 370], [14, 370, 380],
    [15, 380, 400], [16, 400, 410], [17, 410, 420], [18, 420, 430], [19, 430, 440],
    [20, 440, 450], [21, 450, 460], [22, 460, 470], [23, 470, 480], [24, 480, 490],
    [25, 490, 500], [26, 500, 510], [27, 510, 520], [28, 520, 530], [29, 530, 540],
    [30, 540, 550], [31, 550, 560], [32, 560, 570], [33, 570, 580], [34, 580, 590],
    [35, 590, 600], [36, 600, 610], [37, 610, 620], [38, 620, 630], [39, 630, 640],
    [40, 640, 650], [41, 650, 660], [42, 660, 670], [43, 670, 680], [44, 680, 690],
    [45, 690, 700], [46, 700, 710], [47, 710, 720], [48, 720, 730], [49, 730, 740],
    [50, 740, 760], [51, 760, 770], [52, 770, 780], [53, 780, 790], [54, 790, 800],
]

// ─── Percentile Table ────────────────────────────────────────────────────────
// Approximate percentile by total score (midpoint)
const PERCENTILE_TABLE: [number, number][] = [
    [400, 1], [500, 3], [600, 5], [700, 9], [800, 16],
    [900, 26], [950, 32], [1000, 40], [1050, 48], [1100, 56],
    [1150, 63], [1200, 71], [1250, 77], [1300, 83], [1350, 88],
    [1400, 92], [1450, 95], [1500, 97], [1520, 98], [1550, 99],
    [1600, 99],
]

function lookup(table: [number, number, number][], raw: number): [number, number] {
    const clamped = Math.max(0, Math.min(raw, table.length - 1))
    const entry = table[clamped]
    return [entry[1], entry[2]]
}

function getPercentile(totalScore: number): number {
    for (let i = PERCENTILE_TABLE.length - 1; i >= 0; i--) {
        if (totalScore >= PERCENTILE_TABLE[i][0]) {
            return PERCENTILE_TABLE[i][1]
        }
    }
    return 1
}

function getPercentileRange(totalLow: number, totalHigh: number): string {
    const pLow = getPercentile(totalLow)
    const pHigh = getPercentile(totalHigh)
    if (pLow === pHigh) return `${pLow}th percentile`
    return `${pLow}th–${pHigh}th percentile`
}

export function calculateSATScore(mathCorrect: number, rwCorrect: number): SATScoreResult {
    const [mathLow, mathHigh] = lookup(MATH_TABLE, mathCorrect)
    const [rwLow, rwHigh] = lookup(RW_TABLE, rwCorrect)

    const totalLow = mathLow + rwLow
    const totalHigh = mathHigh + rwHigh
    const totalMid = Math.round((totalLow + totalHigh) / 2)

    const percentile = getPercentile(totalMid)
    const percentileRange = getPercentileRange(totalLow, totalHigh)

    let message: string
    if (totalMid >= 1500) message = 'Outstanding! You\'re in the top 3% of test takers.'
    else if (totalMid >= 1400) message = 'Excellent! You\'re competitive for Ivy League schools.'
    else if (totalMid >= 1300) message = 'Great score! You\'re competitive for most selective colleges.'
    else if (totalMid >= 1200) message = 'Good score! You\'re above the national average.'
    else if (totalMid >= 1100) message = 'Solid score! With practice, you can push even higher.'
    else if (totalMid >= 1000) message = 'Good start! Focused practice can significantly boost your score.'
    else message = 'Everyone starts somewhere! A study plan can help you improve quickly.'

    return {
        mathRaw: mathCorrect,
        rwRaw: rwCorrect,
        mathScaledLow: mathLow,
        mathScaledHigh: mathHigh,
        rwScaledLow: rwLow,
        rwScaledHigh: rwHigh,
        totalLow,
        totalHigh,
        totalMid,
        percentile,
        percentileRange,
        message,
    }
}

export function getScoreCategory(score: number): 'low' | 'below_avg' | 'average' | 'above_avg' | 'high' | 'exceptional' {
    if (score >= 1400) return 'exceptional'
    if (score >= 1200) return 'high'
    if (score >= 1050) return 'above_avg'
    if (score >= 900) return 'average'
    if (score >= 700) return 'below_avg'
    return 'low'
}

export function getScoreColor(score: number): string {
    const cat = getScoreCategory(score)
    switch (cat) {
        case 'exceptional': return '#22c55e'
        case 'high': return '#84cc16'
        case 'above_avg': return '#C9923C'
        case 'average': return '#eab308'
        case 'below_avg': return '#f97316'
        case 'low': return '#ef4444'
    }
}
