import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { AdmissionCalculator } from '@/components/calculator/AdmissionCalculator'
import { CollegeCard } from '@/components/colleges/CollegeCard'
import { MAJOR_OPTIONS, US_STATES } from '@/lib/types'
import { formatUSD, formatPct } from '@/lib/utils'
import type { College } from '@/lib/types'

// Map from MAJOR_OPTIONS display names to search keywords
const MAJOR_KEYWORDS: Record<string, string[]> = {
  'Agriculture': ['agriculture', 'agri', 'farm', 'animal science'],
  'Architecture': ['architecture', 'architectural', 'urban design'],
  'Arts & Design': ['arts', 'design', 'fine arts', 'visual', 'graphic'],
  'Biology & Life Sciences': ['biology', 'life science', 'biochemistry', 'biomedical'],
  'Business & Management': ['business', 'management', 'accounting', 'finance', 'economics'],
  'Communications & Journalism': ['communications', 'journalism', 'media', 'public relations'],
  'Computer Science & IT': ['computer', 'information technology', 'software', 'data science'],
  'Criminal Justice': ['criminal justice', 'criminology', 'law enforcement'],
  'Education': ['education', 'teaching', 'pedagogy'],
  'Engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'chemical'],
  'English & Literature': ['english', 'literature', 'writing', 'linguistics'],
  'Environmental Science': ['environmental', 'ecology', 'earth science', 'sustainability'],
  'Health Sciences': ['health science', 'public health', 'kinesiology', 'sports medicine'],
  'History & Political Science': ['history', 'political science', 'government', 'international'],
  'Law': ['law', 'legal', 'pre-law', 'paralegal'],
  'Mathematics': ['mathematics', 'math', 'statistics', 'actuarial'],
  'Medicine & Pre-Med': ['medicine', 'pre-med', 'medical', 'pre-health', 'pharmacy'],
  'Nursing': ['nursing', 'registered nurse', 'bsn'],
  'Psychology': ['psychology', 'counseling', 'cognitive science'],
  'Social Work': ['social work', 'sociology', 'social services'],
  'Science': ['science', 'chemistry', 'physics', 'geology', 'astronomy'],
  'Technology': ['technology', 'information systems', 'cybersecurity', 'network'],
}

function majorToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') + '-colleges'
}

function slugToMajor(slug: string): string | null {
  const key = slug.replace(/-colleges$/, '')
  return MAJOR_OPTIONS.find(m => m.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') === key) ?? null
}

export function generateStaticParams() {
  return MAJOR_OPTIONS
    .filter(m => m !== 'Undecided')
    .map(m => ({ major: majorToSlug(m) }))
}

async function fetchCollegesForMajor(majorName: string): Promise<College[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('colleges')
    .select('*')
    .eq('level', 'four_year')
    .not('name', 'is', null)
    .order('median_earnings', { ascending: false, nullsFirst: false })

  const colleges = (data ?? []) as College[]

  const keywords = MAJOR_KEYWORDS[majorName] ?? [majorName.toLowerCase().split(' ')[0]]

  return colleges.filter(c =>
    c.programs.some(p => {
      const pl = p.toLowerCase()
      return keywords.some(k => pl.includes(k))
    })
  )
}

export async function generateMetadata({ params }: { params: Promise<{ major: string }> }): Promise<Metadata> {
  const { major } = await params
  const majorName = slugToMajor(major)
  if (!majorName) return {}
  return {
    title: `Best ${majorName} Colleges 2026 — Rankings, Salaries & Admission`,
    description: `Find the best colleges for ${majorName}. Compare acceptance rates, graduation rates, and median graduate earnings across top programs.`,
    alternates: { canonical: `/major/${major}` },
    openGraph: { url: `/major/${major}` },
  }
}

function avg(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export default async function MajorPage({ params }: { params: Promise<{ major: string }> }) {
  const { major } = await params
  const majorName = slugToMajor(major)
  if (!majorName) notFound()

  const colleges = await fetchCollegesForMajor(majorName)

  if (colleges.length === 0) notFound()

  const avgEarnings = avg(colleges.map(c => c.median_earnings))
  const avgAcceptance = avg(colleges.map(c => c.acceptance_rate))
  const avgGradRate = avg(colleges.map(c => c.graduation_rate))

  const topColleges = colleges.slice(0, 24)

  const relatedMajors = MAJOR_OPTIONS
    .filter(m => m !== 'Undecided' && m !== majorName)
    .slice(0, 5)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${majorName} Colleges`,
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

        {/* Hero */}
        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-faint)' }}>
            <Link href="/search" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>Colleges</Link>
            {' / '}Major
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Best {majorName} Colleges (2026)
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
            {colleges.length} four-year colleges with strong {majorName} programs, ranked by graduate earnings.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatUSD(avgEarnings ? Math.round(avgEarnings) : null)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Avg Median Earnings</p>
          </div>
          <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatPct(avgAcceptance)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Avg Acceptance Rate</p>
          </div>
          <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatPct(avgGradRate)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Avg Graduation Rate</p>
          </div>
        </div>

        {/* Calculator */}
        <AdmissionCalculator defaultMajor={majorName} mode="top-matches" />

        {/* College grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top {majorName} Programs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topColleges.map((c, i) => (
              <CollegeCard key={c.id} college={c} index={i} />
            ))}
          </div>
        </div>

        {/* State links */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Browse by state:</h2>
          <div className="flex flex-wrap gap-2">
            {US_STATES.slice(0, 12).map(s => (
              <Link
                key={s.code}
                href={`/state/${s.name.toLowerCase().replace(/\s+/g, '-')}-colleges`}
                className="px-3 py-1.5 rounded-lg border text-sm hover:border-[var(--gold-primary)] transition-all"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Related majors */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Related majors:</h2>
          <div className="flex flex-wrap gap-2">
            {relatedMajors.map(m => (
              <Link
                key={m}
                href={`/major/${majorToSlug(m)}`}
                className="px-3 py-1.5 rounded-lg border text-sm hover:border-[var(--gold-primary)] transition-all"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {m}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
