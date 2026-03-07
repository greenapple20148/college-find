'use client'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { US_STATES } from '@/lib/types'
import type { FinancialProfile } from '@/lib/types'

interface FinancialFormProps {
  profile: FinancialProfile
  onChange: (profile: FinancialProfile) => void
}

const stateOptions = US_STATES.map(s => ({ value: s.code, label: `${s.code} — ${s.name}` }))

const incomeBrackets = [
  { value: '0', label: 'Under $20,000' },
  { value: '15000', label: '$15,000' },
  { value: '25000', label: '$25,000' },
  { value: '35000', label: '$35,000' },
  { value: '48000', label: '$48,000' },
  { value: '60000', label: '$60,000' },
  { value: '75000', label: '$75,000' },
  { value: '90000', label: '$90,000' },
  { value: '110000', label: '$110,000' },
  { value: '130000', label: '$130,000' },
  { value: '150000', label: '$150,000' },
  { value: '175000', label: '$175,000' },
  { value: '200000', label: '$200,000' },
  { value: '250000', label: '$250,000+' },
]

export function FinancialForm({ profile, onChange }: FinancialFormProps) {
  function update<K extends keyof FinancialProfile>(key: K, value: FinancialProfile[K]) {
    onChange({ ...profile, [key]: value })
  }

  const isIndependent = profile.dependency_status === 'independent'

  const selectStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="space-y-5">
      {/* Dependency status */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
          Student Type
        </label>
        <div className="flex gap-2">
          {(['dependent', 'independent'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => update('dependency_status', type)}
              className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={
                profile.dependency_status === type
                  ? { backgroundColor: 'var(--gold-primary)', color: '#FAF9F6', borderColor: 'var(--gold-primary)' }
                  : { backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }
              }
            >
              {type === 'dependent' ? 'Dependent (uses parent income)' : 'Independent'}
            </button>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>
          Most 12th graders are dependent students.
        </p>
      </div>

      {/* Income */}
      {!isIndependent ? (
        <Select
          label="Parent / Household Income (annual gross)"
          value={profile.annual_income.toString()}
          onChange={e => update('annual_income', parseInt(e.target.value))}
          options={incomeBrackets}
        />
      ) : (
        <Select
          label="Student Income (annual gross)"
          value={(profile.student_income ?? 0).toString()}
          onChange={e => update('student_income', parseInt(e.target.value))}
          options={incomeBrackets}
        />
      )}

      {/* Family size & num in college */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Family Size
          </label>
          <select
            value={profile.family_size}
            onChange={e => update('family_size', parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
            style={{ ...selectStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
          >
            {[2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>{n} people</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
            # in College at Once
          </label>
          <select
            value={profile.num_in_college}
            onChange={e => update('num_in_college', parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
            style={{ ...selectStyle, '--tw-ring-color': 'var(--input-focus-ring)' } as React.CSSProperties}
          >
            {[1, 2, 3].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-ghost)' }}>Siblings in college?</p>
        </div>
      </div>

      {/* Home state */}
      <Select
        label="Your Home State"
        value={profile.home_state}
        onChange={e => update('home_state', e.target.value)}
        options={[{ value: '', label: 'Select your state' }, ...stateOptions]}
        hint="Used to determine in-state vs. out-of-state tuition"
      />

      {/* Info box */}
      <div
        className="p-3 rounded-lg text-xs leading-relaxed border"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.06)',
          borderColor: 'rgba(59, 130, 246, 0.15)',
          color: 'var(--text-muted)',
        }}
      >
        <strong>How this works:</strong> We estimate your Student Aid Index (SAI) using a simplified
        version of the federal FAFSA methodology. SAI determines how much federal aid you qualify for.
        Asset information (home equity, savings, investments) is not included — actual SAI will vary.
      </div>
    </div>
  )
}
