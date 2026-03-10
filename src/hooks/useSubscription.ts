'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
    type PlanId,
    PLAN_HIERARCHY,
    PLANS,
    hasFeatureAccess,
    type FeatureKey,
} from '@/lib/feature-config'

/* ═══════════════════════════════════════════════════════════════
   Plan hierarchy — higher index = more features
   ═══════════════════════════════════════════════════════════════ */

// Legacy plan mapping (for users on old plan IDs)
const LEGACY_MAP: Record<string, PlanId> = {
    free: 'free',
    'student-pro': 'pro',
    toolkit: 'pro',
    'prep-pro-plus': 'premium',
    bundle: 'premium',
}

/* ═══════════════════════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════════════════════ */

export function useSubscription() {
    const { user } = useAuth()
    const [plan, setPlan] = useState<PlanId>('free')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setPlan('free')
            setLoading(false)
            return
        }

        const supabase = createClient()
            ; (async () => {
                try {
                    const { data } = await supabase
                        .from('user_profiles')
                        .select('plan')
                        .eq('user_id', user.id)
                        .single()

                    const rawPlan = data?.plan || 'free'
                    // Normalize legacy plan names to new plan IDs
                    const normalizedPlan = LEGACY_MAP[rawPlan] ?? (rawPlan as PlanId)
                    setPlan(normalizedPlan)
                } catch {
                    setPlan('free')
                } finally {
                    setLoading(false)
                }
            })()
    }, [user])

    const level = PLAN_HIERARCHY[plan] ?? 0
    const isPro = level >= 1
    const isPremium = level >= 2

    const planConfig = PLANS[plan] ?? PLANS.free
    const planLabel = planConfig.name

    return {
        /** Current plan ID */
        plan,
        /** Display name for the plan */
        planLabel,
        /** Numeric level (0=free, 1=pro, 2=premium) */
        level,
        /** Is the user on Pro or higher? */
        isPro,
        /** Is the user on Premium? */
        isPremium,
        /** Still fetching plan data? */
        loading,
        /** Check if a feature is available on the current plan */
        canAccess: (feature: FeatureKey): boolean => hasFeatureAccess(feature, plan),
        /** Check if user meets the minimum plan level */
        requirePlan: (minLevel: number): { allowed: boolean; requiredPlan: string } => {
            if (level >= minLevel) return { allowed: true, requiredPlan: '' }
            return {
                allowed: false,
                requiredPlan: minLevel >= 2 ? 'Premium' : 'Pro',
            }
        },
    }
}

// Re-export PlanId for convenience
export type { PlanId }
