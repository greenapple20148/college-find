'use client'

import { useState, useRef, useEffect } from 'react'
import { SearchIcon, XIcon } from '@/components/ui/Icon'
import type { College } from '@/lib/types'

interface CollegeSearchPickerProps {
  selected: College[]
  onAdd: (college: College) => void
  onRemove: (collegeId: string) => void
  maxColleges?: number
}

export function CollegeSearchPicker({
  selected,
  onAdd,
  onRemove,
  maxColleges = 4,
}: CollegeSearchPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<College[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleQueryChange(q: string) {
    setQuery(q)
    if (!q.trim()) { setResults([]); setOpen(false); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/colleges?q=${encodeURIComponent(q)}&limit=8`)
        const json = await res.json()
        setResults(json.data ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function handleSelect(college: College) {
    if (selected.some(c => c.id === college.id)) return
    onAdd(college)
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  const selectedIds = new Set(selected.map(c => c.id))
  const canAddMore = selected.length < maxColleges

  return (
    <div className="space-y-3">
      {/* Search input */}
      {canAddMore && (
        <div ref={wrapperRef} className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search and add a college…"
              className="w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--input-focus-ring)',
              } as React.CSSProperties}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-ghost)' }}>
              <SearchIcon className="w-4 h-4" />
            </span>
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs animate-pulse" style={{ color: 'var(--text-ghost)' }}>
                …
              </span>
            )}
          </div>

          {/* Dropdown */}
          {open && results.length > 0 && (
            <ul
              className="absolute z-20 mt-1 w-full border rounded-xl shadow-lg max-h-64 overflow-y-auto"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {results.map(college => {
                const alreadyAdded = selectedIds.has(college.id)
                return (
                  <li key={college.id}>
                    <button
                      type="button"
                      onClick={() => !alreadyAdded && handleSelect(college)}
                      disabled={alreadyAdded}
                      className="w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-3 transition-colors"
                      style={{
                        color: alreadyAdded ? 'var(--text-ghost)' : 'var(--text-primary)',
                        cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                        backgroundColor: alreadyAdded ? 'var(--bg-tertiary)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (!alreadyAdded) {
                          e.currentTarget.style.backgroundColor = 'rgba(201,146,60,0.1)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!alreadyAdded) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div>
                        <p className="font-medium">{college.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                          {college.city && college.state
                            ? `${college.city}, ${college.state}`
                            : college.state ?? ''}{' '}
                          · {college.control === 'public' ? 'Public' : 'Private'}
                        </p>
                      </div>
                      {alreadyAdded && <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>Added</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {!canAddMore && (
        <p className="text-xs text-amber-600">
          Max {maxColleges} colleges. Remove one to add another.
        </p>
      )}

      {/* Selected colleges chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(college => (
            <div
              key={college.id}
              className="flex items-center gap-1.5 text-xs font-medium rounded-full pl-3 pr-1.5 py-1"
              style={{
                backgroundColor: 'rgba(201,146,60,0.1)',
                border: '1px solid rgba(201,146,60,0.2)',
                color: 'var(--gold-primary)',
              }}
            >
              <span className="truncate max-w-[160px]">{college.name}</span>
              <button
                type="button"
                onClick={() => onRemove(college.id)}
                className="rounded-full p-0.5 transition-colors"
                style={{ color: 'var(--gold-primary)' }}
                aria-label={`Remove ${college.name}`}
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
          Search for colleges above to see personalized cost estimates.
        </p>
      )}
    </div>
  )
}
