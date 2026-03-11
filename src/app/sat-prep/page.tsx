import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'SAT Ace — Free SAT Prep & Practice Tests',
    description:
        'Boost your SAT score with SAT Ace. Free score calculator, practice questions, full-length mock tests, AI explanations, and personalized study plans. Join thousands of students preparing for the Digital SAT.',
    alternates: { canonical: '/sat-prep' },
    openGraph: {
        title: 'SAT Ace — Free SAT Prep & Practice Tests',
        description:
            'Free SAT score calculator, practice questions, mock tests, AI explanations, and study planning. Everything you need to ace the Digital SAT.',
        url: '/sat-prep',
    },
}

const features = [
    {
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 4h16v16H4z" /><path d="M12 4v16M4 12h16" />
            </svg>
        ),
        title: 'Score Calculator',
        desc: 'Estimate your SAT score instantly. Enter raw scores and see your scaled score, percentile, and where you stand.',
        href: '/sat-prep/calculator',
        free: true,
    },
    {
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
        title: 'Practice Questions',
        desc: 'Master Math, Reading, and Writing with topic-tagged questions at every difficulty level. Get instant feedback.',
        href: '/sat-prep/practice',
        free: true,
    },
    {
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        title: 'Mock Tests',
        desc: 'Take full-length, timed Digital SAT practice exams. Get detailed score breakdowns by topic.',
        href: '/sat-prep/mock-tests',
        free: false,
    },
    {
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                <circle cx="12" cy="15" r="2" /><path d="M12 17v2" />
            </svg>
        ),
        title: 'AI Explanations',
        desc: 'Get step-by-step AI-powered explanations for every question. Understand why answers are right or wrong.',
        href: '/sat-prep/practice',
        free: false,
    },
    {
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
        title: 'Study Planner',
        desc: 'Get a personalized weekly study plan based on your target score, exam date, and strengths.',
        href: '/sat-prep/planner',
        free: false,
    },
    {
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
        ),
        title: 'Performance Analytics',
        desc: 'Track your accuracy by topic, see score trends, and identify weak areas to focus your study time.',
        href: '/sat-prep/analytics',
        free: false,
    },
]



export default function SATAcePage() {
    return (
        <div className="flex flex-col">
            {/* Hero */}
            <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                    style={{
                        background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,146,60,0.07) 0%, transparent 70%)',
                    }}
                />

                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>
                            SAT Preparation
                        </span>
                    </div>

                    <h1 className="heading-serif text-4xl sm:text-5xl lg:text-6xl mb-6 leading-[1.15]" style={{ color: 'var(--text-primary)' }}>
                        Ace the SAT with{' '}
                        <span className="heading-serif-italic text-gradient-gold">
                            confidence
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
                        Free SAT score calculator, adaptive practice questions, full-length mock tests, and AI-powered study tools.
                        Everything you need to hit your target score.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sat-prep/calculator"
                            className="btn-gold text-lg px-8 py-3"
                        >
                            Try Score Calculator →
                        </Link>
                        <Link
                            href="/sat-prep/practice"
                            className="btn-outline text-lg px-8 py-3"
                        >
                            Practice Questions
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-10">
                        {[
                            { num: '10K+', label: 'Questions' },
                            { num: '98', label: 'Topics' },
                            { num: '4.9★', label: 'Rating' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-xl font-bold" style={{ color: 'var(--gold-primary)' }}>{s.num}</div>
                                <div className="text-xs" style={{ color: 'var(--text-ghost)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4" aria-label="SAT Ace Features">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                            <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>
                                Features
                            </span>
                        </div>
                        <h2 className="heading-serif text-3xl sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                            Everything you need to{' '}
                            <span className="heading-serif-italic text-gradient-gold">
                                ace the SAT
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map(f => (
                            <Link
                                key={f.title}
                                href={f.href}
                                className="card-dark p-6 group relative overflow-hidden"
                            >
                                {!f.free && (
                                    <span
                                        className="absolute top-4 right-4 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                                        style={{
                                            background: 'rgba(201,146,60,0.12)',
                                            color: 'var(--gold-primary)',
                                            border: '1px solid rgba(201,146,60,0.25)',
                                        }}
                                    >
                                        Premium
                                    </span>
                                )}
                                <div
                                    className="mb-4 transition-transform duration-300 group-hover:scale-110 inline-block"
                                    style={{ color: 'var(--gold-primary)' }}
                                >
                                    {f.icon}
                                </div>
                                <h3 className="font-semibold mb-2 text-base" style={{ color: 'var(--text-primary)' }}>
                                    {f.title}
                                </h3>
                                <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
                                    {f.desc}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 relative" aria-label="How SAT Ace Works">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>
                            How It Works
                        </span>
                    </div>
                    <h2 className="heading-serif text-3xl sm:text-4xl mb-14" style={{ color: 'var(--text-primary)' }}>
                        Your path to a{' '}
                        <span className="heading-serif-italic text-gradient-gold">
                            higher score
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        {[
                            { step: '1', title: 'Take the Calculator', desc: 'See where you stand with our free score estimator.' },
                            { step: '2', title: 'Practice Daily', desc: 'Answer questions by topic and difficulty. Track your progress.' },
                            { step: '3', title: 'Get AI Help', desc: 'AI explains every mistake so you learn from each question.' },
                            { step: '4', title: 'Ace the SAT', desc: 'Take mock tests, follow your study plan, and hit your target.' },
                        ].map(s => (
                            <div key={s.step} className="flex flex-col items-center">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-lg font-bold"
                                    style={{
                                        background: 'rgba(201,146,60,0.1)',
                                        border: '1px solid rgba(201,146,60,0.3)',
                                        color: 'var(--gold-primary)',
                                    }}
                                >
                                    {s.step}
                                </div>
                                <h3 className="font-semibold mb-1.5 text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                                <p className="text-xs font-light" style={{ color: 'var(--text-faint)' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Final CTA */}
            <section className="py-20 px-4 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="heading-serif text-3xl sm:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
                        Start your SAT prep{' '}
                        <span className="heading-serif-italic text-gradient-gold">
                            today
                        </span>
                    </h2>
                    <p className="text-lg mb-8 font-light" style={{ color: 'var(--text-muted)' }}>
                        The free score calculator is just the beginning. Join thousands of students using SAT Ace.
                    </p>
                    <Link
                        href="/sat-prep/calculator"
                        className="btn-gold text-lg px-10 py-4"
                    >
                        Get Started — It&apos;s Free →
                    </Link>
                </div>
            </section>
        </div>
    )
}
