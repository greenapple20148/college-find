import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { CollegeCard } from '@/components/colleges/CollegeCard'
import { US_STATES } from '@/lib/types'
import { formatUSD, formatPct } from '@/lib/utils'
import type { College } from '@/lib/types'

function stateNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-') + '-colleges'
}

function slugToState(slug: string): { code: string; name: string } | null {
  const nameSlug = slug.replace(/-colleges$/, '')
  return US_STATES.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === nameSlug) ?? null
}

export function generateStaticParams() {
  return US_STATES.map(s => ({ state: stateNameToSlug(s.name) }))
}

async function fetchStateColleges(stateCode: string): Promise<College[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('colleges')
    .select('*')
    .eq('state', stateCode)
    .eq('level', 'four_year')
    .not('name', 'is', null)
    .order('enrollment', { ascending: false })
  return (data ?? []) as College[]
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params
  const stateObj = slugToState(state)
  if (!stateObj) return {}
  return {
    title: `${stateObj.name} Colleges — Tuition, Acceptance Rates & Rankings (2026)`,
    description: `Browse four-year colleges in ${stateObj.name}. Compare in-state and out-of-state tuition, acceptance rates, graduation rates, and more.`,
    alternates: { canonical: `/state/${state}` },
    openGraph: { url: `/state/${state}` },
  }
}

function avg(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function TuitionRow({ college }: { college: College }) {
  const isPublic = college.control === 'public'
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg border"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex-1 min-w-0">
        {college.slug ? (
          <Link href={`/college/${college.slug}`} className="text-sm font-medium hover:underline truncate block" style={{ color: 'var(--text-primary)' }}>
            {college.name}
          </Link>
        ) : (
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{college.name}</p>
        )}
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          {isPublic ? 'Public' : 'Private'} · {college.city ?? ''}
        </p>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        {isPublic && college.tuition_in_state !== null && (
          <p className="text-xs" style={{ color: '#34d399' }}>In-state: {formatUSD(college.tuition_in_state)}</p>
        )}
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Out-of-state: {formatUSD(college.tuition_out_state)}</p>
      </div>
    </div>
  )
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const stateObj = slugToState(state)
  if (!stateObj) notFound()

  const colleges = await fetchStateColleges(stateObj.code)
  if (colleges.length === 0) notFound()

  const publicColleges = colleges.filter(c => c.control === 'public')
  const privateColleges = colleges.filter(c => c.control === 'private_nonprofit')
  const avgInStateTuition = avg(publicColleges.map(c => c.tuition_in_state))
  const avgOutStateTuition = avg(colleges.map(c => c.tuition_out_state))
  const avgAcceptance = avg(colleges.map(c => c.acceptance_rate))

  const topColleges = colleges.slice(0, 18)
  const tuitionColleges = colleges.slice(0, 15)

  const neighboringStates = US_STATES
    .filter(s => s.code !== stateObj.code)
    .slice(0, 8)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top Colleges in ${stateObj.name}`,
    numberOfItems: colleges.length,
    itemListElement: topColleges.slice(0, 10).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      url: c.slug ? `https://collegefindtool.com/college/${c.slug}` : undefined,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-faint)' }}>
          <Link href="/search" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>Colleges</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{stateObj.name}</span>
        </nav>

        {/* Hero */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Colleges in {stateObj.name} (2026)
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
            {colleges.length} four-year colleges in {stateObj.name} — {publicColleges.length} public, {privateColleges.length} private non-profit.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{colleges.length}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>4-Year Colleges</p>
          </div>
          <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xl font-bold" style={{ color: '#34d399' }}>{formatUSD(avgInStateTuition ? Math.round(avgInStateTuition) : null)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Avg In-State Tuition</p>
          </div>
          <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatUSD(avgOutStateTuition ? Math.round(avgOutStateTuition) : null)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Avg Out-of-State Tuition</p>
          </div>
          <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatPct(avgAcceptance)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Avg Acceptance Rate</p>
          </div>
        </div>

        {/* Top colleges grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top Colleges in {stateObj.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topColleges.map((c, i) => (
              <CollegeCard key={c.id} college={c} index={i} />
            ))}
          </div>
        </div>

        {/* Tuition comparison */}
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Tuition Comparison
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Public universities in {stateObj.name} offer significantly lower in-state tuition for state residents.
          </p>
          <div className="space-y-2">
            {tuitionColleges.map(c => <TuitionRow key={c.id} college={c} />)}
          </div>
        </div>

        {/* Scholarships link */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Looking for {stateObj.name} scholarships?
          </p>
          <Link
            href={`/scholarships?state=${stateObj.code}`}
            className="inline-flex items-center gap-1.5 mt-2 text-sm hover:underline"
            style={{ color: 'var(--gold-primary)' }}
          >
            Browse {stateObj.name} Scholarships →
          </Link>
        </div>

        {/* Other states */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Browse other states:</h2>
          <div className="flex flex-wrap gap-2">
            {neighboringStates.map(s => (
              <Link
                key={s.code}
                href={`/state/${stateNameToSlug(s.name)}`}
                className="px-3 py-1.5 rounded-lg border text-sm hover:border-[var(--gold-primary)] transition-all"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
