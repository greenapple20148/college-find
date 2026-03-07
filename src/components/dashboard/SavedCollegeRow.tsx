'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TrashIcon } from '@/components/ui/Icon'
import type { SavedCollege, ApplicationStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'waitlisted', label: 'Waitlisted' },
]

const STATUS_COLORS: Record<ApplicationStatus, { color: string; bg: string }> = {
  not_started: { color: 'var(--text-faint)', bg: 'var(--bg-tertiary)' },
  in_progress: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  submitted: { color: 'var(--gold-primary)', bg: 'rgba(201,146,60,0.12)' },
  accepted: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  waitlisted: { color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
}

function deadlineColor(deadline: string | null): string {
  if (!deadline) return 'var(--text-ghost)'
  const days = Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'var(--text-ghost)'
  if (days < 7) return '#dc2626'
  if (days < 30) return '#ca8a04'
  return '#16a34a'
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline'
  return new Date(deadline + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

interface SavedCollegeRowProps {
  saved: SavedCollege
  onUpdate: (id: string, updates: Partial<SavedCollege>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SavedCollegeRow({ saved, onUpdate, onDelete }: SavedCollegeRowProps) {
  const [status, setStatus] = useState<ApplicationStatus>(saved.status)
  const [deadline, setDeadline] = useState(saved.deadline ?? '')
  const [notes, setNotes] = useState(saved.notes ?? '')
  const [showNotes, setShowNotes] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const college = saved.college

  async function handleStatusChange(newStatus: ApplicationStatus) {
    setStatus(newStatus)
    setSaving(true)
    try { await onUpdate(saved.id, { status: newStatus }) } finally { setSaving(false) }
  }

  async function handleDeadlineChange(newDate: string) {
    setDeadline(newDate)
    setSaving(true)
    try { await onUpdate(saved.id, { deadline: newDate || null }) } finally { setSaving(false) }
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

  const statusStyle = STATUS_COLORS[status]
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-soft)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{college?.name ?? 'Unknown College'}</h3>
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            {college?.city && college?.state ? `${college.city}, ${college.state}` : college?.state ?? ''}
            {college?.control === 'public' ? ' · Public' : college?.control ? ' · Private' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Deadline:</label>
          <input type="date" value={deadline} onChange={e => handleDeadlineChange(e.target.value)}
            className="text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 transition-colors"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties} />
          {deadline && <span className="text-xs font-medium" style={{ color: deadlineColor(deadline) }}>{formatDeadline(deadline)}</span>}
        </div>

        <select value={status} onChange={e => handleStatusChange(e.target.value as ApplicationStatus)}
          className="text-sm rounded-lg px-3 py-1.5 border-0 font-medium focus:outline-none focus:ring-2"
          style={{ color: statusStyle.color, backgroundColor: statusStyle.bg, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}>
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotes(n => !n)} className="text-xs border rounded-lg px-2 py-1 transition-colors"
            style={{ color: 'var(--text-faint)', borderColor: 'var(--border-primary)' }}>
            {showNotes ? 'Hide notes' : 'Notes'}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="text-red-400 hover:text-red-600 disabled:opacity-50 p-1" title="Remove from list">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes…" rows={2}
            className="flex-1 text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 transition-colors"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties} />
          <button onClick={handleNotesSave} disabled={saving}
            className="px-3 py-2 text-sm rounded-lg disabled:opacity-50 font-medium transition-colors"
            style={{ backgroundColor: 'var(--gold-primary)', color: '#FAF9F6' }}>
            {saving ? '…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
