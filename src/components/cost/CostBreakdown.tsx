import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { XIcon, WarningIcon } from '@/components/ui/Icon'
import type { CostEstimate } from '@/lib/types'

function fmt(n: number): string {
  return `$${n.toLocaleString()}`
}

function pct(n: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

interface CostBreakdownProps {
  estimate: CostEstimate
  onRemove?: () => void
}

export function CostBreakdown({ estimate, onRemove }: CostBreakdownProps) {
  const {
    college,
    tuition,
    room_board_estimate,
    books_fees_estimate,
    total_coa,
    sai,
    pell_grant,
    institutional_aid_estimate,
    total_grants,
    estimated_net_price,
    comparison_net_price,
    is_in_state,
    aid_breakdown,
  } = estimate

  const affordabilityColor =
    estimated_net_price < 15_000
      ? '#15803d'
      : estimated_net_price < 30_000
        ? '#1d4ed8'
        : estimated_net_price < 50_000
          ? '#a16207'
          : '#dc2626'

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(201,146,60,0.08), rgba(168,85,247,0.05))',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>{college.name}</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
            {college.city && college.state ? `${college.city}, ${college.state} · ` : ''}
            {college.control === 'public' ? 'Public' : 'Private'}
            {is_in_state && <Badge variant="safety" className="ml-2 text-xs">In-State</Badge>}
          </p>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 p-0.5 transition-colors"
            style={{ color: 'var(--text-ghost)' }}
            aria-label="Remove"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Net price hero */}
        <div className="text-center py-2">
          <p className="text-xs uppercase tracking-wide font-medium mb-1" style={{ color: 'var(--text-faint)' }}>
            Estimated Annual Net Price
          </p>
          <p className="text-4xl font-bold" style={{ color: affordabilityColor }}>
            {fmt(estimated_net_price)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>
            After estimated grants & aid
          </p>
          {comparison_net_price !== null && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
              College Scorecard avg net price:{' '}
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{fmt(comparison_net_price)}</span>
              {' '}(all students)
            </p>
          )}
        </div>

        {/* SAI callout */}
        <div
          className="flex items-center justify-between rounded-lg px-4 py-2.5"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Your Student Aid Index (SAI)</p>
            <p className="text-sm" style={{ color: 'var(--text-ghost)' }}>Your estimated family contribution</p>
          </div>
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(sai)}</span>
        </div>

        {/* Cost of Attendance breakdown */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
            Cost of Attendance
          </h4>
          <div className="space-y-2">
            <CostRow
              label={is_in_state ? 'Tuition (In-State)' : 'Tuition (Out-of-State)'}
              amount={tuition}
              total={total_coa}
              color="bg-gold-400"
            />
            <CostRow
              label="Room & Board (estimated)"
              amount={room_board_estimate}
              total={total_coa}
              color="bg-purple-400"
              note="Estimate — varies by on/off campus, meal plan"
            />
            <CostRow
              label="Books, Fees & Personal (estimated)"
              amount={books_fees_estimate}
              total={total_coa}
              color="bg-gray-300"
              note="Standard estimate"
            />
            <div className="flex justify-between text-sm font-bold pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-primary)' }}>Total Cost of Attendance</span>
              <span style={{ color: 'var(--text-primary)' }}>{fmt(total_coa)}</span>
            </div>
          </div>
        </div>

        {/* Aid breakdown */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
            Estimated Financial Aid
          </h4>
          {aid_breakdown.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--text-ghost)' }}>
              No need-based aid estimated at this income level.
            </p>
          ) : (
            <div className="space-y-2">
              {aid_breakdown.map(item => (
                <div key={item.label} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#15803d' }}>{item.label}</p>
                    {item.note && <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>{item.note}</p>}
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap" style={{ color: '#15803d' }}>
                    − {fmt(item.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-1" style={{ borderTop: '1px solid rgba(34,197,94,0.2)' }}>
                <span style={{ color: '#15803d' }}>Total Estimated Aid</span>
                <span style={{ color: '#15803d' }}>− {fmt(total_grants)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Net price summary bar */}
        <div className="pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex justify-between text-base font-bold mb-2">
            <span style={{ color: 'var(--text-primary)' }}>Estimated Net Price</span>
            <span style={{ color: affordabilityColor }}>{fmt(estimated_net_price)}</span>
          </div>
          {/* Visual bar: grants vs. out-of-pocket */}
          <div className="w-full rounded-full h-3 overflow-hidden flex" style={{ backgroundColor: 'var(--donut-track)' }}>
            {total_grants > 0 && (
              <div
                className="bg-green-400 h-3 rounded-l-full"
                style={{ width: pct(total_grants, total_coa) }}
                title={`Aid: ${fmt(total_grants)}`}
              />
            )}
            <div
              className={`h-3 ${total_grants > 0 ? '' : 'rounded-l-full'} rounded-r-full ${estimated_net_price < 15_000 ? 'bg-green-200' :
                  estimated_net_price < 30_000 ? 'bg-blue-300' :
                    estimated_net_price < 50_000 ? 'bg-yellow-300' : 'bg-red-300'
                }`}
              style={{ width: pct(estimated_net_price, total_coa) }}
              title={`Out-of-pocket: ${fmt(estimated_net_price)}`}
            />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>
            <span style={{ color: '#16a34a' }}>Aid: {pct(total_grants, total_coa)}</span>
            <span>Out-of-pocket: {pct(estimated_net_price, total_coa)}</span>
          </div>
        </div>

        {/* 4-year cost */}
        <div
          className="rounded-lg px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)' }}
        >
          <p className="text-sm" style={{ color: '#92400e' }}>
            Estimated <strong>4-year total</strong>
          </p>
          <p className="text-lg font-bold" style={{ color: '#78350f' }}>
            {fmt(estimated_net_price * 4)}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-5 pb-4">
        <p className="text-xs leading-relaxed flex gap-1" style={{ color: 'var(--text-ghost)' }}>
          <WarningIcon className="w-3 h-3 flex-shrink-0 mt-0.5" />
          This is an estimate. Actual aid is determined by the institution after FAFSA review.
          Merit aid, state grants, and work-study are not included.
        </p>
      </div>
    </Card>
  )
}

function CostRow({
  label,
  amount,
  total,
  color,
  note,
}: {
  label: string
  amount: number
  total: number
  color: string
  note?: string
}) {
  const width = total > 0 ? `${Math.round((amount / total) * 100)}%` : '0%'

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          {note && <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>{note}</p>}
        </div>
        <span className="font-medium whitespace-nowrap ml-4" style={{ color: 'var(--text-primary)' }}>{`$${amount.toLocaleString()}`}</span>
      </div>
      <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--donut-track)' }}>
        <div className={`${color} h-1.5 rounded-full`} style={{ width }} />
      </div>
    </div>
  )
}
