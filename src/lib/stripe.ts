import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
})

/**
 * Map plan IDs to Stripe Price IDs.
 * After creating products/prices in Stripe Dashboard, paste the price_xxx IDs here.
 */
export const STRIPE_PRICE_MAP: Record<string, { monthly?: string; yearly?: string; oneTime?: string }> = {
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
