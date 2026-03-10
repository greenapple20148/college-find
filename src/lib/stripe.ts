import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

if (!key) {
    console.warn('[STRIPE] STRIPE_SECRET_KEY is not set — Stripe features will be unavailable')
}

export const stripe = key
    ? new Stripe(key, {
        apiVersion: '2026-02-25.clover',
        typescript: true,
    })
    : (null as unknown as Stripe)

/**
 * Map plan IDs to Stripe Price IDs.
 * After creating products/prices in Stripe Dashboard, paste the price_xxx IDs here.
 *
 * Plans:
 *   - pro:     $12/month or $59/year
 *   - premium: $99/year only
 *
 * Legacy (kept for existing subscribers):
 *   - student-pro, prep-pro-plus, toolkit, bundle
 */
export const STRIPE_PRICE_MAP: Record<string, { monthly?: string; yearly?: string; oneTime?: string }> = {
    // ── New plan IDs ─────────────────────────────────
    'pro': {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
    },
    'premium': {
        yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? '',
    },

    // ── Legacy plan IDs (kept for backward compat) ───
    'student-pro': {
        monthly: process.env.STRIPE_PRICE_STUDENT_PRO_MONTHLY ?? '',
        yearly: process.env.STRIPE_PRICE_STUDENT_PRO_YEARLY ?? '',
    },
    'prep-pro-plus': {
        monthly: process.env.STRIPE_PRICE_PREP_PRO_PLUS_MONTHLY ?? '',
        yearly: process.env.STRIPE_PRICE_PREP_PRO_PLUS_YEARLY ?? '',
    },
    'toolkit': {
        oneTime: process.env.STRIPE_PRICE_TOOLKIT ?? '',
    },
    'bundle': {
        oneTime: process.env.STRIPE_PRICE_BUNDLE ?? '',
    },
}

/**
 * Get or create a Stripe customer for a Supabase user.
 */
export async function getOrCreateStripeCustomer(
    userId: string,
    email: string,
    existingCustomerId?: string | null
): Promise<string> {
    if (existingCustomerId) return existingCustomerId

    const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
    })

    return customer.id
}
