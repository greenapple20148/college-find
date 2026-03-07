import React from 'react'

type Variant = 'safety' | 'match' | 'reach' | 'public' | 'private' | 'info' | 'gray'

interface BadgeProps {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<Variant, { bg: string; fg: string; border: string }> = {
  safety: { bg: 'rgba(74, 222, 128, 0.15)', fg: '#4ade80', border: 'rgba(74, 222, 128, 0.2)' },
  match: { bg: 'rgba(96, 165, 250, 0.15)', fg: '#60a5fa', border: 'rgba(96, 165, 250, 0.2)' },
  reach: { bg: 'rgba(251, 146, 60, 0.15)', fg: '#fb923c', border: 'rgba(251, 146, 60, 0.2)' },
  public: { bg: 'var(--badge-public-bg)', fg: 'var(--badge-public-fg)', border: 'var(--badge-public-border)' },
  private: { bg: 'var(--badge-private-bg)', fg: 'var(--badge-private-fg)', border: 'var(--badge-private-border)' },
  info: { bg: 'rgba(201, 146, 60, 0.15)', fg: 'var(--gold-light)', border: 'rgba(201, 146, 60, 0.2)' },
  gray: { bg: 'var(--badge-gray-bg)', fg: 'var(--badge-gray-fg)', border: 'var(--badge-gray-border)' },
}

export function Badge({ variant = 'gray', className = '', children }: BadgeProps) {
  const s = variantStyles[variant]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200 ${className}`}
      style={{
        backgroundColor: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
      }}
    >
      {children}
    </span>
  )
}
