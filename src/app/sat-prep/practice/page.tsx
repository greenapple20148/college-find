'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import type { SATQuestion, SATSection, Difficulty, AnswerChoice } from '@/lib/sat-types'

// ─── Seed questions (used until the DB is populated) ─────────────────────────
const SEED_QUESTIONS: SATQuestion[] = [
    {
        id: 'q1', section: 'math', topic: 'Algebra', difficulty: 'easy',
        question_text: 'If 3x + 7 = 22, what is the value of x?',
        passage_text: null,
        option_a: '3', option_b: '5', option_c: '7', option_d: '15',
        correct_answer: 'B',
        explanation: 'Subtract 7 from both sides: 3x = 15. Divide both sides by 3: x = 5.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q2', section: 'math', topic: 'Linear Equations', difficulty: 'medium',
        question_text: 'A line passes through the points (2, 5) and (6, 13). What is the slope of the line?',
        passage_text: null,
        option_a: '1', option_b: '2', option_c: '3', option_d: '4',
        correct_answer: 'B',
        explanation: 'Slope = (y₂ - y₁)/(x₂ - x₁) = (13 - 5)/(6 - 2) = 8/4 = 2.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q3', section: 'math', topic: 'Quadratic Equations', difficulty: 'hard',
        question_text: 'If x² - 5x + 6 = 0, what is the sum of all possible values of 2x?',
        passage_text: null,
        option_a: '5', option_b: '6', option_c: '10', option_d: '12',
        correct_answer: 'C',
        explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3. Sum of 2x values: 2(2) + 2(3) = 4 + 6 = 10.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q4', section: 'reading', topic: 'Vocabulary in Context', difficulty: 'easy',
        question_text: 'In the sentence "The scientist\'s findings were corroborated by subsequent experiments," what does "corroborated" most nearly mean?',
        passage_text: null,
        option_a: 'Disproved', option_b: 'Confirmed', option_c: 'Questioned', option_d: 'Ignored',
        correct_answer: 'B',
        explanation: '"Corroborated" means confirmed or supported. The sentence indicates subsequent experiments supported the findings.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q5', section: 'reading', topic: 'Main Idea', difficulty: 'medium',
        question_text: 'Based on the passage, the primary purpose of the author is to:',
        passage_text: 'Recent studies have shown that regular physical exercise improves not only cardiovascular health but also cognitive function. Researchers at Harvard found that adults who exercised for 30 minutes daily showed improved memory recall and faster problem-solving abilities compared to sedentary peers.',
        option_a: 'Argue that exercise is dangerous', option_b: 'Describe the cognitive benefits of exercise',
        option_c: 'Compare different types of exercise', option_d: 'Explain why people avoid exercise',
        correct_answer: 'B',
        explanation: 'The passage focuses on how exercise improves cognitive function (memory and problem-solving), making B the main idea.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q6', section: 'writing', topic: 'Grammar & Punctuation', difficulty: 'easy',
        question_text: 'Which choice correctly completes the sentence? "The students _____ their homework before the deadline."',
        passage_text: null,
        option_a: 'submits', option_b: 'submitted', option_c: 'submitting', option_d: 'have submit',
        correct_answer: 'B',
        explanation: 'The past tense "submitted" is correct because "before the deadline" indicates a completed action.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q7', section: 'writing', topic: 'Transitions', difficulty: 'medium',
        question_text: 'Which transition word best connects these two sentences? "The project seemed impossible. _____, the team worked together and finished it on time."',
        passage_text: null,
        option_a: 'Therefore', option_b: 'Meanwhile', option_c: 'Nevertheless', option_d: 'Similarly',
        correct_answer: 'C',
        explanation: '"Nevertheless" shows contrast—the project seemed impossible, but the team succeeded anyway.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q8', section: 'math', topic: 'Percentages', difficulty: 'easy',
        question_text: 'A shirt originally costs $40. It is on sale for 25% off. What is the sale price?',
        passage_text: null,
        option_a: '$10', option_b: '$25', option_c: '$30', option_d: '$35',
        correct_answer: 'C',
        explanation: '25% of $40 = $10. Sale price = $40 - $10 = $30.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q9', section: 'math', topic: 'Statistics & Probability', difficulty: 'medium',
        question_text: 'The mean of five numbers is 12. If one of the numbers is removed, the mean of the remaining four is 10. What number was removed?',
        passage_text: null,
        option_a: '16', option_b: '18', option_c: '20', option_d: '22',
        correct_answer: 'C',
        explanation: 'Sum of 5 numbers = 5 × 12 = 60. Sum of 4 numbers = 4 × 10 = 40. Removed number = 60 - 40 = 20.',
        source_type: 'seed', active_status: true,
    },
    {
        id: 'q10', section: 'math', topic: 'Geometry', difficulty: 'hard',
        question_text: 'A circle has a radius of 5. What is the area of a sector with a central angle of 72°?',
        passage_text: null,
        option_a: '5π', option_b: '10π', option_c: '15π', option_d: '25π',
        correct_answer: 'A',
        explanation: 'Sector area = (θ/360) × πr² = (72/360) × π(25) = (1/5) × 25π = 5π.',
        source_type: 'seed', active_status: true,
    },
]

const sectionLabels: Record<string, string> = {
    all: 'All Sections',
    math: 'Math',
    reading: 'Reading',
    writing: 'Writing',
}

const difficultyLabels: Record<string, string> = {
    all: 'All Levels',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
}

const difficultyColors: Record<string, string> = {
    easy: '#22c55e',
    medium: '#eab308',
    hard: '#ef4444',
}

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
    const [section, setSection] = useState<SATSection | 'all'>('all')
    const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
    const [questions, setQuestions] = useState<SATQuestion[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [selected, setSelected] = useState<AnswerChoice | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState({ correct: 0, total: 0 })
    const [timer, setTimer] = useState(0)
    const [sessionStarted, setSessionStarted] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Filter and load questions
    const loadQuestions = useCallback(() => {
        let filtered = SEED_QUESTIONS
        if (section !== 'all') filtered = filtered.filter(q => q.section === section)
        if (difficulty !== 'all') filtered = filtered.filter(q => q.difficulty === difficulty)
        setQuestions(filtered.sort(() => Math.random() - 0.5))
        setCurrentIdx(0)
        setSelected(null)
        setSubmitted(false)
        setScore({ correct: 0, total: 0 })
        setTimer(0)
        setSessionStarted(false)
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

    const handleStart = () => {
        setSessionStarted(true)
        setTimer(0)
    }

    const handleSelect = (choice: AnswerChoice) => {
        if (submitted) return
        if (!sessionStarted) setSessionStarted(true)
        setSelected(choice)
    }

    const handleSubmit = () => {
        if (!selected || !question) return
        setSubmitted(true)
        if (timerRef.current) clearInterval(timerRef.current)
        setScore(prev => ({
            correct: prev.correct + (selected === question.correct_answer ? 1 : 0),
            total: prev.total + 1,
        }))
    }

    const handleNext = () => {
        setSelected(null)
        setSubmitted(false)
        setTimer(0)
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
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: '#60a5fa' }}>
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
                            <div className="text-xl font-bold" style={{ color: '#60a5fa' }}>
                                {score.correct}/{score.total}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>
                                Score
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: score.total > 0 ? (score.correct / score.total >= 0.7 ? '#22c55e' : '#eab308') : 'var(--text-ghost)' }}>
                                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                            </div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>
                                Accuracy
                            </div>
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
                                backgroundColor: section === s ? 'rgba(59,130,246,0.15)' : 'transparent',
                                color: section === s ? '#60a5fa' : 'var(--text-ghost)',
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
                                backgroundColor: difficulty === d ? 'rgba(59,130,246,0.15)' : 'transparent',
                                color: difficulty === d ? '#60a5fa' : 'var(--text-ghost)',
                                borderRight: d !== 'hard' ? '1px solid var(--border-primary)' : 'none',
                            }}
                        >
                            {difficultyLabels[d]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question Card */}
            {question ? (
                <div className="card-dark p-6 sm:p-8">
                    {/* Question header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
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
                                backgroundColor: 'rgba(59,130,246,0.1)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59,130,246,0.2)',
                            }}>
                                {question.section.charAt(0).toUpperCase() + question.section.slice(1)} — {question.topic}
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
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-muted)',
                                borderLeft: '3px solid rgba(59,130,246,0.4)',
                            }}
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

                            if (isCorrect) {
                                borderColor = '#22c55e'
                                bgColor = 'rgba(34,197,94,0.08)'
                                textColor = '#22c55e'
                            } else if (isWrong) {
                                borderColor = '#ef4444'
                                bgColor = 'rgba(239,68,68,0.08)'
                                textColor = '#ef4444'
                            } else if (isSelected) {
                                borderColor = '#3b82f6'
                                bgColor = 'rgba(59,130,246,0.08)'
                                textColor = '#60a5fa'
                            }

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
                                            backgroundColor: isSelected || isCorrect || isWrong
                                                ? `${borderColor}20`
                                                : 'var(--bg-tertiary)',
                                            color: isSelected || isCorrect || isWrong ? borderColor : 'var(--text-ghost)',
                                        }}
                                    >
                                        {opt.key}
                                    </span>
                                    <span className="text-sm" style={{ color: textColor }}>
                                        {opt.text}
                                    </span>
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
                            className="rounded-xl p-5 mb-6 text-sm leading-relaxed animate-in"
                            style={{
                                backgroundColor: selected === question.correct_answer
                                    ? 'rgba(34,197,94,0.06)'
                                    : 'rgba(239,68,68,0.06)',
                                border: `1px solid ${selected === question.correct_answer ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                            }}
                        >
                            <p className="font-semibold mb-2" style={{ color: selected === question.correct_answer ? '#22c55e' : '#ef4444' }}>
                                {selected === question.correct_answer ? '✓ Correct!' : '✗ Incorrect'}
                            </p>
                            <p style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
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
                                    background: selected ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'var(--bg-tertiary)',
                                    color: selected ? '#fff' : 'var(--text-ghost)',
                                }}
                            >
                                Submit Answer
                            </button>
                        ) : currentIdx < questions.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: '#fff',
                                }}
                            >
                                Next Question →
                            </button>
                        ) : (
                            <div className="flex-1 text-center py-3 text-sm" style={{ color: 'var(--text-faint)' }}>
                                🎉 Session complete! You scored {score.correct}/{score.total}
                                <button
                                    onClick={loadQuestions}
                                    className="block mx-auto mt-3 text-sm font-medium"
                                    style={{ color: '#60a5fa' }}
                                >
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
            <div className="mt-8 card-dark p-6 sm:p-8 text-center" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-5 h-5" style={{ color: '#a78bfa' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>
                        Upgrade to Premium
                    </span>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    Get unlimited questions, AI explanations, mock tests, and a personalized study plan.
                </p>
                <Link
                    href="/sat-prep"
                    className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: '#fff',
                    }}
                >
                    See Plans & Pricing →
                </Link>
            </div>
        </div>
    )
}
