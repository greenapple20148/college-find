'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { calculateSATScore, getScoreColor } from '@/lib/sat-scoring'
import type { SATScoreResult } from '@/lib/sat-types'

function ScoreGauge({ label, low, high, max = 800 }: { label: string; low: number; high: number; max?: number }) {
    const mid = Math.round((low + high) / 2)
    const pct = ((mid - 200) / (max - 200)) * 100
    const color = getScoreColor(label === 'Total' ? mid : mid * 2)

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-sm font-mono" style={{ color: 'var(--text-faint)' }}>
                    {low}–{high}
                </span>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
                />
            </div>
        </div>
    )
}

export default function SATCalculatorPage() {
    const [mathCorrect, setMathCorrect] = useState('')
    const [rwCorrect, setRwCorrect] = useState('')
    const [result, setResult] = useState<SATScoreResult | null>(null)
    const [animateIn, setAnimateIn] = useState(false)

    const handleCalculate = useCallback(() => {
        const math = parseInt(mathCorrect) || 0
        const rw = parseInt(rwCorrect) || 0
        const clampedMath = Math.max(0, Math.min(44, math))
        const clampedRw = Math.max(0, Math.min(54, rw))

        const score = calculateSATScore(clampedMath, clampedRw)
        setAnimateIn(false)
        setTimeout(() => {
            setResult(score)
            setAnimateIn(true)
        }, 50)
    }, [mathCorrect, rwCorrect])

    const handleReset = () => {
        setResult(null)
        setMathCorrect('')
        setRwCorrect('')
        setAnimateIn(false)
    }

    const totalColor = result ? getScoreColor(result.totalMid) : '#C9923C'

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                    <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>
                        Free Tool
                    </span>
                </div>
                <h1 className="heading-serif text-3xl sm:text-4xl lg:text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
                    SAT Score{' '}
                    <span className="heading-serif-italic text-gradient-gold">Calculator</span>
                </h1>
                <p className="text-lg max-w-2xl mx-auto font-light" style={{ color: 'var(--text-muted)' }}>
                    Enter the number of questions you answered correctly to estimate your Digital SAT score
                    and see where you stand nationally.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Card */}
                <div className="card-dark p-6 sm:p-8">
                    <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                        Enter Your Raw Scores
                    </h2>

                    <div className="flex flex-col gap-6">
                        {/* Math Section */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16v16H4z" /><path d="M12 4v16M4 12h16" />
                                    </svg>
                                    Math — Correct Answers
                                </span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    max={44}
                                    value={mathCorrect}
                                    onChange={e => setMathCorrect(e.target.value)}
                                    placeholder="0"
                                    className="block w-full rounded-xl border px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--input-border)',
                                        color: 'var(--text-primary)',
                                        // @ts-ignore
                                        '--tw-ring-color': 'var(--input-focus-ring)',
                                    }}
                                />
                                <span className="text-sm whitespace-nowrap font-mono" style={{ color: 'var(--text-ghost)' }}>/ 44</span>
                            </div>
                            <p className="text-xs mt-1.5" style={{ color: 'var(--text-ghost)' }}>
                                Digital SAT: 2 modules × 22 questions
                            </p>
                        </div>

                        {/* Reading & Writing Section */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                    </svg>
                                    Reading & Writing — Correct Answers
                                </span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    max={54}
                                    value={rwCorrect}
                                    onChange={e => setRwCorrect(e.target.value)}
                                    placeholder="0"
                                    className="block w-full rounded-xl border px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--input-border)',
                                        color: 'var(--text-primary)',
                                        // @ts-ignore
                                        '--tw-ring-color': 'var(--input-focus-ring)',
                                    }}
                                />
                                <span className="text-sm whitespace-nowrap font-mono" style={{ color: 'var(--text-ghost)' }}>/ 54</span>
                            </div>
                            <p className="text-xs mt-1.5" style={{ color: 'var(--text-ghost)' }}>
                                Digital SAT: 2 modules × 27 questions
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleCalculate}
                                className="btn-gold flex-1 text-base"
                            >
                                Calculate Score
                            </button>
                            {result && (
                                <button
                                    onClick={handleReset}
                                    className="btn-outline text-base px-6"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                <div
                    className={`card-dark p-6 sm:p-8 transition-all duration-500 ${result && animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    style={{ minHeight: 340 }}
                >
                    {result ? (
                        <div className="flex flex-col h-full">
                            {/* Total Score */}
                            <div className="text-center mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <p className="text-xs font-medium tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-ghost)' }}>
                                    Estimated Total Score
                                </p>
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                    <span className="text-5xl sm:text-6xl font-bold font-mono" style={{ color: totalColor }}>
                                        {result.totalLow}
                                    </span>
                                    <span className="text-2xl font-light" style={{ color: 'var(--text-ghost)' }}>–</span>
                                    <span className="text-5xl sm:text-6xl font-bold font-mono" style={{ color: totalColor }}>
                                        {result.totalHigh}
                                    </span>
                                </div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>
                                    {result.percentileRange}
                                </p>
                            </div>

                            {/* Section Scores */}
                            <div className="flex flex-col gap-4 mb-6">
                                <ScoreGauge label="Math" low={result.mathScaledLow} high={result.mathScaledHigh} />
                                <ScoreGauge label="Reading & Writing" low={result.rwScaledLow} high={result.rwScaledHigh} />
                            </div>

                            {/* Message */}
                            <div
                                className="mt-auto rounded-xl p-4 text-sm"
                                style={{
                                    backgroundColor: `${totalColor}10`,
                                    border: `1px solid ${totalColor}25`,
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                <p className="flex items-start gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: totalColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    {result.message}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: 'rgba(201,146,60,0.1)', border: '1px solid rgba(201,146,60,0.2)' }}
                            >
                                <svg className="w-8 h-8" style={{ color: 'var(--gold-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M4 4h16v16H4z" /><path d="M12 4v16M4 12h16" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Ready to check your score?
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                                Enter your answers above and click Calculate
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="mt-12 card-dark p-8 text-center">
                <h3 className="heading-serif text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                    Ready to <span className="heading-serif-italic text-gradient-gold">improve your score</span>?
                </h3>
                <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                    Practice with real-format SAT questions, get AI-powered explanations, and track your progress with our personalized study tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/sat-prep/practice" className="btn-gold text-base">
                        Start Practicing Free
                    </Link>
                    <Link href="/sat-prep" className="btn-outline text-base">
                        Explore SAT Ace
                    </Link>
                </div>
            </div>

            {/* FAQ Section for SEO */}
            <div className="mt-16">
                <h2 className="heading-serif text-2xl mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
                    Frequently Asked <span className="heading-serif-italic text-gradient-gold">Questions</span>
                </h2>
                <div className="grid gap-4">
                    {[
                        {
                            q: 'How is the Digital SAT scored?',
                            a: 'The Digital SAT has two sections: Reading & Writing (54 questions) and Math (44 questions). Each section is scored 200–800, for a total score of 400–1600.',
                        },
                        {
                            q: 'What is a good SAT score?',
                            a: 'The average SAT score is around 1050. A score above 1200 is considered above average, 1350+ is excellent, and 1500+ is outstanding (top 3%).',
                        },
                        {
                            q: 'How accurate is this calculator?',
                            a: 'This calculator uses approximate conversion tables based on College Board practice tests. Actual scores may vary by ±20 points depending on the specific test curve.',
                        },
                        {
                            q: 'How many questions can I get wrong and still get a 1500?',
                            a: 'To score around 1500, you can typically miss about 3–5 questions in Math and 3–5 in Reading & Writing, depending on the curve.',
                        },
                    ].map((faq, i) => (
                        <details key={i} className="card-dark p-5 group cursor-pointer">
                            <summary className="flex items-center justify-between text-sm font-medium list-none" style={{ color: 'var(--text-primary)' }}>
                                {faq.q}
                                <svg
                                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                                    style={{ color: 'var(--text-ghost)' }}
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </summary>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{faq.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    )
}
