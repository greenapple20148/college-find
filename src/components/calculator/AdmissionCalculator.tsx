'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { estimateAdmissionChance } from '@/lib/matching'
import { MAJOR_OPTIONS } from '@/lib/types'
import { useSubscription } from '@/hooks/useSubscription'
import type { College, StudentProfile, MatchCategory } from '@/lib/types'

interface AdmissionCalculatorProps {
  college?: College
  defaultGpa?: number
  defaultSat?: number | null
  defaultMajor?: string | null
  mode?: 'single' | 'top-matches'
}

const CATEGORY_COLORS: Record<MatchCategory, { bg: string; text: string; label: string }> = {
  safety: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', label: 'Safety' },
  match: { bg: 'rgba(96, 165, 250, 0.15)', text: '#60a5fa', label: 'Match' },
  reach: { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', label: 'Reach' },
}

interface TopMatchResult {
  college: College
  probability: number
  category: MatchCategory
}

export function AdmissionCalculator({
  college,
  defaultGpa,
  defaultSat,
  defaultMajor,
  mode = 'single',
}: AdmissionCalculatorProps) {
  const [gpa, setGpa] = useState(defaultGpa ?? 3.5)
  const [sat, setSat] = useState<string>(defaultSat ? String(defaultSat) : '')
  const [major, setMajor] = useState(defaultMajor ?? '')
  const [result, setResult] = useState<ReturnType<typeof estimateAdmissionChance> | null>(null)
  const [topResults, setTopResults] = useState<TopMatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { canAccess } = useSubscription()

  // Pre-fill from localStorage profile on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('collegefind_profile')
      if (stored) {
        const profile = JSON.parse(stored) as Partial<StudentProfile>
        if (profile.gpa && defaultGpa === undefined) setGpa(profile.gpa)
        if (profile.sat_total && defaultSat === undefined) setSat(String(profile.sat_total))
        if (profile.intended_major && defaultMajor === undefined) setMajor(profile.intended_major)
      }
    } catch {
      // ignore parse errors
    }
  }, [defaultGpa, defaultSat, defaultMajor])

  function buildStudent(): StudentProfile {
    const satVal = sat ? parseInt(sat, 10) : null
    return {
      gpa,
      sat_total: satVal && !isNaN(satVal) ? satVal : null,
      act: null,
      intended_major: major || null,
      preferred_states: [],
      budget_max: null,
      campus_size: 'any',
    }
  }

  function calculateSingle() {
    if (!college) return
    const student = buildStudent()
    const res = estimateAdmissionChance(student, college)
    setResult(res)
    setHasCalculated(true)
  }

  async function calculateTopMatches() {
    setLoading(true)
    setHasCalculated(true)
    try {
      const student = buildStudent()
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      })
      const data = await res.json()
      const all: TopMatchResult[] = [
        ...(data.results?.safety ?? []),
        ...(data.results?.match ?? []),
        ...(data.results?.reach ?? []),
      ].slice(0, 12).map((r: { college: College; probability: number; category: MatchCategory }) => ({
        college: r.college,
        probability: r.probability,
        category: r.category,
      }))
      setTopResults(all)
    } catch {
      // error silently
    } finally {
      setLoading(false)
    }
  }

  function handleCalculate() {
    if (!canAccess('admission_predictor')) {
      setShowUpgrade(true)
      return
    }
    setShowUpgrade(false)
    if (mode === 'single') {
      calculateSingle()
    } else {
      calculateTopMatches()
    }
  }

  const colors = result ? CATEGORY_COLORS[result.category] : null

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
        Estimate Your Admission Chance
      </h3>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* GPA */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            GPA (0.0 – 4.0)
          </label>
          <input
            type="number"
            min="0"
            max="4.0"
            step="0.1"
            value={gpa}
            onChange={e => setGpa(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* SAT */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            SAT Score (optional)
          </label>
          <input
            type="number"
            min="400"
            max="1600"
            step="10"
            value={sat}
            onChange={e => setSat(e.target.value)}
            placeholder="e.g. 1200"
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Major */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Intended Major (optional)
          </label>
          <select
            value={major}
            onChange={e => setMajor(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
              color: major ? 'var(--text-primary)' : 'var(--text-ghost)',
            }}
          >
            <option value="">Any major</option>
            {MAJOR_OPTIONS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary, #b8862a))',
          color: '#0a0a0a',
        }}
      >
        {loading ? 'Calculating…' : 'Calculate My Chances'}
      </button>

      {/* Upgrade prompt */}
      {showUpgrade && (
        <div
          className="rounded-lg p-5 border text-center"
          style={{ backgroundColor: 'rgba(201,146,60,0.08)', borderColor: 'rgba(201,146,60,0.3)' }}
        >
          <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--gold-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
          </svg>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Upgrade to Pro</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Admission chance predictions are available on the Pro plan.</p>
          <Link href="/pricing" className="inline-block px-5 py-2 rounded-lg text-xs font-semibold" style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))', color: '#fff' }}>
            View Plans →
          </Link>
        </div>
      )}

      {/* Single college result */}
      {mode === 'single' && hasCalculated && result && colors && (
        <div
          className="rounded-lg p-4 border space-y-3"
          style={{ backgroundColor: colors.bg, borderColor: colors.text + '40' }}
        >
          <div className="flex items-center gap-3">
            {/* Probability circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border-2"
              style={{ borderColor: colors.text, backgroundColor: colors.bg }}
            >
              <span className="text-lg font-bold" style={{ color: colors.text }}>
                {Math.round(result.probability * 100)}%
              </span>
            </div>
            <div>
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1"
                style={{ backgroundColor: colors.text + '25', color: colors.text }}
              >
                {colors.label}
              </span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Estimated admission probability
              </p>
            </div>
          </div>

          {/* Probability bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${result.probability * 100}%`, backgroundColor: colors.text }}
            />
          </div>

          {/* Explanation */}
          <ul className="space-y-1">
            {result.explanation.map((line, i) => (
              <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: colors.text }}>•</span>
                {line}
              </li>
            ))}
          </ul>

          <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
            Disclaimer: Estimates only. Does not account for essays, recommendations, or extracurriculars.
          </p>
        </div>
      )}

      {/* Top matches result */}
      {mode === 'top-matches' && hasCalculated && !loading && topResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Your top matches:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topResults.map(r => {
              const c = CATEGORY_COLORS[r.category]
              return (
                <a
                  key={r.college.id}
                  href={r.college.slug ? `/college/${r.college.slug}` : '#'}
                  className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:border-[var(--gold-primary)]"
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {Math.round(r.probability * 100)}%
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {r.college.name}
                    </p>
                    <p className="text-xs" style={{ color: c.text }}>{c.label}</p>
                  </div>
                </a>
              )
            })}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
            Disclaimer: Estimates only. Does not account for essays, recommendations, or extracurriculars.
          </p>
        </div>
      )}
    </div>
  )
}
