'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/Select'
import { SearchIcon } from '@/components/ui/Icon'
import { US_STATES, MAJOR_OPTIONS } from '@/lib/types'

export interface FilterState {
  q: string
  state: string
  control: string
  size: string
  major: string
  tuition_max: string
  acceptance_min: string
  acceptance_max: string
}

interface CollegeFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onReset: () => void
  total: number
  loading: boolean
}

const stateOptions = [
  { value: '', label: 'All States' },
  ...US_STATES.map(s => ({ value: s.code, label: `${s.code} — ${s.name}` })),
]

const majorOptions = [
  { value: '', label: 'All Majors' },
  ...MAJOR_OPTIONS.filter(m => m !== 'Undecided').map(m => ({ value: m, label: m })),
]

export function CollegeFilters({ filters, onChange, onReset, total, loading }: CollegeFiltersProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    search: true,
    location: true,
    type: true,
    major: false,
    cost: false,
    selectivity: false,
  })

  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  function toggle(section: string) {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const activeCount = [
    filters.q,
    filters.state,
    filters.control,
    filters.size,
    filters.major,
    filters.tuition_max,
    filters.acceptance_min,
    filters.acceptance_max,
  ].filter(Boolean).length

  return (
    <aside className="flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h2>
          {activeCount > 0 && (
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: 'var(--gold-primary)', color: '#FAF9F6' }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--gold-primary)' }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <FilterSection title="Search" expanded={expanded.search} onToggle={() => toggle('search')} icon="search">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
          <input
            type="text"
            placeholder="e.g. University of Michigan"
            value={filters.q}
            onChange={e => update('q', e.target.value)}
            className="block w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors duration-200"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-primary)',
              // @ts-ignore
              '--tw-ring-color': 'var(--input-focus-ring)',
            }}
          />
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location" expanded={expanded.location} onToggle={() => toggle('location')} icon="pin">
        <Select
          value={filters.state}
          onChange={e => update('state', e.target.value)}
          options={stateOptions}
        />
      </FilterSection>

      {/* Type & Size */}
      <FilterSection title="Type & Size" expanded={expanded.type} onToggle={() => toggle('type')} icon="building">
        <Select
          label="Control"
          value={filters.control}
          onChange={e => update('control', e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'public', label: 'Public' },
            { value: 'private_nonprofit', label: 'Private Non-Profit' },
            { value: 'private_forprofit', label: 'Private For-Profit' },
          ]}
        />
        <Select
          label="Campus Size"
          value={filters.size}
          onChange={e => update('size', e.target.value)}
          options={[
            { value: '', label: 'Any Size' },
            { value: 'small', label: 'Small (< 2,000)' },
            { value: 'medium', label: 'Medium (2,000–15,000)' },
            { value: 'large', label: 'Large (> 15,000)' },
          ]}
        />
      </FilterSection>

      {/* Major / Program */}
      <FilterSection title="Major / Program" expanded={expanded.major} onToggle={() => toggle('major')} icon="book">
        <Select
          value={filters.major}
          onChange={e => update('major', e.target.value)}
          options={majorOptions}
        />
      </FilterSection>

      {/* Cost */}
      <FilterSection title="Cost" expanded={expanded.cost} onToggle={() => toggle('cost')} icon="dollar">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
            Max Out-of-State Tuition
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--text-faint)' }}>$</span>
            <input
              type="number"
              placeholder="e.g. 40000"
              value={filters.tuition_max}
              onChange={e => update('tuition_max', e.target.value)}
              min={0}
              step={5000}
              className="block flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
                // @ts-ignore
                '--tw-ring-color': 'var(--input-focus-ring)',
              }}
            />
          </div>
        </div>
      </FilterSection>

      {/* Selectivity */}
      <FilterSection title="Selectivity" expanded={expanded.selectivity} onToggle={() => toggle('selectivity')} icon="target">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
            Acceptance Rate Range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.acceptance_min}
              onChange={e => update('acceptance_min', e.target.value)}
              min={0}
              max={100}
              className="block w-20 rounded-lg border px-2 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
                // @ts-ignore
                '--tw-ring-color': 'var(--input-focus-ring)',
              }}
            />
            <span style={{ color: 'var(--text-ghost)' }}>–</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.acceptance_max}
              onChange={e => update('acceptance_max', e.target.value)}
              min={0}
              max={100}
              className="block w-20 rounded-lg border px-2 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
                // @ts-ignore
                '--tw-ring-color': 'var(--input-focus-ring)',
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>%</span>
          </div>
        </div>
      </FilterSection>

      {/* Results count */}
      <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(201,146,60,0.3)', borderTopColor: 'var(--gold-primary)' }}
              />
              Searching…
            </span>
          ) : (
            <span>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{total.toLocaleString()}</span> colleges found
            </span>
          )}
        </p>
      </div>
    </aside>
  )
}

/* ─── Collapsible Filter Section ──────────────── */
function FilterSection({
  title,
  expanded,
  onToggle,
  icon,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  icon: string
  children: React.ReactNode
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span className="flex items-center gap-2">
          <FilterIcon type={icon} />
          {title}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--text-ghost)' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-60 opacity-100 pb-3' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── Filter Section Icons ────────────────────── */
function FilterIcon({ type }: { type: string }) {
  const style: React.CSSProperties = { color: 'var(--text-ghost)' }
  const cls = "w-3.5 h-3.5"
  switch (type) {
    case 'search':
      return <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
    case 'pin':
      return <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
    case 'building':
      return <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V8l9-6 9 6v14" /><path d="M9 22v-4h6v4" /><path d="M9 14h6M9 10h6" /></svg>
    case 'dollar':
      return <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    case 'target':
      return <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    case 'book':
      return <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
    default:
      return null
  }
}
