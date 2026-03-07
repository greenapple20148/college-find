import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  hint?: string
}

export function Select({
  label,
  options,
  placeholder,
  error,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={[
          'block w-full rounded-lg border px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2',
          'disabled:opacity-50',
          'transition-colors duration-200',
          className,
        ].join(' ')}
        style={{
          backgroundColor: 'var(--input-bg)',
          borderColor: error ? 'var(--error-fg)' : 'var(--input-border)',
          color: 'var(--text-primary)',
          // @ts-ignore
          '--tw-ring-color': 'var(--input-focus-ring)',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs" style={{ color: 'var(--error-fg)' }}>{error}</p>}
    </div>
  )
}
