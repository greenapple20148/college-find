import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { formatUSD, formatPct } from '@/lib/utils'
import { CollegeCard } from '@/components/colleges/CollegeCard'
import { AdmissionCalculator } from '@/components/calculator/AdmissionCalculator'
import { SaveButton } from '@/components/colleges/SaveButton'
import { CollegeDeadlines } from '@/components/colleges/CollegeDeadlines'
import { CollegeScholarships } from '@/components/colleges/CollegeScholarships'
import { Badge } from '@/components/ui/Badge'
import { US_STATES, MAJOR_OPTIONS } from '@/lib/types'
import type { College } from '@/lib/types'

export const revalidate = 86400
export const dynamicParams = true

async function getCollegeBySlug(slug: string): Promise<College | null> {
  const supabase = createServiceClient()

  // Exact match first
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .eq('slug', slug)
    .single()
  if (!error && data) return data as College

  // Fallback: slug may have been disambiguated with a unit_id suffix
  // e.g. "international-beauty-education-center-123456"
  const { data: prefixData } = await supabase
    .from('colleges')
    .select('*')
    .like('slug', `${slug}-%`)
    .order('enrollment', { ascending: false })
    .limit(1)
    .single()
  if (prefixData) return prefixData as College

  return null
}

async function getRelatedColleges(college: College): Promise<College[]> {
  if (!college.state) return []
  const supabase = createServiceClient()
  const rate = college.acceptance_rate ?? 0.5
  const { data } = await supabase
    .from('colleges')
    .select('*')
    .eq('state', college.state)
    .eq('level', 'four_year')
    .neq('id', college.id)
    .gte('acceptance_rate', Math.max(0, rate - 0.15))
    .lte('acceptance_rate', Math.min(1, rate + 0.15))
    .order('enrollment', { ascending: false })
    .limit(4)
  return (data ?? []) as College[]
}

export async function generateStaticParams() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('colleges')
    .select('slug')
    .not('slug', 'is', null)
    .order('enrollment', { ascending: false })
    .limit(200)
  return (data ?? []).filter((c: { slug?: string | null }) => c.slug).map((c: { slug: string }) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const college = await getCollegeBySlug(slug)
  if (!college) return {}

  const acceptStr = college.acceptance_rate !== null
    ? `${Math.round(college.acceptance_rate * 100)}% acceptance rate`
    : 'acceptance rate not reported'

  const description = `${college.name} — ${acceptStr}. Tuition: ${formatUSD(college.tuition_out_state)} out-of-state. Graduation rate: ${formatPct(college.graduation_rate)}. See GPA requirements, SAT ranges, and estimate your admission chances.`

  return {
    title: `${college.name} Admission Requirements, Acceptance Rate, GPA, SAT (2026)`,
    description,
    alternates: { canonical: `/college/${college.slug}` },
    openGraph: {
      title: `${college.name} — Acceptance Rate, Admission Requirements (2026)`,
      description,
      url: `/college/${college.slug}`,
    },
  }
}

function schoolGpaEstimate(rate: number): number {
  if (rate < 0.10) return 3.90
  if (rate < 0.20) return 3.75
  if (rate < 0.35) return 3.50
  if (rate < 0.50) return 3.25
  if (rate < 0.70) return 3.00
  return 2.70
}

function getAcceptanceColor(rate: number | null): string {
  if (rate === null) return 'var(--text-ghost)'
  const pct = rate * 100
  if (pct <= 15) return '#f87171'
  if (pct <= 30) return '#fb923c'
  if (pct <= 50) return '#fbbf24'
  if (pct <= 75) return '#4ade80'
  return '#34d399'
}

function AcceptanceDonut({ rate, size = 72 }: { rate: number | null; size?: number }) {
  if (rate === null) {
    return (
      <div className="rounded-full flex items-center justify-center" style={{ width: size, height: size, backgroundColor: 'var(--bg-tertiary)' }}>
        <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>N/A</span>
      </div>
    )
  }
  const pct = Math.round(rate * 100)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate * circumference)
  const color = getAcceptanceColor(rate)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--donut-track)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        {pct}%
      </span>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-ghost)' }}>{sub}</p>}
    </div>
  )
}

export default async function CollegeProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [college, related] = await Promise.all([
    getCollegeBySlug(slug),
    getCollegeBySlug(slug).then(c => c ? getRelatedColleges(c) : []),
  ])

  if (!college) notFound()

  const stateName = US_STATES.find(s => s.code === college.state)?.name
  const stateSlug = stateName ? stateName.toLowerCase().replace(/\s+/g, '-') + '-colleges' : null
  const estimatedGpa = college.acceptance_rate !== null ? schoolGpaEstimate(college.acceptance_rate) : null
  const satMid = (college.sat_math_50 && college.sat_read_50) ? college.sat_math_50 + college.sat_read_50 : null
  const satLow = (college.sat_math_25 && college.sat_read_25) ? college.sat_math_25 + college.sat_read_25 : null
  const satHigh = (college.sat_math_75 && college.sat_read_75) ? college.sat_math_75 + college.sat_read_75 : null

  const controlLabel = college.control === 'public' ? 'Public' : college.control === 'private_nonprofit' ? 'Private Non-Profit' : college.control === 'private_forprofit' ? 'Private For-Profit' : null
  const isPublic = college.control === 'public'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: college.name,
    url: college.website ?? undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: college.city ?? undefined,
      addressRegion: college.state ?? undefined,
      addressCountry: 'US',
    },
    ...(college.enrollment ? { numberOfStudents: college.enrollment } : {}),
    ...(college.acceptance_rate !== null ? { acceptanceRate: `${Math.round(college.acceptance_rate * 100)}%` } : {}),
    ...(college.tuition_out_state ? { tuitionRange: `$${college.tuition_out_state.toLocaleString()}/year` } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-faint)' }}>
          <Link href="/search" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>Colleges</Link>
          <span>/</span>
          {stateSlug && stateName && (
            <>
              <Link href={`/state/${stateSlug}`} className="hover:underline" style={{ color: 'var(--gold-primary)' }}>{stateName}</Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--text-secondary)' }}>{college.name}</span>
        </nav>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {controlLabel && (
                <Badge variant={isPublic ? 'public' : 'private'}>{controlLabel}</Badge>
              )}
              {college.level === 'four_year' && <Badge variant="gray">4-Year</Badge>}
              {college.size_category && <Badge variant="gray" className="capitalize">{college.size_category} campus</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {college.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-base" style={{ color: 'var(--text-faint)' }}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {college.city}{college.city && college.state ? ', ' : ''}{college.state}
            </p>
            {college.website && (
              <a href={college.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-sm hover:underline" style={{ color: 'var(--gold-primary)' }}>
                Visit Official Website →
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <AcceptanceDonut rate={college.acceptance_rate} size={80} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>Acceptance Rate</p>
            </div>
            <SaveButton collegeId={college.id} />
          </div>
        </div>

        {/* Stats grid */}
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Key Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Acceptance Rate" value={formatPct(college.acceptance_rate)} sub="Class of 2026 data" />
            <StatCard label="Graduation Rate" value={formatPct(college.graduation_rate)} />
            <StatCard label="Enrollment" value={college.enrollment?.toLocaleString() ?? 'N/A'} sub="Total students" />
            <StatCard label="Median Earnings" value={formatUSD(college.median_earnings)} sub="10 yrs after entry" />
            <StatCard label="In-State Tuition" value={formatUSD(college.tuition_in_state)} sub="Per year" />
            <StatCard label="Out-of-State Tuition" value={formatUSD(college.tuition_out_state)} sub="Per year" />
            <StatCard label="Average Net Price" value={formatUSD(college.net_price)} sub="After aid (avg)" />
            {satLow && satHigh ? (
              <StatCard label="SAT Range (M+R)" value={`${satLow}–${satHigh}`} sub="25th–75th percentile" />
            ) : (
              <StatCard label="SAT Range" value="N/A or test-optional" />
            )}
          </div>
        </div>

        {/* Admissions section */}
        <div className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Admission Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Typical GPA Range</p>
              <p style={{ color: 'var(--text-primary)' }}>
                {estimatedGpa !== null
                  ? `${(estimatedGpa - 0.2).toFixed(1)} – ${Math.min(4.0, estimatedGpa + 0.15).toFixed(2)}`
                  : 'Data not available'}
              </p>
              {estimatedGpa !== null && (
                <Link href={`/gpa/${estimatedGpa.toFixed(1)}-colleges`} className="text-xs hover:underline mt-1 block" style={{ color: 'var(--gold-primary)' }}>
                  See all colleges for a {estimatedGpa.toFixed(1)} GPA →
                </Link>
              )}
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>SAT Score Range (M+R)</p>
              <p style={{ color: 'var(--text-primary)' }}>
                {satLow && satHigh ? `${satLow} – ${satHigh}` : 'Test-optional / N/A'}
              </p>
              {satMid && (
                <Link href={`/sat/${satMid}-colleges`} className="text-xs hover:underline mt-1 block" style={{ color: 'var(--gold-primary)' }}>
                  See colleges for a {satMid} SAT →
                </Link>
              )}
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>ACT Score Range</p>
              <p style={{ color: 'var(--text-primary)' }}>
                {college.act_25 && college.act_75 ? `${college.act_25} – ${college.act_75}` : 'Test-optional / N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Application Deadlines */}
        <CollegeDeadlines collegeId={college.id} collegeName={college.name} />

        {/* University Scholarships */}
        <CollegeScholarships collegeId={college.id} collegeName={college.name} />

        {/* Programs */}
        {college.programs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Available Programs</h2>
            <div className="flex flex-wrap gap-2">
              {college.programs.map(program => {
                const matchedMajor = MAJOR_OPTIONS.find(m =>
                  program.toLowerCase().includes(m.toLowerCase().split(' ')[0]) ||
                  m.toLowerCase().includes(program.toLowerCase().split(' ')[0])
                )
                const majorSlug = matchedMajor
                  ? matchedMajor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') + '-colleges'
                  : null
                return majorSlug ? (
                  <Link
                    key={program}
                    href={`/major/${majorSlug}`}
                    className="px-3 py-1 rounded-full text-sm border transition-all hover:border-[var(--gold-primary)]"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {program}
                  </Link>
                ) : (
                  <span
                    key={program}
                    className="px-3 py-1 rounded-full text-sm border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {program}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Admission Calculator */}
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Calculate Your Admission Chance</h2>
          <AdmissionCalculator
            college={college}
            defaultGpa={estimatedGpa ?? 3.5}
            defaultSat={satMid ?? undefined}
            mode="single"
          />
        </div>

        {/* Internal links */}
        <div
          className="rounded-xl border p-5 space-y-3"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Explore More</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {stateSlug && stateName && (
              <Link href={`/state/${stateSlug}`} className="px-3 py-1.5 rounded-lg border hover:border-[var(--gold-primary)] transition-all" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                All {stateName} Colleges
              </Link>
            )}
            {estimatedGpa !== null && (
              <Link href={`/gpa/${estimatedGpa.toFixed(1)}-colleges`} className="px-3 py-1.5 rounded-lg border hover:border-[var(--gold-primary)] transition-all" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                Colleges for {estimatedGpa.toFixed(1)} GPA
              </Link>
            )}
            {satMid && (
              <Link href={`/sat/${satMid}-colleges`} className="px-3 py-1.5 rounded-lg border hover:border-[var(--gold-primary)] transition-all" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                Colleges for {satMid} SAT
              </Link>
            )}
            <Link href="/match" className="px-3 py-1.5 rounded-lg border hover:border-[var(--gold-primary)] transition-all" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              Find My Match Schools
            </Link>
          </div>
        </div>

        {/* Related colleges */}
        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Similar Colleges {stateName ? `in ${stateName}` : ''}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {related.map((c, i) => (
                <CollegeCard key={c.id} college={c} index={i} />
              ))}
            </div>
          </div>
        )}

      </main>
    </>
  )
}
