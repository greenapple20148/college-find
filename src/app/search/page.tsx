'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { CollegeFilters, type FilterState } from '@/components/colleges/CollegeFilters'
import { CollegeGrid } from '@/components/colleges/CollegeGrid'
import { SearchIcon } from '@/components/ui/Icon'
import type { College, CollegesApiResponse } from '@/lib/types'

const DEFAULT_FILTERS: FilterState = {
  q: '',
  state: '',
  control: '',
  size: '',
  major: '',
  tuition_max: '',
  acceptance_min: '',
  acceptance_max: '',
}

const LIMIT = 21

type SortKey = 'name' | 'tuition_low' | 'tuition_high' | 'acceptance_low' | 'acceptance_high' | 'graduation' | 'earnings'
type ViewMode = 'grid' | 'list'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'tuition_low', label: 'Tuition (Low → High)' },
  { value: 'tuition_high', label: 'Tuition (High → Low)' },
  { value: 'acceptance_low', label: 'Most Selective' },
  { value: 'acceptance_high', label: 'Least Selective' },
  { value: 'graduation', label: 'Graduation Rate' },
  { value: 'earnings', label: 'Highest Earnings' },
]

function getFilterLabel(key: string, value: string): string {
  switch (key) {
    case 'q': return `"${value}"`
    case 'state': return value
    case 'control':
      if (value === 'public') return 'Public'
      if (value === 'private_nonprofit') return 'Private Non-Profit'
      if (value === 'private_forprofit') return 'Private For-Profit'
      return value
    case 'size':
      if (value === 'small') return 'Small'
      if (value === 'medium') return 'Medium'
      if (value === 'large') return 'Large'
      return value
    case 'tuition_max': return `≤ $${parseInt(value).toLocaleString()}`
    case 'acceptance_min': return `≥ ${value}% acceptance`
    case 'acceptance_max': return `≤ ${value}% acceptance`
    case 'major': return value
    default: return value
  }
}

export default function SearchPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [colleges, setColleges] = useState<College[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchColleges = useCallback(async (f: FilterState, off: number) => {
    setLoading(true)
    setFetchError(null)
    const params = new URLSearchParams()
    if (f.q) params.set('q', f.q)
    if (f.state) params.set('state', f.state)
    if (f.control) params.set('control', f.control)
    if (f.size) params.set('size', f.size)
    if (f.major) params.set('major', f.major)
    if (f.tuition_max) params.set('tuition_max', f.tuition_max)
    if (f.acceptance_min) params.set('acceptance_min', f.acceptance_min)
    if (f.acceptance_max) params.set('acceptance_max', f.acceptance_max)
    params.set('limit', String(LIMIT))
    params.set('offset', String(off))

    try {
      const res = await fetch(`/api/colleges?${params}`)
      const text = await res.text()
      let json: CollegesApiResponse
      try {
        json = JSON.parse(text)
      } catch {
        console.error('[search] Non-JSON response:', text.slice(0, 200))
        setFetchError('Server error. Check that your environment variables are set and the database is seeded.')
        return
      }
      if (!res.ok || (json as any).error) {
        setFetchError((json as any).error ?? `Request failed (${res.status})`)
        return
      }
      if (off === 0) {
        setColleges(json.data ?? [])
      } else {
        setColleges(prev => [...prev, ...(json.data ?? [])])
      }
      setTotal(json.total ?? 0)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setOffset(0)
      fetchColleges(filters, 0)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [filters, fetchColleges])

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
  }

  function handleLoadMore() {
    const newOffset = offset + LIMIT
    setOffset(newOffset)
    fetchColleges(filters, newOffset)
  }

  function removeFilter(key: keyof FilterState) {
    setFilters(prev => ({ ...prev, [key]: '' }))
  }

  const sortedColleges = [...colleges].sort((a, b) => {
    switch (sortBy) {
      case 'tuition_low':
        return (a.tuition_out_state ?? Infinity) - (b.tuition_out_state ?? Infinity)
      case 'tuition_high':
        return (b.tuition_out_state ?? -Infinity) - (a.tuition_out_state ?? -Infinity)
      case 'acceptance_low':
        return (a.acceptance_rate ?? Infinity) - (b.acceptance_rate ?? Infinity)
      case 'acceptance_high':
        return (b.acceptance_rate ?? -Infinity) - (a.acceptance_rate ?? -Infinity)
      case 'graduation':
        return (b.graduation_rate ?? -Infinity) - (a.graduation_rate ?? -Infinity)
      case 'earnings':
        return (b.median_earnings ?? -Infinity) - (a.median_earnings ?? -Infinity)
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const hasMore = colleges.length < total

  const activeFilters = Object.entries(filters).filter(([, v]) => v) as [keyof FilterState, string][]

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* ─── Hero Header ─────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))', boxShadow: 'var(--shadow-glow)' }}
          >
            <SearchIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>
              Search Colleges
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Browse and filter 6,000+ U.S. institutions
            </p>
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" /></svg>
            Filters
            {activeFilters.length > 0 && (
              <span
                className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--gold-primary)', color: '#FAF9F6' }}
              >
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Active filter pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: 'rgba(201,146,60,0.1)',
                    color: 'var(--gold-primary)',
                    borderColor: 'rgba(201,146,60,0.2)',
                  }}
                >
                  {getFilterLabel(key, value)}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-xs whitespace-nowrap" style={{ color: 'var(--text-ghost)' }}>Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
                // @ts-ignore
                '--tw-ring-color': 'var(--input-focus-ring)',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 transition-colors"
              style={{
                backgroundColor: viewMode === 'grid' ? 'rgba(201,146,60,0.15)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--gold-primary)' : 'var(--text-ghost)',
              }}
              title="Grid view"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 transition-colors"
              style={{
                borderLeft: '1px solid var(--border-primary)',
                backgroundColor: viewMode === 'list' ? 'rgba(201,146,60,0.15)' : 'transparent',
                color: viewMode === 'list' ? 'var(--gold-primary)' : 'var(--text-ghost)',
              }}
              title="List view"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ────────────────── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className={`w-full md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div
            className="sticky top-24 rounded-xl border p-5 transition-colors duration-300"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <CollegeFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
              total={total}
              loading={loading}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {fetchError && (
            <div
              className="mb-4 p-4 rounded-xl text-sm flex items-center gap-3 border"
              style={{
                backgroundColor: 'var(--error-bg)',
                borderColor: 'var(--error-border)',
                color: 'var(--error-fg)',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              {fetchError}
            </div>
          )}

          <CollegeGrid
            colleges={sortedColleges}
            loading={loading && offset === 0}
            emptyMessage="No colleges match your filters."
            viewMode={viewMode}
          />

          {hasMore && !loading && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="group px-8 py-3 rounded-xl border text-sm font-medium transition-all duration-300"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--gold-primary)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span className="flex items-center gap-2">
                  Load more
                  <span style={{ color: 'var(--text-ghost)' }}>
                    ({(total - colleges.length).toLocaleString()} remaining)
                  </span>
                </span>
              </button>
            </div>
          )}

          {loading && offset > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-faint)' }}>
              <span
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(201,146,60,0.3)', borderTopColor: 'var(--gold-primary)' }}
              />
              Loading more…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
