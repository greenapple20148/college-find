'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ScoreBreakdown {
    hook: number; storytelling: number; authenticity: number
    specificity: number; reflection: number; writing: number; structure: number
}

interface Improvement { area: string; issue: string; suggestion: string }
interface LineEdit { original: string; revised: string; reason: string }
interface Feedback {
    overallScore: number; scores: ScoreBreakdown; summary: string
    strengths: string[]; improvements: Improvement[]; lineEdits: LineEdit[]
    admissionsInsight: string; nextSteps: string[]
}

export default function EssayFeedbackPage() {
    const [essayText, setEssayText] = useState('')
    const [essayType, setEssayType] = useState('personal_statement')
    const [essayPrompt, setEssayPrompt] = useState('')
    const [wordLimit, setWordLimit] = useState('650')
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState<Feedback | null>(null)
    const [error, setError] = useState('')
    const [upgradeRequired, setUpgradeRequired] = useState(false)

    const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/essay-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ essayText, essayType, prompt: essayPrompt, wordLimit: Number(wordLimit) }),
            })
            const data = await res.json()
            if (data.upgrade_required) { setUpgradeRequired(true); setError(data.message); return }
            if (data.error) { setError(data.error); return }
            setFeedback(data.feedback)
        } catch {
            setError('Failed to get feedback')
        } finally {
            setLoading(false)
        }
    }

    const scoreColor = (score: number) => score >= 8 ? '#22c55e' : score >= 6 ? 'var(--gold-primary)' : score >= 4 ? '#eab308' : '#ef4444'

    if (upgradeRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))' }}>
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    </div>
                    <h1 className="heading-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Premium Feature</h1>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
                    <Link href="/pricing" className="btn-gold px-8 py-3 inline-block">Upgrade to Premium</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen px-4 py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>Premium</span>
                    </div>
                    <h1 className="heading-serif text-3xl sm:text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
                        Essay <span className="heading-serif-italic text-gradient-gold">Feedback</span>
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Get detailed AI feedback on your college essay draft
                    </p>
                </div>

                {!feedback ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 card-dark p-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Your Essay</label>
                                <span className="text-xs font-mono" style={{
                                    color: wordCount > Number(wordLimit) ? '#ef4444' : 'var(--text-faint)'
                                }}>{wordCount}/{wordLimit} words</span>
                            </div>
                            <textarea
                                rows={18}
                                value={essayText}
                                onChange={e => setEssayText(e.target.value)}
                                placeholder="Paste your essay here..."
                                className="w-full px-4 py-3 rounded-lg text-sm resize-none leading-relaxed"
                                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="card-dark p-5 space-y-4">
                                <div>
                                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Essay Type</label>
                                    <select value={essayType} onChange={e => setEssayType(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                                        <option value="personal_statement">Common App Personal Statement</option>
                                        <option value="supplemental">Supplemental Essay</option>
                                        <option value="why_school">Why This School</option>
                                        <option value="activity">Activity Description</option>
                                        <option value="additional_info">Additional Information</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Essay Prompt</label>
                                    <textarea rows={3} value={essayPrompt} onChange={e => setEssayPrompt(e.target.value)}
                                        placeholder="Paste the essay prompt (optional)..."
                                        className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Word Limit</label>
                                    <input type="number" value={wordLimit} onChange={e => setWordLimit(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                                </div>

                                {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

                                <button onClick={handleSubmit} disabled={loading || wordCount < 10}
                                    className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50">
                                    {loading ? 'Analyzing...' : 'Get Feedback →'}
                                </button>
                            </div>
                            <div className="card-dark p-4">
                                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                                    💡 For best results, paste a complete draft. The AI evaluates hook strength, storytelling, authenticity, and provides specific line-level suggestions.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="card-dark p-8 text-center">
                            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>Overall Score</p>
                            <p className="text-6xl font-bold font-mono" style={{ color: scoreColor(feedback.overallScore) }}>
                                {feedback.overallScore}<span className="text-2xl" style={{ color: 'var(--text-ghost)' }}>/10</span>
                            </p>
                            <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>{feedback.summary}</p>
                        </div>

                        {/* Score Breakdown */}
                        <div className="card-dark p-6">
                            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Score Breakdown</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(feedback.scores).map(([key, val]) => (
                                    <div key={key} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                        <p className="text-2xl font-bold font-mono" style={{ color: scoreColor(val) }}>{val}</p>
                                        <p className="text-[10px] uppercase tracking-wide mt-1 capitalize" style={{ color: 'var(--text-faint)' }}>{key}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strengths */}
                        {feedback.strengths?.length > 0 && (
                            <div className="card-dark p-6">
                                <h3 className="font-semibold mb-3" style={{ color: '#22c55e' }}>✓ Strengths</h3>
                                <ul className="space-y-2">
                                    {feedback.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {feedback.improvements?.length > 0 && (
                            <div className="card-dark p-6">
                                <h3 className="font-semibold mb-3" style={{ color: 'var(--gold-primary)' }}>⚡ Improvements</h3>
                                <div className="space-y-4">
                                    {feedback.improvements.map((imp, i) => (
                                        <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                                            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--gold-primary)' }}>{imp.area}</p>
                                            <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{imp.issue}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>→ {imp.suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Line Edits */}
                        {feedback.lineEdits?.length > 0 && (
                            <div className="card-dark p-6">
                                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>📝 Line-Level Edits</h3>
                                <div className="space-y-4">
                                    {feedback.lineEdits.map((edit, i) => (
                                        <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                                            <p className="text-sm line-through mb-1" style={{ color: '#ef4444', opacity: 0.7 }}>&ldquo;{edit.original}&rdquo;</p>
                                            <p className="text-sm mb-1" style={{ color: '#22c55e' }}>&ldquo;{edit.revised}&rdquo;</p>
                                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{edit.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Admissions Insight */}
                        {feedback.admissionsInsight && (
                            <div className="card-dark p-6" style={{ borderColor: 'rgba(201,146,60,0.3)' }}>
                                <h3 className="font-semibold mb-2" style={{ color: 'var(--gold-primary)' }}>🎓 Admissions Officer Perspective</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{feedback.admissionsInsight}</p>
                            </div>
                        )}

                        {/* Next Steps */}
                        {feedback.nextSteps?.length > 0 && (
                            <div className="card-dark p-6">
                                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Next Steps</h3>
                                <ol className="space-y-2">
                                    {feedback.nextSteps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                                                style={{ backgroundColor: 'var(--gold-primary)', color: '#fff' }}>{i + 1}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setFeedback(null) }} className="btn-outline px-6 py-2.5 text-sm">
                                ← Revise & Resubmit
                            </button>
                            <button onClick={() => { setFeedback(null); setEssayText(''); setEssayPrompt('') }} className="btn-outline px-6 py-2.5 text-sm">
                                New Essay
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
