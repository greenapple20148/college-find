import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { runMatch } from '@/lib/matching'
import { AdmissionCalculator } from '@/components/calculator/AdmissionCalculator'
import type { College, MatchResult, StudentProfile } from '@/lib/types'

const SAT_VALUES = [1600, 1550, 1500, 1450, 1400, 1350, 1300, 1250, 1200, 1150, 1100, 1000]

export function generateStaticParams() {
  return SAT_VALUES.map(s => ({ score: `${s}-colleges` }))
}

function parseSat(score: string): number | null {
  const raw = score.replace(/-colleges$/, '')
  const n = parseInt(raw, 10)
  if (isNaN(n) || n < 400 || n > 1600) return null
  return n
}

// Map SAT to approximate national percentile (rough estimate)
function satPercentile(sat: number): string {
  if (sat >= 1550) return '99th'
  if (sat >= 1500) return '98th–99th'
  if (sat >= 1450) return '96th–97th'
  if (sat >= 1400) return '94th–95th'
  if (sat >= 1350) return '91st–93rd'
  if (sat >= 1300) return '87th–90th'
  if (sat >= 1250) return '82nd–86th'
  if (sat >= 1200) return '74th–81st'
  if (sat >= 1150) return '66th–73rd'
  if (sat >= 1100) return '57th–65th'
  if (sat >= 1000) return '40th–56th'
  return 'below 40th'
}

async function fetchFourYearColleges(): Promise<College[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('colleges')
    .select('*')
    .eq('level', 'four_year')
    .not('name', 'is', null)
    .order('enrollment', { ascending: false })
  return (data ?? []) as College[]
}

export async function generateMetadata({ params }: { params: Promise<{ score: string }> }): Promise<Metadata> {
  const { score } = await params
  const sat = parseSat(score)
  if (!sat) return {}
  return {
    title: `${sat} SAT Score Colleges — What Schools Can You Get Into? (2026)`,
    description: `Find colleges accepting a ${sat} SAT score. See safety, match, and reach schools with estimated admission probabilities. ${sat} SAT is around the ${satPercentile(sat)} percentile nationally.`,
    alternates: { canonical: `/sat/${score}` },
    openGraph: { url: `/sat/${score}` },
  }
}

function CollegeProbRow({ result }: { result: MatchResult }) {
  const pct = Math.round(result.probability * 100)
  const color = result.category === 'safety' ? '#34d399' : result.category === 'match' ? '#60a5fa' : '#fb923c'
  const satMid = (result.college.sat_math_50 && result.college.sat_read_50)
    ? result.college.sat_math_50 + result.college.sat_read_50
    : null
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-[var(--gold-primary)]"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
        style={{ backgroundColor: color + '20', color }}
      >
        {pct}%
      </div>
      <div className="flex-1 min-w-0">
        {result.college.slug ? (
          <Link href={`/college/${result.college.slug}`} className="font-semibold text-sm hover:underline block truncate" style={{ color: 'var(--text-primary)' }}>
            {result.college.name}
          </Link>
        ) : (
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{result.college.name}</p>
        )}
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          {result.college.city}{result.college.city && result.college.state ? ', ' : ''}{result.college.state}
          {satMid ? ` · Mid SAT: ${satMid}` : ''}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium" style={{ color }}>
          {result.category === 'safety' ? 'Safety' : result.category === 'match' ? 'Match' : 'Reach'}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
          {result.college.acceptance_rate !== null ? `${Math.round(result.college.acceptance_rate * 100)}% accept` : 'N/A'}
        </p>
      </div>
    </div>
  )
}

function Section({ title, color, results, limit = 10 }: { title: string; color: string; results: MatchResult[]; limit?: number }) {
  const shown = results.slice(0, limit)
  if (shown.length === 0) return null
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        {title}
        <span className="text-sm font-normal" style={{ color: 'var(--text-faint)' }}>({results.length} colleges)</span>
      </h2>
      <div className="space-y-2">
        {shown.map(r => <CollegeProbRow key={r.college.id} result={r} />)}
      </div>
    </div>
  )
}

export default async function SatPage({ params }: { params: Promise<{ score: string }> }) {
  const { score } = await params
  const sat = parseSat(score)
  if (!sat) notFound()

  const colleges = await fetchFourYearColleges()

  // Use neutral GPA (3.0) so SAT is the dominant differentiator
  const student: StudentProfile = {
    gpa: 3.0,
    sat_total: sat,
    act: null,
    intended_major: null,
    preferred_states: [],
    budget_max: null,
    campus_size: 'any',
  }

  const { safety, match, reach } = runMatch(student, colleges)
  const percentile = satPercentile(sat)
  const nearbySats = SAT_VALUES.filter(s => s !== sat).slice(0, 5)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Hero */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Colleges for a {sat} SAT Score
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
          A {sat} SAT score falls around the <strong style={{ color: 'var(--text-primary)' }}>{percentile} percentile</strong> nationally.
          Below are Safety, Match, and Reach schools based on your SAT relative to each school&apos;s middle 50% range.
        </p>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1.5" style={{ color: '#34d399' }}>
            <span className="w-2 h-2 rounded-full bg-[#34d399]" /> {safety.length} Safety
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#60a5fa' }}>
            <span className="w-2 h-2 rounded-full bg-[#60a5fa]" /> {match.length} Match
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#fb923c' }}>
            <span className="w-2 h-2 rounded-full bg-[#fb923c]" /> {reach.length} Reach
          </span>
        </div>
      </div>

      {/* Test-optional note */}
      <div className="p-4 rounded-xl border text-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Test-Optional Note:</strong> Many colleges no longer require SAT/ACT scores.
        If you apply test-optional, your GPA, essays, and extracurriculars carry more weight. Use our{' '}
        <Link href="/match" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>personalized match tool</Link>
        {' '}for a more complete picture.
      </div>

      {/* Calculator */}
      <AdmissionCalculator defaultSat={sat} mode="top-matches" />

      {/* Results */}
      <Section title="Safety Schools" color="#34d399" results={safety} />
      <Section title="Match Schools" color="#60a5fa" results={match} />
      <Section title="Reach Schools" color="#fb923c" results={reach} />

      {/* Disclaimer */}
      <p className="text-xs p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-ghost)' }}>
        Results use a neutral 3.0 GPA baseline so SAT is the primary factor shown. Enter your actual GPA in the calculator above for a personalized result. Data sourced from College Scorecard (NCES).
      </p>

      {/* Related SAT pages */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Also see colleges for:</h2>
        <div className="flex flex-wrap gap-2">
          {nearbySats.map(s => (
            <Link
              key={s}
              href={`/sat/${s}-colleges`}
              className="px-3 py-1.5 rounded-lg border text-sm hover:border-[var(--gold-primary)] transition-all"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {s} SAT Colleges
            </Link>
          ))}
          <Link
            href="/match"
            className="px-3 py-1.5 rounded-lg border text-sm hover:border-[var(--gold-primary)] transition-all"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--gold-primary)' }}
          >
            Get personalized matches →
          </Link>
        </div>
      </div>

    </main>
  )
}
