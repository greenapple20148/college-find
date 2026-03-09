'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useProfile } from '@/context/ProfileContext'
import type { Recommendation } from '@/lib/recommendations'

/* ─── SVG Icons ──────────────────────────────────────────────── */

function SparklesSvg() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}

function ArrowRightSvg() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    )
}

function CheckSvg() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

function MapPinSvg() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

function DollarSvg() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

function GraduationSvg() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
            <path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
    )
}

function ClipboardSvg() {
    return (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
    )
}

/* ─── Fit Score Ring ─────────────────────────────────────────── */

function FitScoreRing({ score }: { score: number }) {
    const radius = 22
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r={radius} fill="none"
                    stroke="var(--bg-tertiary)" strokeWidth="4" />
                <circle cx="28" cy="28" r={radius} fill="none"
                    stroke="var(--gold-primary)" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <span
                className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ color: 'var(--gold-primary)' }}
            >
                {score}
            </span>
        </div>
    )
}

/* ─── Score Breakdown Bar ────────────────────────────────────── */

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span style={{ color: 'var(--text-faint)' }}>{icon}</span>
            <span className="w-20 truncate" style={{ color: 'var(--text-faint)' }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${value}%`, backgroundColor: 'var(--gold-primary)' }}
                />
            </div>
            <span className="w-7 text-right tabular-nums font-medium" style={{ color: 'var(--text-secondary)' }}>{value}</span>
        </div>
    )
}

/* ─── Recommendation Card ────────────────────────────────────── */

function RecommendationCard({
    rec,
    rank,
    onSave,
    isSaved,
}: {
    rec: Recommendation
    rank: number
    onSave: (collegeId: string) => void
    isSaved: boolean
}) {
    const c = rec.college

    return (
        <div
            className="rounded-xl border p-5 transition-all duration-200 hover:shadow-lg relative"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: rank === 1 ? 'rgba(201,146,60,0.3)' : 'var(--border-subtle)',
                boxShadow: rank === 1 ? '0 0 30px rgba(201,146,60,0.08)' : 'none',
            }}
        >
            {/* Rank badge */}
            <div
                className="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                    background: rank <= 3 ? 'var(--gold-gradient)' : 'var(--bg-tertiary)',
                    color: rank <= 3 ? '#000' : 'var(--text-faint)',
                    border: rank <= 3 ? 'none' : '1px solid var(--border-subtle)',
                }}
            >
                {rank}
            </div>

            <div className="flex gap-4">
                {/* Fit score ring */}
                <FitScoreRing score={rec.fit_score} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/colleges/${c.slug ?? c.id}`}
                        className="text-base font-semibold hover:underline truncate block"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {c.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                        <span className="flex items-center gap-1">
                            <MapPinSvg />
                            {c.city}, {c.state}
                        </span>
                        <span className="flex items-center gap-1">
                            <DollarSvg />
                            ${rec.tuition_estimate.toLocaleString()}/yr
                        </span>
                        <span className="flex items-center gap-1">
                            <GraduationSvg />
                            {Math.round(rec.admission_probability * 100)}% chance
                        </span>
                    </div>
                </div>

                {/* Save button */}
                <button
                    onClick={() => onSave(c.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all self-start"
                    style={{
                        backgroundColor: isSaved ? 'rgba(201,146,60,0.1)' : 'var(--bg-tertiary)',
                        color: isSaved ? 'var(--gold-primary)' : 'var(--text-faint)',
                        border: `1px solid ${isSaved ? 'rgba(201,146,60,0.2)' : 'var(--border-subtle)'}`,
                    }}
                >
                    {isSaved ? <><CheckSvg /> Saved</> : 'Save'}
                </button>
            </div>

            {/* Reasons */}
            <div className="mt-3 flex flex-wrap gap-1.5">
                {rec.reasons.map((r, i) => (
                    <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md"
                        style={{
                            backgroundColor: 'rgba(201,146,60,0.06)',
                            color: 'var(--gold-primary)',
                            border: '1px solid rgba(201,146,60,0.12)',
                        }}
                    >
                        {r}
                    </span>
                ))}
            </div>

            {/* Score breakdown */}
            <div className="mt-3 space-y-1.5">
                <ScoreBar label="Admission" value={Math.round(rec.admission_probability * 100)} icon={<GraduationSvg />} />
                <ScoreBar label="Major fit" value={rec.major_match_score} icon={<SparklesSvg />} />
                <ScoreBar label="Cost fit" value={rec.cost_fit_score} icon={<DollarSvg />} />
                <ScoreBar label="Location" value={rec.location_match_score} icon={<MapPinSvg />} />
                <ScoreBar label="Grad rate" value={rec.graduation_score} icon={<GraduationSvg />} />
            </div>
        </div>
    )
}

/* ─── Main Page ──────────────────────────────────────────────── */

const SESSION_KEY = 'collegefind_session_id'

function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(SESSION_KEY, id)
    }
    return id
}

export default function RecommendationsClient() {
    const { profile, hasProfile, isLoaded } = useProfile()
    const [recs, setRecs] = useState<Recommendation[]>([])
    const [totalEvaluated, setTotalEvaluated] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!isLoaded || !hasProfile || !profile) return

        setLoading(true)
        setError(null)

        fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setRecs(data.recommendations)
                setTotalEvaluated(data.total_evaluated)
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [profile, hasProfile, isLoaded])

    async function handleSave(collegeId: string) {
        if (savedIds.has(collegeId)) {
            setSavedIds(prev => { const n = new Set(prev); n.delete(collegeId); return n })
            return
        }
        const sessionId = getOrCreateSessionId()
        try {
            const res = await fetch('/api/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, college_id: collegeId }),
            })
            if (res.ok) {
                setSavedIds(prev => new Set(prev).add(collegeId))
            }
        } catch (e) {
            console.error('Save failed:', e)
        }
    }

    if (!isLoaded) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center" style={{ color: 'var(--text-faint)' }}>
                Loading…
            </div>
        )
    }

    if (!hasProfile) {
        return (
            <div className="max-w-lg mx-auto px-4 py-24 text-center">
                <div className="flex justify-center mb-4">
                    <ClipboardSvg />
                </div>
                <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Set up your profile first
                </h1>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                    We need your GPA, test scores, and preferences to generate personalized recommendations.
                </p>
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'var(--gold-gradient)', color: '#fff' }}
                >
                    Create My Profile <ArrowRightSvg />
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--gold-gradient)', boxShadow: 'var(--shadow-glow)' }}
                    >
                        <SparklesSvg />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>
                            Your Top Picks
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
                            {totalEvaluated > 0 ? `Top 10 of ${totalEvaluated} colleges evaluated` : 'Personalized just for you'}
                            {profile?.intended_major ? ` · ${profile.intended_major}` : ''}
                            {profile?.preferred_states?.length ? ` · ${profile.preferred_states.join(', ')}` : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Weights explanation */}
            <div
                className="rounded-xl border p-4 mb-6 text-xs"
                style={{
                    backgroundColor: 'rgba(201,146,60,0.04)',
                    borderColor: 'rgba(201,146,60,0.12)',
                    color: 'var(--text-faint)',
                }}
            >
                <strong style={{ color: 'var(--text-secondary)' }}>How fit scores work:</strong>{' '}
                35% admission probability · 25% major match · 20% cost fit · 10% location · 10% graduation rate
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border p-5 animate-pulse h-40"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                        />
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <div
                    className="p-4 rounded-xl text-sm border"
                    style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-fg)' }}
                >
                    {error}. Please try again or{' '}
                    <Link href="/profile" className="underline">update your profile</Link>.
                </div>
            )}

            {/* Results */}
            {!loading && recs.length > 0 && (
                <div className="space-y-4">
                    {recs.map((rec, i) => (
                        <RecommendationCard
                            key={rec.college.id}
                            rec={rec}
                            rank={i + 1}
                            onSave={handleSave}
                            isSaved={savedIds.has(rec.college.id)}
                        />
                    ))}

                    <div className="pt-4 flex gap-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <Link href="/profile" className="text-sm font-medium" style={{ color: 'var(--gold-primary)' }}>
                            ← Update Profile
                        </Link>
                        <Link href="/match" className="text-sm font-medium" style={{ color: 'var(--gold-primary)' }}>
                            View Safety / Match / Reach →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
