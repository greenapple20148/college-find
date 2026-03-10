'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface DashboardData {
    estimatedScore: number
    mathScore: number
    rwScore: number
    totalQuestions: number
    correctCount: number
    accuracy: number
    streak: number
    topicAccuracy: { topic: string; accuracy: number; total: number; section: string }[]
    scoreTrend: { date: string; score: number; math: number; rw: number }[]
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
    return (
        <div className="card-dark p-5">
            <p className="text-xs font-medium tracking-wider uppercase mb-1" style={{ color: 'var(--text-ghost)' }}>{label}</p>
            <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
            {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</p>}
        </div>
    )
}

function AccuracyBar({ topic, accuracy }: { topic: string; accuracy: number }) {
    const color = accuracy >= 80 ? '#22c55e' : accuracy >= 65 ? '#eab308' : '#ef4444'
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs w-28 truncate" style={{ color: 'var(--text-secondary)' }}>{topic}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${accuracy}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-mono w-10 text-right" style={{ color }}>{accuracy}%</span>
        </div>
    )
}

export default function SATDashboard() {
    const { user, loading: authLoading } = useAuth()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            setLoading(false)
            return
        }

        async function fetchDashboard() {
            try {
                const res = await fetch(`/api/sat/dashboard?user_id=${user!.id}`)
                const json = await res.json()
                if (!json.error) setData(json)
            } catch {
                // silent
            }
            setLoading(false)
        }
        fetchDashboard()
    }, [user, authLoading])

    if (authLoading || loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <div className="card-dark p-12 text-center">
                    <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--border-primary)', borderTopColor: '#60a5fa' }} />
                    <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <div className="card-dark p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <svg className="w-8 h-8" style={{ color: '#60a5fa' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2 className="heading-serif text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Sign in to track your progress</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Practice questions and your scores will be saved automatically.</p>
                    <Link href="/login" className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>
                        Sign In →
                    </Link>
                </div>
            </div>
        )
    }

    const stats = data || {
        estimatedScore: 0, mathScore: 0, rwScore: 0,
        totalQuestions: 0, correctCount: 0, accuracy: 0, streak: 0,
        topicAccuracy: [], scoreTrend: [],
    }

    const isEmpty = stats.totalQuestions === 0

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: '#60a5fa' }}>Dashboard</span>
                    </div>
                    <h1 className="heading-serif text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>Your SAT Progress</h1>
                </div>
                <div className="flex gap-2">
                    <Link href="/sat-prep/practice" className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>
                        Practice Now →
                    </Link>
                    <Link href="/sat-prep/planner" className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border transition-all" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                        Study Plan
                    </Link>
                </div>
            </div>

            {isEmpty ? (
                <div className="card-dark p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <svg className="w-8 h-8" style={{ color: '#60a5fa' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M4 4h16v16H4z" /><path d="M12 4v16M4 12h16" />
                        </svg>
                    </div>
                    <h2 className="heading-serif text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No practice data yet</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Start practicing to see your progress, accuracy, and score trends here.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/sat-prep/practice" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>
                            Start Practicing
                        </Link>
                        <Link href="/sat-prep/calculator" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                            Try Score Calculator
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <StatCard label="EST. Score" value={stats.estimatedScore ? String(stats.estimatedScore) : '—'} sub={stats.estimatedScore ? 'from latest score' : 'use calculator'} color="#60a5fa" />
                        <StatCard label="Questions" value={String(stats.totalQuestions)} sub="completed" color="var(--text-primary)" />
                        <StatCard label="Accuracy" value={`${stats.accuracy}%`} sub={`${stats.correctCount} correct`} color={stats.accuracy >= 70 ? '#22c55e' : '#eab308'} />
                        <StatCard label="Streak" value={stats.streak > 0 ? `${stats.streak} day${stats.streak !== 1 ? 's' : ''}` : '—'} sub={stats.streak > 0 ? '🔥 keep going!' : 'practice today!'} color="#f97316" />
                    </div>

                    {/* Score Trend & Section Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Score Trend */}
                        <div className="card-dark p-6">
                            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Score Trend</h3>
                            {stats.scoreTrend.length > 0 ? (
                                <div className="flex items-end gap-1 h-40">
                                    {stats.scoreTrend.map((d, i) => {
                                        const min = Math.min(...stats.scoreTrend.map(s => s.score))
                                        const max = Math.max(...stats.scoreTrend.map(s => s.score))
                                        const range = max - min || 1
                                        const height = ((d.score - min) / range) * 80 + 20
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-mono" style={{ color: '#60a5fa' }}>{d.score}</span>
                                                <div
                                                    className="w-full rounded-t-md transition-all duration-500"
                                                    style={{ height: `${height}%`, background: 'linear-gradient(180deg, #3b82f6, #2563eb)', opacity: 0.8 }}
                                                />
                                                <span className="text-[9px]" style={{ color: 'var(--text-ghost)' }}>{d.date}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center">
                                    <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>Use the Score Calculator to start tracking</p>
                                </div>
                            )}
                        </div>

                        {/* Section Breakdown */}
                        <div className="card-dark p-6">
                            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Section Scores</h3>
                            <div className="flex flex-col gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Math</span>
                                        <span className="text-lg font-bold font-mono" style={{ color: '#60a5fa' }}>{stats.mathScore || '—'}</span>
                                    </div>
                                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                        <div className="h-full rounded-full" style={{ width: `${stats.mathScore ? ((stats.mathScore - 200) / 600) * 100 : 0}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reading & Writing</span>
                                        <span className="text-lg font-bold font-mono" style={{ color: '#818cf8' }}>{stats.rwScore || '—'}</span>
                                    </div>
                                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                        <div className="h-full rounded-full" style={{ width: `${stats.rwScore ? ((stats.rwScore - 200) / 600) * 100 : 0}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Topic Accuracy */}
                    {stats.topicAccuracy.length > 0 && (
                        <div className="card-dark p-6">
                            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Topic Accuracy</h3>
                            <div className="flex flex-col gap-3">
                                {stats.topicAccuracy.map(t => (
                                    <AccuracyBar key={t.topic} topic={t.topic} accuracy={t.accuracy} />
                                ))}
                            </div>
                            <div className="mt-4 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-ghost)' }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                                Weak areas need more practice
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
