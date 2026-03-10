'use client'

/**
 * ═══════════════════════════════════════════════════════════
 *  useFeatureGate — Client-side hook for feature gating
 *
 *  Usage:
 *    const { access, check, consume } = useFeatureGate('sat_questions')
 *
 *    if (!access.allowed) return <UpgradePrompt message={access.message} />
 *    // else render the feature
 * ═══════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { FEATURES, type FeatureKey, type PlanId, getPlanLevel } from '@/lib/feature-config'

export interface ClientFeatureAccess {
    /** Whether the user can use this feature right now */
    allowed: boolean
    /** Remaining uses in the current period (-1 = unlimited, null = not loaded yet) */
    remaining: number | null
    /** Whether the user needs to upgrade their plan */
    upgrade_required: boolean
    /** Block message to show to the user */
    message?: string
    /** Whether we're still loading the status */
    loading: boolean
}

const INITIAL: ClientFeatureAccess = {
    allowed: true,
    remaining: null,
    upgrade_required: false,
    loading: true,
}

export function useFeatureGate(feature: FeatureKey) {
    const { user } = useAuth()
    const [access, setAccess] = useState<ClientFeatureAccess>(INITIAL)

    // Fetch current access status
    const check = useCallback(async () => {
        if (!user) {
            // Anonymous users get free-tier access
            setAccess({ allowed: true, remaining: null, upgrade_required: false, loading: false })
            return
        }

        try {
            const res = await fetch(`/api/usage?feature=${feature}`)
            const data = await res.json()
            setAccess({
                allowed: data.allowed,
                remaining: data.remaining,
                upgrade_required: data.upgrade_required,
                message: data.message,
                loading: false,
            })
        } catch {
            // Fail open — don't block on network errors
            setAccess({ allowed: true, remaining: null, upgrade_required: false, loading: false })
        }
    }, [user, feature])

    useEffect(() => {
        check()
    }, [check])

    // Record a usage event and refresh access state
    const consume = useCallback(async (): Promise<boolean> => {
        if (!user) return true

        try {
            const res = await fetch('/api/usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feature }),
            })
            const data = await res.json()
            setAccess({
                allowed: data.allowed,
                remaining: data.remaining,
                upgrade_required: data.upgrade_required,
                message: data.message,
                loading: false,
            })
            return data.allowed
        } catch {
            return true // fail open
        }
    }, [user, feature])

    return { access, check, consume }
}

/**
 * Quick synchronous check: does the given plan string have access to a feature?
 * Useful for rendering UI conditionally without hitting the API.
 */
export function canAccess(feature: FeatureKey, plan: string | null | undefined): boolean {
    const def = FEATURES[feature]
    if (!def) return false
    return getPlanLevel(plan) >= getPlanLevel(def.minPlan)
}
