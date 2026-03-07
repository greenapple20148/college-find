'use client'

import { useEffect, useState } from 'react'
import { useProfile } from '@/context/ProfileContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DollarIcon, WarningIcon, ArrowRightIcon } from '@/components/ui/Icon'
import type { Scholarship } from '@/lib/types'

function formatDeadline(d: string | null): string {
  if (!d) return 'Rolling / No deadline'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatAmount(s: Scholarship): string {
  if (s.amount_type === 'full_tuition') return 'Full tuition'
  if (s.amount_type === 'varies') return 'Varies'
  if (s.amount === null) return 'See website'
  if (s.amount_type === 'per_year') return `$${s.amount.toLocaleString()}/year`
  return `$${s.amount.toLocaleString()}`
}

function isDeadlineSoon(d: string | null): boolean {
  if (!d) return false
  const days = Math.floor((new Date(d + 'T00:00:00').getTime() - Date.now()) / 86400000)
  return days >= 0 && days < 30
}

export default function ScholarshipsPage() {
  const { profile } = useProfile()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [gpaFilter, setGpaFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [majorFilter, setMajorFilter] = useState('')

  useEffect(() => {
    if (profile) {
      setGpaFilter(profile.gpa.toString())
      if (profile.preferred_states.length === 1) {
        setStateFilter(profile.preferred_states[0])
      }
      if (profile.intended_major) {
        setMajorFilter(profile.intended_major)
      }
    }
  }, [profile])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (gpaFilter) params.set('gpa', gpaFilter)
    if (stateFilter) params.set('state', stateFilter)
    if (majorFilter) params.set('major', majorFilter)

    fetch(`/api/scholarships?${params}`)
      .then(res => res.json())
      .then(data => setScholarships(data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [gpaFilter, stateFilter, majorFilter])

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <DollarIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>
              Scholarships
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Find national and state scholarships. Eligibility is pre-filtered based on your profile.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="mb-6 p-3 rounded-xl text-sm flex items-center gap-2 border"
        style={{
          backgroundColor: 'rgba(234, 179, 8, 0.08)',
          borderColor: 'rgba(234, 179, 8, 0.2)',
          color: 'var(--text-secondary)',
        }}
      >
        <WarningIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#eab308' } as React.CSSProperties} />
        Always verify eligibility and deadlines on the scholarship provider&apos;s official website.
        This list is for informational purposes only.
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-4 mb-8 p-4 rounded-xl border transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Min GPA</label>
          <input
            type="number"
            min={0}
            max={4}
            step={0.1}
            value={gpaFilter}
            onChange={e => setGpaFilter(e.target.value)}
            placeholder="My GPA"
            className="w-28 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 transition-colors"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>State</label>
          <input
            type="text"
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="E.G. CA"
            maxLength={2}
            className="w-20 border rounded-lg px-2 py-1.5 text-sm uppercase focus:outline-none focus:ring-2 transition-colors"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Major area</label>
          <input
            type="text"
            value={majorFilter}
            onChange={e => setMajorFilter(e.target.value)}
            placeholder="e.g. Nursing"
            className="w-40 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 transition-colors"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setGpaFilter(''); setStateFilter(''); setMajorFilter('') }}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--gold-primary)' }}
          >
            Reset filters
          </button>
        </div>
        <div className="flex items-end ml-auto">
          <span className="text-sm" style={{ color: 'var(--text-faint)' }}>
            {loading ? 'Searching…' : `${scholarships.length} scholarships found`}
          </span>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-5 animate-pulse h-44"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-3">
            <DollarIcon className="w-12 h-12" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
          </div>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No scholarships match your current filters.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Try lowering your GPA filter or clearing state/major filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scholarships.map(s => (
            <div
              key={s.id}
              className="rounded-xl border p-5 flex flex-col gap-3 transition-all duration-300 card-animate-in"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-soft)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold-primary)'
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Name & amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</h3>
                  {s.provider && <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{s.provider}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold" style={{ color: 'var(--gold-primary)' }}>{formatAmount(s)}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {s.gpa_min !== null && (
                  <Badge variant="info">GPA ≥ {s.gpa_min}</Badge>
                )}
                {s.states.length > 0 ? (
                  s.states.map(st => <Badge key={st} variant="gray">{st}</Badge>)
                ) : (
                  <Badge variant="gray">All States</Badge>
                )}
                {s.majors.length > 0 && (
                  <Badge variant="gray">{s.majors.slice(0, 2).join(', ')}{s.majors.length > 2 ? '…' : ''}</Badge>
                )}
              </div>

              {/* Description */}
              {s.description && (
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{s.description}</p>
              )}

              {/* Footer / Deadline */}
              <div
                className="flex items-center justify-between pt-2"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <p
                  className="text-xs flex items-center gap-1"
                  style={{
                    color: isDeadlineSoon(s.deadline) ? '#dc2626' : 'var(--text-ghost)',
                    fontWeight: isDeadlineSoon(s.deadline) ? 600 : 400,
                  }}
                >
                  {isDeadlineSoon(s.deadline) && <WarningIcon className="w-3 h-3 flex-shrink-0" />}
                  Deadline: {formatDeadline(s.deadline)}
                </p>
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: 'var(--gold-primary)' }}
                  >
                    Apply <ArrowRightIcon className="w-3 h-3" />
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
