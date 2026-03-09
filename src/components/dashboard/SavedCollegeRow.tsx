'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrashIcon } from '@/components/ui/Icon'
import type { SavedCollege, ApplicationStatus, MatchCategory } from '@/lib/types'

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'waitlisted', label: 'Waitlisted' },
]

const STATUS_STYLES: Record<ApplicationStatus, { color: string; bg: string; dot: string }> = {
  not_started: { color: 'var(--text-faint)',    bg: 'var(--bg-tertiary)',          dot: '#9ca3af' },
  in_progress: { color: '#3b82f6',              bg: 'rgba(59,130,246,0.10)',       dot: '#3b82f6' },
  submitted:   { color: 'var(--gold-primary)',  bg: 'rgba(201,146,60,0.10)',       dot: 'var(--gold-primary)' },
  accepted:    { color: '#22c55e',              bg: 'rgba(34,197,94,0.10)',        dot: '#22c55e' },
  rejected:    { color: '#ef4444',              bg: 'rgba(239,68,68,0.10)',        dot: '#ef4444' },
  waitlisted:  { color: '#eab308',              bg: 'rgba(234,179,8,0.10)',        dot: '#eab308' },
}

const CHANCE_STYLES: Record<MatchCategory, { label: string; color: string; bg: string; border: string }> = {
  safety: { label: 'Safety', color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)' },
  match:  { label: 'Match',  color: '#d97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)' },
  reach:  { label: 'Reach',  color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)' },
}

const CONTROL_ACCENT: Record<string, string> = {
  public:            'var(--gold-primary)',
  private_nonprofit: 'var(--gold-dark)',
  private_forprofit: 'var(--gold-light)',
}

function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr + 'T00:00:00').getTime() - Date.now()) / 86400000)
}

function deadlinePill(deadline: string | null): { label: string; color: string; bg: string } | null {
  if (!deadline) return null
  const days = daysUntil(deadline)
  const d = new Date(deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (days < 0)  return { label: `${d} · past`,      color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' }
  if (days === 0) return { label: 'Due today!',        color: '#dc2626', bg: 'rgba(220,38,38,0.1)' }
  if (days <= 7)  return { label: `${d} · ${days}d`,  color: '#dc2626', bg: 'rgba(220,38,38,0.1)' }
  if (days <= 30) return { label: `${d} · ${days}d`,  color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' }
  return           { label: d,                         color: '#16a34a', bg: 'rgba(22,163,74,0.1)' }
}

export interface AdmissionChance {
  probability: number
  category: MatchCategory
}

interface SavedCollegeRowProps {
  saved: SavedCollege
  onUpdate: (id: string, updates: Partial<SavedCollege>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  chance?: AdmissionChance | null
}

export function SavedCollegeRow({ saved, onUpdate, onDelete, chance }: SavedCollegeRowProps) {
  const [status, setStatus]     = useState<ApplicationStatus>(saved.status)
  const [deadline, setDeadline] = useState(saved.deadline ?? '')
  const [notes, setNotes]       = useState(saved.notes ?? '')
  const [showNotes, setShowNotes] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  const college = saved.college
  const accent  = CONTROL_ACCENT[college?.control ?? ''] ?? '#9ca3af'
  const pill    = deadlinePill(deadline || null)
  const statusStyle = STATUS_STYLES[status]
  const chanceStyle = chance ? CHANCE_STYLES[chance.category] : null

  async function handleStatusChange(v: ApplicationStatus) {
    setStatus(v)
    setSaving(true)
    try { await onUpdate(saved.id, { status: v }) } finally { setSaving(false) }
  }

  async function handleDeadlineChange(v: string) {
    setDeadline(v)
    setSaving(true)
    try { await onUpdate(saved.id, { deadline: v || null }) } finally { setSaving(false) }
  }

  async function handleNotesSave() {
    setSaving(true)
    try { await onUpdate(saved.id, { notes }) } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${college?.name ?? 'this college'} from your list?`)) return
    setDeleting(true)
    try { await onDelete(saved.id) } finally { setDeleting(false) }
  }

  return (
    <div
      className="rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Color accent bar */}
      <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />

      {/* Main content */}
      <div className="p-4">
        {/* Row 1: name + badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {college?.slug ? (
              <Link
                href={`/college/${college.slug}`}
                className="font-semibold text-sm leading-snug hover:underline line-clamp-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {college.name ?? 'Unknown College'}
              </Link>
            ) : (
              <p className="font-semibold text-sm leading-snug line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                {college?.name ?? 'Unknown College'}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              {[college?.city, college?.state].filter(Boolean).join(', ')}
              {college?.control === 'public' ? ' · Public' : college?.control ? ' · Private' : ''}
            </p>
          </div>

          {/* Right: chance badge + status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {chanceStyle && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap"
                style={{ color: chanceStyle.color, backgroundColor: chanceStyle.bg, borderColor: chanceStyle.border }}
              >
                {chanceStyle.label} · {Math.round(chance!.probability * 100)}%
              </span>
            )}
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value as ApplicationStatus)}
              className="text-xs font-medium rounded-lg px-2.5 py-1 border-0 focus:outline-none focus:ring-1 cursor-pointer"
              style={{
                color: statusStyle.color,
                backgroundColor: statusStyle.bg,
                '--tw-ring-color': 'var(--input-focus-ring)',
              } as React.CSSProperties}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: deadline + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-ghost)' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              value={deadline}
              onChange={e => handleDeadlineChange(e.target.value)}
              className="text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                '--tw-ring-color': 'var(--gold-primary)',
              } as React.CSSProperties}
            />
            {pill && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline"
                style={{ color: pill.color, backgroundColor: pill.bg }}
              >
                {pill.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNotes(n => !n)}
              className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
              style={{
                color: showNotes ? 'var(--gold-primary)' : 'var(--text-faint)',
                borderColor: showNotes ? 'rgba(201,146,60,0.3)' : 'var(--border-subtle)',
                backgroundColor: showNotes ? 'rgba(201,146,60,0.06)' : 'transparent',
              }}
            >
              {notes ? '📝 Notes' : 'Notes'}
            </button>
            {saving && (
              <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>saving…</span>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 disabled:opacity-40"
              style={{ color: '#f87171' }}
              title="Remove from list"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notes */}
        {showNotes && (
          <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes about this school…"
              rows={2}
              className="flex-1 text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--gold-primary)',
              } as React.CSSProperties}
            />
            <button
              onClick={handleNotesSave}
              disabled={saving}
              className="self-end px-3 py-2 text-sm rounded-lg font-medium disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: 'var(--gold-primary)', color: '#FAF9F6' }}
            >
              {saving ? '…' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
