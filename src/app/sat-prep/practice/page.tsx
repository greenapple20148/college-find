'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import type { SATQuestion, SATSection, Difficulty, AnswerChoice } from '@/lib/sat-types'

// ─── Fallback seed questions (used when DB is empty) ──────────────────────────
const SEED_QUESTIONS: SATQuestion[] = [
    {
        id: 'q1', section: 'math', topic: 'Algebra', subtopic: 'Solving Linear Equations', difficulty: 'easy', status: 'published',
        question_text: 'If 3x + 7 = 22, what is the value of x?',
        passage_text: null, option_a: '3', option_b: '5', option_c: '7', option_d: '15',
        correct_answer: 'B', explanation: 'Subtract 7 from both sides: 3x = 15. Divide both sides by 3: x = 5.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q2', section: 'math', topic: 'Linear Equations', subtopic: 'Slope Calculation', difficulty: 'medium', status: 'published',
        question_text: 'A line passes through (2, 5) and (6, 13). What is the slope?',
        passage_text: null, option_a: '1', option_b: '2', option_c: '3', option_d: '4',
        correct_answer: 'B', explanation: 'Slope = (13 - 5)/(6 - 2) = 8/4 = 2.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q3', section: 'math', topic: 'Quadratic Equations', subtopic: 'Factoring', difficulty: 'hard', status: 'published',
        question_text: 'If x² - 5x + 6 = 0, what is the sum of all possible values of 2x?',
        passage_text: null, option_a: '5', option_b: '6', option_c: '10', option_d: '12',
        correct_answer: 'C', explanation: 'Factor: (x-2)(x-3) = 0 → x = 2, 3. Sum of 2x: 4 + 6 = 10.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q4', section: 'reading', topic: 'Vocabulary in Context', subtopic: 'Academic Vocabulary', difficulty: 'easy', status: 'published',
        question_text: 'In "The scientist\'s findings were corroborated by subsequent experiments," "corroborated" means:',
        passage_text: null, option_a: 'Disproved', option_b: 'Confirmed', option_c: 'Questioned', option_d: 'Ignored',
        correct_answer: 'B', explanation: '"Corroborated" means confirmed or supported.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q5', section: 'writing', topic: 'Transitions', subtopic: 'Contrast Transitions', difficulty: 'medium', status: 'published',
        question_text: 'Which transition fits? "The project seemed impossible. _____, the team finished on time."',
        passage_text: null, option_a: 'Therefore', option_b: 'Meanwhile', option_c: 'Nevertheless', option_d: 'Similarly',
        correct_answer: 'C', explanation: '"Nevertheless" shows contrast.',
        source_type: 'seed', active_status: true,
    },
]

const sectionLabels: Record<string, string> = { all: 'All Sections', math: 'Math', reading: 'Reading', writing: 'Writing' }
const difficultyLabels: Record<string, string> = { all: 'All Levels', easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const difficultyColors: Record<string, string> = { easy: '#22c55e', medium: '#eab308', hard: '#ef4444' }

function Timer({ seconds }: { seconds: number }) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return (
        <span className="font-mono text-sm" style={{ color: seconds > 60 ? 'var(--text-ghost)' : '#ef4444' }}>
            {m}:{s.toString().padStart(2, '0')}
        </span>
    )
}

export default function PracticePage() {
    const { user } = useAuth()
    const [section, setSection] = useState<SATSection | 'all'>('all')
    const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
    const [questions, setQuestions] = useState<SATQuestion[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [selected, setSelected] = useState<AnswerChoice | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState({ correct: 0, total: 0 })
    const [timer, setTimer] = useState(0)
    const [sessionStarted, setSessionStarted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [aiExplanation, setAiExplanation] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // ─── Load questions from Supabase ──────────────────────────
    const loadQuestions = useCallback(async () => {
        setLoading(true)
        setCurrentIdx(0)
        setSelected(null)
        setSubmitted(false)
        setScore({ correct: 0, total: 0 })
        setTimer(0)
        setSessionStarted(false)
        setAiExplanation(null)

        try {
            const params = new URLSearchParams({ limit: '20' })
            if (section !== 'all') params.set('section', section)
            if (difficulty !== 'all') params.set('difficulty', difficulty)

            const res = await fetch(`/api/sat/questions?${params.toString()}`)
            const json = await res.json()

            if (json.data && json.data.length > 0) {
                // Shuffle the questions client-side
                const shuffled = [...json.data].sort(() => Math.random() - 0.5)
                setQuestions(shuffled)
            } else {
                // Fall back to seed questions if DB is empty
                let filtered: SATQuestion[] = SEED_QUESTIONS
                if (section !== 'all') filtered = filtered.filter(q => q.section === section)
                if (difficulty !== 'all') filtered = filtered.filter(q => q.difficulty === difficulty)
                setQuestions(filtered.sort(() => Math.random() - 0.5))
            }
        } catch {
            // Network error → use seed questions
            let filtered: SATQuestion[] = SEED_QUESTIONS
            if (section !== 'all') filtered = filtered.filter(q => q.section === section)
            if (difficulty !== 'all') filtered = filtered.filter(q => q.difficulty === difficulty)
            setQuestions(filtered.sort(() => Math.random() - 0.5))
        }

        setLoading(false)
    }, [section, difficulty])

    useEffect(() => { loadQuestions() }, [loadQuestions])

    // Timer
    useEffect(() => {
        if (sessionStarted && !submitted) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [sessionStarted, submitted, currentIdx])

    const question = questions[currentIdx]

    const handleSelect = (choice: AnswerChoice) => {
        if (submitted) return
        if (!sessionStarted) setSessionStarted(true)
        setSelected(choice)
    }

    // ─── Submit answer → save attempt to Supabase ─────────────
    const handleSubmit = async () => {
        if (!selected || !question) return
        setSubmitted(true)
        if (timerRef.current) clearInterval(timerRef.current)

        const isCorrect = selected === question.correct_answer
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
        }))

        // Save attempt to Supabase (fire-and-forget)
        if (user) {
            fetch('/api/sat/attempt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    question_id: question.id,
                    selected_answer: selected,
                    is_correct: isCorrect,
                    time_spent: timer,
                    section: question.section,
                    topic: question.topic,
                    difficulty: question.difficulty,
                }),
            }).catch(() => { }) // silent fail
        }
    }

    // ─── Request AI explanation ────────────────────────────────
    const requestAiExplanation = async () => {
        if (!question || aiLoading) return
        setAiLoading(true)

        try {
            const res = await fetch('/api/sat/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_text: question.question_text,
                    section: question.section,
                    passage_text: question.passage_text,
                    options: {
                        A: question.option_a,
                        B: question.option_b,
                        C: question.option_c,
                        D: question.option_d,
                    },
                    correct_answer: question.correct_answer,
                    selected_answer: selected,
                }),
            })
            const json = await res.json()
            setAiExplanation(json.explanation || 'Unable to generate explanation.')
        } catch {
            setAiExplanation('Unable to reach AI service. Please try again later.')
        }

        setAiLoading(false)
    }

    const handleNext = () => {
        setSelected(null)
        setSubmitted(false)
        setTimer(0)
        setAiExplanation(null)
        setCurrentIdx(prev => prev + 1)
    }

    const options: { key: AnswerChoice; text: string }[] = question
        ? [
            { key: 'A', text: question.option_a },
            { key: 'B', text: question.option_b },
            { key: 'C', text: question.option_c },
            { key: 'D', text: question.option_d },
        ]
        : []

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>
                            Practice
                        </span>
                    </div>
                    <h1 className="heading-serif text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                        SAT Practice Questions
                    </h1>
                </div>
                {score.total > 0 && (
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: 'var(--gold-primary)' }}>
                                {score.correct}/{score.total}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: score.correct / score.total >= 0.7 ? '#22c55e' : '#eab308' }}>
                                {Math.round((score.correct / score.total) * 100)}%
                            </div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>Accuracy</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
                    {(['all', 'math', 'reading', 'writing'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setSection(s)}
                            className="px-4 py-2 text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: section === s ? 'rgba(201,146,60,0.15)' : 'transparent',
                                color: section === s ? 'var(--gold-primary)' : 'var(--text-ghost)',
                                borderRight: s !== 'writing' ? '1px solid var(--border-primary)' : 'none',
                            }}
                        >
                            {sectionLabels[s]}
                        </button>
                    ))}
                </div>
                <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
                    {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className="px-4 py-2 text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: difficulty === d ? 'rgba(201,146,60,0.15)' : 'transparent',
                                color: difficulty === d ? 'var(--gold-primary)' : 'var(--text-ghost)',
                                borderRight: d !== 'hard' ? '1px solid var(--border-primary)' : 'none',
                            }}
                        >
                            {difficultyLabels[d]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="card-dark p-12 text-center">
                    <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--gold-primary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading questions...</p>
                </div>
            ) : question ? (
                <div className="card-dark p-6 sm:p-8">
                    {/* Question header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                style={{
                                    backgroundColor: `${difficultyColors[question.difficulty]}15`,
                                    color: difficultyColors[question.difficulty],
                                    border: `1px solid ${difficultyColors[question.difficulty]}30`,
                                }}
                            >
                                {question.difficulty}
                            </span>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                                backgroundColor: 'rgba(201,146,60,0.1)', color: 'var(--gold-primary)',
                                border: '1px solid rgba(201,146,60,0.2)',
                            }}>
                                {question.section.charAt(0).toUpperCase() + question.section.slice(1)} — {question.topic}{question.subtopic ? ` › ${question.subtopic}` : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Timer seconds={timer} />
                            <span className="text-xs font-mono" style={{ color: 'var(--text-ghost)' }}>
                                {currentIdx + 1}/{questions.length}
                            </span>
                        </div>
                    </div>

                    {/* Passage */}
                    {question.passage_text && (
                        <div
                            className="rounded-xl p-5 mb-6 text-sm leading-relaxed italic"
                            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', borderLeft: '3px solid rgba(201,146,60,0.4)' }}
                        >
                            {question.passage_text}
                        </div>
                    )}

                    {/* Question text */}
                    <p className="text-base font-medium mb-6 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {question.question_text}
                    </p>

                    {/* Options */}
                    <div className="grid gap-3 mb-6">
                        {options.map(opt => {
                            const isCorrect = submitted && opt.key === question.correct_answer
                            const isWrong = submitted && opt.key === selected && opt.key !== question.correct_answer
                            const isSelected = opt.key === selected && !submitted

                            let borderColor = 'var(--border-primary)'
                            let bgColor = 'transparent'
                            let textColor = 'var(--text-secondary)'

                            if (isCorrect) { borderColor = '#22c55e'; bgColor = 'rgba(34,197,94,0.08)'; textColor = '#22c55e' }
                            else if (isWrong) { borderColor = '#ef4444'; bgColor = 'rgba(239,68,68,0.08)'; textColor = '#ef4444' }
                            else if (isSelected) { borderColor = 'var(--gold-primary)'; bgColor = 'rgba(201,146,60,0.08)'; textColor = 'var(--gold-primary)' }

                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => handleSelect(opt.key)}
                                    disabled={submitted}
                                    className="flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200"
                                    style={{ borderColor, backgroundColor: bgColor }}
                                >
                                    <span
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{
                                            backgroundColor: isSelected || isCorrect || isWrong ? `${borderColor}20` : 'var(--bg-tertiary)',
                                            color: isSelected || isCorrect || isWrong ? borderColor : 'var(--text-ghost)',
                                        }}
                                    >
                                        {opt.key}
                                    </span>
                                    <span className="text-sm" style={{ color: textColor }}>{opt.text}</span>
                                    {isCorrect && (
                                        <svg className="w-5 h-5 ml-auto flex-shrink-0" style={{ color: '#22c55e' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                    {isWrong && (
                                        <svg className="w-5 h-5 ml-auto flex-shrink-0" style={{ color: '#ef4444' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Explanation */}
                    {submitted && (
                        <div
                            className="rounded-xl p-5 mb-4 text-sm leading-relaxed"
                            style={{
                                backgroundColor: selected === question.correct_answer ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                                border: `1px solid ${selected === question.correct_answer ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                            }}
                        >
                            <p className="font-semibold mb-2" style={{ color: selected === question.correct_answer ? '#22c55e' : '#ef4444' }}>
                                {selected === question.correct_answer ? '✓ Correct!' : '✗ Incorrect'}
                            </p>
                            <p style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
                        </div>
                    )}

                    {/* AI Explanation */}
                    {submitted && (
                        <div className="mb-6">
                            {aiExplanation ? (
                                <div
                                    className="rounded-xl p-5 text-sm leading-relaxed"
                                    style={{ backgroundColor: 'rgba(201,146,60,0.05)', border: '1px solid rgba(201,146,60,0.15)' }}
                                >
                                    <p className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--gold-primary)' }}>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z" />
                                            <path d="M10 21h4" />
                                        </svg>
                                        AI Explanation
                                    </p>
                                    <div style={{ color: 'var(--text-muted)' }} className="whitespace-pre-wrap">{aiExplanation}</div>
                                </div>
                            ) : (
                                <button
                                    onClick={requestAiExplanation}
                                    disabled={aiLoading}
                                    className="w-full py-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2"
                                    style={{
                                        borderColor: 'rgba(201,146,60,0.3)',
                                        color: 'var(--gold-primary)',
                                        backgroundColor: aiLoading ? 'rgba(201,146,60,0.05)' : 'transparent',
                                    }}
                                >
                                    {aiLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(201,146,60,0.2)', borderTopColor: 'var(--gold-primary)' }} />
                                            Generating AI explanation...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z" />
                                                <path d="M10 21h4" />
                                            </svg>
                                            Get AI Explanation
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {!submitted ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!selected}
                                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40"
                                style={{
                                    background: selected ? 'linear-gradient(135deg, var(--gold-primary), #B8860B)' : 'var(--bg-tertiary)',
                                    color: selected ? '#fff' : 'var(--text-ghost)',
                                }}
                            >
                                Submit Answer
                            </button>
                        ) : currentIdx < questions.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, var(--gold-primary), #B8860B)', color: '#fff' }}
                            >
                                Next Question →
                            </button>
                        ) : (
                            <div className="flex-1 text-center py-3 text-sm" style={{ color: 'var(--text-faint)' }}>
                                🎉 Session complete! You scored {score.correct}/{score.total}
                                <button onClick={loadQuestions} className="block mx-auto mt-3 text-sm font-medium" style={{ color: 'var(--gold-primary)' }}>
                                    Start New Session
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card-dark p-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                        No questions match your filters. Try adjusting the section or difficulty.
                    </p>
                </div>
            )}

            {/* Upgrade CTA */}
            <div className="mt-8 card-dark p-6 sm:p-8 text-center" style={{ borderColor: 'rgba(201,146,60,0.3)' }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-5 h-5" style={{ color: 'var(--gold-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: 'var(--gold-primary)' }}>Upgrade to Premium</span>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    Get unlimited questions, AI explanations, mock tests, and a personalized study plan.
                </p>
                <Link
                    href="/sat-prep"
                    className="btn-gold px-6 py-2.5 text-sm"
                >
                    See Plans & Pricing →
                </Link>
            </div>
        </div>
    )
}
