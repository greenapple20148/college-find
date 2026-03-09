'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import type { EssayIdea, EssaySession } from '@/lib/types'
import { COMMON_APP_PROMPTS } from '@/lib/types'

/* ═══════════════════════════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════════════════════════ */

function SparklesSvg() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}

function PenSvg() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        </svg>
    )
}

function LightbulbSvg() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" /><path d="M10 22h4" />
        </svg>
    )
}

function ClockSvg() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function ChevronSvg({ open }: { open: boolean }) {
    return (
        <svg
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Field Component
   ═══════════════════════════════════════════════════════════════ */

function Field({
    label,
    hint,
    value,
    onChange,
    textarea,
    required,
}: {
    label: string
    hint?: string
    value: string
    onChange: (v: string) => void
    textarea?: boolean
    required?: boolean
}) {
    const Tag = textarea ? 'textarea' : 'input'
    return (
        <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {label} {required && <span style={{ color: 'var(--gold-primary)' }}>*</span>}
            </label>
            {hint && (
                <p className="text-xs mb-1.5" style={{ color: 'var(--text-ghost)' }}>{hint}</p>
            )}
            <Tag
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
                rows={textarea ? 3 : undefined}
                required={required}
            />
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   IdeaCard
   ═══════════════════════════════════════════════════════════════ */

function IdeaCard({ idea, index }: { idea: EssayIdea; index: number }) {
    const [expanded, setExpanded] = useState(index === 0)

    return (
        <div
            className="rounded-xl border transition-all"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: expanded ? 'rgba(201,146,60,0.25)' : 'var(--border-subtle)',
            }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{
                        background: 'var(--gold-gradient)',
                        color: '#000',
                    }}
                >
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {idea.title}
                    </p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                        {idea.themes.map((t, i) => (
                            <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                    backgroundColor: 'rgba(201,146,60,0.08)',
                                    color: 'var(--gold-primary)',
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
                <ChevronSvg open={expanded} />
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="px-4 pb-4 space-y-4">
                    <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }} />

                    {/* Hook */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1"
                            style={{ color: 'var(--gold-primary)' }}>
                            <LightbulbSvg /> Hook
                        </p>
                        <p
                            className="text-sm italic leading-relaxed px-3 py-2.5 rounded-lg"
                            style={{
                                backgroundColor: 'rgba(201,146,60,0.04)',
                                color: 'var(--text-secondary)',
                                borderLeft: '3px solid var(--gold-primary)',
                            }}
                        >
                            &ldquo;{idea.hook}&rdquo;
                        </p>
                    </div>

                    {/* Outline */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide mb-1.5"
                            style={{ color: 'var(--gold-primary)' }}>
                            Essay Outline
                        </p>
                        <ol className="space-y-1.5">
                            {idea.outline.map((step, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm">
                                    <span
                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                                        style={{
                                            backgroundColor: 'rgba(201,146,60,0.1)',
                                            color: 'var(--gold-primary)',
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Reflection */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide mb-1.5"
                            style={{ color: 'var(--gold-primary)' }}>
                            What They&apos;ll Learn About You
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                            {idea.reflection}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Previous Session Card
   ═══════════════════════════════════════════════════════════════ */

function SessionCard({
    session,
    onLoad,
}: {
    session: EssaySession
    onLoad: (s: EssaySession) => void
}) {
    const prompt = COMMON_APP_PROMPTS.find(p => p.key === session.essay_prompt)
    const ideaCount = session.generated_output?.ideas?.length ?? 0
    const date = new Date(session.created_at)

    return (
        <button
            onClick={() => onLoad(session)}
            className="w-full text-left p-3 rounded-lg border transition-all hover:border-[var(--gold-primary)]"
            style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {prompt?.label ?? session.essay_prompt}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-ghost)' }}>
                <span className="flex items-center gap-1">
                    <ClockSvg />
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span>{ideaCount} ideas</span>
                {session.major && <span>{session.major}</span>}
            </div>
        </button>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */

export default function EssayBrainstormClient() {
    const { user } = useAuth()

    // Form state
    const [major, setMajor] = useState('')
    const [activities, setActivities] = useState('')
    const [leadership, setLeadership] = useState('')
    const [challenges, setChallenges] = useState('')
    const [achievements, setAchievements] = useState('')
    const [goals, setGoals] = useState('')
    const [values, setValues] = useState('')
    const [essayPrompt, setEssayPrompt] = useState('')

    // Output state
    const [ideas, setIdeas] = useState<EssayIdea[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Previous sessions
    const [sessions, setSessions] = useState<EssaySession[]>([])
    const [showSessions, setShowSessions] = useState(false)

    // Load previous sessions
    useEffect(() => {
        if (!user) return
        fetch('/api/essay-brainstorm/sessions')
            .then(r => r.json())
            .then(d => setSessions(d.data ?? []))
            .catch(() => { })
    }, [user])

    async function handleGenerate() {
        if (!essayPrompt) return

        setLoading(true)
        setError(null)
        setIdeas([])

        try {
            const res = await fetch('/api/essay-brainstorm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    major: major || undefined,
                    activities: activities || undefined,
                    leadership: leadership || undefined,
                    challenges: challenges || undefined,
                    achievements: achievements || undefined,
                    goals: goals || undefined,
                    values: values || undefined,
                    essay_prompt: essayPrompt,
                }),
            })

            const data = await res.json()

            if (data.error) {
                setError(data.error)
            } else if (data.ideas) {
                setIdeas(data.ideas)
                // Refresh sessions list
                fetch('/api/essay-brainstorm/sessions')
                    .then(r => r.json())
                    .then(d => setSessions(d.data ?? []))
                    .catch(() => { })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed')
        } finally {
            setLoading(false)
        }
    }

    function loadSession(s: EssaySession) {
        setMajor(s.major ?? '')
        setActivities(s.activities ?? '')
        setLeadership(s.leadership ?? '')
        setChallenges(s.challenges ?? '')
        setAchievements(s.achievements ?? '')
        setGoals(s.goals ?? '')
        setValues(s.values ?? '')
        setEssayPrompt(s.essay_prompt)
        setIdeas(s.generated_output?.ideas ?? [])
        setShowSessions(false)
    }

    if (!user) {
        return (
            <div className="max-w-lg mx-auto px-4 py-24 text-center">
                <div className="flex justify-center mb-4" style={{ color: 'var(--text-ghost)' }}>
                    <PenSvg />
                </div>
                <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Sign in to brainstorm essay ideas
                </h1>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                    Get personalized essay ideas powered by AI.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}
                >
                    Log in to get started
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--gold-gradient)', boxShadow: 'var(--shadow-glow)' }}
                >
                    <PenSvg />
                </div>
                <div>
                    <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>
                        Essay Brainstorming
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        Get AI-powered essay ideas — we guide, you write
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Left: Form ──────────────────────────────────────── */}
                <div className="lg:col-span-1 space-y-4">
                    <div
                        className="rounded-xl border p-5 space-y-4"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            Tell us about yourself
                        </h2>

                        {/* Essay prompt selector */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Essay Prompt <span style={{ color: 'var(--gold-primary)' }}>*</span>
                            </label>
                            <select
                                value={essayPrompt}
                                onChange={e => setEssayPrompt(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors appearance-none"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderColor: 'var(--border-primary)',
                                    color: essayPrompt ? 'var(--text-primary)' : 'var(--text-ghost)',
                                }}
                            >
                                <option value="">Select a prompt…</option>
                                {COMMON_APP_PROMPTS.map(p => (
                                    <option key={p.key} value={p.key}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <Field label="Intended Major" value={major} onChange={setMajor}
                            hint="e.g. Computer Science, Biology" />
                        <Field label="Key Activities" value={activities} onChange={setActivities} textarea
                            hint="e.g. Robotics club, debate team, volunteering" />
                        <Field label="Leadership" value={leadership} onChange={setLeadership} textarea
                            hint="e.g. Team captain, club president, project lead" />
                        <Field label="Challenges" value={challenges} onChange={setChallenges} textarea
                            hint="Personal obstacles you've overcome" />
                        <Field label="Achievements" value={achievements} onChange={setAchievements} textarea
                            hint="Awards, honors, or accomplishments" />
                        <Field label="Career Goals" value={goals} onChange={setGoals}
                            hint="What you want to do after college" />
                        <Field label="Values & Passions" value={values} onChange={setValues} textarea
                            hint="What matters most to you" />

                        <button
                            onClick={handleGenerate}
                            disabled={!essayPrompt || loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'var(--gold-gradient)', color: '#000' }}
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Brainstorming…
                                </>
                            ) : (
                                <>
                                    <SparklesSvg /> Generate Essay Ideas
                                </>
                            )}
                        </button>
                    </div>

                    {/* Previous sessions */}
                    {sessions.length > 0 && (
                        <div
                            className="rounded-xl border p-4"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                        >
                            <button
                                onClick={() => setShowSessions(v => !v)}
                                className="w-full flex items-center justify-between text-sm font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Previous Sessions ({sessions.length})
                                <ChevronSvg open={showSessions} />
                            </button>
                            {showSessions && (
                                <div className="mt-3 space-y-2">
                                    {sessions.map(s => (
                                        <SessionCard key={s.id} session={s} onLoad={loadSession} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: Results ──────────────────────────────────── */}
                <div className="lg:col-span-2">
                    {error && (
                        <div
                            className="p-4 rounded-xl text-sm border mb-4"
                            style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-fg)' }}
                        >
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="rounded-xl border p-5 animate-pulse"
                                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                                            <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && ideas.length === 0 && !error && (
                        <div
                            className="rounded-xl border p-12 text-center"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="flex justify-center mb-4" style={{ color: 'var(--text-ghost)' }}>
                                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                                    <path d="M9 18h6" /><path d="M10 22h4" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Ready to brainstorm?
                            </h2>
                            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-faint)' }}>
                                Fill in your details on the left and select an essay prompt. We&apos;ll generate personalized story ideas to get you started.
                            </p>
                        </div>
                    )}

                    {!loading && ideas.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                                    Your Essay Ideas ({ideas.length})
                                </h2>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                                    style={{ color: 'var(--gold-primary)', backgroundColor: 'rgba(201,146,60,0.08)' }}
                                >
                                    ↻ Generate more
                                </button>
                            </div>

                            {ideas.map((idea, i) => (
                                <IdeaCard key={i} idea={idea} index={i} />
                            ))}

                            <div
                                className="rounded-xl border p-4 text-xs text-center"
                                style={{
                                    backgroundColor: 'rgba(201,146,60,0.04)',
                                    borderColor: 'rgba(201,146,60,0.12)',
                                    color: 'var(--text-faint)',
                                }}
                            >
                                These are brainstorming ideas to inspire you — not finished essays.
                                Use them as a starting point and make the story authentically yours.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
