'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useProfile } from '@/context/ProfileContext'
import { XIcon, ArrowRightIcon } from '@/components/ui/Icon'
import { US_STATES, MAJOR_OPTIONS } from '@/lib/types'
import type { StudentProfile } from '@/lib/types'

const majorOptions = MAJOR_OPTIONS.map(m => ({ value: m, label: m }))
const budgetOptions = [
  { value: '', label: 'No limit' },
  { value: '10000', label: 'Up to $10,000/yr' },
  { value: '15000', label: 'Up to $15,000/yr' },
  { value: '20000', label: 'Up to $20,000/yr' },
  { value: '25000', label: 'Up to $25,000/yr' },
  { value: '30000', label: 'Up to $30,000/yr' },
  { value: '40000', label: 'Up to $40,000/yr' },
  { value: '50000', label: 'Up to $50,000/yr' },
  { value: '60000', label: 'Up to $60,000/yr' },
]

interface FormErrors {
  gpa?: string
  sat_total?: string
  act?: string
}

export function ProfileForm() {
  const { profile, setProfile } = useProfile()
  const router = useRouter()

  const [gpa, setGpa] = useState(profile?.gpa?.toString() ?? '')
  const [satTotal, setSatTotal] = useState(profile?.sat_total?.toString() ?? '')
  const [act, setAct] = useState(profile?.act?.toString() ?? '')
  const [major, setMajor] = useState(profile?.intended_major ?? '')
  const [selectedStates, setSelectedStates] = useState<string[]>(profile?.preferred_states ?? [])
  const [budgetMax, setBudgetMax] = useState(profile?.budget_max?.toString() ?? '')
  const [campusSize, setCampusSize] = useState<StudentProfile['campus_size']>(profile?.campus_size ?? 'any')
  const [errors, setErrors] = useState<FormErrors>({})
  const [stateSearch, setStateSearch] = useState('')

  function validate(): boolean {
    const newErrors: FormErrors = {}

    const gpaNum = parseFloat(gpa)
    if (!gpa || isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      newErrors.gpa = 'GPA must be between 0.0 and 4.0'
    }
    if (satTotal) {
      const sat = parseInt(satTotal)
      if (isNaN(sat) || sat < 400 || sat > 1600) {
        newErrors.sat_total = 'SAT total must be between 400 and 1600'
      }
    }
    if (act) {
      const actNum = parseInt(act)
      if (isNaN(actNum) || actNum < 1 || actNum > 36) {
        newErrors.act = 'ACT must be between 1 and 36'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleStateToggle(code: string) {
    setSelectedStates(prev => {
      if (prev.includes(code)) return prev.filter(s => s !== code)
      if (prev.length >= 10) return prev
      return [...prev, code]
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const newProfile: StudentProfile = {
      gpa: parseFloat(gpa),
      sat_total: satTotal ? parseInt(satTotal) : null,
      act: act ? parseInt(act) : null,
      intended_major: major || null,
      preferred_states: selectedStates,
      budget_max: budgetMax ? parseInt(budgetMax) : null,
      campus_size: campusSize,
    }

    setProfile(newProfile)
    router.push('/match')
  }

  const filteredStates = US_STATES.filter(s =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(stateSearch.toLowerCase())
  )

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Academic Info */}
      <section>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Academic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="GPA (0.0–4.0) *"
            type="number"
            min={0}
            max={4}
            step={0.01}
            value={gpa}
            onChange={e => setGpa(e.target.value)}
            placeholder="e.g. 3.6"
            error={errors.gpa}
            hint="Use your unweighted GPA on a 4.0 scale"
          />
          <Input
            label="SAT Total (optional)"
            type="number"
            min={400}
            max={1600}
            step={10}
            value={satTotal}
            onChange={e => setSatTotal(e.target.value)}
            placeholder="e.g. 1280"
            error={errors.sat_total}
            hint="Combined Math + Reading (400–1600)"
          />
          <Input
            label="ACT Composite (optional)"
            type="number"
            min={1}
            max={36}
            value={act}
            onChange={e => setAct(e.target.value)}
            placeholder="e.g. 28"
            error={errors.act}
            hint="Composite score (1–36)"
          />
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Preferences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Intended Major"
            value={major}
            onChange={e => setMajor(e.target.value)}
            options={majorOptions}
            placeholder="Select a major area (optional)"
          />
          <Select
            label="Annual Budget (Net Price Max)"
            value={budgetMax}
            onChange={e => setBudgetMax(e.target.value)}
            options={budgetOptions}
          />
        </div>

        {/* Campus Size */}
        <div className="mt-4">
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Campus Size</label>
          <div className="flex flex-wrap gap-2">
            {(['any', 'small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => setCampusSize(size)}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={
                  campusSize === size
                    ? { backgroundColor: 'var(--gold-primary)', color: '#FAF9F6', borderColor: 'var(--gold-primary)' }
                    : { backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }
                }
              >
                {size === 'any' ? 'No Preference' : size.charAt(0).toUpperCase() + size.slice(1)}
                {size === 'small' && ' (< 2k)'}
                {size === 'medium' && ' (2k–15k)'}
                {size === 'large' && ' (> 15k)'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Preferred States */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Preferred States
            <span className="ml-1 font-normal" style={{ color: 'var(--text-ghost)' }}>(optional, select up to 10)</span>
          </label>
          {selectedStates.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedStates([])}
              className="text-xs font-medium"
              style={{ color: 'var(--gold-primary)' }}
            >
              Clear all
            </button>
          )}
        </div>

        {selectedStates.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedStates.map(code => (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium"
                style={{
                  backgroundColor: 'rgba(201,146,60,0.15)',
                  color: 'var(--gold-primary)',
                }}
              >
                {code}
                <button
                  type="button"
                  onClick={() => handleStateToggle(code)}
                  aria-label={`Remove ${code}`}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          placeholder="Search states…"
          value={stateSearch}
          onChange={e => setStateSearch(e.target.value)}
          className="mb-2 block w-full max-w-xs rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
          style={{ ...inputStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
        />

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 max-h-48 overflow-y-auto border rounded-lg p-2"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          {filteredStates.map(state => (
            <button
              key={state.code}
              type="button"
              onClick={() => handleStateToggle(state.code)}
              disabled={!selectedStates.includes(state.code) && selectedStates.length >= 10}
              className="text-left px-2 py-1.5 rounded text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                selectedStates.includes(state.code)
                  ? { backgroundColor: 'var(--gold-primary)', color: '#FAF9F6', fontWeight: 500 }
                  : { color: 'var(--text-secondary)' }
              }
              onMouseEnter={e => {
                if (!selectedStates.includes(state.code)) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                }
              }}
              onMouseLeave={e => {
                if (!selectedStates.includes(state.code)) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {state.code}
            </button>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>
          {selectedStates.length}/10 states selected. Leave empty to search all states.
        </p>
      </section>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto inline-flex items-center gap-2">
          Save Profile & Find Matches <ArrowRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
