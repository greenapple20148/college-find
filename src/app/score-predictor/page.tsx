'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Prediction {
    currentEstimate: number
    projectedScore: number
    improvement: number
    trendDirection: string
    confidence: string
    weeksOfData: number
}

interface WeeklyData {
    week: string
    accuracy: number
    total: number
}

interface TopicData {
    topic: string
    accuracy: number
    attempts: number
    potentialGain?: number
}

export default function ScorePredictorPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [stats, setStats] = useState<{ totalAttempts: number; overallAccuracy: number; sections: Record<string, { accuracy: number; total: number }>; difficulties: Record<string, { accuracy: number; total: number }> } | null>(null)
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyData[]>([])
    const [weakTopics, setWeakTopics] = useState<TopicData[]>([])
    const [strongTopics, setStrongTopics] = useState<TopicData[]>([])
    const [upgradeRequired, setUpgradeRequired] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetch('/api/score-predictor')
            .then(r => r.json())
            .then(data => {
                if (data.upgrade_required) {
                    setUpgradeRequired(true)
                    setMessage(data.message)
                } else if (data.message && !data.prediction) {
                    setMessage(data.message)
                } else {
                    setPrediction(data.prediction)
                    setStats(data.stats)
                    setWeeklyTrend(data.weeklyTrend || [])
                    setWeakTopics(data.weakTopics || [])
                    setStrongTopics(data.strongTopics || [])
                }
            })
            .catch(() => setError('Failed to load predictions'))
            .finally(() => setLoading(false))
    }, [])

    if (upgradeRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))' }}>
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    </div>
                    <h1 className="heading-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Premium Feature</h1>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{message}</p>
                    <Link href="/pricing" className="btn-gold px-8 py-3 inline-block">Upgrade to Premium</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen px-4 py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>Premium</span>
                    </div>
                    <h1 className="heading-serif text-3xl sm:text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
                        Score Improvement <span className="heading-serif-italic text-gradient-gold">Predictor</span>
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        AI-powered analysis of your practice history to predict your SAT score trajectory
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--gold-primary)' }} />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
                    </div>
                ) : message && !prediction ? (
                    <div className="card-dark p-8 text-center max-w-md mx-auto">
                        <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--gold-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <h2 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>More Practice Needed</h2>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{message}</p>
                        <Link href="/sat-prep/practice" className="btn-gold px-6 py-2.5 text-sm inline-block">
                            Start Practicing →
                        </Link>
                    </div>
                ) : prediction && stats ? (
                    <div className="space-y-6">
                        {/* Score Prediction Card */}
                        <div className="card-dark p-6 sm:p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>Current Estimate</p>
                                    <p className="text-4xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{prediction.currentEstimate}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>Projected (4 weeks)</p>
                                    <p className="text-4xl font-bold font-mono" style={{ color: 'var(--gold-primary)' }}>{prediction.projectedScore}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>Expected Gain</p>
                                    <p className="text-4xl font-bold font-mono" style={{
                                        color: prediction.improvement > 0 ? '#22c55e' : 'var(--text-muted)'
                                    }}>
                                        +{prediction.improvement}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                                    Trend: <strong style={{ color: prediction.trendDirection === 'improving' ? '#22c55e' : prediction.trendDirection === 'declining' ? '#ef4444' : 'var(--text-muted)' }}>
                                        {prediction.trendDirection === 'improving' ? '📈 Improving' : prediction.trendDirection === 'declining' ? '📉 Declining' : '→ Stable'}
                                    </strong>
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                                    Confidence: <strong>{prediction.confidence}</strong>
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                                    {prediction.weeksOfData} weeks of data
                                </span>
                            </div>
                        </div>

                        {/* Weekly Trend */}
                        {weeklyTrend.length > 1 && (
                            <div className="card-dark p-6">
                                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Accuracy Trend</h3>
                                <div className="flex items-end gap-1 h-32">
                                    {weeklyTrend.map((w, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>
                                                {Math.round(w.accuracy * 100)}%
                                            </span>
                                            <div
                                                className="w-full rounded-t transition-all"
                                                style={{
                                                    height: `${Math.max(8, w.accuracy * 100)}%`,
                                                    background: w.accuracy >= 0.7 ? 'linear-gradient(to top, var(--gold-primary), var(--gold-light))' : 'var(--bg-tertiary)',
                                                    minHeight: '4px',
                                                }}
                                            />
                                            <span className="text-[9px]" style={{ color: 'var(--text-ghost)' }}>{w.total}q</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section Breakdown + Difficulty */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="card-dark p-6">
                                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>By Section</h3>
                                {Object.entries(stats.sections).map(([sec, val]) => (
                                    <div key={sec} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{sec.replace(/_/g, ' ')}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                                <div className="h-full rounded-full" style={{
                                                    width: `${val.accuracy}%`,
                                                    backgroundColor: val.accuracy >= 70 ? 'var(--gold-primary)' : '#ef4444',
                                                }} />
                                            </div>
                                            <span className="text-sm font-mono w-10 text-right" style={{ color: 'var(--text-primary)' }}>{val.accuracy}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="card-dark p-6">
                                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>By Difficulty</h3>
                                {Object.entries(stats.difficulties).map(([diff, val]) => (
                                    <div key={diff} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{diff}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                                <div className="h-full rounded-full" style={{
                                                    width: `${val.accuracy}%`,
                                                    backgroundColor: val.accuracy >= 70 ? 'var(--gold-primary)' : '#ef4444',
                                                }} />
                                            </div>
                                            <span className="text-sm font-mono w-10 text-right" style={{ color: 'var(--text-primary)' }}>{val.accuracy}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weak & Strong Topics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {weakTopics.length > 0 && (
                                <div className="card-dark p-6">
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>🎯 Focus Areas</h3>
                                    <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>Topics with the most room for improvement</p>
                                    {weakTopics.map(t => (
                                        <div key={t.topic} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.topic}</p>
                                                <p className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>{t.attempts} attempts · +{t.potentialGain} pts potential</p>
                                            </div>
                                            <span className="text-sm font-mono" style={{ color: '#ef4444' }}>{t.accuracy}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {strongTopics.length > 0 && (
                                <div className="card-dark p-6">
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>💪 Strong Areas</h3>
                                    <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>Topics you&apos;re excelling in</p>
                                    {strongTopics.map(t => (
                                        <div key={t.topic} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.topic}</p>
                                                <p className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>{t.attempts} attempts</p>
                                            </div>
                                            <span className="text-sm font-mono" style={{ color: '#22c55e' }}>{t.accuracy}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Overall Stats */}
                        <div className="card-dark p-6 text-center">
                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                                Based on {stats.totalAttempts} practice questions · {stats.overallAccuracy}% overall accuracy
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
