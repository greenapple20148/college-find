'use client'

import Link from 'next/link'

interface UpgradeGateProps {
    planName: string
    feature: string
    children?: React.ReactNode
}

/**
 * Drop-in upgrade prompt shown when a feature requires a higher plan.
 * Render this instead of the gated content.
 */
export function UpgradeGate({ planName, feature, children }: UpgradeGateProps) {
    return (
        <div className="rounded-xl border p-6 text-center max-w-md mx-auto my-12" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(201,146,60,0.2)' }}>
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(201,146,60,0.1)' }}
            >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {feature}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-faint)' }}>
                This feature requires <strong style={{ color: 'var(--gold-primary)' }}>{planName}</strong> or higher.
            </p>
            {children}
            <Link
                href="/pricing"
                className="inline-block text-sm font-semibold px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark, #8A6D30))', color: '#000' }}
            >
                View Plans
            </Link>
        </div>
    )
}
