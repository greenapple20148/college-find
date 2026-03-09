import Link from 'next/link'
import type { EssayPageConfig } from '@/lib/essay-content'
import { ALL_ESSAY_PAGES, HUB_SLUG } from '@/lib/essay-content'

/* ═══════════════════════════════════════════════════════════════
   FAQ Section (with Schema.org markup)
   ═══════════════════════════════════════════════════════════════ */

function FaqSection({ items }: { items: { question: string; answer: string }[] }) {
    return (
        <section className="mt-12">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Frequently Asked Questions
            </h2>
            <div className="space-y-4">
                {items.map((faq, i) => (
                    <details key={i} className="group rounded-xl border overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                        <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium"
                            style={{ color: 'var(--text-primary)' }}>
                            {faq.question}
                            <svg className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </summary>
                        <div className="px-4 pb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {faq.answer}
                        </div>
                    </details>
                ))}
            </div>

            {/* JSON-LD FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: items.map(f => ({
                            '@type': 'Question',
                            name: f.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: f.answer,
                            },
                        })),
                    }),
                }}
            />
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════════
   CTA Block
   ═══════════════════════════════════════════════════════════════ */

function CtaBlock({ tool, label, text, variant = 'primary' }: {
    tool: string; label: string; text: string; variant?: 'primary' | 'secondary'
}) {
    return (
        <div
            className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{
                background: variant === 'primary'
                    ? 'linear-gradient(135deg, rgba(201,146,60,0.08), rgba(201,146,60,0.02))'
                    : 'var(--bg-secondary)',
                border: `1px solid ${variant === 'primary' ? 'rgba(201,146,60,0.2)' : 'var(--border-subtle)'}`,
            }}
        >
            <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{text}</p>
            </div>
            <Link
                href={`/${tool}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex-shrink-0"
                style={{
                    background: variant === 'primary' ? 'var(--gold-gradient)' : 'transparent',
                    color: variant === 'primary' ? '#fff' : 'var(--gold-primary)',
                    border: variant === 'primary' ? 'none' : '1px solid var(--gold-primary)',
                }}
            >
                {label} →
            </Link>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Related Links
   ═══════════════════════════════════════════════════════════════ */

function RelatedLinks({ slugs }: { slugs: string[] }) {
    const pages = slugs
        .map(s => ALL_ESSAY_PAGES.find(p => p.slug === s))
        .filter(Boolean) as EssayPageConfig[]

    if (pages.length === 0) return null

    return (
        <section className="mt-10">
            <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Related Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pages.map(page => (
                    <Link
                        key={page.slug}
                        href={`/${page.slug}`}
                        className="flex items-center gap-2 p-3 rounded-lg border text-sm transition-all hover:border-[rgba(201,146,60,0.3)]"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    >
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                        <span className="truncate">{page.h1.replace(/ — .*$/, '')}</span>
                    </Link>
                ))}
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Main Content Template
   ═══════════════════════════════════════════════════════════════ */

export default function EssayContentTemplate({ page }: { page: EssayPageConfig }) {
    return (
        <article className="max-w-3xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: 'var(--text-ghost)' }}>
                <Link href="/" className="hover:underline">Home</Link>
                <span>›</span>
                <Link href={`/${HUB_SLUG}`} className="hover:underline" style={{ color: 'var(--gold-primary)' }}>College Essays</Link>
                <span>›</span>
                <span className="truncate">{page.h1.replace(/ — .*$/, '').slice(0, 40)}</span>
            </nav>

            {/* H1 */}
            <h1 className="text-3xl md:text-4xl font-bold heading-serif mb-4" style={{ color: 'var(--text-primary)' }}>
                {page.h1}
            </h1>

            {/* Intro */}
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {page.intro}
            </p>

            {/* Quick answer box */}
            <div
                className="rounded-xl p-4 mb-8 text-sm"
                style={{
                    backgroundColor: 'rgba(201,146,60,0.04)',
                    border: '1px solid rgba(201,146,60,0.15)',
                    borderLeft: '4px solid var(--gold-primary)',
                    color: 'var(--text-secondary)',
                }}
            >
                <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold-primary)' }}>
                    Quick Answer
                </p>
                {page.quickAnswer}
            </div>

            {/* Primary CTA (above the fold) */}
            <CtaBlock {...page.primaryCta} variant="primary" />

            {/* Content sections */}
            <div className="mt-10 space-y-8">
                {page.sections.map((section, i) => (
                    <section key={i}>
                        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            {section.heading}
                        </h2>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                            {section.body}
                        </p>
                        {section.list && (
                            <ul className="space-y-2 ml-1">
                                {section.list.map((item, j) => (
                                    <li key={j} className="flex items-start gap-2.5 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: 'var(--gold-primary)' }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            {/* Common mistakes */}
            {page.commonMistakes && page.commonMistakes.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Common Mistakes to Avoid
                    </h2>
                    <div className="rounded-xl border p-4 space-y-2"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                        {page.commonMistakes.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{m}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Secondary CTA */}
            {page.secondaryCta && (
                <div className="mt-8">
                    <CtaBlock {...page.secondaryCta} variant="secondary" />
                </div>
            )}

            {/* FAQ */}
            <FaqSection items={page.faq} />

            {/* Related links */}
            <RelatedLinks slugs={page.relatedPages} />

            {/* Back to hub */}
            <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <Link href={`/${HUB_SLUG}`} className="text-sm font-medium" style={{ color: 'var(--gold-primary)' }}>
                    ← Back to Essay Hub
                </Link>
            </div>
        </article>
    )
}
