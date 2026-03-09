import type { Metadata } from 'next'
import Link from 'next/link'
import {
  SearchIcon,
  TargetIcon,
  ScalesIcon,
  ClipboardIcon,
  DollarIcon,
  CalculatorIcon,
  ChartIcon,
  GraduationCapIcon,
  ArrowRightIcon,
} from '@/components/ui/Icon'

export const metadata: Metadata = {
  title: 'CollegeFind — Free College Search & Admissions Tool',
  description:
    'Free college search and admission match tool for 12th-grade students. Search 6,000+ U.S. colleges, estimate admission chances, compare schools side by side, find scholarships, and track deadlines — all in one place.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CollegeFind — Free College Search & Admissions Tool for Students',
    description:
      'Search 6,000+ U.S. colleges, get a personalized Safety/Match/Reach list, compare schools, estimate costs, and find scholarships. Free, no account required.',
    url: '/',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://collegefindtool.com/#website',
      url: 'https://collegefindtool.com',
      name: 'CollegeFind',
      description:
        'Free college search and admissions probability tool for U.S. high school seniors.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://collegefindtool.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://collegefindtool.com/#app',
      name: 'CollegeFind',
      url: 'https://collegefindtool.com',
      applicationCategory: 'EducationApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Search 6,000+ U.S. colleges, estimate admission probability, compare schools, calculate net price, and find scholarships.',
      featureList: [
        'College search with filters',
        'Admissions probability calculator',
        'Safety/Match/Reach categorization',
        'Side-by-side college comparison',
        'College cost and net price calculator',
        'Scholarship finder',
        'Application deadline tracker',
      ],
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'student',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://collegefindtool.com/#organization',
      name: 'CollegeFind',
      url: 'https://collegefindtool.com',
    },
  ],
}

const features = [
  {
    icon: <SearchIcon className="w-7 h-7" />,
    title: 'Search 6,000+ Colleges',
    desc: 'Filter by state, size, tuition, acceptance rate, and more. Browse official data from the U.S. Department of Education.',
  },
  {
    icon: <TargetIcon className="w-7 h-7" />,
    title: 'Personalized Match',
    desc: 'Enter your GPA and test scores to get a Safety, Match, and Reach list tailored to your academic profile.',
  },
  {
    icon: <ScalesIcon className="w-7 h-7" />,
    title: 'Side-by-Side Compare',
    desc: 'Compare up to 4 colleges on tuition, graduation rate, earnings, acceptance rate, and more — all in one table.',
  },
  {
    icon: <ClipboardIcon className="w-7 h-7" />,
    title: 'Track Applications',
    desc: 'Save your favorites, set deadlines, and track application status from Not Started to Accepted.',
  },
  {
    icon: <DollarIcon className="w-7 h-7" />,
    title: 'Find Scholarships',
    desc: 'Discover national and state scholarships matched to your GPA, home state, and intended major.',
  },
  {
    icon: <CalculatorIcon className="w-7 h-7" />,
    title: 'College Cost Calculator',
    desc: 'Enter your family income and see your estimated net price at any college after Pell Grants and institutional aid — no FAFSA required.',
  },
  {
    icon: <ChartIcon className="w-7 h-7" />,
    title: 'Real Data',
    desc: 'Powered by the College Scorecard API from the U.S. Department of Education. Updated regularly.',
  },
]

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
          {/* Subtle radial glow behind hero */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,146,60,0.08) 0%, transparent 70%)',
            }}
          />

          <div className="relative max-w-3xl mx-auto text-center">
            {/* Decorative tag */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
              <span
                className="text-xs font-medium tracking-[0.2em] uppercase"
                style={{ color: 'var(--gold-primary)' }}
              >
                College Search Tool
              </span>
            </div>

            <h1 className="heading-serif text-4xl sm:text-5xl lg:text-6xl mb-6 leading-[1.15]" style={{ color: 'var(--text-primary)' }}>
              Find your{' '}
              <span className="heading-serif-italic text-gradient-gold">
                perfect college fit
              </span>
            </h1>

            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
              Free tools for 12th-grade students. Search 6,000+ U.S. colleges, estimate your
              admission chances, compare schools, and track your application deadlines — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile" className="btn-gold">
                Create My Profile <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link href="/search" className="btn-outline">
                Browse Colleges
              </Link>
            </div>

            <p className="mt-8 text-sm font-light" style={{ color: 'var(--text-ghost)' }}>
              No account required. No cost. Data from the U.S. Department of Education.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4" aria-label="Features">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                <span
                  className="text-xs font-medium tracking-[0.2em] uppercase"
                  style={{ color: 'var(--gold-primary)' }}
                >
                  Features
                </span>
              </div>
              <h2 className="heading-serif text-3xl sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                Everything you need for{' '}
                <span className="heading-serif-italic text-gradient-gold">your college search</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(f => (
                <div key={f.title} className="card-dark p-6 group">
                  <div className="mb-4 transition-transform duration-300 group-hover:scale-110 inline-block" style={{ color: 'var(--gold-primary)' }}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-base" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 relative" aria-label="How it works">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse 50% 40% at 50% 60%, rgba(201,146,60,0.05) 0%, transparent 70%)',
            }}
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
              <span
                className="text-xs font-medium tracking-[0.2em] uppercase"
                style={{ color: 'var(--gold-primary)' }}
              >
                How It Works
              </span>
            </div>
            <h2 className="heading-serif text-3xl sm:text-4xl mb-14" style={{ color: 'var(--text-primary)' }}>
              Get started in{' '}
              <span className="heading-serif-italic text-gradient-gold">3 simple steps</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  title: 'Set Your Profile',
                  desc: 'Enter your GPA, test scores, preferred states, and budget.',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                },
                {
                  title: 'Get Your Match List',
                  desc: 'See Safety, Match, and Reach schools tailored to your profile.',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ),
                },
                {
                  title: 'Save & Track',
                  desc: 'Save favorites, add deadlines, and track your application status.',
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border"
                    style={{
                      background: 'rgba(201, 146, 60, 0.08)',
                      borderColor: 'rgba(201, 146, 60, 0.3)',
                      color: 'var(--gold-primary)',
                    }}
                    aria-label={s.title}
                  >
                    {s.icon}
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-sm font-light" style={{ color: 'var(--text-faint)' }}>{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <Link href="/profile" className="btn-gold">
                Get Started — It&apos;s Free <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-4 text-center text-sm font-light" style={{ color: 'var(--text-ghost)', borderTop: '1px solid var(--border-subtle)' }}>
          <p>
            Data sourced from the{' '}
            <a
              href="https://collegescorecard.ed.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors"
              style={{ color: 'var(--gold-primary)' }}
            >
              U.S. College Scorecard
            </a>{' '}
            (U.S. Department of Education). Admission estimates are statistical approximations, not guarantees.
          </p>
          <p className="mt-2">CollegeFind — Built for students, by students.</p>
        </footer>
      </div>
    </>
  )
}
