'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock data for the dashboard — will be replaced with real data from Supabase
const mockStats = {
    estimatedScore: 1280,
    mathScore: 650,
    rwScore: 630,
    questionsCompleted: 247,
    accuracy: 72,
    streak: 5,
    percentile: 83,
}

const mockScoreTrend = [
    { date: 'Week 1', score: 1100 },
    { date: 'Week 2', score: 1140 },
    { date: 'Week 3', score: 1180 },
    { date: 'Week 4', score: 1220 },
    { date: 'Week 5', score: 1250 },
    { date: 'Week 6', score: 1280 },
]

const mockTopicAccuracy = [
    { topic: 'Algebra', accuracy: 85, section: 'math' },
    { topic: 'Geometry', accuracy: 62, section: 'math' },
    { topic: 'Statistics', accuracy: 78, section: 'math' },
    { topic: 'Grammar', accuracy: 80, section: 'writing' },
    { topic: 'Vocabulary', accuracy: 70, section: 'reading' },
    { topic: 'Reading Comp.', accuracy: 65, section: 'reading' },
    { topic: 'Transitions', accuracy: 88, section: 'writing' },
    { topic: 'Quadratics', accuracy: 55, section: 'math' },
]

const mockUpcomingTasks = [
    { task: '20 Algebra Questions', section: 'math', completed: false },
    { task: 'Reading Passage Drill', section: 'reading', completed: false },
    { task: 'Grammar Review', section: 'writing', completed: true },
    { task: 'Mini Mock Test', section: 'mixed', completed: false },
]

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
    return (
        <div className="card-dark p-5">
            <p className="text-xs font-medium tracking-wider uppercase mb-1" style={{ color: 'var(--text-ghost)' }}>{label}</p>
            <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
            {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</p>}
        </div>
    )
}

function AccuracyBar({ topic, accuracy, section }: { topic: string; accuracy: number; section: string }) {
    const color = accuracy >= 80 ? '#22c55e' : accuracy >= 65 ? '#eab308' : '#ef4444'
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs w-28 truncate" style={{ color: 'var(--text-secondary)' }}>{topic}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${accuracy}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs font-mono w-10 text-right" style={{ color }}>{accuracy}%</span>
        </div>
    )
}

export default function SATDashboard() {
    const [tab, setTab] = useState<'overview' | 'topics' | 'history'>('overview')

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: '#60a5fa' }}>
                            Dashboard
                        </span>
                    </div>
                    <h1 className="heading-serif text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                        Your SAT Progress
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/sat-prep/practice"
                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#fff',
                        }}
                    >
                        Practice Now →
                    </Link>
                    <Link
                        href="/sat-prep/planner"
                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                        style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                    >
                        Study Plan
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatCard label="EST. Score" value={String(mockStats.estimatedScore)} sub={`${mockStats.percentile}th percentile`} color="#60a5fa" />
                <StatCard label="Questions" value={String(mockStats.questionsCompleted)} sub="completed" color="var(--text-primary)" />
                <StatCard label="Accuracy" value={`${mockStats.accuracy}%`} sub="overall" color={mockStats.accuracy >= 70 ? '#22c55e' : '#eab308'} />
                <StatCard label="Streak" value={`${mockStats.streak} days`} sub="🔥 keep going!" color="#f97316" />
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Score Trend */}
                <div className="card-dark p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Score Trend</h3>
                    <div className="flex items-end gap-1 h-40">
                        {mockScoreTrend.map((d, i) => {
                            const min = Math.min(...mockScoreTrend.map(s => s.score))
                            const max = Math.max(...mockScoreTrend.map(s => s.score))
                            const range = max - min || 1
                            const height = ((d.score - min) / range) * 80 + 20

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-mono" style={{ color: '#60a5fa' }}>{d.score}</span>
                                    <div
                                        className="w-full rounded-t-md transition-all duration-500"
                                        style={{
                                            height: `${height}%`,
                                            background: 'linear-gradient(180deg, #3b82f6, #2563eb)',
                                            opacity: 0.8,
                                        }}
                                    />
                                    <span className="text-[9px]" style={{ color: 'var(--text-ghost)' }}>{d.date.replace('Week ', 'W')}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Section Breakdown */}
                <div className="card-dark p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Section Scores</h3>
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Math</span>
                                <span className="text-lg font-bold font-mono" style={{ color: '#60a5fa' }}>{mockStats.mathScore}</span>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${((mockStats.mathScore - 200) / 600) * 100}%`,
                                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reading & Writing</span>
                                <span className="text-lg font-bold font-mono" style={{ color: '#818cf8' }}>{mockStats.rwScore}</span>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${((mockStats.rwScore - 200) / 600) * 100}%`,
                                        background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Topic Accuracy & Study Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Topic Accuracy */}
                <div className="card-dark p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Topic Accuracy</h3>
                    <div className="flex flex-col gap-3">
                        {mockTopicAccuracy
                            .sort((a, b) => a.accuracy - b.accuracy)
                            .map(t => (
                                <AccuracyBar key={t.topic} {...t} />
                            ))}
                    </div>
                    <div className="mt-4 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-ghost)' }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                        Weak areas need more practice
                    </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="card-dark p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Today&apos;s Tasks</h3>
                    <div className="flex flex-col gap-2">
                        {mockUpcomingTasks.map((t, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                                style={{
                                    borderColor: t.completed ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)',
                                    backgroundColor: t.completed ? 'rgba(34,197,94,0.04)' : 'transparent',
                                }}
                            >
                                <div
                                    className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0"
                                    style={{
                                        borderColor: t.completed ? '#22c55e' : 'var(--border-primary)',
                                        backgroundColor: t.completed ? 'rgba(34,197,94,0.2)' : 'transparent',
                                    }}
                                >
                                    {t.completed && (
                                        <svg className="w-3 h-3" style={{ color: '#22c55e' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <span
                                    className="text-sm flex-1"
                                    style={{
                                        color: t.completed ? 'var(--text-ghost)' : 'var(--text-secondary)',
                                        textDecoration: t.completed ? 'line-through' : 'none',
                                    }}
                                >
                                    {t.task}
                                </span>
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        backgroundColor: t.section === 'math' ? 'rgba(59,130,246,0.1)' : t.section === 'reading' ? 'rgba(139,92,246,0.1)' : 'rgba(201,146,60,0.1)',
                                        color: t.section === 'math' ? '#60a5fa' : t.section === 'reading' ? '#a78bfa' : 'var(--gold-primary)',
                                    }}
                                >
                                    {t.section}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/sat-prep/planner"
                        className="block mt-4 text-center text-xs font-medium py-2 rounded-lg transition-colors"
                        style={{ color: '#60a5fa' }}
                    >
                        View Full Study Plan →
                    </Link>
                </div>
            </div>
        </div>
    )
}
