import { MatchCard } from './MatchCard'
import { CategoryDot } from '@/components/ui/Icon'
import type { MatchResult, MatchCategory } from '@/lib/types'

const config: Record<MatchCategory, { label: string; color: string; desc: string }> = {
  safety: {
    label: 'Safety',
    color: '#15803d',
    desc: 'Strong candidates — estimated ≥ 75% chance',
  },
  match: {
    label: 'Match',
    color: '#1d4ed8',
    desc: 'Solid fit — estimated 40–74% chance',
  },
  reach: {
    label: 'Reach',
    color: '#c2410c',
    desc: 'Challenging but possible — estimated < 40% chance',
  },
}

interface MatchSectionProps {
  category: MatchCategory
  results: MatchResult[]
  onSave?: (result: MatchResult) => void
  savedIds?: Set<string>
}

export function MatchSection({ category, results, onSave, savedIds = new Set() }: MatchSectionProps) {
  const { label, color, desc } = config[category]

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <CategoryDot category={category} />
        <div>
          <h2 className="text-lg font-bold" style={{ color }}>
            {label} <span className="text-base font-normal" style={{ color: 'var(--text-faint)' }}>({results.length})</span>
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{desc}</p>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-sm italic pl-5" style={{ color: 'var(--text-ghost)' }}>
          No {label.toLowerCase()} schools found for your profile and preferences.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map(result => (
            <MatchCard
              key={result.college.id}
              result={result}
              onSave={onSave}
              saved={savedIds.has(result.college.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
