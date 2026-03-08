'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'

/* ═══════════════════════════════════════════════════════════════
   Plan hierarchy — higher index = more features
   ═══════════════════════════════════════════════════════════════ */

export type PlanId = 'free' | 'student-pro' | 'prep-pro-plus' | 'toolkit' | 'bundle'

const PLAN_LEVEL: Record<string, number> = {
    free: 0,
    'student-pro': 1,
    toolkit: 1,          // one-time toolkit = pro-level access
    'prep-pro-plus': 2,
    bundle: 2,           // one-time bundle = pro+ level access
}

/* ═══════════════════════════════════════════════════════════════
   Feature definitions
   ═══════════════════════════════════════════════════════════════ */

export interface PlanLimits {
    maxSavedColleges: number
    maxComparisons: number
    canExportList: boolean
    canUseAIAdvisor: boolean
    canUseEssayToolkit: boolean
    canViewRecommendations: boolean
    canUseChecklist: boolean
    hasEssayContent: boolean
}

const PLAN_LIMITS: Record<number, PlanLimits> = {
    0: {
        // Free
        maxSavedColleges: 10,
        maxComparisons: 2,
        canExportList: false,
        canUseAIAdvisor: false,
        canUseEssayToolkit: false,
        canViewRecommendations: false,
        canUseChecklist: false,
        hasEssayContent: true,        // SEO pages are free
    },
    1: {
        // Student Pro / Toolkit
        maxSavedColleges: Infinity,
        maxComparisons: Infinity,
        canExportList: true,
        canUseAIAdvisor: false,
        canUseEssayToolkit: false,
        canViewRecommendations: true,
        canUseChecklist: true,
        hasEssayContent: true,
    },
    2: {
        // Prep Pro+ / Bundle
        maxSavedColleges: Infinity,
        maxComparisons: Infinity,
        canExportList: true,
        canUseAIAdvisor: true,
        canUseEssayToolkit: true,
        canViewRecommendations: true,
        canUseChecklist: true,
        hasEssayContent: true,
    },
}

/* ═══════════════════════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════════════════════ */

export function useSubscription() {
    const { user } = useAuth()
    const [plan, setPlan] = useState<string>('free')
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
                    setPlan(data?.plan || 'free')
                } catch {
                    setPlan('free')
                } finally {
                    setLoading(false)
                }
            })()
    }, [user])

    const level = PLAN_LEVEL[plan] ?? 0
    const limits = PLAN_LIMITS[level] ?? PLAN_LIMITS[0]
    const isPro = level >= 1
    const isProPlus = level >= 2

    const PLAN_LABELS: Record<string, string> = {
        free: 'Free Plan',
        'student-pro': 'Student Pro',
        toolkit: 'Student Pro',
        'prep-pro-plus': 'Prep Pro+',
        bundle: 'Prep Pro+',
    }
    const planLabel = PLAN_LABELS[plan] ?? 'Free Plan'

    return {
        plan,
        planLabel,
        level,
        limits,
        isPro,
        isProPlus,
        loading,
        /** Check if user can perform an action; returns true or the required plan name */
        requirePlan: (minLevel: number): { allowed: boolean; requiredPlan: string } => {
            if (level >= minLevel) return { allowed: true, requiredPlan: '' }
            return {
                allowed: false,
                requiredPlan: minLevel >= 2 ? 'College Prep Pro+' : 'Student Pro',
            }
        },
    }
}
