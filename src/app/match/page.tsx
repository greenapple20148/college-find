'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useProfile } from '@/context/ProfileContext'
import { MatchSection } from '@/components/match/MatchSection'
import { ClipboardIcon, WarningIcon, CategoryDot, ArrowRightIcon, TargetIcon } from '@/components/ui/Icon'
import type { MatchResponse, MatchResult } from '@/lib/types'

const SESSION_KEY = 'collegematch_session_id'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export default function MatchPage() {
  const { profile, hasProfile, isLoaded } = useProfile()
  const [matchData, setMatchData] = useState<MatchResponse | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !hasProfile || !profile) return

    setLoading(true)
    setError(null)

    fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setMatchData(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [profile, hasProfile, isLoaded])

  async function handleSave(result: MatchResult) {
    const sessionId = getOrCreateSessionId()
    const college = result.college

    if (savedIds.has(college.id)) {
      setSavedIds(prev => { const n = new Set(prev); n.delete(college.id); return n })
      return
    }

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, college_id: college.id }),
      })
      if (res.ok) {
        setSavedIds(prev => new Set(prev).add(college.id))
      }
    } catch (e) {
      console.error('Save failed:', e)
    }
  }

  if (!isLoaded) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center" style={{ color: 'var(--text-faint)' }}>Loading…</div>
  }

  if (!hasProfile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="flex justify-center mb-4">
          <ClipboardIcon className="w-16 h-16" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Set up your profile first</h1>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
          We need your GPA and preferences to generate a personalized Safety / Match / Reach list.
        </p>
        <Link href="/profile" className="btn-gold">
          Create My Profile <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <TargetIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>My College Matches</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Based on GPA {profile?.gpa}
              {profile?.sat_total ? `, SAT ${profile.sat_total}` : ''}
              {profile?.act ? `, ACT ${profile.act}` : ''}
              {profile?.preferred_states?.length ? ` · ${profile.preferred_states.join(', ')}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="mb-6 p-4 rounded-xl text-sm flex gap-2 border"
        style={{
          backgroundColor: 'rgba(234, 179, 8, 0.08)',
          borderColor: 'rgba(234, 179, 8, 0.2)',
          color: 'var(--text-secondary)',
        }}
      >
        <WarningIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#eab308' } as React.CSSProperties} />
        <span>
          <strong>Important:</strong> These are statistical estimates based on publicly available data.
          They are <strong>not guarantees</strong> of admission. Actual outcomes depend on many factors
          not captured here. Always consult with a school counselor.
        </span>
      </div>

      {loading && (
        <div className="space-y-8">
          {['Safety', 'Match', 'Reach'].map(label => (
            <div key={label}>
              <div className="h-7 w-32 rounded animate-pulse mb-4" style={{ backgroundColor: 'var(--skeleton-color)' }} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-xl border p-5 animate-pulse h-52" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-xl text-sm border"
          style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-fg)' }}
        >
          {error}. Please try again or{' '}
          <Link href="/profile" className="underline">update your profile</Link>.
        </div>
      )}

      {matchData && !loading && (
        <div className="space-y-12">
          <div className="flex gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <CategoryDot category="safety" /> Safety: {matchData.counts.safety}
            </span>
            <span className="flex items-center gap-1.5">
              <CategoryDot category="match" /> Match: {matchData.counts.match}
            </span>
            <span className="flex items-center gap-1.5">
              <CategoryDot category="reach" /> Reach: {matchData.counts.reach}
            </span>
            <span style={{ color: 'var(--text-faint)' }}>Total: {matchData.counts.total} schools</span>
          </div>

          <MatchSection
            category="safety"
            results={matchData.results.safety}
            onSave={handleSave}
            savedIds={savedIds}
          />
          <MatchSection
            category="match"
            results={matchData.results.match}
            onSave={handleSave}
            savedIds={savedIds}
          />
          <MatchSection
            category="reach"
            results={matchData.results.reach}
            onSave={handleSave}
            savedIds={savedIds}
          />

          {matchData.filters_applied.states_relaxed && (
            <p className="text-sm text-amber-600 flex items-center gap-1.5">
              <WarningIcon className="w-4 h-4 flex-shrink-0" />
              Too few colleges matched your state preferences — showing results from all states.
            </p>
          )}

          <div className="pt-4 flex gap-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <Link href="/profile" className="text-sm font-medium" style={{ color: 'var(--gold-primary)' }}>
              ← Update Profile
            </Link>
            <Link href="/compare" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--gold-primary)' }}>
              Compare Selected Colleges <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
