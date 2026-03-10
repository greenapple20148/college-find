'use client'

import { useState } from 'react'
import Link from 'next/link'

const mockTests = [
    {
        id: 'mt1',
        title: 'Digital SAT Practice Test 1',
        description: 'Full-length practice exam following the official Digital SAT format.',
        totalQuestions: 98,
        mathTime: 64,
        rwTime: 64,
        difficulty: 'Mixed',
        attempts: 0,
        bestScore: null as number | null,
    },
    {
        id: 'mt2',
        title: 'Digital SAT Practice Test 2',
        description: 'Second full-length practice exam with different question distribution.',
        totalQuestions: 98,
        mathTime: 64,
        rwTime: 64,
        difficulty: 'Mixed',
        attempts: 1,
        bestScore: 1240,
    },
    {
        id: 'mt3',
        title: 'Math Focus Mini Test',
        description: 'Concentrated math section practice — 44 questions in 64 minutes.',
        totalQuestions: 44,
        mathTime: 64,
        rwTime: 0,
        difficulty: 'Medium-Hard',
        attempts: 0,
        bestScore: null,
    },
    {
        id: 'mt4',
        title: 'Reading & Writing Focus Mini Test',
        description: 'Concentrated R&W section practice — 54 questions in 64 minutes.',
        totalQuestions: 54,
        mathTime: 0,
        rwTime: 64,
        difficulty: 'Medium',
        attempts: 2,
        bestScore: 680,
    },
]

export default function MockTestsPage() {
    const [showUpgrade, setShowUpgrade] = useState(false)

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                    <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: '#60a5fa' }}>
                        Premium Feature
                    </span>
                </div>
                <h1 className="heading-serif text-2xl sm:text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                    SAT Mock Tests
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Take full-length, timed Digital SAT practice exams and get detailed score breakdowns.
                </p>
            </div>

            {/* Test overview stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="card-dark p-4 text-center">
                    <p className="text-2xl font-bold font-mono" style={{ color: '#60a5fa' }}>4</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>Available Tests</p>
                </div>
                <div className="card-dark p-4 text-center">
                    <p className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>3</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>Attempts Made</p>
                </div>
                <div className="card-dark p-4 text-center">
                    <p className="text-2xl font-bold font-mono" style={{ color: '#22c55e' }}>1240</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>Best Score</p>
                </div>
            </div>

            {/* Tests List */}
            <div className="flex flex-col gap-4">
                {mockTests.map(test => (
                    <div key={test.id} className="card-dark p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{test.title}</h3>
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                        style={{
                                            backgroundColor: 'rgba(59,130,246,0.1)',
                                            color: '#60a5fa',
                                            border: '1px solid rgba(59,130,246,0.2)',
                                        }}
                                    >
                                        {test.difficulty}
                                    </span>
                                </div>
                                <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>{test.description}</p>

                                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-ghost)' }}>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {test.mathTime + test.rwTime} min
                                    </span>
                                    <span>{test.totalQuestions} questions</span>
                                    {test.attempts > 0 && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                            </svg>
                                            {test.attempts} attempt{test.attempts !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {test.bestScore && (
                                        <span style={{ color: '#22c55e' }}>
                                            Best: {test.bestScore}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowUpgrade(true)}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: '#fff',
                                    boxShadow: '0 2px 10px rgba(59,130,246,0.2)',
                                }}
                            >
                                {test.attempts > 0 ? 'Retake' : 'Start Test'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upgrade Modal */}
            {showUpgrade && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgrade(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-md rounded-2xl border p-8 text-center"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(59,130,246,0.3)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                            <svg className="w-8 h-8" style={{ color: '#60a5fa' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h3 className="heading-serif text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                            Upgrade to Premium Plus
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            Mock tests are available with the Premium Plus plan ($29/month). Get unlimited mock tests, AI explanations, and advanced analytics.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUpgrade(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                            >
                                Not Now
                            </button>
                            <Link
                                href="/sat-prep"
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}
                            >
                                See Plans
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
