import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { formatUSD } from '@/lib/utils'
import type { College, Scholarship } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'

export const revalidate = 86400
export const dynamicParams = true

async function getCollegeBySlug(slug: string): Promise<College | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('slug', slug)
        .single()
    if (error || !data) return null
    return data as College
}

async function getScholarshipsForCollege(collegeId: string): Promise<Scholarship[]> {
    const supabase = createServiceClient()
    const { data } = await supabase
        .from('scholarships')
        .select('*')
        .eq('college_id', collegeId)
        .order('amount', { ascending: false, nullsFirst: false })
    return (data ?? []) as Scholarship[]
}

export async function generateStaticParams() {
    const supabase = createServiceClient()
    // Only generate pages for colleges with scholarships
    const { data } = await supabase
        .from('scholarships')
        .select('colleges!inner(slug)')
        .not('college_id', 'is', null)

    const slugs = new Set<string>()
    for (const row of data ?? []) {
        const college = row.colleges as unknown as { slug: string | null }
        if (college?.slug) slugs.add(college.slug)
    }
    return Array.from(slugs).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const college = await getCollegeBySlug(slug)
    if (!college) return {}

    const title = `${college.name} Scholarships & Merit Aid (2026)`
    const description = `Browse all scholarships and merit awards available at ${college.name}. Find eligibility requirements, deadlines, and application details.`

    return {
        title,
        description,
        alternates: { canonical: `/scholarship/${slug}` },
        openGraph: {
            title,
            description,
            url: `/scholarship/${slug}`,
        },
    }
}

function formatAmount(s: Scholarship): string {
    if (s.amount_type === 'full_tuition') return 'Full Tuition'
    if (s.amount_type === 'varies') return 'Varies'
    if (s.amount === null) return 'See details'
    if (s.amount_type === 'per_year') return `$${s.amount.toLocaleString()}/year`
    return `$${s.amount.toLocaleString()}`
}

function formatDeadline(d: string | null): string {
    if (!d) return 'Rolling / No deadline'
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    })
}

function isDeadlineSoon(d: string | null): boolean {
    if (!d) return false
    const days = Math.floor((new Date(d + 'T00:00:00').getTime() - Date.now()) / 86400000)
    return days >= 0 && days < 30
}

export default async function ScholarshipByUniversityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const college = await getCollegeBySlug(slug)
    if (!college) notFound()

    const scholarships = await getScholarshipsForCollege(college.id)

    // Compute totals
    const fullTuitionCount = scholarships.filter(s => s.amount_type === 'full_tuition').length
    const maxAmount = Math.max(...scholarships.map(s => s.amount ?? 0))

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-faint)' }}>
                <Link href="/scholarships" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>
                    Scholarships
                </Link>
                <span>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>{college.name}</span>
            </nav>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold heading-serif mb-2" style={{ color: 'var(--text-primary)' }}>
                    {college.name} Scholarships
                </h1>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                    {scholarships.length > 0
                        ? `${scholarships.length} scholarship${scholarships.length > 1 ? 's' : ''} available at ${college.name}${college.city ? ` in ${college.city}, ${college.state}` : ''}.`
                        : `No university-specific scholarships listed yet for ${college.name}.`}
                </p>

                {/* Quick stats */}
                {scholarships.length > 0 && (
                    <div
                        className="flex flex-wrap gap-4 mt-4 p-4 rounded-xl border"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Total Scholarships</p>
                            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{scholarships.length}</p>
                        </div>
                        {fullTuitionCount > 0 && (
                            <div>
                                <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Full Tuition Awards</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--gold-primary)' }}>{fullTuitionCount}</p>
                            </div>
                        )}
                        {maxAmount > 0 && (
                            <div>
                                <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Highest Award</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {formatUSD(maxAmount)}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Tuition</p>
                            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {formatUSD(college.tuition_out_state)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Scholarship cards */}
            {scholarships.length === 0 ? (
                <div className="text-center py-20">
                    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="var(--text-ghost)" strokeWidth="1.5">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <p className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        No scholarships listed yet
                    </p>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-faint)' }}>
                        Check the university&apos;s financial aid page for the latest scholarship information.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        {college.website && (
                            <a
                                href={college.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                style={{ background: 'var(--gold-gradient)', color: '#fff' }}
                            >
                                Visit {college.name} →
                            </a>
                        )}
                        <Link
                            href="/scholarships"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:border-[var(--gold-primary)]"
                            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                        >
                            Browse All Scholarships
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {scholarships.map(s => (
                        <div
                            key={s.id}
                            className="rounded-xl border p-5 transition-all duration-200 hover:border-[rgba(201,146,60,0.3)] hover:shadow-md"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: 'var(--border-subtle)',
                                boxShadow: 'var(--shadow-soft)',
                            }}
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {s.name}
                                    </h2>
                                    {s.provider && (
                                        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{s.provider}</p>
                                    )}
                                </div>
                                <span className="text-xl font-bold flex-shrink-0" style={{ color: 'var(--gold-primary)' }}>
                                    {formatAmount(s)}
                                </span>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {s.amount_type === 'full_tuition' && <Badge variant="info">Full Tuition</Badge>}
                                {s.amount_type === 'per_year' && <Badge variant="info">Per Year</Badge>}
                                {s.gpa_min !== null && <Badge variant="info">GPA ≥ {s.gpa_min}</Badge>}
                                {s.majors.length > 0 && (
                                    <Badge variant="gray">{s.majors.slice(0, 2).join(', ')}{s.majors.length > 2 ? '…' : ''}</Badge>
                                )}
                            </div>

                            {/* Description */}
                            {s.description && (
                                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                                    {s.description}
                                </p>
                            )}

                            {/* Footer */}
                            <div
                                className="flex items-center justify-between pt-3"
                                style={{ borderTop: '1px solid var(--border-subtle)' }}
                            >
                                <p
                                    className="text-xs"
                                    style={{
                                        color: isDeadlineSoon(s.deadline) ? '#dc2626' : 'var(--text-ghost)',
                                        fontWeight: isDeadlineSoon(s.deadline) ? 600 : 400,
                                    }}
                                >
                                    {isDeadlineSoon(s.deadline) && <svg className="inline-block w-3.5 h-3.5 mr-0.5 -mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                                    Deadline: {formatDeadline(s.deadline)}
                                </p>
                                {s.website && (
                                    <a
                                        href={s.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                                        style={{ color: 'var(--gold-primary)' }}
                                    >
                                        Apply →
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Back link & CTA */}
            <div
                className="mt-10 p-5 rounded-xl border text-center"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
                <p className="text-sm mb-3" style={{ color: 'var(--text-faint)' }}>
                    Looking for more financial aid?
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link
                        href={`/college/${slug}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        ← Back to {college.name}
                    </Link>
                    <Link
                        href="/scholarships"
                        className="text-sm font-medium hover:underline"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        Browse All Scholarships
                    </Link>
                    <Link
                        href="/cost-calculator"
                        className="text-sm font-medium hover:underline"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        Cost Calculator
                    </Link>
                </div>
            </div>

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        name: `Scholarships at ${college.name}`,
                        numberOfItems: scholarships.length,
                        itemListElement: scholarships.map((s, i) => ({
                            '@type': 'ListItem',
                            position: i + 1,
                            name: s.name,
                            description: s.description,
                            url: s.website,
                        })),
                    }),
                }}
            />
        </main>
    )
}
