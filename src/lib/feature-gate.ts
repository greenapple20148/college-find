/**
 * ═══════════════════════════════════════════════════════════
 *  CollegeFind — Server-side Feature Gate
 *  Checks plan access + usage limits using Supabase
 * ═══════════════════════════════════════════════════════════
 */

import { createServiceClient } from '@/lib/supabase/server'
import {
    type FeatureKey,
    type PlanId,
    FEATURES,
    getPlanLevel,
    getFeatureLimit,
} from '@/lib/feature-config'

// ─── Result Types ────────────────────────────────────────────

export interface FeatureAccessResult {
    /** Whether the user can perform this action right now */
    allowed: boolean
    /** Remaining usage in the current period (-1 = unlimited, 0 = exhausted) */
    remaining: number
    /** Whether the user needs to upgrade (vs. just waiting for reset) */
    upgrade_required: boolean
    /** Human-readable message (only set when blocked) */
    message?: string
}

// ─── Date helpers ────────────────────────────────────────────

function todayStart(): string {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
}

function monthStart(): string {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
}

// ─── Core Gate Function ──────────────────────────────────────

/**
 * Check whether a user can access a feature.
 *
 * 1. Looks up the user's plan from user_profiles
 * 2. Checks if the plan meets the minimum required plan
 * 3. If the feature has usage limits, queries the usage_tracking table
 *
 * @param userId  Supabase auth user ID
 * @param feature Feature key from feature-config
 */
export async function checkFeatureAccess(
    userId: string,
    feature: FeatureKey
): Promise<FeatureAccessResult> {
    const supabase = createServiceClient()
    const def = FEATURES[feature]

    // 1. Get user's current plan
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('user_id', userId)
        .single()

    // Legacy plan mapping (matches useSubscription.ts)
    const LEGACY_MAP: Record<string, PlanId> = {
        free: 'free',
        'student-pro': 'pro',
        toolkit: 'pro',
        'prep-pro-plus': 'premium',
        bundle: 'premium',
    }

    const rawPlan = (profile?.plan ?? 'free') as string
    const plan = LEGACY_MAP[rawPlan] ?? (rawPlan as PlanId)
    const userLevel = getPlanLevel(plan)
    const requiredLevel = getPlanLevel(def.minPlan)

    // 2. Check plan-level access
    if (userLevel < requiredLevel) {
        return {
            allowed: false,
            remaining: 0,
            upgrade_required: true,
            message: def.upgradeMessage,
        }
    }

    // 3. Check usage limits (if any)
    const limitDef = getFeatureLimit(feature, plan)
    if (!limitDef || limitDef.limit === Infinity) {
        return { allowed: true, remaining: -1, upgrade_required: false }
    }

    // Determine the time window
    let periodStart: string
    switch (limitDef.period) {
        case 'daily':
            periodStart = todayStart()
            break
        case 'monthly':
            periodStart = monthStart()
            break
        case 'total':
            periodStart = '1970-01-01T00:00:00Z'
            break
    }

    // Count usage in the current period
    const { count } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('feature', feature)
        .gte('created_at', periodStart)

    const used = count ?? 0
    const remaining = Math.max(0, limitDef.limit - used)

    if (remaining <= 0) {
        return {
            allowed: false,
            remaining: 0,
            upgrade_required: false,
            message: def.upgradeMessage,
        }
    }

    return {
        allowed: true,
        remaining,
        upgrade_required: false,
    }
}

// ─── Record Usage ────────────────────────────────────────────

/**
 * Record a single usage event for a feature.
 * Call this AFTER the action succeeds.
 */
export async function recordUsage(
    userId: string,
    feature: FeatureKey
): Promise<void> {
    const supabase = createServiceClient()

    await supabase.from('usage_tracking').insert({
        user_id: userId,
        feature,
    })
}

// ─── Combined check-and-record ───────────────────────────────

/**
 * Convenience function: check access, and if allowed, record the usage.
 * Returns the access result so the caller can respond appropriately.
 */
export async function gateAndRecord(
    userId: string,
    feature: FeatureKey
): Promise<FeatureAccessResult> {
    const result = await checkFeatureAccess(userId, feature)
    if (result.allowed) {
        await recordUsage(userId, feature)
    }
    return result
}
