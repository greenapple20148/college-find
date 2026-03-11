import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/lib/feature-gate'

/**
 * SAT Score Improvement Predictor
 * Analyzes practice history and projects score improvement
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Feature gate
        const access = await checkFeatureAccess(user.id, 'score_improvement_predictor')
        if (!access.allowed) {
            return NextResponse.json({
                error: 'upgrade_required', message: access.message, upgrade_required: true
            }, { status: 403 })
        }

        const service = createServiceClient()

        // Get practice history (last 90 days)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        const { data: attempts } = await service
            .from('sat_question_attempts')
            .select('is_correct, section, topic, difficulty, created_at, time_spent')
            .eq('user_id', user.id)
            .gte('created_at', ninetyDaysAgo)
            .order('created_at', { ascending: true })

        if (!attempts || attempts.length < 5) {
            return NextResponse.json({
                prediction: null,
                message: 'You need at least 5 practice attempts to generate a prediction.',
                totalAttempts: attempts?.length ?? 0,
            })
        }

        // Split into weekly buckets
        const weeks: Record<string, { correct: number; total: number; avgTime: number }> = {}
        for (const a of attempts) {
            const d = new Date(a.created_at)
            const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}-${d.getMonth()}`
            if (!weeks[weekKey]) weeks[weekKey] = { correct: 0, total: 0, avgTime: 0 }
            weeks[weekKey].total++
            if (a.is_correct) weeks[weekKey].correct++
            weeks[weekKey].avgTime += (a.time_spent || 0)
        }

        const weeklyAccuracy = Object.entries(weeks).map(([key, w]) => ({
            week: key,
            accuracy: w.total > 0 ? w.correct / w.total : 0,
            total: w.total,
            avgTime: w.total > 0 ? w.avgTime / w.total : 0,
        }))

        // Calculate overall stats
        const totalCorrect = attempts.filter(a => a.is_correct).length
        const overallAccuracy = totalCorrect / attempts.length

        // Section breakdown
        const sections: Record<string, { correct: number; total: number }> = {}
        const topics: Record<string, { correct: number; total: number }> = {}
        const difficulties: Record<string, { correct: number; total: number }> = {}

        for (const a of attempts) {
            const sec = a.section || 'unknown'
            if (!sections[sec]) sections[sec] = { correct: 0, total: 0 }
            sections[sec].total++
            if (a.is_correct) sections[sec].correct++

            const top = a.topic || 'unknown'
            if (!topics[top]) topics[top] = { correct: 0, total: 0 }
            topics[top].total++
            if (a.is_correct) topics[top].correct++

            const diff = a.difficulty || 'medium'
            if (!difficulties[diff]) difficulties[diff] = { correct: 0, total: 0 }
            difficulties[diff].total++
            if (a.is_correct) difficulties[diff].correct++
        }

        // Calculate improvement trend (linear regression on weekly accuracy)
        const accValues = weeklyAccuracy.map(w => w.accuracy)
        const n = accValues.length
        let trendSlope = 0
        if (n >= 2) {
            const xMean = (n - 1) / 2
            const yMean = accValues.reduce((a, b) => a + b, 0) / n
            let num = 0, den = 0
            for (let i = 0; i < n; i++) {
                num += (i - xMean) * (accValues[i] - yMean)
                den += (i - xMean) ** 2
            }
            trendSlope = den > 0 ? num / den : 0
        }

        // Project score based on accuracy → SAT mapping
        // SAT: 400-1600, roughly accuracy * 1200 + 400
        const currentEstimate = Math.round(overallAccuracy * 1200 + 400)
        const projectedAccuracy = Math.min(1, overallAccuracy + trendSlope * 4) // 4 more weeks
        const projectedScore = Math.round(projectedAccuracy * 1200 + 400)
        const improvement = projectedScore - currentEstimate

        // Find weak topics (below 60% accuracy, min 3 attempts)
        const weakTopics = Object.entries(topics)
            .filter(([, v]) => v.total >= 3 && (v.correct / v.total) < 0.6)
            .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
            .slice(0, 5)
            .map(([topic, v]) => ({
                topic,
                accuracy: Math.round((v.correct / v.total) * 100),
                attempts: v.total,
                potentialGain: Math.round((0.8 - v.correct / v.total) * (v.total / attempts.length) * 1200),
            }))

        // Strong topics
        const strongTopics = Object.entries(topics)
            .filter(([, v]) => v.total >= 3 && (v.correct / v.total) >= 0.8)
            .sort(([, a], [, b]) => (b.correct / b.total) - (a.correct / a.total))
            .slice(0, 5)
            .map(([topic, v]) => ({
                topic,
                accuracy: Math.round((v.correct / v.total) * 100),
                attempts: v.total,
            }))

        return NextResponse.json({
            prediction: {
                currentEstimate,
                projectedScore: Math.max(currentEstimate, projectedScore),
                improvement: Math.max(0, improvement),
                trendDirection: trendSlope > 0.01 ? 'improving' : trendSlope < -0.01 ? 'declining' : 'stable',
                confidence: n >= 4 ? 'high' : n >= 2 ? 'moderate' : 'low',
                weeksOfData: n,
            },
            stats: {
                totalAttempts: attempts.length,
                overallAccuracy: Math.round(overallAccuracy * 100),
                sections: Object.fromEntries(
                    Object.entries(sections).map(([k, v]) => [k, {
                        accuracy: Math.round((v.correct / v.total) * 100),
                        total: v.total,
                    }])
                ),
                difficulties: Object.fromEntries(
                    Object.entries(difficulties).map(([k, v]) => [k, {
                        accuracy: Math.round((v.correct / v.total) * 100),
                        total: v.total,
                    }])
                ),
            },
            weeklyTrend: weeklyAccuracy,
            weakTopics,
            strongTopics,
        })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
    }
}
