'use client'

import { useCompare } from '@/context/CompareContext'
import { ScalesIcon, CheckIcon } from '@/components/ui/Icon'
import type { College } from '@/lib/types'

function fmt(n: number | null, prefix = '$'): string {
  if (n === null) return '—'
  return `${prefix}${n.toLocaleString()}`
}

function fmtPct(n: number | null): string {
  if (n === null) return '—'
  return `${Math.round(n * 100)}%`
}

type RowDef = {
  label: string
  key: keyof College
  format: (v: College[keyof College], college?: College) => string
  lowerIsBetter?: boolean
}

const rows: RowDef[] = [
  { label: 'Location', key: 'city', format: (v) => v as string ?? '—' },
  { label: 'State', key: 'state', format: (v) => v as string ?? '—' },
  {
    label: 'Control', key: 'control', format: (v) => {
      if (v === 'public') return 'Public'
      if (v === 'private_nonprofit') return 'Private Non-Profit'
      if (v === 'private_forprofit') return 'Private For-Profit'
      return '—'
    }
  },
  { label: 'Campus Size', key: 'size_category', format: (v) => v ? String(v).charAt(0).toUpperCase() + String(v).slice(1) : '—' },
  { label: 'Enrollment', key: 'enrollment', format: (v) => v !== null ? (v as number).toLocaleString() : '—' },
  { label: 'In-State Tuition', key: 'tuition_in_state', format: (v) => fmt(v as number | null), lowerIsBetter: true },
  { label: 'Out-of-State Tuition', key: 'tuition_out_state', format: (v) => fmt(v as number | null), lowerIsBetter: true },
  { label: 'Net Price', key: 'net_price', format: (v) => fmt(v as number | null), lowerIsBetter: true },
  { label: 'Acceptance Rate', key: 'acceptance_rate', format: (v) => fmtPct(v as number | null) },
  {
    label: 'SAT Mid (M+R)', key: 'sat_math_50', format: (_v, college?: College) => {
      if (!college) return '—'
      const m = college.sat_math_50
      const r = college.sat_read_50
      if (m === null || r === null) return '—'
      return String(m + r)
    }
  },
  { label: 'ACT Midpoint', key: 'act_50', format: (v) => v !== null ? String(v) : '—' },
  { label: 'Graduation Rate', key: 'graduation_rate', format: (v) => fmtPct(v as number | null) },
  { label: 'Median Earnings', key: 'median_earnings', format: (v) => fmt(v as number | null) },
]

function getBestIndex(colleges: College[], key: keyof College, lowerIsBetter = false): number {
  const values = colleges.map(c => {
    const v = c[key]
    return typeof v === 'number' ? v : null
  })
  const valid = values.filter(v => v !== null) as number[]
  if (valid.length < 2) return -1
  const best = lowerIsBetter ? Math.min(...valid) : Math.max(...valid)
  return values.indexOf(best)
}

interface CompareTableProps {
  colleges?: College[]
}

export function CompareTable({ colleges: propColleges }: CompareTableProps) {
  const { compareList, removeFromCompare } = useCompare()
  const colleges = propColleges ?? compareList

  if (colleges.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="flex justify-center mb-3">
          <ScalesIcon className="w-12 h-12" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
        </div>
        <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No colleges in your compare list.</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
          Use the + Compare button on college cards to add schools here.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="min-w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
            <th
              className="text-left px-4 py-3 text-sm font-semibold w-40 sticky left-0 z-10"
              style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
            >
              Attribute
            </th>
            {colleges.map(college => (
              <th key={college.id} className="px-4 py-3 text-sm min-w-[160px]">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold text-center leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {college.name}
                  </span>
                  <button
                    onClick={() => removeFromCompare(college.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => {
            const bestIdx = getBestIndex(colleges, row.key, row.lowerIsBetter)
            const rowBg = rowIdx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'

            return (
              <tr key={row.key} style={{ backgroundColor: rowBg }}>
                <td
                  className="px-4 py-3 text-sm font-medium sticky left-0 z-10"
                  style={{ color: 'var(--text-secondary)', backgroundColor: rowBg }}
                >
                  {row.label}
                </td>
                {colleges.map((college, colIdx) => {
                  const value = row.format(college[row.key], college)
                  const isBest = bestIdx === colIdx && value !== '—'

                  return (
                    <td
                      key={college.id}
                      className="px-4 py-3 text-sm text-center"
                      style={{
                        color: isBest ? '#15803d' : 'var(--text-primary)',
                        fontWeight: isBest ? 600 : 400,
                        backgroundColor: isBest ? 'rgba(34, 197, 94, 0.1)' : undefined,
                      }}
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        {value}
                        {isBest && <CheckIcon className="w-3 h-3 text-green-600" />}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
