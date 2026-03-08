import { Metadata } from 'next'
import Link from 'next/link'
import { ESSAY_TOOLS } from '@/lib/essay-tools'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: 'Essay Toolkit — AI Writing Tools | CollegeFind',
    description: 'A complete suite of AI essay tools: topic generators, hook builders, essay analyzers, and more. Everything you need for standout college application essays.',
}

const svgProps = { className: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--gold-primary)', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ICONS: Record<string, ReactNode> = {
    lightbulb: (
        <svg {...svgProps}>
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" /><path d="M10 22h4" />
        </svg>
    ),
    target: (
        <svg {...svgProps}>
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    ),
    search: (
        <svg {...svgProps}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
    ),
    list: (
        <svg {...svgProps}>
            <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
            <path d="M15 3v4a2 2 0 0 0 2 2h4" /><path d="M9 13h6" /><path d="M9 17h3" />
        </svg>
    ),
    sparkles: (
        <svg {...svgProps}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    ),
    chart: (
        <svg {...svgProps}>
            <path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M7 16l4-8 4 4 4-8" />
        </svg>
    ),
    school: (
        <svg {...svgProps}>
            <path d="M2 10l10-6 10 6-10 6-10-6Z" /><path d="M22 10v6" /><path d="M6 12v5c0 2 3.3 4 6 4s6-2 6-4v-5" />
        </svg>
    ),
    star: (
        <svg {...svgProps}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
}

const FallbackIcon = (
    <svg {...svgProps}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
)

export default function EssayToolkitPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold heading-serif mb-3" style={{ color: 'var(--text-primary)' }}>
                    Essay Toolkit
                </h1>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    AI-powered tools to help you brainstorm, structure, and polish your college application essays.
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-faint)' }}>
                    We guide — you write. Every idea is a starting point, not a finished essay.
                </p>
            </div>

            {/* Tool grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ESSAY_TOOLS.map(tool => (
                    <Link
                        key={tool.slug}
                        href={`/${tool.slug}`}
                        className="group rounded-xl border p-5 transition-all duration-200 hover:border-[rgba(201,146,60,0.3)] hover:shadow-lg"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                                style={{ backgroundColor: 'rgba(201,146,60,0.08)' }}
                            >
                                {ICONS[tool.icon] ?? FallbackIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {tool.title}
                                </h2>
                                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                                    {tool.description}
                                </p>
                                <span
                                    className="inline-block text-xs font-medium mt-2 transition-colors"
                                    style={{ color: 'var(--gold-primary)' }}
                                >
                                    Try it →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* SEO content */}
            <div className="mt-16 max-w-2xl mx-auto" style={{ color: 'var(--text-faint)' }}>
                <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    How the Essay Toolkit Works
                </h2>
                <p className="text-sm mb-4">
                    Our AI tools analyze your experiences, interests, and goals to suggest authentic essay topics.
                    Each tool focuses on a different phase of the writing process — from finding your story
                    to polishing your opening hook.
                </p>
                <div className="space-y-3 text-sm">
                    <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Is this cheating?</h3>
                        <p>No. These tools generate ideas and outlines — not finished essays. Think of them as a brainstorming partner.</p>
                    </div>
                    <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Are my essays stored?</h3>
                        <p>Your inputs are saved to your account so you can revisit them. They are never shared with anyone.</p>
                    </div>
                    <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Which tool should I start with?</h3>
                        <p>Start with the <Link href="/essay-topic-generator" className="underline" style={{ color: 'var(--gold-primary)' }}>Topic Generator</Link> or <Link href="/personal-story-finder" className="underline" style={{ color: 'var(--gold-primary)' }}>Story Finder</Link>, then use the <Link href="/essay-outline-builder" className="underline" style={{ color: 'var(--gold-primary)' }}>Outline Builder</Link> once you&apos;ve picked an idea.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
