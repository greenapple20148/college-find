'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SavedCollegeRow } from '@/components/dashboard/SavedCollegeRow'
import { DeadlineTracker } from '@/components/dashboard/DeadlineTracker'
import { ClipboardIcon, HeartIcon, ArrowRightIcon } from '@/components/ui/Icon'
import type { SavedCollege } from '@/lib/types'

const SESSION_KEY = 'collegefind_session_id'

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SESSION_KEY)
}

export default function DashboardPage() {
  const [saved, setSaved] = useState<SavedCollege[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = getSessionId()
    if (!sessionId) {
      setLoading(false)
      return
    }

    fetch(`/api/saved?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setSaved(data.data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpdate(id: string, updates: Partial<SavedCollege>) {
    const res = await fetch(`/api/saved/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      setSaved(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/saved/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSaved(prev => prev.filter(s => s.id !== id))
    }
  }

  const hasSession = !!getSessionId()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" style={{ color: 'var(--text-faint)' }}>
        Loading your college list…
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <ClipboardIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>My Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>Track your saved colleges and application deadlines.</p>
          </div>
        </div>
      </div>

      {!hasSession && (
        <div className="text-center py-24">
          <div className="flex justify-center mb-4">
            <ClipboardIcon className="w-16 h-16" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No saved colleges yet</h2>
          <p className="mb-6 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
            Use the <HeartIcon className="w-4 h-4 inline" style={{ color: 'var(--text-faint)' } as React.CSSProperties} /> Save button on college cards to start building your list.
          </p>
          <Link
            href="/search"
            className="btn-gold"
          >
            Browse Colleges <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      )}

      {hasSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* College list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              My College List ({saved.length})
            </h2>

            {error && (
              <div
                className="p-4 rounded-xl text-sm border"
                style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-fg)' }}
              >
                {error}
              </div>
            )}

            {!error && saved.length === 0 && (
              <div className="py-12 text-center" style={{ color: 'var(--text-faint)' }}>
                <p>No saved colleges yet.</p>
                <Link href="/search" className="text-sm mt-2 block" style={{ color: 'var(--gold-primary)' }}>
                  Browse and save colleges
                </Link>
              </div>
            )}

            {saved.map(s => (
              <SavedCollegeRow
                key={s.id}
                saved={s}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Deadline tracker */}
          <div className="space-y-4">
            <DeadlineTracker savedColleges={saved} />

            {/* Status summary */}
            {saved.length > 0 && (
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
              >
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Application Status</h3>
                <div className="space-y-2">
                  {[
                    { key: 'not_started', label: 'Not Started', color: 'var(--text-faint)' },
                    { key: 'in_progress', label: 'In Progress', color: '#60a5fa' },
                    { key: 'submitted', label: 'Submitted', color: 'var(--gold-primary)' },
                    { key: 'accepted', label: 'Accepted', color: '#4ade80' },
                    { key: 'rejected', label: 'Rejected', color: '#f87171' },
                    { key: 'waitlisted', label: 'Waitlisted', color: '#facc15' },
                  ].map(({ key, label, color }) => {
                    const count = saved.filter(s => s.status === key).length
                    if (count === 0) return null
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                        </div>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
