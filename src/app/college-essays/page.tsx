import { Metadata } from 'next'
import Link from 'next/link'
import { ALL_ESSAY_PAGES } from '@/lib/essay-content'
import { ESSAY_TOOLS } from '@/lib/essay-tools'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: 'College Essay Hub — Guides, Tools & Ideas | CollegeFind',
    description: 'Everything you need for standout college application essays: topic generators, writing guides, Common App brainstormers, essay analyzers, and more.',
    openGraph: {
        title: 'College Essay Hub — Guides, Tools & Ideas | CollegeFind',
        description: 'Everything you need for standout college application essays.',
        url: 'https://college-find.com/college-essays',
    },
}

/* ── SVG helpers ─────────────────────────────────────────────── */
const s = { viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--gold-primary)', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const SVG_ICONS: Record<string, (cls: string) => ReactNode> = {
    lightbulb: (c) => <svg className={c} {...s}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>,
    target: (c) => <svg className={c} {...s}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    search: (c) => <svg className={c} {...s}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
    list: (c) => <svg className={c} {...s}><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" /><path d="M15 3v4a2 2 0 0 0 2 2h4" /><path d="M9 13h6" /><path d="M9 17h3" /></svg>,
    sparkles: (c) => <svg className={c} {...s}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
    chart: (c) => <svg className={c} {...s}><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M7 16l4-8 4 4 4-8" /></svg>,
    school: (c) => <svg className={c} {...s}><path d="M2 10l10-6 10 6-10 6-10-6Z" /><path d="M22 10v6" /><path d="M6 12v5c0 2 3.3 4 6 4s6-2 6-4v-5" /></svg>,
    star: (c) => <svg className={c} {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    pen: (c) => <svg className={c} {...s}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>,
    file: (c) => <svg className={c} {...s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>,
}

const GROUP_ICON_MAP: Record<string, string> = {
    ideas: 'lightbulb',
    prompts: 'target',
    guides: 'pen',
    examples: 'file',
    supplemental: 'school',
}

const GROUPS = [
    { key: 'ideas', label: 'Essay Ideas', description: 'Find the perfect topic for your essay' },
    { key: 'prompts', label: 'Common App Prompts', description: 'Guides for every Common App prompt' },
    { key: 'guides', label: 'Writing Guides', description: 'Step-by-step writing help' },
    { key: 'examples', label: 'Essay Examples', description: 'Real examples that worked' },
    { key: 'supplemental', label: 'Supplemental Essays', description: 'Why This College, Why This Major, and more' },
]

export default function CollegeEssaysHub() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold heading-serif mb-3" style={{ color: 'var(--text-primary)' }}>
                    College Essay Hub
                </h1>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Everything you need to brainstorm, write, and polish standout college application essays —
                    guides, AI tools, and real examples in one place.
                </p>
            </div>

            {/* AI Tools section */}
            <section className="mb-14">
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    AI Essay Tools
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-faint)' }}>
                    Brainstorm, outline, and improve your essays with AI-powered tools.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {ESSAY_TOOLS.map(tool => (
                        <Link
                            key={tool.slug}
                            href={`/${tool.slug}`}
                            className="group rounded-xl border p-4 transition-all hover:border-[rgba(201,146,60,0.3)] hover:shadow-md"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="mb-2">{(SVG_ICONS[tool.icon] ?? SVG_ICONS.sparkles)('w-5 h-5')}</div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tool.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{tool.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Content groups */}
            {GROUPS.map(group => {
                const pages = ALL_ESSAY_PAGES.filter(p => p.group === group.key)
                if (pages.length === 0) return null

                return (
                    <section key={group.key} className="mb-10">
                        <h2 className="text-xl font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            {SVG_ICONS[GROUP_ICON_MAP[group.key]]?.('w-5 h-5')}
                            {group.label}
                        </h2>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-faint)' }}>
                            {group.description}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {pages.map(page => (
                                <Link
                                    key={page.slug}
                                    href={`/${page.slug}`}
                                    className="flex items-center gap-2 p-3 rounded-lg border text-sm transition-all hover:border-[rgba(201,146,60,0.3)]"
                                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                                    </svg>
                                    <span style={{ color: 'var(--text-primary)' }} className="truncate">
                                        {page.h1.replace(/ — .*$/, '')}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )
            })}

            {/* FAQ */}
            <section className="mt-14 max-w-2xl mx-auto" style={{ color: 'var(--text-faint)' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4 text-sm">
                    <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Are these AI tools cheating?</h3>
                        <p>No. They generate ideas and outlines — not finished essays. Think of them as a brainstorming partner that helps you find your own authentic story.</p>
                    </div>
                    <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Which guide should I start with?</h3>
                        <p>Start with <Link href="/college-essay-ideas" className="underline" style={{ color: 'var(--gold-primary)' }}>College Essay Ideas</Link> to find your topic, then <Link href="/how-to-write-a-college-essay" className="underline" style={{ color: 'var(--gold-primary)' }}>How to Write a College Essay</Link> for the full process.</p>
                    </div>
                    <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>How many essays do I need?</h3>
                        <p>You need one Common App personal statement (650 words) plus supplemental essays for each school. Most schools require 1-3 supplementals of 150-400 words each.</p>
                    </div>
                    <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>When should I start?</h3>
                        <p>Ideally, start brainstorming the summer before senior year. Give yourself at least 6 weeks from first draft to final version.</p>
                    </div>
                </div>
            </section>

            {/* JSON-LD for FAQPage schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            { '@type': 'Question', name: 'Are these AI tools cheating?', acceptedAnswer: { '@type': 'Answer', text: 'No. They generate ideas and outlines — not finished essays.' } },
                            { '@type': 'Question', name: 'How many college essays do I need?', acceptedAnswer: { '@type': 'Answer', text: 'One Common App personal statement (650 words) plus supplemental essays for each school (typically 1-3 per school, 150-400 words each).' } },
                        ],
                    }),
                }}
            />
        </div>
    )
}
