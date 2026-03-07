'use client'

import { useState, useEffect, useMemo } from 'react'
import { FinancialForm } from '@/components/cost/FinancialForm'
import { CollegeSearchPicker } from '@/components/cost/CollegeSearchPicker'
import { CostBreakdown } from '@/components/cost/CostBreakdown'
import { CostComparison } from '@/components/cost/CostComparison'
import { estimateCollegeCost, estimateSAI } from '@/lib/cost'
import { useProfile } from '@/context/ProfileContext'
import { DollarIcon, BuildingIcon, GraduationCapIcon, CalculatorIcon } from '@/components/ui/Icon'
import type { College, FinancialProfile, CostEstimate } from '@/lib/types'

const STORAGE_KEY = 'collegefind_financial_profile'

const DEFAULT_PROFILE: FinancialProfile = {
  annual_income: 60000,
  family_size: 4,
  num_in_college: 1,
  home_state: '',
  dependency_status: 'dependent',
  student_income: 0,
}

function loadFinancialProfile(): FinancialProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export default function CostCalculatorPage() {
  const { profile: studentProfile } = useProfile()
  const [financial, setFinancial] = useState<FinancialProfile>(DEFAULT_PROFILE)
  const [colleges, setColleges] = useState<College[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = loadFinancialProfile()
    if (studentProfile?.preferred_states?.length === 1 && !saved.home_state) {
      saved.home_state = studentProfile.preferred_states[0]
    }
    setFinancial(saved)
    setLoaded(true)
  }, [studentProfile])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(financial))
  }, [financial, loaded])

  function handleFinancialChange(updated: FinancialProfile) {
    setFinancial(updated)
  }

  function handleAddCollege(college: College) {
    setColleges(prev => [...prev, college])
  }

  function handleRemoveCollege(id: string) {
    setColleges(prev => prev.filter(c => c.id !== id))
  }

  const estimates: CostEstimate[] = useMemo(() => {
    if (!loaded) return []
    return colleges.map(college => estimateCollegeCost(college, financial))
  }, [colleges, financial, loaded])

  const sai = useMemo(() => loaded ? estimateSAI(financial) : 0, [financial, loaded])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <CalculatorIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>College Cost Calculator</h1>
            <p className="text-sm mt-0.5 max-w-2xl" style={{ color: 'var(--text-faint)' }}>
              Estimate your annual net price at any college based on your family&apos;s financial situation.
              Uses a simplified FAFSA methodology to estimate your Student Aid Index (SAI) and potential grants.
            </p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Financial profile */}
        <aside>
          <div
            className="rounded-xl border p-5 sticky top-24"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-soft)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarIcon className="w-5 h-5" style={{ color: 'var(--gold-primary)' } as React.CSSProperties} />
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Your Financial Profile</h2>
            </div>

            <FinancialForm
              profile={financial}
              onChange={handleFinancialChange}
            />

            {/* SAI result */}
            {loaded && financial.home_state && (
              <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide font-medium mb-1" style={{ color: 'var(--text-faint)' }}>
                    Your Estimated SAI
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--gold-primary)' }}>
                    ${sai.toLocaleString()}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>
                    {sai === 0
                      ? 'Maximum federal aid eligibility'
                      : sai < 6500
                        ? 'Pell Grant eligible'
                        : sai < 30000
                          ? 'Need-based aid likely'
                          : 'Limited need-based aid expected'}
                  </p>
                </div>
              </div>
            )}

            {loaded && !financial.home_state && (
              <p className="mt-4 text-xs text-amber-600">
                ← Select your home state to see in-state tuition estimates.
              </p>
            )}
          </div>
        </aside>

        {/* Right: College picker + results */}
        <div className="lg:col-span-2 space-y-6">
          {/* College picker */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-soft)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BuildingIcon className="w-5 h-5" style={{ color: 'var(--gold-primary)' } as React.CSSProperties} />
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Add Colleges to Estimate
                <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-ghost)' }}>
                  (up to 4)
                </span>
              </h2>
            </div>
            <CollegeSearchPicker
              selected={colleges}
              onAdd={handleAddCollege}
              onRemove={handleRemoveCollege}
              maxColleges={4}
            />
          </div>

          {/* Empty state */}
          {colleges.length === 0 && (
            <div className="text-center py-16">
              <div className="flex justify-center mb-3">
                <GraduationCapIcon className="w-12 h-12" style={{ color: 'var(--text-ghost)' } as React.CSSProperties} />
              </div>
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Search for colleges above</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                Cost estimates will appear here after you add at least one college.
              </p>
            </div>
          )}

          {/* Cost breakdown cards */}
          {estimates.length > 0 && (
            <>
              {estimates.length >= 2 && (
                <CostComparison estimates={estimates} />
              )}

              <div className={`grid gap-6 ${estimates.length >= 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 max-w-xl'}`}>
                {estimates.map(estimate => (
                  <CostBreakdown
                    key={estimate.college.id}
                    estimate={estimate}
                    onRemove={() => handleRemoveCollege(estimate.college.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Global disclaimer */}
          {estimates.length > 0 && (
            <div
              className="p-4 rounded-xl text-xs leading-relaxed border"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              <strong>Disclaimer:</strong> All cost and aid estimates are for informational purposes only.
              Actual financial aid packages are determined by each institution after reviewing your official
              FAFSA application. This tool does not account for: merit scholarships, state grants, work-study,
              loans, or assets. Net prices will vary significantly based on individual circumstances.
              Always complete the FAFSA at{' '}
              <a
                href="https://studentaid.gov/h/apply-for-aid/fafsa"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gold-primary)' }}
                className="hover:underline"
              >
                studentaid.gov
              </a>
              {' '}for accurate aid determination.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
