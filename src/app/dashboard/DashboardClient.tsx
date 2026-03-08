'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SavedCollege, UserProfile, College, ApplicationStatus } from '@/lib/types'
import { estimateAdmissionChance } from '@/lib/matching'
import { useProfile } from '@/context/ProfileContext'
import { useSubscription } from '@/hooks/useSubscription'
import { SavedCollegeRow } from '@/components/dashboard/SavedCollegeRow'
import { EnhancedDeadlineTracker } from '@/components/dashboard/EnhancedDeadlineTracker'
import { ApplicationChecklist } from '@/components/dashboard/ApplicationChecklist'
import { ClipboardIcon, HeartIcon, ArrowRightIcon } from '@/components/ui/Icon'

const STATUS_OPTIONS: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'not_started', label: 'Not Started', color: 'var(--text-faint)' },
  { key: 'in_progress', label: 'In Progress', color: '#60a5fa' },
  { key: 'submitted', label: 'Submitted', color: 'var(--gold-primary)' },
  { key: 'accepted', label: 'Accepted', color: '#4ade80' },
  { key: 'rejected', label: 'Rejected', color: '#f87171' },
  { key: 'waitlisted', label: 'Waitlisted', color: '#facc15' },
]

interface Props {
  saved: SavedCollege[]
  profile: UserProfile | null
  userEmail: string
}

export function DashboardClient({ saved: initialSaved, profile, userEmail }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const { profile: localProfile } = useProfile()
  const { limits, isPro, planLabel } = useSubscription()
  const [exporting, setExporting] = useState(false)

  // Build StudentProfile: prefer DB profile, fall back to localStorage profile
  const studentProfile = (() => {
    if (profile) {
      return {
        gpa: profile.gpa ?? 3.0,
        sat_total: profile.sat_score ?? null,
        act: profile.act_score ?? null,
        intended_major: profile.major ?? null,
        preferred_states: profile.preferred_states ?? [],
        budget_max: profile.budget_max ?? null,
        campus_size: profile.campus_size ?? 'any',
      }
    }
    if (localProfile) return localProfile
    return null
  })()

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

  function getProbability(college: College) {
    if (!studentProfile) return null
    return estimateAdmissionChance(studentProfile, college)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))', boxShadow: 'var(--shadow-glow)' }}
          >
            <ClipboardIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>My Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>{userEmail}</p>
          </div>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-24">
          <div className="flex justify-center mb-4">
            <HeartIcon className="w-16 h-16" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No saved colleges yet</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            Use the Save button on college cards to start building your list.
          </p>
          <Link href="/search" className="btn-gold inline-flex items-center gap-2">
            Browse Colleges <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* College list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                My College List ({saved.length})
              </h2>
              <div className="flex items-center gap-3">
                {isPro ? (
                  <button
                    onClick={async () => {
                      setExporting(true)
                      try {
                        const res = await fetch('/api/saved/export')
                        if (res.ok) {
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `college-list-${new Date().toISOString().slice(0, 10)}.csv`
                          a.click()
                          URL.revokeObjectURL(url)
                        }
                      } finally { setExporting(false) }
                    }}
                    disabled={exporting}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:border-[rgba(201,146,60,0.3)]"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--gold-primary)' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {exporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:border-[rgba(201,146,60,0.3)]"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-faint)' }}
                    title="Upgrade to Student Pro to export"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Export CSV
                  </Link>
                )
                }
                {!studentProfile && (
                  <Link href="/profile" className="text-xs hover:underline" style={{ color: 'var(--gold-primary)' }}>
                    Set GPA/SAT to see admission chances →
                  </Link>
                )}
              </div>
            </div>

            {saved.map(s => {
              const chance = s.college ? getProbability(s.college) : null
              return (
                <SavedCollegeRow
                  key={s.id}
                  saved={s}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  chance={chance ?? undefined}
                />
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Plan indicator */}
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Your Plan</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: isPro ? 'var(--gold-primary)' : 'var(--text-primary)' }}>
                    {planLabel}
                  </p>
                </div>
                {isPro ? (
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(201,146,60,0.15)', color: 'var(--gold-primary)' }}
                  >
                    Active
                  </span>
                ) : (
                  <Link
                    href="/pricing"
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}
                  >
                    Upgrade
                  </Link>
                )}
              </div>
              {!isPro && (
                <p className="text-[11px] mt-2" style={{ color: 'var(--text-ghost)' }}>
                  Upgrade to unlock unlimited saves, export, AI advisor, and essay tools.
                </p>
              )}
            </div>

            <EnhancedDeadlineTracker savedColleges={saved} />

            <ApplicationChecklist savedColleges={saved} />

            {/* Status summary */}
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Application Status</h3>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(({ key, label, color }) => {
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

            {/* Quick links */}
            <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Quick Links</h3>
              <Link href="/profile" className="block text-sm hover:underline" style={{ color: 'var(--gold-primary)' }}>
                Update my profile →
              </Link>
              <Link href="/search" className="block text-sm hover:underline" style={{ color: 'var(--gold-primary)' }}>
                Browse more colleges →
              </Link>
              <Link href="/match" className="block text-sm hover:underline" style={{ color: 'var(--gold-primary)' }}>
                Get personalized matches →
              </Link>
              <Link href="/resume" className="block text-sm hover:underline" style={{ color: 'var(--gold-primary)' }}>
                Build activity resume →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
