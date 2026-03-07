import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
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
      />
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
      {error && <p className="text-xs" style={{ color: 'var(--error-fg)' }}>{error}</p>}
    </div>
  )
}
