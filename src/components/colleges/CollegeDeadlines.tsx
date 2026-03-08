'use client'

import { useState, useEffect, type ReactNode } from 'react'
import type { CollegeDeadline } from '@/lib/types'
import {
    BoltIcon,
    ClipboardListIcon,
    RefreshIcon,
    CoinsIcon,
    ShieldCheckIcon,
    AlertTriangleIcon,
} from '@/components/ui/Icon'

interface DeadlineEntry {
    label: string
    date: string | null
    type: 'early' | 'regular' | 'transfer' | 'financial'
}

function daysUntil(dateStr: string): number {
    return Math.floor((new Date(dateStr + 'T00:00:00').getTime() - Date.now()) / 86400000)
}

function deadlineUrgency(dateStr: string): { color: string; bg: string; label: string } {
    const days = daysUntil(dateStr)
    if (days < 0) return { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', label: 'Past' }
    if (days === 0) return { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', label: 'Today!' }
    if (days <= 7) return { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', label: `${days}d left` }
    if (days <= 30) return { color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', label: `${days}d left` }
    if (days <= 90) return { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', label: `${days}d left` }
    return { color: 'var(--text-faint)', bg: 'transparent', label: `${days}d left` }
}

function formatDeadlineDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

const TYPE_ICONS: Record<string, ReactNode> = {
    early: <BoltIcon className="w-4 h-4" style={{ color: '#a855f7' }} />,
    regular: <ClipboardListIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />,
    transfer: <RefreshIcon className="w-4 h-4" style={{ color: '#14b8a6' }} />,
    financial: <CoinsIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />,
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    early: {
        bg: 'rgba(168, 85, 247, 0.06)',
        border: 'rgba(168, 85, 247, 0.15)',
        text: '#a855f7',
    },
    regular: {
        bg: 'rgba(59, 130, 246, 0.06)',
        border: 'rgba(59, 130, 246, 0.15)',
        text: '#3b82f6',
    },
    transfer: {
        bg: 'rgba(20, 184, 166, 0.06)',
        border: 'rgba(20, 184, 166, 0.15)',
        text: '#14b8a6',
    },
    financial: {
        bg: 'rgba(245, 158, 11, 0.06)',
        border: 'rgba(245, 158, 11, 0.15)',
        text: '#f59e0b',
    },
}

const STATUS_BADGES: Record<string, { label: string; icon: ReactNode; color: string; bg: string }> = {
    official_verified: {
        label: 'Official Source',
        icon: <ShieldCheckIcon className="w-3 h-3" />,
        color: '#16a34a',
        bg: 'rgba(22,163,74,0.1)',
    },
    commonapp_verified: {
        label: 'Common App',
        icon: <ShieldCheckIcon className="w-3 h-3" />,
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.1)',
    },
    needs_review: {
        label: 'Unverified',
        icon: <AlertTriangleIcon className="w-3 h-3" />,
        color: '#ca8a04',
        bg: 'rgba(202,138,4,0.1)',
    },
}

interface CollegeDeadlinesProps {
    collegeId: string
    collegeName?: string
    cycleYear?: number
}

export function CollegeDeadlines({
    collegeId,
    collegeName,
    cycleYear = 2026,
}: CollegeDeadlinesProps) {
    const [deadline, setDeadline] = useState<CollegeDeadline | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchDeadlines() {
            try {
                const res = await fetch(
                    `/api/deadlines?college_id=${collegeId}&cycle_year=${cycleYear}`
                )
                const json = await res.json()
                if (res.ok) {
                    setDeadline(json.data ?? null)
                } else {
                    setError(json.error ?? 'Failed to load deadlines')
                }
            } catch {
                setError('Failed to load deadlines')
            } finally {
                setLoading(false)
            }
        }
        fetchDeadlines()
    }, [collegeId, cycleYear])

    if (loading) {
        return (
            <div
                className="rounded-xl border p-5 space-y-3"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-subtle)',
                }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-24 h-5 rounded animate-pulse"
                        style={{ backgroundColor: 'var(--skeleton-color)' }}
                    />
                </div>
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="h-14 rounded-lg animate-pulse"
                        style={{ backgroundColor: 'var(--skeleton-color)' }}
                    />
                ))}
            </div>
        )
    }

    if (error) return null

    if (!deadline) {
        return (
            <div
                className="rounded-xl border p-5"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-subtle)',
                }}
            >
                <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Application Deadlines
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                    Deadline information for {collegeName ?? 'this college'} is not yet available
                    for the {cycleYear - 1}–{cycleYear} application cycle.
                </p>
                <p
                    className="text-xs mt-3 italic flex items-center gap-1.5"
                    style={{ color: 'var(--text-ghost)' }}
                >
                    <AlertTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    Please verify on the official admissions page
                </p>
            </div>
        )
    }

    // Build deadline entries
    const entries: DeadlineEntry[] = []

    if (deadline.early_action_deadline)
        entries.push({ label: 'Early Action', date: deadline.early_action_deadline, type: 'early' })
    if (deadline.early_decision_1_deadline)
        entries.push({ label: 'Early Decision I', date: deadline.early_decision_1_deadline, type: 'early' })
    if (deadline.early_decision_2_deadline)
        entries.push({ label: 'Early Decision II', date: deadline.early_decision_2_deadline, type: 'early' })
    if (deadline.regular_decision_deadline)
        entries.push({ label: 'Regular Decision', date: deadline.regular_decision_deadline, type: 'regular' })
    if (deadline.transfer_fall_deadline)
        entries.push({ label: 'Transfer (Fall)', date: deadline.transfer_fall_deadline, type: 'transfer' })
    if (deadline.transfer_spring_deadline)
        entries.push({ label: 'Transfer (Spring)', date: deadline.transfer_spring_deadline, type: 'transfer' })
    if (deadline.scholarship_priority_deadline)
        entries.push({ label: 'Scholarship Priority', date: deadline.scholarship_priority_deadline, type: 'financial' })
    if (deadline.fafsa_priority_deadline)
        entries.push({ label: 'FAFSA Priority', date: deadline.fafsa_priority_deadline, type: 'financial' })

    const statusBadge = STATUS_BADGES[deadline.verification_status]

    return (
        <div
            className="rounded-xl border overflow-hidden"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            {/* Header */}
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-1">
                    <h2
                        className="text-lg font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Application Deadlines
                    </h2>
                    <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.color,
                        }}
                    >
                        <span className="inline-flex items-center gap-1">{statusBadge.icon} {statusBadge.label}</span>
                    </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                    {cycleYear - 1}–{cycleYear} Application Cycle
                    {deadline.rolling_admission && (
                        <span
                            className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: 'rgba(34,197,94,0.1)',
                                color: '#16a34a',
                            }}
                        >
                            Rolling Admissions
                        </span>
                    )}
                </p>
            </div>

            {/* Deadline entries */}
            {entries.length > 0 ? (
                <div className="px-5 pb-2 space-y-2">
                    {entries.map((entry, idx) => {
                        const urgency = entry.date ? deadlineUrgency(entry.date) : null
                        const typeStyle = TYPE_COLORS[entry.type]

                        return (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg border transition-all"
                                style={{
                                    backgroundColor: typeStyle.bg,
                                    borderColor: typeStyle.border,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0">{TYPE_ICONS[entry.type]}</span>
                                    <div>
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {entry.label}
                                        </p>
                                        <p
                                            className="text-xs mt-0.5"
                                            style={{ color: typeStyle.text }}
                                        >
                                            {entry.date ? formatDeadlineDate(entry.date) : '—'}
                                        </p>
                                    </div>
                                </div>
                                {urgency && (
                                    <span
                                        className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                                        style={{
                                            backgroundColor: urgency.bg,
                                            color: urgency.color,
                                        }}
                                    >
                                        {urgency.label}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="px-5 pb-4">
                    <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                        {deadline.rolling_admission
                            ? 'This college accepts applications on a rolling basis.'
                            : 'No specific deadlines listed yet.'}
                    </p>
                </div>
            )}

            {/* Disclaimer + source */}
            <div
                className="px-5 py-3 border-t space-y-1"
                style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                }}
            >
                <p
                    className="text-xs flex items-center gap-1.5"
                    style={{ color: 'var(--text-ghost)' }}
                >
                    <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Please verify on the official admissions page
                </p>
                {deadline.source_url && (
                    <a
                        href={deadline.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline inline-flex items-center gap-1"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        View source →
                    </a>
                )}
                {deadline.last_verified_at && (
                    <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                        Last verified:{' '}
                        {new Date(deadline.last_verified_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </p>
                )}
            </div>
        </div>
    )
}
