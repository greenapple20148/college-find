import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { runMatch } from '@/lib/matching'
import { AdmissionCalculator } from '@/components/calculator/AdmissionCalculator'
import type { College, MatchResult, StudentProfile } from '@/lib/types'

const GPA_VALUES = [4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.0, 2.8, 2.5]

export function generateStaticParams() {
  return GPA_VALUES.map(g => ({ score: `${g.toFixed(1)}-colleges` }))
}

function parseGpa(score: string): number | null {
  const raw = score.replace(/-colleges$/, '')
  const n = parseFloat(raw)
  if (isNaN(n) || n < 0 || n > 4.0) return null
  return n
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
  const gpa = parseGpa(score)
  if (!gpa) return {}
  return {
    title: `${gpa.toFixed(1)} GPA Colleges — Safety, Match & Reach Schools (2026)`,
    description: `Find colleges that match a ${gpa.toFixed(1)} GPA. See your Safety, Match, and Reach schools with estimated admission chances for the 2025-2026 cycle.`,
    alternates: { canonical: `/gpa/${score}` },
    openGraph: { url: `/gpa/${score}` },
  }
}

function CollegeProbRow({ result }: { result: MatchResult }) {
  const pct = Math.round(result.probability * 100)
  const color = result.category === 'safety' ? '#34d399' : result.category === 'match' ? '#60a5fa' : '#fb923c'
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
          {result.college.acceptance_rate !== null && ` · ${Math.round(result.college.acceptance_rate * 100)}% acceptance`}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium" style={{ color }}>
          {result.category === 'safety' ? 'Safety' : result.category === 'match' ? 'Match' : 'Reach'}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
          {result.college.tuition_out_state ? `$${result.college.tuition_out_state.toLocaleString()}/yr` : 'Tuition N/A'}
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

export default async function GpaPage({ params }: { params: Promise<{ score: string }> }) {
  const { score } = await params
  const gpa = parseGpa(score)
  if (!gpa) notFound()

  const colleges = await fetchFourYearColleges()

  const student: StudentProfile = {
    gpa,
    sat_total: null,
    act: null,
    intended_major: null,
    preferred_states: [],
    budget_max: null,
    campus_size: 'any',
  }

  const { safety, match, reach } = runMatch(student, colleges)

  const selectivity = gpa >= 3.8 ? 'highly selective, Ivy League, and top-ranked' : gpa >= 3.5 ? 'selective and moderately selective' : gpa >= 3.0 ? 'a wide range of' : 'open-access and less selective'

  const nearbyGpas = GPA_VALUES.filter(g => g !== gpa).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What colleges can I get into with a ${gpa.toFixed(1)} GPA?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `With a ${gpa.toFixed(1)} GPA, you are competitive for ${selectivity} colleges. Our tool found ${safety.length} Safety, ${match.length} Match, and ${reach.length} Reach schools for your profile.`,
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Hero */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Colleges for a {gpa.toFixed(1)} GPA
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
            With a {gpa.toFixed(1)} GPA, you are competitive for {selectivity} colleges.
            Below are your Safety, Match, and Reach schools based on estimated admission probability.
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

        {/* Calculator */}
        <AdmissionCalculator defaultGpa={gpa} mode="top-matches" />

        {/* Results */}
        <Section title="Safety Schools" color="#34d399" results={safety} />
        <Section title="Match Schools" color="#60a5fa" results={match} />
        <Section title="Reach Schools" color="#fb923c" results={reach} />

        {/* Disclaimer */}
        <p className="text-xs p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-ghost)' }}>
          Estimates are based on GPA vs. estimated school averages only. Actual admission depends on essays, recommendations, extracurriculars, and many other factors. Data sourced from College Scorecard (NCES).
        </p>

        {/* Related GPA pages */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Also see colleges for:</h2>
          <div className="flex flex-wrap gap-2">
            {nearbyGpas.map(g => (
              <Link
                key={g}
                href={`/gpa/${g.toFixed(1)}-colleges`}
                className="px-3 py-1.5 rounded-lg border text-sm hover:border-[var(--gold-primary)] transition-all"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {g.toFixed(1)} GPA Colleges
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
    </>
  )
}
