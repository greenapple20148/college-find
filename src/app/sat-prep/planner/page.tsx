'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SATSection } from '@/lib/sat-types'

interface PlanForm {
    currentScore: string
    targetScore: string
    examDate: string
    hoursPerWeek: string
    strongest: SATSection
    weakest: SATSection
}

const DEFAULT_FORM: PlanForm = {
    currentScore: '',
    targetScore: '',
    examDate: '',
    hoursPerWeek: '5',
    strongest: 'reading',
    weakest: 'math',
}

interface WeekPlan {
    week: number
    focus: string
    tasks: { task: string; section: SATSection | 'review'; done: boolean }[]
}

function generatePlan(form: PlanForm): WeekPlan[] {
    const current = parseInt(form.currentScore) || 1000
    const target = parseInt(form.targetScore) || 1400
    const gap = target - current
    const examDate = form.examDate ? new Date(form.examDate) : new Date(Date.now() + 8 * 7 * 24 * 3600 * 1000)
    const weeksUntil = Math.max(1, Math.ceil((examDate.getTime() - Date.now()) / (7 * 24 * 3600 * 1000)))
    const totalWeeks = Math.min(weeksUntil, 12)
    const hours = parseInt(form.hoursPerWeek) || 5
    const weak = form.weakest
    const strong = form.strongest

    const plans: WeekPlan[] = []

    for (let w = 1; w <= totalWeeks; w++) {
        const phase = w <= Math.ceil(totalWeeks / 3) ? 'foundation' : w <= Math.ceil((totalWeeks * 2) / 3) ? 'practice' : 'testing'
        let focus: string
        const tasks: WeekPlan['tasks'] = []

        if (phase === 'foundation') {
            focus = `Build foundations in ${weak}`
            tasks.push(
                { task: `${20 + w * 5} ${weak} questions (focus: weak topics)`, section: weak, done: false },
                { task: `15 ${strong} questions (maintain strength)`, section: strong, done: false },
                { task: `Review all mistakes for 30 min`, section: 'review', done: false },
                { task: `1 Reading passage drill`, section: 'reading', done: false },
            )
            if (hours >= 7) {
                tasks.push({ task: `Watch concept video: ${weak} fundamentals`, section: weak, done: false })
            }
        } else if (phase === 'practice') {
            focus = `Targeted practice & speed building`
            tasks.push(
                { task: `25 timed ${weak} questions`, section: weak, done: false },
                { task: `20 mixed difficulty questions`, section: 'writing', done: false },
                { task: `1 mini mock test (30 min)`, section: 'math', done: false },
                { task: `Review mistakes & weak topics`, section: 'review', done: false },
            )
            if (hours >= 7) {
                tasks.push({ task: `Grammar rule drill: punctuation & transitions`, section: 'writing', done: false })
            }
        } else {
            focus = `Full-length tests & final review`
            tasks.push(
                { task: `1 full-length mock test`, section: 'math', done: false },
                { task: `Review mock test results`, section: 'review', done: false },
                { task: `15 questions on weakest topic`, section: weak, done: false },
                { task: `Final strategy review`, section: 'review', done: false },
            )
        }

        plans.push({ week: w, focus, tasks })
    }

    return plans
}

const sectionColors: Record<string, string> = {
    math: 'var(--gold-primary)',
    reading: '#8b5cf6',
    writing: '#f59e0b',
    review: '#22c55e',
}

export default function StudyPlannerPage() {
    const [form, setForm] = useState<PlanForm>(DEFAULT_FORM)
    const [plan, setPlan] = useState<WeekPlan[] | null>(null)

    const handleGenerate = () => {
        if (!form.currentScore || !form.targetScore) return
        setPlan(generatePlan(form))
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                    <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>
                        Premium Feature
                    </span>
                </div>
                <h1 className="heading-serif text-2xl sm:text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                    Personalized Study Planner
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Get a custom weekly study plan based on your target score, timeline, and strengths.
                </p>
            </div>

            {/* Input Form */}
            <div className="card-dark p-6 sm:p-8 mb-8">
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Tell us about your goals</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current SAT Score</label>
                        <input
                            type="number"
                            min={400}
                            max={1600}
                            value={form.currentScore}
                            onChange={e => setForm({ ...form, currentScore: e.target.value })}
                            placeholder="e.g. 1100"
                            className="block w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target SAT Score</label>
                        <input
                            type="number"
                            min={400}
                            max={1600}
                            value={form.targetScore}
                            onChange={e => setForm({ ...form, targetScore: e.target.value })}
                            placeholder="e.g. 1400"
                            className="block w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Exam Date</label>
                        <input
                            type="date"
                            value={form.examDate}
                            onChange={e => setForm({ ...form, examDate: e.target.value })}
                            className="block w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Hours per Week</label>
                        <select
                            value={form.hoursPerWeek}
                            onChange={e => setForm({ ...form, hoursPerWeek: e.target.value })}
                            className="block w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
                        >
                            <option value="3">3 hours</option>
                            <option value="5">5 hours</option>
                            <option value="7">7 hours</option>
                            <option value="10">10+ hours</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Strongest Section</label>
                        <select
                            value={form.strongest}
                            onChange={e => setForm({ ...form, strongest: e.target.value as SATSection })}
                            className="block w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
                        >
                            <option value="math">Math</option>
                            <option value="reading">Reading</option>
                            <option value="writing">Writing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Weakest Section</label>
                        <select
                            value={form.weakest}
                            onChange={e => setForm({ ...form, weakest: e.target.value as SATSection })}
                            className="block w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
                        >
                            <option value="math">Math</option>
                            <option value="reading">Reading</option>
                            <option value="writing">Writing</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!form.currentScore || !form.targetScore}
                    className="mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                    style={{
                        background: form.currentScore && form.targetScore ? 'linear-gradient(135deg, var(--gold-primary), #B8860B)' : 'var(--bg-tertiary)',
                        color: form.currentScore && form.targetScore ? '#fff' : 'var(--text-ghost)',
                    }}
                >
                    Generate My Study Plan
                </button>
            </div>

            {/* Generated Plan */}
            {plan && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="heading-serif text-xl" style={{ color: 'var(--text-primary)' }}>Your Study Plan</h2>
                        <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                            {plan.length} week{plan.length !== 1 ? 's' : ''} • {form.currentScore} → {form.targetScore}
                        </span>
                    </div>

                    {plan.map(week => (
                        <div key={week.week} className="card-dark p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                        style={{ background: 'rgba(201,146,60,0.15)', color: 'var(--gold-primary)' }}
                                    >
                                        W{week.week}
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            Week {week.week}
                                        </h3>
                                        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{week.focus}</p>
                                    </div>
                                </div>
                                <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                                    {week.tasks.filter(t => t.done).length}/{week.tasks.length} done
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {week.tasks.map((t, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors"
                                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded border flex-shrink-0"
                                            style={{ borderColor: sectionColors[t.section] || 'var(--border-primary)' }}
                                        />
                                        <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{t.task}</span>
                                        <span
                                            className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                                            style={{ color: sectionColors[t.section], backgroundColor: `${sectionColors[t.section]}15` }}
                                        >
                                            {t.section}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
