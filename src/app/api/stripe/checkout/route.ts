import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, STRIPE_PRICE_MAP, getOrCreateStripeCustomer } from '@/lib/stripe'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { planId, billingCycle, userId, email } = body as {
            planId: string
            billingCycle: 'monthly' | 'yearly'
            userId: string
            email: string
        }

        if (!planId || !userId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Look up existing Stripe customer
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single()

        const customerId = await getOrCreateStripeCustomer(
            userId,
            email,
            profile?.stripe_customer_id
        )

        // Persist stripe_customer_id if new
        if (!profile?.stripe_customer_id) {
            await supabaseAdmin
                .from('user_profiles')
                .update({ stripe_customer_id: customerId })
                .eq('user_id', userId)
        }

        const priceConfig = STRIPE_PRICE_MAP[planId]
        if (!priceConfig) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const isOneTime = !!priceConfig.oneTime
        const priceId = isOneTime
            ? priceConfig.oneTime
            : billingCycle === 'yearly'
                ? priceConfig.yearly
                : priceConfig.monthly

        if (!priceId) {
            return NextResponse.json({ error: 'Price not configured' }, { status: 400 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        const sessionParams: Record<string, unknown> = {
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: isOneTime ? 'payment' : 'subscription',
            success_url: `${baseUrl}/checkout/success?plan=${planId}`,
            cancel_url: `${baseUrl}/pricing?canceled=true`,
            metadata: {
                supabase_user_id: userId,
                plan_id: planId,
                billing_cycle: isOneTime ? 'one_time' : billingCycle,
            },
            allow_promotion_codes: true,
        }

        if (!isOneTime) {
            sessionParams.subscription_data = {
                metadata: {
                    supabase_user_id: userId,
                    plan_id: planId,
                },
            }
        }

        const session = await stripe.checkout.sessions.create(
            sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
        )

        return NextResponse.json({ url: session.url })
    } catch (err) {
        console.error('Checkout error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal error' },
            { status: 500 }
        )
    }
}
