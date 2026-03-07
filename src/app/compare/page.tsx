'use client'

import Link from 'next/link'
import { useCompare } from '@/context/CompareContext'
import { CompareTable } from '@/components/compare/CompareTable'
import { Button } from '@/components/ui/Button'
import { InfoIcon, ArrowRightIcon, ScalesIcon } from '@/components/ui/Icon'

export default function ComparePage() {
  const { compareList, clearCompare } = useCompare()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <ScalesIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>Compare Colleges</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
              {compareList.length === 0
                ? 'Add colleges from Search or Match to compare them here.'
                : `Comparing ${compareList.length} college${compareList.length !== 1 ? 's' : ''} — up to 4 allowed.`}
            </p>
          </div>
        </div>
        {compareList.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Clear All
          </Button>
        )}
      </div>

      {compareList.length < 2 && (
        <div
          className="mb-6 p-4 rounded-xl text-sm flex items-center gap-2 border"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            color: 'var(--text-secondary)',
          }}
        >
          <InfoIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#3b82f6' } as React.CSSProperties} />
          <span>
            Add at least 2 colleges to see a comparison.{' '}
            <Link href="/search" className="font-medium underline inline-flex items-center gap-0.5" style={{ color: 'var(--gold-primary)' }}>
              Browse colleges <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </span>
        </div>
      )}

      <CompareTable />
    </div>
  )
}
