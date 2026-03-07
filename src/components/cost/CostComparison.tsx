import { CheckIcon, WarningIcon } from '@/components/ui/Icon'
import type { CostEstimate } from '@/lib/types'

function fmt(n: number | null): string {
  if (n === null) return '—'
  return `$${n.toLocaleString()}`
}

interface CostComparisonProps {
  estimates: CostEstimate[]
}

export function CostComparison({ estimates }: CostComparisonProps) {
  if (estimates.length < 2) return null

  function bestIdx(values: (number | null)[]): number {
    const nums = values.map(v => (typeof v === 'number' ? v : Infinity))
    const min = Math.min(...nums)
    return nums.indexOf(min)
  }

  function bestIdxAid(values: (number | null)[]): number {
    const nums = values.map(v => (typeof v === 'number' ? v : -Infinity))
    const max = Math.max(...nums)
    return nums.indexOf(max)
  }

  const rows: { label: string; values: (number | null)[]; sub?: string }[] = [
    { label: 'Tuition', values: estimates.map(e => e.tuition) },
    { label: 'Total CoA', values: estimates.map(e => e.total_coa) },
    { label: 'Estimated Aid', values: estimates.map(e => e.total_grants) },
    { label: 'Net Price', values: estimates.map(e => e.estimated_net_price), sub: 'After grants' },
    { label: 'Scorecard Avg', values: estimates.map(e => e.comparison_net_price), sub: 'All students' },
    { label: '4-Year Cost', values: estimates.map(e => e.estimated_net_price * 4) },
  ]

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-soft)' }}>
      <div className="px-5 py-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Side-by-Side Cost Comparison</h3>
        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
          <CheckIcon className="w-3 h-3 text-green-600" /> = most affordable
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide w-44 sticky left-0 z-10" style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-secondary)' }}>Cost Item</th>
              {estimates.map(e => (
                <th key={e.college.id} className="px-4 py-3 text-sm text-center min-w-[160px]">
                  <p className="font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>{e.college.name}</p>
                  {e.is_in_state && <span className="text-xs text-green-600 font-medium">In-State</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const isAid = row.label === 'Estimated Aid'
              const best = isAid ? bestIdxAid(row.values) : bestIdx(row.values)
              const bg = rowIdx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'
              return (
                <tr key={row.label} style={{ backgroundColor: bg }}>
                  <td className="px-4 py-3 text-sm font-medium sticky left-0 z-10" style={{ color: 'var(--text-secondary)', backgroundColor: bg }}>
                    {row.label}
                    {row.sub && <p className="text-xs font-normal" style={{ color: 'var(--text-ghost)' }}>{row.sub}</p>}
                  </td>
                  {row.values.map((value, colIdx) => {
                    const isBest = best === colIdx && value !== null && value !== Infinity && value !== -Infinity
                    return (
                      <td key={colIdx} className="px-4 py-3 text-sm text-center" style={{ color: isBest ? '#15803d' : 'var(--text-primary)', fontWeight: isBest ? 600 : 400, backgroundColor: isBest ? 'rgba(34,197,94,0.1)' : undefined }}>
                        <span className="inline-flex items-center justify-center gap-1">
                          {isAid ? <span style={{ color: '#15803d' }}>{value !== null ? `− ${fmt(value)}` : '—'}</span> : fmt(value)}
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
      <div className="px-4 py-3" style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-subtle)' }}>
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-ghost)' }}>
          <WarningIcon className="w-3 h-3 flex-shrink-0" /> Estimates only. Merit aid, state grants, work-study not included.
        </p>
      </div>
    </div>
  )
}
