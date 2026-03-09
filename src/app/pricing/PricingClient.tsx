'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'

/* ─── Plan Data ─────────────────────────────────────────────────── */

type BillingCycle = 'monthly' | 'yearly'

interface PlanTier {
    id: string
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
        features: [
            'College search (6,000+ schools)',
            'Admission chance calculator',
            'View college profiles',
            'Save up to 10 colleges',
            'Cost & ROI calculators',
            'View application deadlines',
            'Compare up to 2 colleges',
        ],
        cta: 'Start Free',
        ctaStyle: 'outline',
    },
    {
        id: 'student-pro',
        name: 'Student Pro',
        tagline: 'For seniors actively applying',
        monthlyPrice: 7,
        yearlyPrice: 29,
        accent: 'var(--gold-primary)',
        accentBg: 'rgba(201,146,60,0.08)',
        accentBorder: 'rgba(201,146,60,0.25)',
        popular: true,
        features: [
            'Unlimited saved colleges',
            'Advanced admission model',
            'Unlimited college comparisons',
            'Application deadline tracker',
            'Scholarship search',
            'Personalized college recommendations',
            'Application checklist per college',
            'College essay guides & examples',
        ],
        cta: 'Upgrade to Pro',
        ctaStyle: 'gold',
    },
    {
        id: 'prep-pro-plus',
        name: 'College Prep Pro+',
        tagline: 'Full toolkit for serious applicants',
        monthlyPrice: 12,
        yearlyPrice: 49,
        accent: 'var(--gold-primary)',
        accentBg: 'rgba(201,146,60,0.1)',
        accentBorder: 'rgba(201,146,60,0.2)',
        features: [
            'Everything in Student Pro',
            'AI college advisor (chat)',
            'Essay Toolkit (8 AI tools)',
            'Essay analyzer & idea scorer',
            'Supplemental essay helper',
            'Activity resume guide',
            'Early access to new features',
        ],
        cta: 'Go Pro+',
        ctaStyle: 'gradient',
    },
]

interface OneTimePlan {
    id: string
    name: string
    price: number
    badge: string
    badgeColor: string
    badgeBg: string
    tagline: string
    features: string[]
}

const ONE_TIME_PLANS: OneTimePlan[] = [
    {
        id: 'toolkit',
        name: 'College Application Toolkit',
        price: 19,
        badge: 'One-Time',
        badgeColor: 'var(--gold-primary)',
        badgeBg: 'rgba(201,146,60,0.08)',
        tagline: 'Pay once — keep access for 6 months',
        features: [
            'Pro features for 6 months',
            'Unlimited comparisons & saves',
            'Application checklist',
            'Personalized recommendations',
        ],
    },
    {
        id: 'bundle',
        name: 'College Application Bundle',
        price: 25,
        badge: 'Best Value',
        badgeColor: '#C9923C',
        badgeBg: 'rgba(201,146,60,0.1)',
        tagline: 'Everything you need — one purchase',
        features: [
            'All Pro+ features for 6 months',
            'Essay Toolkit (8 AI tools)',
            'AI college advisor (chat)',
            'Application checklist & tracker',
        ],
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
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

function SparklesSvg() {
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
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

function GiftSvg() {
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
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

    const PLAN_LEVEL: Record<string, number> = {
        free: 0, 'student-pro': 1, toolkit: 1, 'prep-pro-plus': 2, bundle: 2,
    }

    async function handleCheckout(planId: string, cycle: 'monthly' | 'yearly' | 'one_time') {
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
                        You&apos;re now on the <strong>{successPlan?.replace('-', ' ')}</strong> plan. Welcome aboard!
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
                            billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
                        const isPopular = plan.popular
                        const planLevel = PLAN_LEVEL[plan.id] ?? 0
                        const isCurrent = currentPlan === plan.id || (currentLevel === planLevel && currentLevel > 0)
                        const isDowngrade = planLevel < currentLevel

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
                                                /{billing === 'monthly' ? 'mo' : 'yr'}
                                            </span>
                                        )}
                                    </div>
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
                                        onClick={() => handleCheckout(plan.id, billing)}
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

                {/* ── One-Time Purchases ─────────────────────────────── */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <div
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-4"
                            style={{
                                backgroundColor: 'rgba(201,146,60,0.08)',
                                color: 'var(--gold-primary)',
                                border: '1px solid rgba(201,146,60,0.15)',
                            }}
                        >
                            <GiftSvg />
                            One-Time Purchases — No Subscription Needed
                        </div>
                        <h2
                            className="text-2xl md:text-3xl font-bold heading-serif"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Prefer to pay once?
                        </h2>
                        <p
                            className="text-sm mt-2 max-w-md mx-auto"
                            style={{ color: 'var(--text-faint)' }}
                        >
                            Get everything you need for your applications with a single
                            purchase — no recurring charges.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        {ONE_TIME_PLANS.map(plan => (
                            <div
                                key={plan.id}
                                className="rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-subtle)',
                                    boxShadow: 'var(--shadow-card)',
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3
                                        className="text-lg font-bold"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {plan.name}
                                    </h3>
                                    <span
                                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                                        style={{
                                            backgroundColor: plan.badgeBg,
                                            color: plan.badgeColor,
                                        }}
                                    >
                                        {plan.badge}
                                    </span>
                                </div>
                                <p
                                    className="text-sm mb-4"
                                    style={{ color: 'var(--text-faint)' }}
                                >
                                    {plan.tagline}
                                </p>

                                <div className="mb-5">
                                    <span
                                        className="text-3xl font-bold"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        ${plan.price}
                                    </span>
                                    <span
                                        className="text-sm ml-1"
                                        style={{ color: 'var(--text-ghost)' }}
                                    >
                                        one-time
                                    </span>
                                </div>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <CheckSvg color={plan.badgeColor} />
                                            <span
                                                className="text-sm"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleCheckout(plan.id, 'one_time' as 'monthly')}
                                    disabled={loadingPlan === plan.id}
                                    className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                                    style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-subtle)',
                                    }}
                                >
                                    {loadingPlan === plan.id ? 'Redirecting...' : `Get ${plan.name}`}
                                </button>
                            </div>
                        ))}
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
                                    <svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
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
                                    <svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                ),
                                label: 'Email support',
                            },
                            {
                                icon: (
                                    <svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
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
                                a: 'Absolutely! The free plan gives you access to college search, admission calculators, profiles, and deadlines — enough for most exploratory research.',
                            },
                            {
                                q: 'What happens if I cancel?',
                                a: 'You keep access until the end of your billing period. After that, you\u2019ll be downgraded to the Free plan. Your saved data is never deleted.',
                            },
                            {
                                q: 'Are the one-time purchases separate from subscriptions?',
                                a: 'Yes. One-time purchases give you time-limited access to Pro features without an ongoing subscription. Great for students who only need tools during application season.',
                            },
                            {
                                q: 'Can I upgrade mid-billing to the College Prep Pro+ plan?',
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
