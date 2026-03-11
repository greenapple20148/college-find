'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const PLAN_LABELS: Record<string, string> = {
    'pro': 'CollegeFind Pro',
    'premium': 'CollegeFind Premium',
    'student-pro': 'Student Pro',
    'prep-pro-plus': 'College Prep Pro+',
    'toolkit': 'College Application Toolkit',
    'bundle': 'College Application Bundle',
}

function CheckCircleSvg() {
    return (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="var(--gold-primary)" strokeWidth="2.5" opacity="0.2" />
            <circle cx="32" cy="32" r="30" stroke="var(--gold-primary)" strokeWidth="2.5"
                strokeDasharray="188.5" strokeDashoffset="188.5"
                style={{ animation: 'draw-circle 0.6s ease-out 0.2s forwards' }}
            />
            <path d="M20 33l8 8 16-18" stroke="var(--gold-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="40" strokeDashoffset="40"
                style={{ animation: 'draw-check 0.4s ease-out 0.7s forwards' }}
            />
        </svg>
    )
}

function SparklesSvg() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}

function ArrowRightSvg() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}

export function SuccessPageClient() {
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan') ?? ''
    const planLabel = PLAN_LABELS[plan] ?? plan.replace(/-/g, ' ')
    const isOneTime = plan === 'toolkit' || plan === 'bundle'
    const [show, setShow] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setShow(true), 100)
        return () => clearTimeout(t)
    }, [])

    return (
        <>
            <style>{`
        @keyframes draw-circle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes confetti-float {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-60px) rotate(180deg); opacity: 0; }
        }
      `}</style>

            <div
                className="min-h-screen flex items-center justify-center px-4 py-20"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div
                    className="max-w-md w-full text-center transition-all duration-700"
                    style={{
                        opacity: show ? 1 : 0,
                        transform: show ? 'translateY(0)' : 'translateY(20px)',
                    }}
                >
                    {/* Animated check */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <CheckCircleSvg />
                            {/* Confetti dots */}
                            {[...Array(6)].map((_, i) => (
                                <span
                                    key={i}
                                    className="absolute w-1.5 h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: 'var(--gold-primary)',
                                        top: '50%',
                                        left: '50%',
                                        transform: `rotate(${i * 60}deg) translateY(-40px)`,
                                        animation: `confetti-float 1s ease-out ${0.8 + i * 0.1}s both`,
                                        opacity: 0.7,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Heading */}
                    <h1
                        className="text-3xl font-bold mb-2 heading-serif"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        You&apos;re all set!
                    </h1>
                    <p
                        className="text-lg mb-1"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        {planLabel}
                    </p>
                    <p
                        className="text-sm mb-8"
                        style={{ color: 'var(--text-faint)' }}
                    >
                        {isOneTime
                            ? 'Your access is active for the next 6 months.'
                            : 'Your subscription is now active. You can manage it anytime.'}
                    </p>

                    {/* Feature highlights */}
                    <div
                        className="rounded-xl border p-5 mb-8 text-left"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <p
                            className="text-xs font-medium uppercase tracking-wide mb-3 flex items-center gap-1.5"
                            style={{ color: 'var(--gold-primary)' }}
                        >
                            <SparklesSvg /> What&apos;s unlocked
                        </p>
                        <ul className="space-y-2">
                            {getFeatures(plan).map((f, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                            style={{
                                background: 'var(--gold-gradient)',
                                color: '#fff',
                                boxShadow: '0 4px 20px rgba(201,146,60,0.25)',
                            }}
                        >
                            Go to Dashboard
                            <ArrowRightSvg />
                        </Link>
                        <Link
                            href="/search"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-subtle)',
                            }}
                        >
                            Explore Colleges
                        </Link>
                    </div>

                    {/* Receipt note */}
                    <p className="text-xs mt-6" style={{ color: 'var(--text-ghost)' }}>
                        A receipt has been sent to your email. You can manage your subscription from the Pricing page.
                    </p>
                </div>
            </div>
        </>
    )
}

function getFeatures(plan: string): string[] {
    switch (plan) {
        case 'pro':
        case 'student-pro':
            return [
                'Unlimited SAT practice questions',
                'AI explanations for SAT answers',
                'Personalized college recommendations',
                'Save unlimited colleges',
                'Admission chance predictor',
                'Full application checklist',
                'Deadline tracker',
            ]
        case 'premium':
        case 'prep-pro-plus':
            return [
                'Everything in Pro',
                'SAT score improvement predictor',
                'Weak area diagnostics',
                'Personalized SAT study plan',
                'AI college admission strategy',
                'Major & career match engine',
                'Financial aid estimator',
                'Essay feedback & improvement suggestions',
                'Unlimited AI advisor usage',
            ]
        case 'toolkit':
            return [
                'Pro features for 6 months',
                'Activity resume builder',
                'Application checklist',
                'College comparison tools',
            ]
        case 'bundle':
            return [
                'Resume builder',
                'College planning tools',
                'Essay brainstorming tool',
                'Application tracker',
            ]
        default:
            return ['All premium features unlocked']
    }
}
