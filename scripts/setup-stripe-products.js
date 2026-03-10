#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  Stripe Product & Price Setup Script
 *  Creates the Pro and Premium products with correct prices.
 *
 *  Usage:
 *    STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe-products.js
 *
 *  After running, paste the output price IDs into your .env:
 *    STRIPE_PRICE_PRO_MONTHLY=price_xxx
 *    STRIPE_PRICE_PRO_YEARLY=price_xxx
 *    STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
 * ═══════════════════════════════════════════════════════════
 */

const Stripe = require('stripe')

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
    console.error('ERROR: Set STRIPE_SECRET_KEY environment variable')
    process.exit(1)
}

const stripe = new Stripe(key)

async function main() {
    console.log('\n🔧 Creating Stripe Products & Prices for CollegeFind...\n')

    // ── 1. Pro Plan ────────────────────────────────────────────
    const proProduct = await stripe.products.create({
        name: 'CollegeFind Pro',
        description: 'Unlimited SAT practice, AI explanations, personalized recommendations, unlimited saved colleges, full checklist, deadline tracker, and scholarship alerts.',
        metadata: { plan_id: 'pro' },
    })
    console.log(`✓ Created product: ${proProduct.name} (${proProduct.id})`)

    const proMonthly = await stripe.prices.create({
        product: proProduct.id,
        unit_amount: 1200, // $12.00
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan_id: 'pro', billing_cycle: 'monthly' },
    })
    console.log(`  → Monthly price: $12/mo (${proMonthly.id})`)

    const proYearly = await stripe.prices.create({
        product: proProduct.id,
        unit_amount: 5900, // $59.00
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { plan_id: 'pro', billing_cycle: 'yearly' },
    })
    console.log(`  → Yearly price:  $59/yr (${proYearly.id})`)

    // ── 2. Premium Plan ────────────────────────────────────────
    const premiumProduct = await stripe.products.create({
        name: 'CollegeFind Premium',
        description: 'Everything in Pro plus score improvement predictor, weak area diagnostics, personalized study plan, AI admission strategy, major & career match, financial aid estimator, essay feedback, and unlimited AI advisor.',
        metadata: { plan_id: 'premium' },
    })
    console.log(`\n✓ Created product: ${premiumProduct.name} (${premiumProduct.id})`)

    const premiumYearly = await stripe.prices.create({
        product: premiumProduct.id,
        unit_amount: 9900, // $99.00
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { plan_id: 'premium', billing_cycle: 'yearly' },
    })
    console.log(`  → Yearly price:  $99/yr (${premiumYearly.id})`)

    // ── Output env vars ────────────────────────────────────────
    console.log('\n' + '═'.repeat(60))
    console.log('Add these to your .env.local:\n')
    console.log(`STRIPE_PRICE_PRO_MONTHLY=${proMonthly.id}`)
    console.log(`STRIPE_PRICE_PRO_YEARLY=${proYearly.id}`)
    console.log(`STRIPE_PRICE_PREMIUM_YEARLY=${premiumYearly.id}`)
    console.log('\n' + '═'.repeat(60))
}

main().catch(err => {
    console.error('Failed:', err.message)
    process.exit(1)
})
