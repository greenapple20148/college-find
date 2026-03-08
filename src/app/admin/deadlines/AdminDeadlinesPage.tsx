'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
    CollegeDeadline,
    DeadlineVerificationStatus,
} from '@/lib/types'
import { XIcon } from '@/components/ui/Icon'

const STATUS_OPTIONS: {
    value: DeadlineVerificationStatus
    label: string
    color: string
    bg: string
}[] = [
        {
            value: 'needs_review',
            label: 'Needs Review',
            color: '#ca8a04',
            bg: 'rgba(202,138,4,0.1)',
        },
        {
            value: 'official_verified',
            label: 'Official Verified',
            color: '#16a34a',
            bg: 'rgba(22,163,74,0.1)',
        },
        {
            value: 'commonapp_verified',
            label: 'Common App Verified',
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.1)',
        },
    ]

const DATE_FIELDS: { key: string; label: string }[] = [
    { key: 'early_action_deadline', label: 'Early Action' },
    { key: 'early_decision_1_deadline', label: 'Early Decision I' },
    { key: 'early_decision_2_deadline', label: 'Early Decision II' },
    { key: 'regular_decision_deadline', label: 'Regular Decision' },
    { key: 'transfer_fall_deadline', label: 'Transfer (Fall)' },
    { key: 'transfer_spring_deadline', label: 'Transfer (Spring)' },
    { key: 'scholarship_priority_deadline', label: 'Scholarship Priority' },
    { key: 'fafsa_priority_deadline', label: 'FAFSA Priority' },
]

function EditModal({
    deadline,
    onClose,
    onSave,
}: {
    deadline: CollegeDeadline
    onClose: () => void
    onSave: (updated: CollegeDeadline) => void
}) {
    const [form, setForm] = useState<Record<string, string | boolean | null>>({})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const initial: Record<string, string | boolean | null> = {}
        const dlRecord: Record<string, unknown> = { ...deadline }
        DATE_FIELDS.forEach(f => {
            initial[f.key] = (dlRecord[f.key] as string | null) ?? ''
        })
        initial.rolling_admission = deadline.rolling_admission
        initial.verification_status = deadline.verification_status
        initial.source_url = deadline.source_url ?? ''
        initial.source_type = deadline.source_type
        initial.admin_notes = deadline.admin_notes ?? ''
        setForm(initial)
    }, [deadline])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)

        // Clean dates — turn empty strings into null
        const payload: Record<string, unknown> = {}
        DATE_FIELDS.forEach(f => {
            const val = form[f.key]
            payload[f.key] = val && typeof val === 'string' && val.trim() ? val.trim() : null
        })
        payload.rolling_admission = form.rolling_admission
        payload.verification_status = form.verification_status
        payload.source_url = form.source_url
        payload.source_type = form.source_type
        payload.admin_notes = form.admin_notes

        try {
            const res = await fetch(`/api/deadlines/${deadline.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Failed to save')
                return
            }
            onSave(data)
        } catch {
            setError('Network error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2
                            className="text-lg font-bold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Edit Deadlines
                        </h2>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
                            {deadline.college?.name ?? 'Unknown College'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-faint)',
                        }}
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date fields */}
                    <div className="grid grid-cols-2 gap-3">
                        {DATE_FIELDS.map(f => (
                            <div key={f.key}>
                                <label
                                    className="block text-xs font-medium mb-1"
                                    style={{ color: 'var(--text-faint)' }}
                                >
                                    {f.label}
                                </label>
                                <input
                                    type="date"
                                    value={(form[f.key] as string) ?? ''}
                                    onChange={e =>
                                        setForm(prev => ({ ...prev, [f.key]: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--input-border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Rolling admission */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!form.rolling_admission}
                            onChange={e =>
                                setForm(prev => ({
                                    ...prev,
                                    rolling_admission: e.target.checked,
                                }))
                            }
                            className="w-4 h-4 rounded"
                            style={{ accentColor: 'var(--gold-primary)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Rolling Admissions
                        </span>
                    </label>

                    {/* Source URL */}
                    <div>
                        <label
                            className="block text-xs font-medium mb-1"
                            style={{ color: 'var(--text-faint)' }}
                        >
                            Source URL
                        </label>
                        <input
                            type="url"
                            value={(form.source_url as string) ?? ''}
                            onChange={e =>
                                setForm(prev => ({ ...prev, source_url: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--text-primary)',
                            }}
                            placeholder="https://admissions.example.edu/apply"
                        />
                    </div>

                    {/* Source type + verification */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                className="block text-xs font-medium mb-1"
                                style={{ color: 'var(--text-faint)' }}
                            >
                                Source Type
                            </label>
                            <select
                                value={(form.source_type as string) ?? 'official'}
                                onChange={e =>
                                    setForm(prev => ({ ...prev, source_type: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--input-border)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                <option value="official">Official</option>
                                <option value="commonapp">Common App</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div>
                            <label
                                className="block text-xs font-medium mb-1"
                                style={{ color: 'var(--text-faint)' }}
                            >
                                Verification Status
                            </label>
                            <select
                                value={(form.verification_status as string) ?? 'needs_review'}
                                onChange={e =>
                                    setForm(prev => ({
                                        ...prev,
                                        verification_status: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--input-border)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Admin notes */}
                    <div>
                        <label
                            className="block text-xs font-medium mb-1"
                            style={{ color: 'var(--text-faint)' }}
                        >
                            Admin Notes
                        </label>
                        <textarea
                            value={(form.admin_notes as string) ?? ''}
                            onChange={e =>
                                setForm(prev => ({ ...prev, admin_notes: e.target.value }))
                            }
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--text-primary)',
                            }}
                            placeholder="Internal notes about this deadline record..."
                        />
                    </div>

                    {error && (
                        <div
                            className="px-4 py-2 rounded-lg text-sm"
                            style={{
                                backgroundColor: 'var(--error-bg)',
                                border: `1px solid var(--error-border)`,
                                color: 'var(--error-fg)',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
                                color: '#FAF9F6',
                                opacity: saving ? 0.6 : 1,
                            }}
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function AdminDeadlinesPage() {
    const [deadlines, setDeadlines] = useState<CollegeDeadline[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [editing, setEditing] = useState<CollegeDeadline | null>(null)
    const [page, setPage] = useState(0)
    const limit = 20

    const fetchData = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(page * limit),
            cycle_year: '2026',
        })
        if (statusFilter !== 'all') {
            params.set('status', statusFilter)
        }

        try {
            const res = await fetch(`/api/deadlines?${params}`)
            const json = await res.json()
            if (res.ok) {
                setDeadlines(json.data ?? [])
                setTotal(json.total ?? 0)
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    function handleSave(updated: CollegeDeadline) {
        setDeadlines(prev =>
            prev.map(d => (d.id === updated.id ? { ...d, ...updated } : d))
        )
        setEditing(null)
    }

    const totalPages = Math.ceil(total / limit)

    function getStatusBadge(status: string) {
        const opt = STATUS_OPTIONS.find(s => s.value === status)
        if (!opt) return null
        return (
            <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: opt.bg, color: opt.color }}
            >
                {opt.label}
            </span>
        )
    }

    function formatDate(d: string | null): string {
        if (!d) return '—'
        return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold heading-serif"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Deadline Admin
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                        Review, verify, and edit college application deadlines —{' '}
                        <span className="font-medium">{total} records</span>
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {[{ value: 'all', label: 'All' }, ...STATUS_OPTIONS].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setStatusFilter(opt.value)
                                setPage(0)
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                                backgroundColor:
                                    statusFilter === opt.value
                                        ? 'rgba(201,146,60,0.15)'
                                        : 'var(--bg-tertiary)',
                                color:
                                    statusFilter === opt.value
                                        ? 'var(--gold-primary)'
                                        : 'var(--text-faint)',
                                border: `1px solid ${statusFilter === opt.value ? 'rgba(201,146,60,0.3)' : 'var(--border-subtle)'}`,
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div
                className="rounded-xl border overflow-hidden"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-subtle)',
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderBottom: '1px solid var(--border-subtle)',
                                }}
                            >
                                {['College', 'EA', 'ED1', 'ED2', 'RD', 'Rolling', 'Source', 'Status', 'Verified', ''].map(
                                    (h, i) => (
                                        <th
                                            key={i}
                                            className="px-3 py-2.5 text-left font-medium text-xs whitespace-nowrap"
                                            style={{ color: 'var(--text-faint)' }}
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 10 }).map((_, j) => (
                                            <td key={j} className="px-3 py-3">
                                                <div
                                                    className="h-4 rounded animate-pulse"
                                                    style={{
                                                        backgroundColor: 'var(--skeleton-color)',
                                                        width: j === 0 ? '140px' : '50px',
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : deadlines.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="text-center py-12 text-sm"
                                        style={{ color: 'var(--text-faint)' }}
                                    >
                                        No deadline records found.
                                    </td>
                                </tr>
                            ) : (
                                deadlines.map(dl => (
                                    <tr
                                        key={dl.id}
                                        className="transition-colors"
                                        style={{
                                            borderBottom: '1px solid var(--border-subtle)',
                                        }}
                                        onMouseEnter={e =>
                                        (e.currentTarget.style.backgroundColor =
                                            'var(--bg-surface-hover)')
                                        }
                                        onMouseLeave={e =>
                                            (e.currentTarget.style.backgroundColor = 'transparent')
                                        }
                                    >
                                        <td className="px-3 py-3">
                                            <div>
                                                <p
                                                    className="font-medium text-sm leading-tight"
                                                    style={{ color: 'var(--text-primary)' }}
                                                >
                                                    {dl.college?.name ?? 'Unknown'}
                                                </p>
                                                <p
                                                    className="text-xs"
                                                    style={{ color: 'var(--text-ghost)' }}
                                                >
                                                    {dl.college?.state}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {formatDate(dl.early_action_deadline)}
                                        </td>
                                        <td className="px-3 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {formatDate(dl.early_decision_1_deadline)}
                                        </td>
                                        <td className="px-3 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {formatDate(dl.early_decision_2_deadline)}
                                        </td>
                                        <td className="px-3 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {formatDate(dl.regular_decision_deadline)}
                                        </td>
                                        <td className="px-3 py-3">
                                            {dl.rolling_admission ? (
                                                <span
                                                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                    style={{
                                                        backgroundColor: 'rgba(34,197,94,0.1)',
                                                        color: '#16a34a',
                                                    }}
                                                >
                                                    Yes
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-ghost)' }}>—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span
                                                className="text-xs px-2 py-0.5 rounded capitalize"
                                                style={{
                                                    backgroundColor: 'var(--bg-tertiary)',
                                                    color: 'var(--text-faint)',
                                                }}
                                            >
                                                {dl.source_type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            {getStatusBadge(dl.verification_status)}
                                        </td>
                                        <td
                                            className="px-3 py-3 text-xs"
                                            style={{ color: 'var(--text-ghost)' }}
                                        >
                                            {dl.last_verified_at
                                                ? new Date(dl.last_verified_at).toLocaleDateString(
                                                    'en-US',
                                                    { month: 'short', day: 'numeric' }
                                                )
                                                : '—'}
                                        </td>
                                        <td className="px-3 py-3">
                                            <button
                                                onClick={() => setEditing(dl)}
                                                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                                style={{
                                                    backgroundColor: 'rgba(201,146,60,0.12)',
                                                    color: 'var(--gold-primary)',
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div
                        className="flex items-center justify-between px-4 py-3 border-t"
                        style={{ borderColor: 'var(--border-subtle)' }}
                    >
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color:
                                    page === 0 ? 'var(--text-ghost)' : 'var(--text-secondary)',
                                cursor: page === 0 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            ← Previous
                        </button>
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color:
                                    page >= totalPages - 1
                                        ? 'var(--text-ghost)'
                                        : 'var(--text-secondary)',
                                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editing && (
                <EditModal
                    deadline={editing}
                    onClose={() => setEditing(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}
