import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'College Activity Resume Builder',
  description: 'Build a compelling college activity resume showcasing your extracurriculars, leadership, awards, and community involvement.',
  alternates: { canonical: '/resume' },
}

const RESUME_BUILDER_URL = process.env.NEXT_PUBLIC_RESUME_BUILDER_URL ?? 'https://www.overleaf.com/gallery/tagged/cv'

const TIPS = [
  {
    section: 'Activities & Extracurriculars',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    tips: [
      'List up to 10 activities in order of importance to you',
      'Include the number of hours per week and weeks per year',
      'Describe your specific role, not just the club name',
    ],
  },
  {
    section: 'Leadership Roles',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
    tips: [
      'Highlight positions like president, captain, or editor',
      'Quantify impact: "Led team of 12", "Increased membership by 40%"',
      'Include school-wide, regional, or national recognition',
    ],
  },
  {
    section: 'Awards & Honors',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
    tips: [
      'Include academic awards, competitions, and scholarships',
      'Specify scope: school-level, district, state, national',
      'Add AP/IB scores if strong (5s, 6s, 7s)',
    ],
  },
  {
    section: 'Volunteer & Community',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    tips: [
      'Show consistent, sustained commitment — not one-time events',
      'Describe what you did, not just the organization name',
      'Include total hours if significant (100+)',
    ],
  },
  {
    section: 'Work Experience',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    tips: [
      'Include part-time jobs, internships, and research positions',
      'Summer work counts — especially if related to your major',
      'Translate skills: "Managed customer inquiries for 200+ clients/week"',
    ],
  },
]

export default function ResumePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">

      {/* Hero */}
      <div>
        <p className="text-sm mb-2" style={{ color: 'var(--text-faint)' }}>
          <Link href="/dashboard" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>Dashboard</Link>
          {' / '}Resume Builder
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          College Activity Resume
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
          A strong activity resume helps admissions officers understand who you are beyond your grades. Use the tips below, then open our recommended builder to create your document.
        </p>
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex-1">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Ready to build your resume?</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            We recommend using a clean, professional template. Click below to open the resume builder in a new tab.
          </p>
        </div>
        <a
          href={RESUME_BUILDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ background: 'var(--gold-gradient)', color: '#fff' }}
        >
          Open Resume Builder →
        </a>
      </div>

      {/* Tips by section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>What to Include</h2>
        <div className="space-y-4">
          {TIPS.map(({ section, icon, tips }) => (
            <div
              key={section}
              className="rounded-xl border p-5"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>{icon}</span> {section}
              </h3>
              <ul className="space-y-1.5">
                {tips.map(tip => (
                  <li key={tip} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Common Application note */}
      <div
        className="rounded-xl border p-5 text-sm"
        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
      >
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Common App vs. Resume</p>
        <p>
          The Common App has its own Activities section (10 entries). A separate activity resume is an <em>optional</em> supplement — upload it under &ldquo;Additional Information&rdquo; if your activities don&apos;t fit in the limited space or if you&apos;re applying to schools that request it.
        </p>
      </div>

      {/* Back link */}
      <div>
        <Link href="/dashboard" className="text-sm hover:underline" style={{ color: 'var(--gold-primary)' }}>
          ← Back to Dashboard
        </Link>
      </div>

    </main>
  )
}
