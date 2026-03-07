import { CollegeCard } from './CollegeCard'
import { SearchIcon } from '@/components/ui/Icon'
import type { College } from '@/lib/types'

interface CollegeGridProps {
  colleges: College[]
  savedIds?: Set<string>
  onSave?: (college: College) => void
  loading?: boolean
  emptyMessage?: string
  viewMode?: 'grid' | 'list'
}

function SkeletonCard({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  const skBg: React.CSSProperties = { backgroundColor: 'var(--skeleton-color)' }

  if (viewMode === 'list') {
    return (
      <div
        className="rounded-xl border p-5 animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full flex-shrink-0" style={skBg} />
          <div className="flex-1">
            <div className="h-4 rounded w-2/5 mb-2" style={skBg} />
            <div className="h-3 rounded w-1/4" style={skBg} />
          </div>
          <div className="hidden md:flex gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-right">
                <div className="h-2 rounded w-12 mb-1" style={skBg} />
                <div className="h-3 rounded w-16" style={skBg} />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <div className="h-6 w-16 rounded-full" style={skBg} />
            <div className="h-6 w-16 rounded-full" style={skBg} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="h-1" style={skBg} />
      <div className="p-5">
        <div className="flex justify-between mb-4">
          <div className="flex-1">
            <div className="h-4 rounded w-3/4 mb-2" style={skBg} />
            <div className="h-3 rounded w-1/2" style={skBg} />
          </div>
          <div className="flex gap-1.5">
            <div className="h-6 w-14 rounded-full" style={skBg} />
            <div className="h-6 w-14 rounded-full" style={skBg} />
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="w-11 h-11 rounded-full" style={skBg} />
          <div>
            <div className="h-3 rounded w-24 mb-1" style={skBg} />
            <div className="h-2 rounded w-16" style={skBg} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-2 rounded w-2/3 mb-1" style={skBg} />
              <div className="h-3 rounded w-1/2" style={skBg} />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="h-9 rounded-lg flex-1" style={skBg} />
          <div className="h-9 rounded-lg flex-1" style={skBg} />
        </div>
      </div>
    </div>
  )
}

export function CollegeGrid({
  colleges,
  savedIds = new Set(),
  onSave,
  loading = false,
  emptyMessage = 'No colleges match your filters.',
  viewMode = 'grid',
}: CollegeGridProps) {
  if (loading) {
    return (
      <div className={
        viewMode === 'list'
          ? 'flex flex-col gap-3'
          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
      }>
        {[...Array(viewMode === 'list' ? 6 : 9)].map((_, i) => (
          <SkeletonCard key={i} viewMode={viewMode} />
        ))}
      </div>
    )
  }

  if (colleges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <SearchIcon className="w-7 h-7" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
        </div>
        <p className="font-semibold text-lg" style={{ color: 'var(--text-secondary)' }}>{emptyMessage}</p>
        <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--text-faint)' }}>
          Try broadening your search criteria or removing some filters to see more results.
        </p>
      </div>
    )
  }

  return (
    <div className={
      viewMode === 'list'
        ? 'flex flex-col gap-3'
        : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
    }>
      {colleges.map((college, i) => (
        <CollegeCard
          key={college.id}
          college={college}
          saved={savedIds.has(college.id)}
          onSave={onSave}
          viewMode={viewMode}
          index={i}
        />
      ))}
    </div>
  )
}
