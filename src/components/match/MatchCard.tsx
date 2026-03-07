'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HeartIcon, CheckIcon, PlusIcon, DollarIcon, BuildingIcon } from '@/components/ui/Icon'
import { useCompare } from '@/context/CompareContext'
import type { MatchResult } from '@/lib/types'

function fmt(n: number | null, prefix = '$'): string {
  if (n === null) return 'N/A'
  return `${prefix}${n.toLocaleString()}`
}

function fmtPct(n: number | null): string {
  if (n === null) return 'N/A'
  return `${Math.round(n * 100)}%`
}

function fmtAdj(n: number): string {
  if (n === 0) return '±0'
  return n > 0 ? `+${(n * 100).toFixed(0)}%` : `${(n * 100).toFixed(0)}%`
}

const categoryColors = {
  safety: 'bg-green-400/5 border-green-400/20',
  match: 'bg-blue-400/5 border-blue-400/20',
  reach: 'bg-orange-400/5 border-orange-400/20',
}

interface MatchCardProps {
  result: MatchResult
  onSave?: (result: MatchResult) => void
  saved?: boolean
}

export function MatchCard({ result, onSave, saved = false }: MatchCardProps) {
  const {
    college, probability, category, probability_label,
    budget_note, size_note, score_breakdown, explanation,
  } = result

  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare()
  const inCompare = isInCompare(college.id)
  const [isSaved, setIsSaved] = useState(saved)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const probPct = Math.round(probability * 100)
  const barColor =
    category === 'safety' ? 'bg-green-500' :
      category === 'match' ? 'bg-blue-500' : 'bg-orange-500'

  return (
    <Card className={`p-5 border ${categoryColors[category]}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{college.name}</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
            {college.city}{college.city && college.state ? ', ' : ''}{college.state}
            {college.control ? ` · ${college.control === 'public' ? 'Public' : 'Private'}` : ''}
          </p>
        </div>
        <Badge variant={category} className="text-sm px-3 py-1 flex-shrink-0">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Badge>
      </div>

      {/* Probability bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{probability_label}</span>
          <button
            onClick={() => setShowBreakdown(s => !s)}
            className="font-medium"
            style={{ color: 'var(--gold-primary)' }}
          >
            {showBreakdown ? 'Hide why ▲' : 'Why? ▼'}
          </button>
        </div>
        <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--donut-track)' }}>
          <div
            className={`${barColor} h-2 rounded-full transition-all`}
            style={{ width: `${probPct}%` }}
          />
        </div>
      </div>

      {/* Score breakdown panel */}
      {showBreakdown && (
        <div
          className="mb-4 p-3 rounded-lg border space-y-3"
          style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Adjustment table */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
              Score Breakdown
            </p>
            <div className="space-y-1 text-xs">
              <AdjRow label="Base (acceptance rate)" value={`${Math.round(score_breakdown.base * 100)}%`} neutral />
              <AdjRow label="GPA fit" value={fmtAdj(score_breakdown.gpa_adj)} adj={score_breakdown.gpa_adj} />
              <AdjRow label="Test score fit" value={fmtAdj(score_breakdown.test_adj)} adj={score_breakdown.test_adj} />
              <AdjRow label="Fit bonuses" value={fmtAdj(score_breakdown.fit_adj)} adj={score_breakdown.fit_adj} />
              {score_breakdown.rule_cap !== null && (
                <AdjRow
                  label="Rule cap applied"
                  value={`→ ${Math.round(score_breakdown.rule_cap * 100)}%`}
                  neutral
                />
              )}
              <div className="flex justify-between pt-1 font-semibold" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated chance</span>
                <span style={{ color: 'var(--text-primary)' }}>{probPct}%</span>
              </div>
            </div>
          </div>

          {/* Explanation reasons */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-faint)' }}>
              Factors considered
            </p>
            <ul className="space-y-1">
              {explanation.map((line, i) => (
                <li key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-ghost)' }} className="flex-shrink-0">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        <Stat label="Acceptance Rate" value={fmtPct(college.acceptance_rate)} />
        <Stat label="Net Price" value={fmt(college.net_price)} />
        <Stat label="Out-of-State Tuition" value={fmt(college.tuition_out_state)} />
        <Stat label="Graduation Rate" value={fmtPct(college.graduation_rate)} />
      </div>

      {/* Notes */}
      {(budget_note || size_note) && (
        <div className="text-xs mb-3 space-y-0.5" style={{ color: 'var(--text-faint)' }}>
          {budget_note && (
            <p className="flex items-center gap-1">
              <DollarIcon className="w-3 h-3 flex-shrink-0" /> {budget_note}
            </p>
          )}
          {size_note && (
            <p className="flex items-center gap-1">
              <BuildingIcon className="w-3 h-3 flex-shrink-0" /> {size_note}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <Button
          variant={isSaved ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setIsSaved(s => !s); onSave?.(result) }}
          className="flex-1 flex items-center justify-center gap-1"
        >
          <HeartIcon className="w-3.5 h-3.5" filled={isSaved} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
        <Button
          variant={inCompare ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => inCompare ? removeFromCompare(college.id) : addToCompare(college)}
          disabled={!inCompare && !canAddMore}
          className="flex-1 flex items-center justify-center gap-1"
        >
          {inCompare
            ? <><CheckIcon className="w-3.5 h-3.5" /> Comparing</>
            : <><PlusIcon className="w-3.5 h-3.5" /> Compare</>
          }
        </Button>
      </div>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}

function AdjRow({
  label,
  value,
  adj,
  neutral,
}: {
  label: string
  value: string
  adj?: number
  neutral?: boolean
}) {
  const color = neutral || adj === undefined || adj === 0
    ? 'var(--text-faint)'
    : adj > 0 ? '#15803d' : '#dc2626'

  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-medium" style={{ color }}>{value}</span>
    </div>
  )
}
