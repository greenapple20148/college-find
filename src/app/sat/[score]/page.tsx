import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { runMatch } from '@/lib/matching'
import { AdmissionCalculator } from '@/components/calculator/AdmissionCalculator'
import type { College, MatchResult, StudentProfile } from '@/lib/types'
import { ALL_SAT_SCORE_PAGES, getSATScoreData } from '@/lib/sat-seo-data'

/* ───────────────────────── Static params ───────────────────────── */

export function generateStaticParams() {
  return ALL_SAT_SCORE_PAGES.map(p => ({ score: `${p.score}-colleges` }))
}

/* ───────────────────────── Helpers ───────────────────────── */

function parseSat(score: string): number | null {
  const raw = score.replace(/-colleges$/, '')
  const n = parseInt(raw, 10)
  if (isNaN(n) || n < 400 || n > 1600) return null
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

/* ───────────────────────── Metadata ───────────────────────── */

export async function generateMetadata({ params }: { params: Promise<{ score: string }> }): Promise<Metadata> {
  const { score } = await params
  const sat = parseSat(score)
  if (!sat) return {}
  const seo = getSATScoreData(sat)
  const ptile = seo?.percentile ?? ''
  return {
    title: `Colleges for a ${sat} SAT Score — Safety, Match & Reach Schools (2026)`,
    description: `Discover colleges that accept students with a ${sat} SAT score (${ptile} percentile). See safety, match, and reach schools with admission probabilities. Free college list builder.`,
    alternates: { canonical: `/sat/${score}` },
    openGraph: {
      title: `${sat} SAT Score Colleges — What Schools Can You Get Into?`,
      description: `Find the best colleges for a ${sat} SAT score. Safety, match, and reach schools with estimated admission chances.`,
      url: `/sat/${score}`,
    },
  }
}

/* ───────────────────────── Components ───────────────────────── */

function CollegeRow({ result }: { result: MatchResult }) {
  const pct = Math.round(result.probability * 100)
  const color = result.category === 'safety' ? '#34d399' : result.category === 'match' ? '#C9923C' : '#fb923c'
  const label = result.category === 'safety' ? 'Safety' : result.category === 'match' ? 'Match' : 'Reach'
  const satMid = (result.college.sat_math_50 && result.college.sat_read_50)
    ? result.college.sat_math_50 + result.college.sat_read_50
    : null
  const accRate = result.college.acceptance_rate !== null
    ? `${Math.round(result.college.acceptance_rate * 100)}%`
    : 'N/A'

  return (
    <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      <td className="py-3 pr-3">
        {result.college.slug ? (
          <Link href={`/college/${result.college.slug}`} className="font-medium text-sm hover:underline" style={{ color: 'var(--text-primary)' }}>
            {result.college.name}
          </Link>
        ) : (
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{result.college.name}</span>
        )}
        <span className="block text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          {result.college.city}{result.college.city && result.college.state ? ', ' : ''}{result.college.state}
        </span>
      </td>
      <td className="py-3 px-2 text-sm font-mono text-center" style={{ color: 'var(--text-secondary)' }}>
        {satMid ?? '—'}
      </td>
      <td className="py-3 px-2 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
        {accRate}
      </td>
      <td className="py-3 px-2 text-sm text-center font-semibold" style={{ color }}>
        {label}
      </td>
      <td className="py-3 pl-2 text-right">
        <span className="inline-flex items-center justify-center w-12 h-7 rounded-md text-xs font-bold" style={{ backgroundColor: color + '18', color }}>
          {pct}%
        </span>
      </td>
    </tr>
  )
}

function CollegeTable({ title, results, limit = 12 }: { title: string; results: MatchResult[]; limit?: number }) {
  const shown = results.slice(0, limit)
  if (shown.length === 0) return null
  return (
    <div>
      <h2 className="heading-serif text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        {title}
        <span className="text-sm font-normal font-sans" style={{ color: 'var(--text-faint)' }}>({results.length} schools)</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ minWidth: 500 }}>
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-ghost)' }}>
              <th className="py-2 pr-3 font-medium">College</th>
              <th className="py-2 px-2 font-medium text-center">Avg SAT</th>
              <th className="py-2 px-2 font-medium text-center">Accept Rate</th>
              <th className="py-2 px-2 font-medium text-center">Category</th>
              <th className="py-2 pl-2 font-medium text-right">Chance</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(r => <CollegeRow key={r.college.id} result={r} />)}
          </tbody>
        </table>
      </div>
      {results.length > limit && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-ghost)' }}>
          + {results.length - limit} more schools. Use the calculator below for the full list.
        </p>
      )}
    </div>
  )
}

function TipsList({ tips }: { tips: string[] }) {
  return (
    <ol className="space-y-3 pl-0 list-none counter-reset-items">
      {tips.map((tip, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'rgba(201,146,60,0.1)', color: 'var(--gold-primary)', border: '1px solid rgba(201,146,60,0.2)' }}
          >
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip}</span>
        </li>
      ))}
    </ol>
  )
}

function InternalLinks({ score }: { score: number }) {
  const links = [
    { href: '/sat-prep/calculator', label: 'SAT Score Calculator', desc: 'Enter raw scores and instantly see your scaled SAT score' },
    { href: '/sat-prep/practice', label: 'SAT Practice Questions', desc: `Practice questions matched to the ${score} skill level` },
    { href: '/sat-prep/planner', label: 'SAT Study Planner', desc: 'Get a personalized weekly study schedule for your target score' },
    { href: '/match', label: 'College Match Tool', desc: 'Find your best-fit colleges based on SAT, GPA, and preferences' },
    { href: '/sat-prep', label: 'SAT Ace Overview', desc: 'Free and premium SAT prep tools for every score level' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className="card-dark p-4 group hover:border-[var(--gold-primary)] transition-all"
        >
          <p className="text-sm font-semibold group-hover:underline" style={{ color: 'var(--gold-primary)' }}>{l.label}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{l.desc}</p>
        </Link>
      ))}
    </div>
  )
}

function RelatedScoreLinks({ scores, currentScore }: { scores: number[]; currentScore: number }) {
  // Also add nearby scores not in the relatedScores list
  const allScores = ALL_SAT_SCORE_PAGES.map(p => p.score)
  const nearby = allScores.filter(s => s !== currentScore && Math.abs(s - currentScore) <= 150)
  const combined = Array.from(new Set([...scores, ...nearby])).sort((a, b) => a - b)

  return (
    <div className="flex flex-wrap gap-2">
      {combined.map(s => (
        <Link
          key={s}
          href={`/sat/${s}-colleges`}
          className="px-3 py-1.5 rounded-lg border text-sm hover:border-[var(--gold-primary)] transition-all"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          {s} SAT
        </Link>
      ))}
    </div>
  )
}

/* ───────────────────────── JSON-LD Schema ───────────────────────── */

function jsonLd(sat: number, percentile: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What colleges can I get into with a ${sat} SAT score?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `A ${sat} SAT score (${percentile} percentile) makes you competitive at many four-year universities. Your options include safety, match, and reach schools based on each college's admitted student SAT ranges.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is a ${sat} SAT score good?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `A ${sat} SAT score is in the ${percentile} percentile nationally, meaning you scored higher than ${percentile.split('–')[0]?.replace(/\D/g, '') || ''}% of test-takers. ${sat >= 1200 ? 'This is considered a strong score.' : sat >= 1000 ? 'This is around the national average.' : 'This is below the national average but many quality colleges accept students at this level.'}`,
        },
      },
      {
        '@type': 'Question',
        name: `How can I improve from a ${sat} SAT score?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `To improve from ${sat}, focus on your weakest skill areas with targeted practice, take timed practice tests regularly, and use tools like SAT Ace for instant feedback and AI-powered explanations.`,
        },
      },
    ],
  }
}

/* ───────────────────────── Main Page ───────────────────────── */

export default async function SatScorePage({ params }: { params: Promise<{ score: string }> }) {
  const { score } = await params
  const sat = parseSat(score)
  if (!sat) notFound()

  const seo = getSATScoreData(sat)
  const colleges = await fetchFourYearColleges()

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
  const percentile = seo?.percentile ?? `around the ${Math.round((sat - 400) / 12)}th`
  const totalMatches = safety.length + match.length + reach.length

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(sat, percentile)) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        {/* ── Hero ── */}
        <header>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
            <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>
              SAT Score Guide
            </span>
          </div>

          <h1 className="heading-serif text-3xl sm:text-4xl mb-3" style={{ color: 'var(--text-primary)' }}>
            Colleges for a {sat} SAT Score
          </h1>

          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            A {sat} SAT score falls around the <strong style={{ color: 'var(--text-primary)' }}>{percentile} percentile</strong> nationally.
            {totalMatches > 0
              ? <> We found <strong style={{ color: 'var(--gold-primary)' }}>{totalMatches} colleges</strong> that match this score — including {safety.length} safety, {match.length} match, and {reach.length} reach schools.</>
              : ' Below are colleges matched to your score range.'}
          </p>

          {/* Quick stats */}
          <div className="flex gap-6 mt-5 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--gold-primary)' }}>{sat}</p>
              <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>SAT Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{percentile}</p>
              <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>Percentile</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#34d399' }}>{safety.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>Safety</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#C9923C' }}>{match.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>Match</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#fb923c' }}>{reach.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>Reach</p>
            </div>
          </div>
        </header>

        {/* ── What does a [score] SAT mean? ── */}
        {seo && (
          <section aria-labelledby="what-it-means">
            <h2 id="what-it-means" className="heading-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              What Does a {sat} SAT Score Mean?
            </h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{seo.intro}</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{seo.whatItMeans}</p>
          </section>
        )}

        {/* ── Test-Optional Note ── */}
        <div className="p-4 rounded-xl border text-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>📋 Test-Optional Note:</strong>{' '}
          Many colleges no longer require SAT/ACT scores. If you apply test-optional, GPA, essays, and extracurriculars carry more weight.
          Use our <Link href="/match" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>personalized match tool</Link> for a complete picture.
        </div>

        {/* ── College Tables ── */}
        <section aria-labelledby="college-list">
          <h2 id="college-list" className="heading-serif text-xl mb-6" style={{ color: 'var(--text-primary)' }}>
            Recommended Colleges for {sat} SAT
          </h2>
          <div className="space-y-8">
            <CollegeTable title="🟢 Safety Schools" results={safety} />
            <CollegeTable title="🟡 Match Schools" results={match} />
            <CollegeTable title="🟠 Reach Schools" results={reach} />
          </div>
        </section>

        {/* ── Personalized Calculator ── */}
        <section>
          <h2 className="heading-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
            Personalize Your Results
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-faint)' }}>
            The table above uses a neutral 3.0 GPA baseline. Enter your actual GPA and preferences below for more accurate results.
          </p>
          <AdmissionCalculator defaultSat={sat} mode="top-matches" />
        </section>

        {/* ── Building Your College List ── */}
        {seo && (
          <section aria-labelledby="building-list">
            <h2 id="building-list" className="heading-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              How to Build Your College List With a {sat} SAT
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{seo.buildingList}</p>
          </section>
        )}

        {/* ── Tips to Improve ── */}
        {seo && (
          <section aria-labelledby="improve-score">
            <h2 id="improve-score" className="heading-serif text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
              {sat >= 1400 ? `Tips to Maximize Your ${sat}+ SAT Score` : `How to Improve From a ${sat} SAT Score`}
            </h2>
            <TipsList tips={seo.tips} />
            <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{seo.nextSteps}</p>
          </section>
        )}

        {/* ── SAT Ace Tools ── */}
        <section aria-labelledby="tools">
          <h2 id="tools" className="heading-serif text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Free SAT Prep Tools
          </h2>
          <InternalLinks score={sat} />
        </section>

        {/* ── Related Score Pages ── */}
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            Also see colleges for:
          </h2>
          <RelatedScoreLinks scores={seo?.relatedScores ?? []} currentScore={sat} />
        </section>

        {/* ── Disclaimer ── */}
        <p className="text-xs p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-ghost)' }}>
          Results use a neutral 3.0 GPA baseline so SAT is the primary factor shown. Enter your actual GPA in the calculator above for personalized results. Data sourced from College Scorecard (NCES). Acceptance rates are based on the most recent publicly available data.
        </p>

      </main>
    </>
  )
}
