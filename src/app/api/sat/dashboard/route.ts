import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/** GET — aggregate dashboard stats for a user */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const user_id = searchParams.get('user_id')

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 })
        }

        const supabase = createServiceClient()

        // Run all queries in parallel
        const [attemptsRes, scoresRes, streakRes] = await Promise.all([
            // All question attempts
            supabase
                .from('sat_question_attempts')
                .select('is_correct, section, topic, difficulty, created_at')
                .eq('user_id', user_id)
                .order('created_at', { ascending: false }),

            // Score history
            supabase
                .from('sat_score_history')
                .select('math_score, rw_score, total_score, created_at')
                .eq('user_id', user_id)
                .order('created_at', { ascending: false })
                .limit(20),

            // Recent attempts for streak calculation (last 30 days)
            supabase
                .from('sat_question_attempts')
                .select('created_at')
                .eq('user_id', user_id)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())
                .order('created_at', { ascending: false }),
        ])

        const attempts = attemptsRes.data ?? []
        const scores = scoresRes.data ?? []
        const recentAttempts = streakRes.data ?? []

        // ─── Calculate stats ─────────────────────────────────────
        const totalQuestions = attempts.length
        const correctCount = attempts.filter(a => a.is_correct).length
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

        // Latest score
        const latestScore = scores.length > 0 ? scores[0] : null
        const estimatedScore = latestScore?.total_score ?? 0
        const mathScore = latestScore?.math_score ?? 0
        const rwScore = latestScore?.rw_score ?? 0

        // Streak: count consecutive days with activity (from today backwards)
        const uniqueDays = new Set(
            recentAttempts.map(a => new Date(a.created_at).toISOString().split('T')[0])
        )
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 30; i++) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().split('T')[0]
            if (uniqueDays.has(key)) {
                streak++
            } else if (i > 0) {
                break // streak broken
            }
        }

        // Topic accuracy breakdown
        const topicMap: Record<string, { correct: number; total: number; section: string }> = {}
        for (const a of attempts) {
            const key = a.topic || 'Other'
            if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0, section: a.section }
            topicMap[key].total++
            if (a.is_correct) topicMap[key].correct++
        }
        const topicAccuracy = Object.entries(topicMap)
            .map(([topic, d]) => ({
                topic,
                accuracy: Math.round((d.correct / d.total) * 100),
                total: d.total,
                section: d.section,
            }))
            .sort((a, b) => a.accuracy - b.accuracy)

        // Score trend (from score history)
        const scoreTrend = scores
            .slice(0, 10)
            .reverse()
            .map(s => ({
                date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: s.total_score,
                math: s.math_score,
                rw: s.rw_score,
            }))

        return NextResponse.json({
            estimatedScore,
            mathScore,
            rwScore,
            totalQuestions,
            correctCount,
            accuracy,
            streak,
            topicAccuracy,
            scoreTrend,
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
