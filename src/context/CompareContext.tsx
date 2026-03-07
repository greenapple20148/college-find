'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { College } from '@/lib/types'

const MAX_COMPARE = 4

interface CompareContextValue {
  compareList: College[]
  addToCompare: (college: College) => void
  removeFromCompare: (collegeId: string) => void
  isInCompare: (collegeId: string) => boolean
  canAddMore: boolean
  clearCompare: () => void
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<College[]>([])

  const addToCompare = useCallback((college: College) => {
    setCompareList(prev => {
      if (prev.length >= MAX_COMPARE) return prev
      if (prev.some(c => c.id === college.id)) return prev
      return [...prev, college]
    })
  }, [])

  const removeFromCompare = useCallback((collegeId: string) => {
    setCompareList(prev => prev.filter(c => c.id !== collegeId))
  }, [])

  const isInCompare = useCallback(
    (collegeId: string) => compareList.some(c => c.id === collegeId),
    [compareList]
  )

  const clearCompare = useCallback(() => setCompareList([]), [])

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        canAddMore: compareList.length < MAX_COMPARE,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
