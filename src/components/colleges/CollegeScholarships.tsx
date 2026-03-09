'use client'

import { useEffect, useState } from 'react'
import type { Scholarship } from '@/lib/types'
import { DollarIcon, ArrowRightIcon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'

function formatAmount(s: Scholarship): string {
    if (s.amount_type === 'full_tuition') return 'Full tuition'
    if (s.amount_type === 'varies') return 'Varies'
    if (s.amount === null) return 'See website'
    if (s.amount_type === 'per_year') return `$${s.amount.toLocaleString()}/year`
    return `$${s.amount.toLocaleString()}`
}

function formatDeadline(d: string | null): string {
    if (!d) return 'Rolling / No deadline'
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    })
}

interface Props {
    collegeId: string
    collegeName: string
}

export function CollegeScholarships({ collegeId, collegeName }: Props) {
    const [scholarships, setScholarships] = useState<Scholarship[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/scholarships/by-college/${collegeId}`)
            .then(res => res.json())
            .then(data => setScholarships(data.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [collegeId])

    // Don't render anything if no scholarships
    if (!loading && scholarships.length === 0) return null

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <DollarIcon className="w-5 h-5" style={{ color: 'var(--gold-primary)' } as React.CSSProperties} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Scholarships at {collegeName}
                </h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2].map(i => (
                        <div
                            key={i}
                            className="rounded-xl border p-4 animate-pulse h-28"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scholarships.map(s => (
                        <div
                            key={s.id}
                            className="rounded-xl border p-4 transition-all duration-200 hover:border-[rgba(201,146,60,0.3)]"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: 'var(--border-subtle)',
                            }}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {s.name}
                                </h3>
                                <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--gold-primary)' }}>
                                    {formatAmount(s)}
                                </span>
                            </div>

                            {s.description && (
                                <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                                    {s.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                    {s.gpa_min !== null && <Badge variant="info">GPA ≥ {s.gpa_min}</Badge>}
                                    {s.deadline && (
                                        <span className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>
                                            Due {formatDeadline(s.deadline)}
                                        </span>
                                    )}
                                </div>
                                {s.website && (
                                    <a
                                        href={s.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                                        style={{ color: 'var(--gold-primary)' }}
                                    >
                                        Details <ArrowRightIcon className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
