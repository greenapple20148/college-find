'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { PLANS, PLAN_HIERARCHY, type PlanId } from '@/lib/feature-config'

/* ─── Plan Data ─────────────────────────────────────────────────── */

type BillingCycle = 'monthly' | 'yearly'

interface PlanTier {
    id: PlanId
    name: string
    tagline: string
    monthlyPrice: number
    yearlyPrice: number
    accent: string
    accentBg: string
    accentBorder: string
    popular?: boolean
    features: string[]
    cta: string
    ctaStyle: 'outline' | 'gold' | 'gradient'
}

const SUBSCRIPTION_PLANS: PlanTier[] = [
    {
        id: 'free',
        name: 'Free',
        tagline: 'Get started — no credit card required',
        monthlyPrice: 0,
        yearlyPrice: 0,
        accent: 'var(--gold-primary)',
        accentBg: 'rgba(201,146,60,0.06)',
        accentBorder: 'rgba(201,146,60,0.15)',
        features: PLANS.free.features,
        cta: 'Start Free',
        ctaStyle: 'outline',
    },
    {
        id: 'pro',
        name: 'Pro',
        tagline: 'For serious students actively applying',
        monthlyPrice: 12,
        yearlyPrice: 59,
        accent: 'var(--gold-primary)',
        accentBg: 'rgba(201,146,60,0.08)',
        accentBorder: 'rgba(201,146,60,0.25)',
        popular: true,
        features: PLANS.pro.features,
        cta: 'Upgrade to Pro',
        ctaStyle: 'gold',
    },
    {
        id: 'premium',
        name: 'Premium',
        tagline: 'Full toolkit for maximum results',
        monthlyPrice: 0,
        yearlyPrice: 99,
        accent: 'var(--gold-primary)',
        accentBg: 'rgba(201,146,60,0.1)',
        accentBorder: 'rgba(201,146,60,0.2)',
        features: PLANS.premium.features,
        cta: 'Go Premium',
        ctaStyle: 'gradient',
    },
]

/* ─── Icon Components ───────────────────────────────────────────── */

function CheckSvg({ color }: { color: string }) {
    return (
        <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function SparklesSvg() {
    return (
        <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    )
}

function ShieldSvg() {
    return (
        <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

/* ─── Component ─────────────────────────────────────────────────── */

export function PricingPage() {
    const [billing, setBilling] = useState<BillingCycle>('yearly')
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
    const { user } = useAuth()
    const { plan: currentPlan, level: currentLevel } = useSubscription()
    const router = useRouter()
    const searchParams = useSearchParams()
    const success = searchParams.get('success') === 'true'
    const canceled = searchParams.get('canceled') === 'true'
    const successPlan = searchParams.get('plan')

    async function handleCheckout(planId: string, cycle: 'monthly' | 'yearly') {
        if (!user) {
            router.push('/signup')
            return
        }
        setLoadingPlan(planId)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    billingCycle: cycle,
                    userId: user.id,
                    email: user.email,
                }),
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                console.error('Checkout error:', data.error)
            }
        } catch (err) {
            console.error('Checkout failed:', err)
        } finally {
            setLoadingPlan(null)
        }
    }

    async function handleManageBilling() {
        if (!user) return
        try {
            const res = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Portal error:', err)
        }
    }

    return (
        <div
            className="min-h-screen py-16 px-4"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <div className="max-w-6xl mx-auto">
                {/* ── Success / Cancel banners ─────────────────────── */}
                {success && (
                    <div
                        className="rounded-xl border p-4 mb-8 text-center text-sm font-medium"
                        style={{
                            backgroundColor: 'rgba(201,146,60,0.08)',
                            borderColor: 'rgba(201,146,60,0.2)',
                            color: 'var(--gold-primary)',
                        }}
                    >
                        You&apos;re now on the <strong>{successPlan}</strong> plan. Welcome aboard!
                    </div>
                )}
                {canceled && (
                    <div
                        className="rounded-xl border p-4 mb-8 text-center text-sm"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-faint)',
                        }}
                    >
                        Checkout was canceled. No charges were made.
                    </div>
                )}

                {/* ── Header ────────────────────────────────────────── */}
                <div className="text-center mb-12">
                    <div
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-5"
                        style={{
                            backgroundColor: 'rgba(201,146,60,0.1)',
                            color: 'var(--gold-primary)',
                            border: '1px solid rgba(201,146,60,0.2)',
                        }}
                    >
                        <SparklesSvg />
                        Plans for every stage of your journey
                    </div>
                    <h1
                        className="text-4xl md:text-5xl font-bold mb-4 heading-serif"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Find the right plan
                        <br />
                        <span style={{ color: 'var(--gold-primary)' }}>for your future</span>
                    </h1>
                    <p
                        className="text-lg max-w-2xl mx-auto"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Whether you&apos;re just exploring or deep in applications — we have
                        tools to help you get accepted.
                    </p>
                </div>

                {/* ── Billing toggle ────────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    <button
                        onClick={() => setBilling('monthly')}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            backgroundColor:
                                billing === 'monthly'
                                    ? 'rgba(201,146,60,0.12)'
                                    : 'var(--bg-tertiary)',
                            color:
                                billing === 'monthly'
                                    ? 'var(--gold-primary)'
                                    : 'var(--text-faint)',
                            border: `1px solid ${billing === 'monthly' ? 'rgba(201,146,60,0.3)' : 'var(--border-subtle)'}`,
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBilling('yearly')}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all relative"
                        style={{
                            backgroundColor:
                                billing === 'yearly'
                                    ? 'rgba(201,146,60,0.12)'
                                    : 'var(--bg-tertiary)',
                            color:
                                billing === 'yearly'
                                    ? 'var(--gold-primary)'
                                    : 'var(--text-faint)',
                            border: `1px solid ${billing === 'yearly' ? 'rgba(201,146,60,0.3)' : 'var(--border-subtle)'}`,
                        }}
                    >
                        Yearly
                        <span
                            className="absolute -top-2.5 -right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                                backgroundColor: 'rgba(201,146,60,0.12)',
                                color: 'var(--gold-primary)',
                            }}
                        >
                            Save
                        </span>
                    </button>
                </div>

                {/* ── Subscription Cards ────────────────────────────── */}
                <div className="grid md:grid-cols-3 gap-5 mb-20">
                    {SUBSCRIPTION_PLANS.map(plan => {
                        const price =
                            billing === 'monthly'
                                ? (plan.monthlyPrice > 0 ? plan.monthlyPrice : plan.yearlyPrice)
                                : plan.yearlyPrice
                        const showMonthly = billing === 'monthly' && plan.monthlyPrice > 0
                        const isPopular = plan.popular
                        const planLevel = PLAN_HIERARCHY[plan.id] ?? 0
                        const isCurrent = currentPlan === plan.id || (currentLevel === planLevel && currentLevel > 0)
                        const isDowngrade = planLevel < currentLevel

                        // Premium is yearly-only
                        const isYearlyOnly = plan.id === 'premium' && billing === 'monthly'

                        return (
                            <div
                                key={plan.id}
                                className="relative rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: isCurrent
                                        ? 'rgba(201,146,60,0.5)'
                                        : isPopular
                                            ? plan.accentBorder
                                            : 'var(--border-subtle)',
                                    boxShadow: isCurrent
                                        ? '0 0 40px rgba(201,146,60,0.15)'
                                        : isPopular
                                            ? `0 0 40px ${plan.accentBg}`
                                            : 'var(--shadow-card)',
                                }}
                            >
                                {/* Current plan badge */}
                                {isCurrent && (
                                    <div
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            background: 'var(--gold-gradient)',
                                            color: '#fff',
                                        }}
                                    >
                                        Current Plan
                                    </div>
                                )}
                                {/* Popular badge (only if not current) */}
                                {isPopular && !isCurrent && (
                                    <div
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            background: 'var(--gold-gradient)',
                                            color: '#fff',
                                        }}
                                    >
                                        Most Popular
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="mb-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: plan.accent }}
                                        />
                                        <h3
                                            className="text-lg font-bold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {plan.name}
                                        </h3>
                                    </div>
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--text-faint)' }}
                                    >
                                        {plan.tagline}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1.5">
                                        <span
                                            className="text-4xl font-bold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {price === 0 ? 'Free' : `$${price}`}
                                        </span>
                                        {price > 0 && (
                                            <span
                                                className="text-sm"
                                                style={{ color: 'var(--text-faint)' }}
                                            >
                                                /{showMonthly ? 'mo' : 'yr'}
                                            </span>
                                        )}
                                    </div>
                                    {isYearlyOnly && (
                                        <p className="text-xs mt-1" style={{ color: 'var(--gold-primary)' }}>
                                            Annual plan only — ${Math.round(plan.yearlyPrice / 12)}/mo billed yearly
                                        </p>
                                    )}
                                    {billing === 'yearly' && plan.monthlyPrice > 0 && (
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>
                                            <span
                                                style={{
                                                    textDecoration: 'line-through',
                                                    marginRight: '4px',
                                                }}
                                            >
                                                ${plan.monthlyPrice * 12}/yr
                                            </span>
                                            <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
                                                Save ${plan.monthlyPrice * 12 - plan.yearlyPrice}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-2.5 mb-8 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <CheckSvg color={plan.accent} />
                                            <span
                                                className="text-sm"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {isCurrent ? (
                                    <button
                                        onClick={handleManageBilling}
                                        className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 hover:opacity-90"
                                        style={{
                                            backgroundColor: 'rgba(201,146,60,0.1)',
                                            color: 'var(--gold-primary)',
                                            border: '1px solid rgba(201,146,60,0.3)',
                                        }}
                                    >
                                        Manage Billing
                                    </button>
                                ) : isDowngrade || plan.id === 'free' ? (
                                    <Link
                                        href={user ? '/dashboard' : '/signup'}
                                        className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 hover:opacity-90"
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: 'var(--text-secondary)',
                                            border: '1px solid var(--border-subtle)',
                                        }}
                                    >
                                        {user ? 'Go to Dashboard' : 'Start Free'}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => handleCheckout(plan.id, isYearlyOnly ? 'yearly' : billing)}
                                        disabled={loadingPlan === plan.id}
                                        className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                                        style={
                                            plan.ctaStyle === 'gold'
                                                ? {
                                                    background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
                                                    color: '#fff',
                                                    boxShadow: '0 4px 20px rgba(201,146,60,0.25)',
                                                    border: 'none',
                                                }
                                                : {
                                                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-primary))',
                                                    color: '#fff',
                                                    boxShadow: '0 4px 20px rgba(201,146,60,0.2)',
                                                    border: 'none',
                                                }
                                        }
                                    >
                                        {loadingPlan === plan.id ? 'Redirecting...' : plan.cta}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* ── Feature Comparison Table ─────────────────────────── */}
                <div className="mb-20">
                    <h2
                        className="text-2xl md:text-3xl font-bold text-center mb-8 heading-serif"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Compare Plans
                    </h2>
                    <div
                        className="rounded-2xl border overflow-hidden"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th className="text-left px-5 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Feature</th>
                                    <th className="text-center px-4 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Free</th>
                                    <th className="text-center px-4 py-4 font-semibold" style={{ color: 'var(--gold-primary)' }}>Pro</th>
                                    <th className="text-center px-4 py-4 font-semibold" style={{ color: 'var(--gold-primary)' }}>Premium</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'SAT practice questions', free: '15/day', pro: 'Unlimited', premium: 'Unlimited' },
                                    { feature: 'AI advisor messages', free: '3/day', pro: '50/month', premium: 'Unlimited' },
                                    { feature: 'Essay brainstorming', free: '1/day', pro: 'Unlimited', premium: 'Unlimited' },
                                    { feature: 'Saved colleges', free: '5', pro: 'Unlimited', premium: 'Unlimited' },
                                    { feature: 'AI answer explanations', free: '—', pro: true, premium: true },
                                    { feature: 'Personalized recommendations', free: '—', pro: true, premium: true },
                                    { feature: 'Admission predictor', free: '—', pro: true, premium: true },
                                    { feature: 'Full application checklist', free: '—', pro: true, premium: true },
                                    { feature: 'Deadline tracker', free: '—', pro: true, premium: true },
                                    { feature: 'Scholarship alerts', free: '—', pro: true, premium: true },
                                    { feature: 'Score improvement predictor', free: '—', pro: '—', premium: true },
                                    { feature: 'Weak area diagnostics', free: '—', pro: '—', premium: true },
                                    { feature: 'Personalized study plan', free: '—', pro: '—', premium: true },
                                    { feature: 'AI admission strategy', free: '—', pro: '—', premium: true },
                                    { feature: 'Major & career match', free: '—', pro: '—', premium: true },
                                    { feature: 'Financial aid estimator', free: '—', pro: '—', premium: true },
                                    { feature: 'Essay feedback', free: '—', pro: '—', premium: true },
                                ].map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: '1px solid var(--border-subtle)',
                                            backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(201,146,60,0.02)',
                                        }}
                                    >
                                        <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{row.feature}</td>
                                        <td className="text-center px-4 py-3" style={{ color: 'var(--text-faint)' }}>
                                            {typeof row.free === 'string' ? row.free : <CheckSvg color="var(--gold-primary)" />}
                                        </td>
                                        <td className="text-center px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {typeof row.pro === 'string' ? row.pro : row.pro === true ? <span className="inline-flex justify-center"><CheckSvg color="var(--gold-primary)" /></span> : row.pro}
                                        </td>
                                        <td className="text-center px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {typeof row.premium === 'string' ? row.premium : row.premium === true ? <span className="inline-flex justify-center"><CheckSvg color="var(--gold-primary)" /></span> : row.premium}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Trust bar ──────────────────────────────────────── */}
                <div
                    className="rounded-2xl border p-8 text-center"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-subtle)',
                    }}
                >
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {[
                            {
                                icon: <ShieldSvg />,
                                label: 'Secure checkout',
                            },
                            {
                                icon: (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                        <path d="M21 3v5h-5" />
                                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                        <path d="M8 16H3v5" />
                                    </svg>
                                ),
                                label: 'Cancel anytime',
                            },
                            {
                                icon: (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                ),
                                label: 'Email support',
                            },
                            {
                                icon: (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                    </svg>
                                ),
                                label: 'Built for students',
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2"
                                style={{ color: 'var(--text-faint)' }}
                            >
                                {item.icon}
                                <span className="text-sm">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FAQ ────────────────────────────────────────────── */}
                <div className="mt-16 max-w-2xl mx-auto">
                    <h2
                        className="text-2xl font-bold text-center mb-8 heading-serif"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'Can I use CollegeFind for free?',
                                a: 'Absolutely! The free plan gives you 15 SAT practice questions per day, basic college search, up to 5 saved colleges, and limited AI advisor access — enough to get started.',
                            },
                            {
                                q: 'What does Pro unlock?',
                                a: 'Pro gives you unlimited SAT practice, AI answer explanations, personalized college recommendations, unlimited saved colleges, the full application checklist, deadline tracker, and scholarship alerts.',
                            },
                            {
                                q: 'What makes Premium worth it?',
                                a: 'Premium adds advanced tools: SAT score improvement predictor, weak area diagnostics, a personalized study plan, AI admission strategy, major & career matching, financial aid estimator, essay feedback, and unlimited AI advisor usage.',
                            },
                            {
                                q: 'What happens if I cancel?',
                                a: 'You keep access until the end of your billing period. After that, you\u2019ll be downgraded to the Free plan. Your saved data is never deleted.',
                            },
                            {
                                q: 'Can I upgrade from Pro to Premium?',
                                a: 'Yes! When you upgrade, we prorate the cost for the remainder of your current billing period.',
                            },
                            {
                                q: 'Is my payment information secure?',
                                a: 'All payments are processed through Stripe, a PCI-compliant payment processor. We never see or store your full card details.',
                            },
                        ].map((faq, i) => (
                            <details
                                key={i}
                                className="group rounded-xl border overflow-hidden"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-subtle)',
                                }}
                            >
                                <summary
                                    className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold list-none"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {faq.q}
                                    <svg
                                        className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ color: 'var(--text-faint)' }}
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </summary>
                                <div
                                    className="px-5 pb-4 text-sm leading-relaxed"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* ── Bottom CTA ─────────────────────────────────────── */}
                <div className="text-center mt-16 mb-8">
                    <p
                        className="text-sm mb-4"
                        style={{ color: 'var(--text-faint)' }}
                    >
                        Not sure which plan is right for you?
                    </p>
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                        style={{
                            background:
                                'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(201,146,60,0.2)',
                        }}
                    >
                        Start exploring for free
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
