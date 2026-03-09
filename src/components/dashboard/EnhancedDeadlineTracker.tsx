'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import type { SavedCollege, CollegeDeadline } from '@/lib/types'
import {
    BoltIcon,
    ClipboardListIcon,
    RefreshIcon,
    CoinsIcon,
    PinIcon,
    CalendarIcon,
    AlertTriangleIcon,
} from '@/components/ui/Icon'

interface MergedDeadline {
    collegeId: string
    collegeName: string
    collegeSlug: string | null
    state: string | null
    label: string
    date: string
    daysLeft: number
    type: 'early' | 'regular' | 'transfer' | 'financial' | 'custom'
}

function daysUntil(deadline: string): number {
    return Math.floor((new Date(deadline + 'T00:00:00').getTime() - Date.now()) / 86400000)
}

function formatDays(days: number): string {
    if (days < 0) return 'Past'
    if (days === 0) return 'Today!'
    if (days === 1) return '1 day'
    return `${days} days`
}

const TYPE_ICONS: Record<string, ReactNode> = {
    early: <BoltIcon className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />,
    regular: <ClipboardListIcon className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />,
    transfer: <RefreshIcon className="w-3.5 h-3.5" style={{ color: '#14b8a6' }} />,
    financial: <CoinsIcon className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />,
    custom: <PinIcon className="w-3.5 h-3.5" style={{ color: 'var(--gold-primary)' }} />,
}

interface EnhancedDeadlineTrackerProps {
    savedColleges: SavedCollege[]
}

export function EnhancedDeadlineTracker({ savedColleges }: EnhancedDeadlineTrackerProps) {
    const [deadlines, setDeadlines] = useState<MergedDeadline[]>([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        async function fetchDeadlines() {
            const merged: MergedDeadline[] = []
            const collegeIds = savedColleges
                .filter(s => s.college)
                .map(s => s.college_id)

            // Fetch system deadlines for all saved colleges
            const deadlinePromises = collegeIds.map(id =>
                fetch(`/api/deadlines?college_id=${id}&cycle_year=2026`)
                    .then(r => r.json())
                    .catch(() => ({ data: null }))
            )

            const results = await Promise.all(deadlinePromises)

            results.forEach((result, idx) => {
                const saved = savedColleges.find(s => s.college_id === collegeIds[idx])
                if (!saved?.college) return

                const dl: CollegeDeadline | null = result.data

                if (dl) {
                    const entries: { label: string; date: string | null; type: MergedDeadline['type'] }[] = [
                        { label: 'Early Action', date: dl.early_action_deadline, type: 'early' },
                        { label: 'Early Decision I', date: dl.early_decision_1_deadline, type: 'early' },
                        { label: 'Early Decision II', date: dl.early_decision_2_deadline, type: 'early' },
                        { label: 'Regular Decision', date: dl.regular_decision_deadline, type: 'regular' },
                        { label: 'Transfer (Fall)', date: dl.transfer_fall_deadline, type: 'transfer' },
                        { label: 'Transfer (Spring)', date: dl.transfer_spring_deadline, type: 'transfer' },
                        { label: 'Scholarship Priority', date: dl.scholarship_priority_deadline, type: 'financial' },
                        { label: 'FAFSA Priority', date: dl.fafsa_priority_deadline, type: 'financial' },
                    ]

                    entries.forEach(e => {
                        if (e.date) {
                            merged.push({
                                collegeId: saved.college_id,
                                collegeName: saved.college!.name,
                                collegeSlug: saved.college!.slug ?? null,
                                state: saved.college!.state ?? null,
                                label: e.label,
                                date: e.date,
                                daysLeft: daysUntil(e.date),
                                type: e.type,
                            })
                        }
                    })
                }

                // Also include user-set custom deadlines from saved_colleges
                if (saved.deadline) {
                    merged.push({
                        collegeId: saved.college_id,
                        collegeName: saved.college!.name,
                        collegeSlug: saved.college!.slug ?? null,
                        state: saved.college!.state ?? null,
                        label: 'My Deadline',
                        date: saved.deadline,
                        daysLeft: daysUntil(saved.deadline),
                        type: 'custom',
                    })
                }
            })

            // Sort by days left, upcoming first
            merged.sort((a, b) => a.daysLeft - b.daysLeft)

            setDeadlines(merged)
            setLoading(false)
        }

        if (savedColleges.length > 0) {
            fetchDeadlines()
        } else {
            setLoading(false)
        }
    }, [savedColleges])

    if (loading) {
        return (
            <div
                className="rounded-xl border p-5 space-y-3"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-subtle)',
                }}
            >
                <div className="h-5 w-36 rounded animate-pulse" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                ))}
            </div>
        )
    }

    const upcoming = deadlines.filter(d => d.daysLeft >= 0)
    const past = deadlines.filter(d => d.daysLeft < 0)
    const displayed = showAll ? upcoming : upcoming.slice(0, 6)

    if (upcoming.length === 0 && past.length === 0) {
        return (
            <div
                className="rounded-xl border p-5"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-subtle)',
                }}
            >
                <h3
                    className="font-semibold mb-3 flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <CalendarIcon className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} />
                    Upcoming Deadlines
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                    No upcoming deadlines found. Save some colleges to see their deadlines here.
                </p>
            </div>
        )
    }

    return (
        <div
            className="rounded-xl border overflow-hidden"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between">
                    <h3
                        className="font-semibold flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <CalendarIcon className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} />
                        Upcoming Deadlines
                    </h3>
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: 'rgba(201,146,60,0.12)',
                            color: 'var(--gold-primary)',
                        }}
                    >
                        {upcoming.length} upcoming
                    </span>
                </div>
            </div>

            <div className="px-5 pb-3 space-y-2">
                {displayed.map((dl, idx) => {
                    const color =
                        dl.daysLeft <= 7
                            ? '#dc2626'
                            : dl.daysLeft <= 30
                                ? '#ca8a04'
                                : '#16a34a'
                    const bgColor =
                        dl.daysLeft <= 7
                            ? 'rgba(239,68,68,0.06)'
                            : dl.daysLeft <= 30
                                ? 'rgba(234,179,8,0.06)'
                                : 'rgba(34,197,94,0.06)'

                    return (
                        <div
                            key={`${dl.collegeId}-${dl.label}-${idx}`}
                            className="flex items-center justify-between p-3 rounded-lg transition-all"
                            style={{ backgroundColor: bgColor }}
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="flex-shrink-0">{TYPE_ICONS[dl.type]}</span>
                                <div className="min-w-0">
                                    {dl.collegeSlug ? (
                                        <Link
                                            href={`/college/${dl.collegeSlug}`}
                                            className="text-sm font-medium leading-tight hover:underline block truncate"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {dl.collegeName}
                                        </Link>
                                    ) : (
                                        <p
                                            className="text-sm font-medium leading-tight truncate"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {dl.collegeName}
                                        </p>
                                    )}
                                    <p
                                        className="text-xs mt-0.5"
                                        style={{ color: 'var(--text-faint)' }}
                                    >
                                        {dl.label}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-sm font-bold" style={{ color }}>
                                    {formatDays(dl.daysLeft)}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                                    {new Date(dl.date + 'T00:00:00').toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {upcoming.length > 6 && (
                <div className="px-5 pb-3">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs font-medium hover:underline"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        {showAll
                            ? 'Show less'
                            : `Show all ${upcoming.length} deadlines →`}
                    </button>
                </div>
            )}

            {/* Disclaimer */}
            <div
                className="px-5 py-2.5 border-t"
                style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                }}
            >
                <p className="text-xs italic flex items-center gap-1.5" style={{ color: 'var(--text-ghost)' }}>
                    <AlertTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    Please verify on the official admissions page
                </p>
            </div>
        </div>
    )
}
