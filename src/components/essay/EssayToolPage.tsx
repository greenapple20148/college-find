'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

import type { ToolConfig } from '@/lib/essay-tools'

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

function ChevronSvg({ open }: { open: boolean }) {
    return (
        <svg className="w-4 h-4 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
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


/* ═══════════════════════════════════════════════════════════════
   Score Ring (for analyzer / scorer tools)
   ═══════════════════════════════════════════════════════════════ */

function ScoreRing({ score, max = 10, size = 56 }: { score: number; max?: number; size?: number }) {
    const radius = (size - 8) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / max) * circumference
    const color = score >= 7 ? '#4ade80' : score >= 5 ? 'var(--gold-primary)' : '#f87171'

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>
                {score}
            </span>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   ScoreBar (horizontal score metric)
   ═══════════════════════════════════════════════════════════════ */

function ScoreBar({ label, score, feedback }: { label: string; score: number; feedback: string }) {
    const color = score >= 7 ? '#4ade80' : score >= 5 ? 'var(--gold-primary)' : '#f87171'

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-secondary)' }}>{label.replace(/_/g, ' ')}</span>
                <span className="text-xs font-bold" style={{ color }}>{score}/10</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score * 10}%`, backgroundColor: color }} />
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>{feedback}</p>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Generic Output Renderer
   ═══════════════════════════════════════════════════════════════ */

function OutputSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1" style={{ color: 'var(--gold-primary)' }}>
                {title}
            </p>
            {children}
        </div>
    )
}

function Tags({ items }: { items: string[] }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((t, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: 'rgba(201,146,60,0.08)', color: 'var(--gold-primary)', border: '1px solid rgba(201,146,60,0.12)' }}>
                    {t}
                </span>
            ))}
        </div>
    )
}

function Quote({ text }: { text: string }) {
    return (
        <p className="text-sm italic leading-relaxed px-3 py-2.5 rounded-lg"
            style={{ backgroundColor: 'rgba(201,146,60,0.04)', color: 'var(--text-secondary)', borderLeft: '3px solid var(--gold-primary)' }}>
            &ldquo;{text}&rdquo;
        </p>
    )
}

function NumberedList({ items }: { items: string[] }) {
    return (
        <ol className="space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                        style={{ backgroundColor: 'rgba(201,146,60,0.1)', color: 'var(--gold-primary)' }}>
                        {i + 1}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </li>
            ))}
        </ol>
    )
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-1">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </li>
            ))}
        </ul>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Result Card — renders one result item (topic/idea/story/hook)
   ═══════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResultCard({ data, index, toolSlug }: { data: any; index: number; toolSlug: string }) {
    const [expanded, setExpanded] = useState(index === 0)

    const title = data.title || data.angle || data.type || `Idea ${index + 1}`

    return (
        <div className="rounded-xl border transition-all"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: expanded ? 'rgba(201,146,60,0.25)' : 'var(--border-subtle)' }}>
            <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}>
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
                    {data.themes && <div className="mt-1"><Tags items={data.themes} /></div>}
                </div>
                <ChevronSvg open={expanded} />
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3">
                    <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }} />

                    {/* Topic Generator fields */}
                    {data.description && <OutputSection title="Description"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.description}</p></OutputSection>}
                    {data.why_compelling && <OutputSection title="Why It's Compelling"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{data.why_compelling}</p></OutputSection>}

                    {/* Common App fields */}
                    {data.story_angle && <OutputSection title="Story Angle"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.story_angle}</p></OutputSection>}
                    {data.reflection && <OutputSection title="Reflection"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{data.reflection}</p></OutputSection>}
                    {data.structure && <OutputSection title="Structure"><NumberedList items={data.structure} /></OutputSection>}

                    {/* Story finder fields */}
                    {data.story_idea && <OutputSection title="Story Idea"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.story_idea}</p></OutputSection>}
                    {data.emotional_arc && <OutputSection title="Emotional Arc"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.emotional_arc}</p></OutputSection>}
                    {data.potential_topic && <OutputSection title="Potential Topic"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{data.potential_topic}</p></OutputSection>}
                    {data.why_unique && <OutputSection title="Why It's Unique"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{data.why_unique}</p></OutputSection>}

                    {/* Hook generator fields */}
                    {data.text && toolSlug === 'essay-hook-generator' && <OutputSection title="Hook"><Quote text={data.text} /></OutputSection>}
                    {data.why_it_works && <OutputSection title="Why It Works"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{data.why_it_works}</p></OutputSection>}
                    {data.storytelling_tip && <OutputSection title="Storytelling Tip"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{data.storytelling_tip}</p></OutputSection>}

                    {/* Supplemental fields */}
                    {data.key_points && <OutputSection title="Key Points"><BulletList items={data.key_points} /></OutputSection>}
                    {data.personalization_tip && <OutputSection title="Personalization"><p className="text-sm" style={{ color: 'var(--text-faint)' }}>{data.personalization_tip}</p></OutputSection>}
                </div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Outline Viewer (for outline builder tool)
   ═══════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OutlineViewer({ outline }: { outline: any }) {
    return (
        <div className="rounded-xl border p-5 space-y-4"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>

            {outline.hook && (
                <OutputSection title="Hook">
                    <Quote text={outline.hook} />
                    {outline.hook_explanation && <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>{outline.hook_explanation}</p>}
                </OutputSection>
            )}

            {outline.sections?.map((s: { title: string; purpose: string; key_points: string[]; transition?: string }, i: number) => (
                <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ backgroundColor: 'rgba(201,146,60,0.1)', color: 'var(--gold-primary)' }}>
                            {i + 1}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                    </div>
                    <p className="text-xs ml-8" style={{ color: 'var(--text-faint)' }}>{s.purpose}</p>
                    <ul className="ml-8 space-y-0.5">
                        {s.key_points?.map((p: string, j: number) => (
                            <li key={j} className="text-xs flex items-start gap-1.5">
                                <span style={{ color: 'var(--gold-primary)' }}>•</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{p}</span>
                            </li>
                        ))}
                    </ul>
                    {s.transition && <p className="text-[11px] ml-8 italic" style={{ color: 'var(--text-ghost)' }}>→ {s.transition}</p>}
                </div>
            ))}

            {outline.conclusion_approach && (
                <OutputSection title="Conclusion">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{outline.conclusion_approach}</p>
                </OutputSection>
            )}
            {outline.word_count_guidance && (
                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>📝 {outline.word_count_guidance}</p>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Analyzer View (scores + improvements)
   ═══════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AnalyzerView({ data }: { data: any }) {
    const scores = data.scores || {}
    const scoreEntries = Object.entries(scores) as [string, { score: number; feedback?: string; explanation?: string }][]

    return (
        <div className="space-y-4">
            {/* Overall */}
            <div className="rounded-xl border p-5 flex items-center gap-5"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <ScoreRing score={data.overall_score ?? 0} />
                <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Overall Score: {data.overall_score}/10
                    </p>
                    {data.verdict && <p className="text-xs mt-0.5" style={{ color: 'var(--gold-primary)' }}>{data.verdict}</p>}
                    {data.summary && <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{data.summary}</p>}
                </div>
            </div>

            {/* Score breakdown */}
            <div className="rounded-xl border p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--gold-primary)' }}>Score Breakdown</p>
                {scoreEntries.map(([key, val]) => (
                    <ScoreBar key={key} label={key} score={val.score} feedback={val.feedback || val.explanation || ''} />
                ))}
            </div>

            {/* Strengths & improvements */}
            {data.strengths?.length > 0 && (
                <div className="rounded-xl border p-5"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <OutputSection title="Strengths"><BulletList items={data.strengths} /></OutputSection>
                </div>
            )}

            {(data.improvements?.length > 0 || data.tips_to_strengthen?.length > 0) && (
                <div className="rounded-xl border p-5 space-y-2"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <OutputSection title="How to Improve">
                        {(data.improvements || data.tips_to_strengthen)?.map((item: { area?: string; tip?: string; suggestion?: string; why?: string }, i: number) => (
                            <div key={i} className="mb-2">
                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.area || item.tip}</p>
                                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{item.suggestion || item.why}</p>
                            </div>
                        ))}
                    </OutputSection>
                </div>
            )}

            {data.alternative_angles?.length > 0 && (
                <div className="rounded-xl border p-5"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <OutputSection title="Alternative Angles"><BulletList items={data.alternative_angles} /></OutputSection>
                </div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Supplemental View
   ═══════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SupplementalView({ data }: { data: any }) {
    return (
        <div className="space-y-4">
            {data.ideas?.map((idea: { angle: string; key_points: string[]; personalization_tip: string }, i: number) => (
                <ResultCard key={i} data={idea} index={i} toolSlug="supplemental-essay-helper" />
            ))}

            {data.outline?.length > 0 && (
                <div className="rounded-xl border p-5"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <OutputSection title="Suggested Outline"><NumberedList items={data.outline} /></OutputSection>
                </div>
            )}

            {data.research_tips?.length > 0 && (
                <div className="rounded-xl border p-5"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <OutputSection title="Research Tips"><BulletList items={data.research_tips} /></OutputSection>
                </div>
            )}

            {data.common_mistakes?.length > 0 && (
                <div className="rounded-xl border p-5"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <OutputSection title="Common Mistakes to Avoid"><BulletList items={data.common_mistakes} /></OutputSection>
                </div>
            )}

            {data.word_count_tip && (
                <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(201,146,60,0.04)', color: 'var(--text-faint)' }}>
                    📝 {data.word_count_tip}
                </p>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Main — EssayToolPage
   ═══════════════════════════════════════════════════════════════ */

interface Session {
    id: string
    tool_type: string
    inputs_json: Record<string, string>
    ai_output: Record<string, unknown>
    created_at: string
}

export default function EssayToolPage({ tool }: { tool: ToolConfig }) {
    const { user } = useAuth()

    const [inputs, setInputs] = useState<Record<string, string>>({})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [output, setOutput] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sessions, setSessions] = useState<Session[]>([])
    const [showSessions, setShowSessions] = useState(false)
    const [showFaq, setShowFaq] = useState(false)

    const loadSessions = useCallback(async () => {
        if (!user) return
        try {
            const res = await fetch(`/api/essay-toolkit/sessions?tool=${tool.slug}`)
            const data = await res.json()
            setSessions(data.data ?? [])
        } catch { /* ignore */ }
    }, [user, tool.slug])

    useEffect(() => { loadSessions() }, [loadSessions])

    function updateInput(key: string, value: string) {
        setInputs(prev => ({ ...prev, [key]: value }))
    }

    async function handleGenerate() {
        setLoading(true)
        setError(null)
        setOutput(null)

        try {
            const res = await fetch('/api/essay-toolkit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool: tool.slug, inputs }),
            })
            const data = await res.json()
            if (data.error) {
                setError(data.error)
            } else {
                setOutput(data)
                loadSessions()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed')
        } finally {
            setLoading(false)
        }
    }

    function loadSession(s: Session) {
        setInputs(s.inputs_json)
        setOutput(s.ai_output)
        setShowSessions(false)
    }

    // Determine which items to render as cards
    function getListItems(): unknown[] {
        if (!output) return []
        if (output.topics) return output.topics
        if (output.ideas) return output.ideas
        if (output.stories) return output.stories
        if (output.hooks) return output.hooks
        return []
    }

    // Check if this tool uses the score/analyzer view
    const isAnalyzer = tool.slug === 'essay-analyzer' || tool.slug === 'essay-idea-score'
    const isOutline = tool.slug === 'essay-outline-builder'
    const isSupplemental = tool.slug === 'supplemental-essay-helper'
    const listItems = getListItems()

    if (!user) {
        return (
            <div className="max-w-lg mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{tool.title}</h1>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>{tool.description}</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}>
                    Log in to get started
                </Link>
            </div>
        )
    }



    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--gold-gradient)', boxShadow: 'var(--shadow-glow)' }}>
                    <SparklesSvg />
                </div>
                <div>
                    <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>{tool.title}</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>{tool.description}</p>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs mb-6" style={{ color: 'var(--text-ghost)' }}>
                <Link href="/essay-toolkit" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>Essay Toolkit</Link>
                <span>›</span>
                <span>{tool.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Left: Form ──────────────────────────────────────── */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="rounded-xl border p-5 space-y-4"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>

                        {tool.fields.map(field => (
                            <div key={field.key}>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    {field.label} {field.required && <span style={{ color: 'var(--gold-primary)' }}>*</span>}
                                </label>
                                {field.hint && <p className="text-xs mb-1.5" style={{ color: 'var(--text-ghost)' }}>{field.hint}</p>}

                                {field.type === 'select' ? (
                                    <select value={inputs[field.key] ?? ''} onChange={e => updateInput(field.key, e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none appearance-none"
                                        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: inputs[field.key] ? 'var(--text-primary)' : 'var(--text-ghost)' }}>
                                        <option value="">Select…</option>
                                        {field.options?.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea value={inputs[field.key] ?? ''} onChange={e => updateInput(field.key, e.target.value)} rows={3}
                                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                                        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                        onFocus={e => (e.target.style.borderColor = 'var(--gold-primary)')}
                                        onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')} />
                                ) : (
                                    <input type="text" value={inputs[field.key] ?? ''} onChange={e => updateInput(field.key, e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                                        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                        onFocus={e => (e.target.style.borderColor = 'var(--gold-primary)')}
                                        onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')} />
                                )}
                            </div>
                        ))}

                        <button onClick={handleGenerate} disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'var(--gold-gradient)', color: '#000' }}>
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Generating…</>
                            ) : (
                                <><SparklesSvg /> Generate</>
                            )}
                        </button>
                    </div>

                    {/* Previous sessions */}
                    {sessions.length > 0 && (
                        <div className="rounded-xl border p-4"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                            <button onClick={() => setShowSessions(v => !v)}
                                className="w-full flex items-center justify-between text-sm font-semibold"
                                style={{ color: 'var(--text-primary)' }}>
                                Previous Sessions ({sessions.length})
                                <ChevronSvg open={showSessions} />
                            </button>
                            {showSessions && (
                                <div className="mt-3 space-y-2">
                                    {sessions.map(s => (
                                        <button key={s.id} onClick={() => loadSession(s)}
                                            className="w-full text-left p-3 rounded-lg border transition-all hover:border-[var(--gold-primary)]"
                                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
                                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-ghost)' }}>
                                                <ClockSvg />
                                                {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* FAQ */}
                    {tool.faq.length > 0 && (
                        <div className="rounded-xl border p-4"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                            <button onClick={() => setShowFaq(v => !v)}
                                className="w-full flex items-center justify-between text-sm font-semibold"
                                style={{ color: 'var(--text-primary)' }}>
                                FAQ
                                <ChevronSvg open={showFaq} />
                            </button>
                            {showFaq && (
                                <div className="mt-3 space-y-3">
                                    {tool.faq.map((f, i) => (
                                        <div key={i}>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.q}</p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{f.a}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: Results ──────────────────────────────────── */}
                <div className="lg:col-span-2">
                    {error && (
                        <div className="p-4 rounded-xl text-sm border mb-4"
                            style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-fg)' }}>
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="rounded-xl border p-5 animate-pulse h-24"
                                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
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

                    {!loading && !output && !error && (
                        <div className="rounded-xl border p-12 text-center"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                            <div className="flex justify-center mb-4" style={{ color: 'var(--text-ghost)' }}>
                                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Ready to go</h2>
                            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-faint)' }}>
                                Fill in the form and hit Generate to get AI-powered suggestions.
                            </p>
                        </div>
                    )}

                    {!loading && output && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Results</h2>
                                <button onClick={handleGenerate} disabled={loading}
                                    className="text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-80"
                                    style={{ color: 'var(--gold-primary)', backgroundColor: 'rgba(201,146,60,0.08)' }}>
                                    ↻ Regenerate
                                </button>
                            </div>

                            {/* Render based on tool type */}
                            {isAnalyzer && <AnalyzerView data={output} />}
                            {isOutline && output.outline && <OutlineViewer outline={output.outline} />}
                            {isSupplemental && <SupplementalView data={output} />}

                            {!isAnalyzer && !isOutline && !isSupplemental && listItems.map((item, i) => (
                                <ResultCard key={i} data={item} index={i} toolSlug={tool.slug} />
                            ))}

                            <div className="rounded-xl border p-4 text-xs text-center"
                                style={{ backgroundColor: 'rgba(201,146,60,0.04)', borderColor: 'rgba(201,146,60,0.12)', color: 'var(--text-faint)' }}>
                                These are AI-generated suggestions to guide your writing — not finished essays.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
