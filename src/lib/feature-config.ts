/**
 * ═══════════════════════════════════════════════════════════
 *  CollegeFind — Central Feature Configuration
 *  Single source of truth for plan limits, features, and pricing
 * ═══════════════════════════════════════════════════════════
 */

// ─── Plan IDs ────────────────────────────────────────────────
export type PlanId = 'free' | 'pro' | 'premium'

export const PLAN_HIERARCHY: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    premium: 2,
}

// ─── Feature Keys ────────────────────────────────────────────
export type FeatureKey =
    | 'sat_questions'
    | 'ai_advisor'
    | 'essay_brainstorm'
    | 'saved_colleges'
    | 'ai_explanations'
    | 'college_recommendations'
    | 'admission_predictor'
    | 'full_checklist'
    | 'deadline_tracker'
    | 'scholarship_alerts'
    | 'score_improvement_predictor'
    | 'weak_area_diagnostics'
    | 'personalized_study_plan'
    | 'ai_admission_strategy'
    | 'major_career_match'
    | 'financial_aid_estimator'
    | 'essay_feedback'
    | 'scholarship_search'

// ─── Limit Types ─────────────────────────────────────────────
export type LimitPeriod = 'daily' | 'monthly' | 'total'

export interface FeatureLimit {
    limit: number            // Infinity = unlimited
    period: LimitPeriod
}

export interface FeatureDefinition {
    /** Human-readable feature name */
    label: string
    /** Plan required to access this feature (minimum) */
    minPlan: PlanId
    /** Usage limits per plan (if rate-limited) */
    limits?: Partial<Record<PlanId, FeatureLimit>>
    /** Upgrade prompt shown when blocked */
    upgradeMessage: string
}

// ─── Feature Definitions ─────────────────────────────────────
export const FEATURES: Record<FeatureKey, FeatureDefinition> = {

    // ── Rate-limited features ──────────────────────────────────

    sat_questions: {
        label: 'SAT Practice Questions',
        minPlan: 'free',
        limits: {
            free: { limit: 15, period: 'daily' },
            pro: { limit: Infinity, period: 'daily' },
            premium: { limit: Infinity, period: 'daily' },
        },
        upgradeMessage: "You've reached your daily SAT practice limit. Upgrade to Pro for unlimited practice.",
    },

    ai_advisor: {
        label: 'AI College Advisor',
        minPlan: 'free',
        limits: {
            free: { limit: 3, period: 'daily' },
            pro: { limit: 50, period: 'monthly' },
            premium: { limit: Infinity, period: 'monthly' },
        },
        upgradeMessage: "You've used all your AI advisor messages today. Upgrade to Pro for up to 50 per month.",
    },

    essay_brainstorm: {
        label: 'Essay Brainstorming',
        minPlan: 'free',
        limits: {
            free: { limit: 1, period: 'daily' },
            pro: { limit: Infinity, period: 'daily' },
            premium: { limit: Infinity, period: 'daily' },
        },
        upgradeMessage: "You've used your daily essay brainstorm. Upgrade to Pro for unlimited brainstorming.",
    },

    saved_colleges: {
        label: 'Saved Colleges',
        minPlan: 'free',
        limits: {
            free: { limit: 5, period: 'total' },
            pro: { limit: Infinity, period: 'total' },
            premium: { limit: Infinity, period: 'total' },
        },
        upgradeMessage: "You've reached the limit of 5 saved colleges. Upgrade to Pro to save unlimited schools.",
    },

    scholarship_search: {
        label: 'Scholarship Search',
        minPlan: 'free',
        limits: {
            free: { limit: 5, period: 'daily' },  // limited results
            pro: { limit: Infinity, period: 'daily' },
            premium: { limit: Infinity, period: 'daily' },
        },
        upgradeMessage: 'See all matching scholarships with Pro.',
    },

    // ── Pro-gated features (boolean access, no usage counting) ──

    ai_explanations: {
        label: 'AI Answer Explanations',
        minPlan: 'pro',
        upgradeMessage: 'Upgrade to Pro to get step-by-step AI explanations for every SAT question.',
    },

    college_recommendations: {
        label: 'Personalized College Recommendations',
        minPlan: 'pro',
        upgradeMessage: 'Upgrade to Pro for AI-powered personalized college recommendations.',
    },

    admission_predictor: {
        label: 'Admission Chance Predictor',
        minPlan: 'pro',
        upgradeMessage: 'Upgrade to Pro to see your admission chances at every college.',
    },

    full_checklist: {
        label: 'Full Application Checklist',
        minPlan: 'pro',
        upgradeMessage: 'Upgrade to Pro for the complete application checklist with per-college tracking.',
    },

    deadline_tracker: {
        label: 'Application Deadline Tracker',
        minPlan: 'pro',
        upgradeMessage: 'Upgrade to Pro to track all your application deadlines in one place.',
    },

    scholarship_alerts: {
        label: 'Scholarship Alerts',
        minPlan: 'pro',
        upgradeMessage: 'Upgrade to Pro to get alerts when new scholarships match your profile.',
    },

    // ── Premium-gated features ─────────────────────────────────

    score_improvement_predictor: {
        label: 'SAT Score Improvement Predictor',
        minPlan: 'premium',
        upgradeMessage: 'Upgrade to Premium to predict how much you can improve your SAT score.',
    },

    weak_area_diagnostics: {
        label: 'Weak Area Diagnostics',
        minPlan: 'premium',
        upgradeMessage: 'Upgrade to Premium for detailed diagnostics on your weak areas.',
    },

    personalized_study_plan: {
        label: 'Personalized SAT Study Plan',
        minPlan: 'premium',
        upgradeMessage: 'Upgrade to Premium for a customized weekly study plan.',
    },

    ai_admission_strategy: {
        label: 'AI College Admission Strategy',
        minPlan: 'premium',
        upgradeMessage: 'Upgrade to Premium for AI-powered admission strategy recommendations.',
    },

    major_career_match: {
        label: 'Major & Career Match Engine',
        minPlan: 'premium',
        upgradeMessage: 'Upgrade to Premium to discover the best major and career matches for you.',
    },

    financial_aid_estimator: {
        label: 'Financial Aid Estimator',
        minPlan: 'premium',
        upgradeMessage: 'Upgrade to Premium for personalized financial aid estimates.',
    },

    essay_feedback: {
        label: 'Essay Feedback & Improvement',
        minPlan: 'premium',
        upgradeMessage: 'Upgrade to Premium for AI-powered essay feedback and suggestions.',
    },
}

// ─── Pricing Configuration ───────────────────────────────────

export interface PlanConfig {
    id: PlanId
    name: string
    tagline: string
    monthlyPrice: number
    yearlyPrice: number
    features: string[]
}

export const PLANS: Record<PlanId, PlanConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        tagline: 'Get started — no credit card required',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            '15 SAT practice questions per day',
            'Basic SAT score estimator',
            'Basic college search (6,000+ schools)',
            'Save up to 5 colleges',
            '1 essay brainstorm per day',
            '3 AI advisor questions per day',
            'Basic application checklist',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        tagline: 'For serious students actively applying',
        monthlyPrice: 12,
        yearlyPrice: 59,
        features: [
            'Unlimited SAT practice questions',
            'AI explanations for SAT answers',
            'Personalized college recommendations',
            'Save unlimited colleges',
            'Admission chance predictor',
            'Full application checklist',
            'Deadline tracker',
            'Scholarship alerts',
            'Unlimited essay brainstorming',
            '50 AI advisor questions per month',
        ],
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        tagline: 'Full toolkit for maximum results',
        monthlyPrice: 0,  // annual only
        yearlyPrice: 99,
        features: [
            'Everything in Pro',
            'SAT score improvement predictor',
            'Weak area diagnostics',
            'Personalized SAT study plan',
            'AI college admission strategy',
            'Major & career match engine',
            'Financial aid estimator',
            'Essay feedback & improvement suggestions',
            'Unlimited AI advisor usage',
        ],
    },
}

// ─── Convenience helpers ─────────────────────────────────────

/** Get the numeric level for a plan string (defaults to free) */
export function getPlanLevel(plan: string | null | undefined): number {
    return PLAN_HIERARCHY[(plan as PlanId)] ?? 0
}

/** Get limit for a feature at a given plan */
export function getFeatureLimit(feature: FeatureKey, plan: PlanId): FeatureLimit | null {
    const def = FEATURES[feature]
    if (!def.limits) return null
    return def.limits[plan] ?? def.limits.free ?? null
}

/** Quick check: does this plan have access to this feature at all? */
export function hasFeatureAccess(feature: FeatureKey, plan: PlanId): boolean {
    const def = FEATURES[feature]
    return getPlanLevel(plan) >= getPlanLevel(def.minPlan)
}
