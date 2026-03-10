'use client'

/**
 * UpgradePrompt — Shown when a user hits a feature limit or tries to access a gated feature.
 *
 * Usage:
 *   <UpgradePrompt
 *     message="You've reached your daily SAT practice limit."
 *     remaining={0}
 *     feature="sat_questions"
 *   />
 */

import Link from 'next/link'
import type { FeatureKey } from '@/lib/feature-config'
import { FEATURES } from '@/lib/feature-config'

interface UpgradePromptProps {
    /** Custom message (overrides the default from feature config) */
    message?: string
    /** Feature key (used to look up the default message) */
    feature?: FeatureKey
    /** If > 0, show "X remaining" instead of a hard block */
    remaining?: number | null
    /** Variant: inline banner or full-page overlay */
    variant?: 'banner' | 'card' | 'inline'
    /** Optional callback when the user dismisses (only for cards) */
    onDismiss?: () => void
}

export function UpgradePrompt({
    message,
    feature,
    remaining,
    variant = 'banner',
    onDismiss,
}: UpgradePromptProps) {
    const displayMessage = message ?? (feature ? FEATURES[feature]?.upgradeMessage : '') ?? 'Upgrade your plan to unlock this feature.'

    // ── Inline: small text hint ──
    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{
                backgroundColor: 'rgba(201,146,60,0.06)',
                border: '1px solid rgba(201,146,60,0.15)',
                color: 'var(--text-secondary)',
            }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
                <span>{displayMessage}</span>
                <Link
                    href="/pricing"
                    className="font-semibold hover:underline whitespace-nowrap ml-auto"
                    style={{ color: 'var(--gold-primary)' }}
                >
                    Upgrade →
                </Link>
            </div>
        )
    }

    // ── Banner: full-width alert ──
    if (variant === 'banner') {
        return (
            <div className="rounded-xl p-4 border" style={{
                backgroundColor: 'rgba(201,146,60,0.06)',
                borderColor: 'rgba(201,146,60,0.2)',
            }}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{
                        background: 'rgba(201,146,60,0.12)',
                    }}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {remaining != null && remaining > 0
                                ? `${remaining} use${remaining !== 1 ? 's' : ''} remaining today`
                                : 'Limit reached'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {displayMessage}
                        </p>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                            style={{ background: 'var(--gold-gradient)', color: '#fff' }}
                        >
                            View Plans
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // ── Card: centered modal-style ──
    return (
        <div className="rounded-2xl p-6 border text-center" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'rgba(201,146,60,0.2)',
            boxShadow: '0 0 40px rgba(201,146,60,0.05)',
        }}>
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{
                background: 'rgba(201,146,60,0.1)',
            }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Upgrade Your Plan
            </h3>
            <p className="text-sm mb-5 mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: '320px' }}>
                {displayMessage}
            </p>
            <div className="flex items-center justify-center gap-3">
                <Link
                    href="/pricing"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'var(--gold-gradient)', color: '#fff' }}
                >
                    See Pricing
                </Link>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:border-[var(--gold-primary)]"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                        Maybe Later
                    </button>
                )}
            </div>
        </div>
    )
}

/**
 * RemainingBadge — Small badge showing remaining uses. Shows near feature buttons.
 */
export function RemainingBadge({ remaining }: { remaining: number | null }) {
    if (remaining === null || remaining < 0) return null
    if (remaining > 10) return null  // Don't show when plenty left

    const isLow = remaining <= 3
    const color = isLow ? '#dc2626' : 'var(--gold-primary)'
    const bg = isLow ? 'rgba(220,38,38,0.08)' : 'rgba(201,146,60,0.08)'

    return (
        <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: bg }}
        >
            {remaining} left
        </span>
    )
}
