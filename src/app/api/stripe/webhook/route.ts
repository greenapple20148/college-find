import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.supabase_user_id
                const planId = session.metadata?.plan_id
                const billingCycle = session.metadata?.billing_cycle

                if (!userId || !planId) break

                if (session.mode === 'subscription' && session.subscription) {
                    // Fetch the full subscription to get period details
                    const sub = await stripe.subscriptions.retrieve(
                        session.subscription as string,
                        { expand: ['items.data'] }
                    )

                    // Period info is on the first subscription item
                    const firstItem = sub.items.data[0]
                    const periodStart = firstItem?.current_period_start
                    const periodEnd = firstItem?.current_period_end

                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: sub.id,
                        stripe_price_id: firstItem?.price.id,
                        plan_id: planId,
                        status: sub.status,
                        billing_cycle: billingCycle,
                        current_period_start: periodStart
                            ? new Date(periodStart * 1000).toISOString()
                            : null,
                        current_period_end: periodEnd
                            ? new Date(periodEnd * 1000).toISOString()
                            : null,
                    }, { onConflict: 'stripe_subscription_id' })

                    // Update user plan (upsert in case profile doesn't exist yet)
                    await supabaseAdmin
                        .from('user_profiles')
                        .upsert({ user_id: userId, plan: planId }, { onConflict: 'user_id' })

                } else if (session.mode === 'payment') {
                    // One-time purchase — grant 6 months access
                    const expiresAt = new Date()
                    expiresAt.setMonth(expiresAt.getMonth() + 6)

                    await supabaseAdmin.from('one_time_purchases').insert({
                        user_id: userId,
                        stripe_session_id: session.id,
                        plan_id: planId,
                        amount_paid: session.amount_total ?? 0,
                        expires_at: expiresAt.toISOString(),
                    })

                    await supabaseAdmin
                        .from('user_profiles')
                        .upsert({ user_id: userId, plan: planId }, { onConflict: 'user_id' })
                }
                break
            }

            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription
                const userId = sub.metadata?.supabase_user_id

                const firstItem = sub.items.data[0]
                const periodStart = firstItem?.current_period_start
                const periodEnd = firstItem?.current_period_end

                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: sub.status,
                        current_period_start: periodStart
                            ? new Date(periodStart * 1000).toISOString()
                            : null,
                        current_period_end: periodEnd
                            ? new Date(periodEnd * 1000).toISOString()
                            : null,
                        cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
                        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
                    })
                    .eq('stripe_subscription_id', sub.id)

                // If canceled, downgrade user
                if (sub.status === 'canceled' && userId) {
                    await supabaseAdmin
                        .from('user_profiles')
                        .upsert({ user_id: userId, plan: 'free' }, { onConflict: 'user_id' })
                }
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription
                const userId = sub.metadata?.supabase_user_id

                await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'canceled' })
                    .eq('stripe_subscription_id', sub.id)

                if (userId) {
                    await supabaseAdmin
                        .from('user_profiles')
                        .upsert({ user_id: userId, plan: 'free' }, { onConflict: 'user_id' })
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                // In the new API, subscription info is under parent.subscription_details
                const subId = invoice.parent?.subscription_details?.subscription
                if (subId) {
                    await supabaseAdmin
                        .from('subscriptions')
                        .update({ status: 'past_due' })
                        .eq('stripe_subscription_id', subId as string)
                }
                break
            }
        }
    } catch (err) {
        console.error('Webhook handler error:', err)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
