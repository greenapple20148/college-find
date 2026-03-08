import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { AdmissionCalculator } from '@/components/calculator/AdmissionCalculator'
import { formatUSD, formatPct } from '@/lib/utils'
import type { College } from '@/lib/types'

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

export async function generateMetadata({ params }: { params: Promise<{ colleges: string }> }): Promise<Metadata> {
  const { colleges } = await params
  const [slugA, ...rest] = colleges.split('-vs-')
  const slugB = rest.join('-vs-')
  const [a, b] = await Promise.all([getCollegeBySlug(slugA), getCollegeBySlug(slugB)])
  if (!a || !b) return {}
  return {
    title: `${a.name} vs ${b.name} — College Comparison (2026)`,
    description: `Compare ${a.name} and ${b.name} side by side. Acceptance rate, tuition, graduation rate, SAT scores, and more.`,
    alternates: { canonical: `/compare/${colleges}` },
  }
}

type CompareRow = {
  label: string
  valueA: string
  valueB: string
  winner?: 'A' | 'B' | 'tie'
}

function buildRows(a: College, b: College): CompareRow[] {
  function winner(aVal: number | null, bVal: number | null, lowerIsBetter = false): 'A' | 'B' | 'tie' | undefined {
    if (aVal === null || bVal === null) return undefined
    if (aVal === bVal) return 'tie'
    if (lowerIsBetter) return aVal < bVal ? 'A' : 'B'
    return aVal > bVal ? 'A' : 'B'
  }
  return [
    {
      label: 'Location',
      valueA: [a.city, a.state].filter(Boolean).join(', ') || '—',
      valueB: [b.city, b.state].filter(Boolean).join(', ') || '—',
    },
    {
      label: 'Type',
      valueA: a.control === 'public' ? 'Public' : a.control === 'private_nonprofit' ? 'Private Non-Profit' : 'Private',
      valueB: b.control === 'public' ? 'Public' : b.control === 'private_nonprofit' ? 'Private Non-Profit' : 'Private',
    },
    {
      label: 'Enrollment',
      valueA: a.enrollment?.toLocaleString() ?? '—',
      valueB: b.enrollment?.toLocaleString() ?? '—',
    },
    {
      label: 'Acceptance Rate',
      valueA: formatPct(a.acceptance_rate),
      valueB: formatPct(b.acceptance_rate),
      winner: winner(a.acceptance_rate, b.acceptance_rate, true), // lower = more selective (not "better" but notable)
    },
    {
      label: 'In-State Tuition',
      valueA: formatUSD(a.tuition_in_state),
      valueB: formatUSD(b.tuition_in_state),
      winner: winner(a.tuition_in_state, b.tuition_in_state, true),
    },
    {
      label: 'Out-of-State Tuition',
      valueA: formatUSD(a.tuition_out_state),
      valueB: formatUSD(b.tuition_out_state),
      winner: winner(a.tuition_out_state, b.tuition_out_state, true),
    },
    {
      label: 'Average Net Price',
      valueA: formatUSD(a.net_price),
      valueB: formatUSD(b.net_price),
      winner: winner(a.net_price, b.net_price, true),
    },
    {
      label: 'SAT Range (M+R)',
      valueA: (a.sat_math_25 && a.sat_read_25 && a.sat_math_75 && a.sat_read_75)
        ? `${a.sat_math_25 + a.sat_read_25}–${a.sat_math_75 + a.sat_read_75}`
        : '—',
      valueB: (b.sat_math_25 && b.sat_read_25 && b.sat_math_75 && b.sat_read_75)
        ? `${b.sat_math_25 + b.sat_read_25}–${b.sat_math_75 + b.sat_read_75}`
        : '—',
    },
    {
      label: 'ACT Range',
      valueA: (a.act_25 && a.act_75) ? `${a.act_25}–${a.act_75}` : '—',
      valueB: (b.act_25 && b.act_75) ? `${b.act_25}–${b.act_75}` : '—',
    },
    {
      label: 'Graduation Rate',
      valueA: formatPct(a.graduation_rate),
      valueB: formatPct(b.graduation_rate),
      winner: winner(a.graduation_rate, b.graduation_rate),
    },
    {
      label: 'Median Earnings',
      valueA: formatUSD(a.median_earnings),
      valueB: formatUSD(b.median_earnings),
      winner: winner(a.median_earnings, b.median_earnings),
    },
  ]
}

export default async function CompareCollegesPage({ params }: { params: Promise<{ colleges: string }> }) {
  const { colleges } = await params

  // Split on first occurrence of "-vs-"
  const vsIdx = colleges.indexOf('-vs-')
  if (vsIdx === -1) notFound()
  const slugA = colleges.slice(0, vsIdx)
  const slugB = colleges.slice(vsIdx + 4)
  if (!slugA || !slugB) notFound()

  const [collegeA, collegeB] = await Promise.all([
    getCollegeBySlug(slugA),
    getCollegeBySlug(slugB),
  ])

  if (!collegeA || !collegeB) notFound()

  const rows = buildRows(collegeA, collegeB)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <p className="text-sm mb-2" style={{ color: 'var(--text-faint)' }}>
          <Link href="/compare" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>Compare</Link>
          {' / '}Side-by-Side
        </p>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {collegeA.name} vs {collegeB.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Side-by-side comparison for the 2025–2026 admissions cycle
        </p>
      </div>

      {/* College name headers */}
      <div className="grid grid-cols-2 gap-4">
        {[collegeA, collegeB].map(c => (
          <div key={c.id} className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <p className="font-semibold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{c.city}{c.city && c.state ? ', ' : ''}{c.state}</p>
            {c.slug && (
              <Link href={`/college/${c.slug}`} className="text-xs mt-2 inline-block hover:underline" style={{ color: 'var(--gold-primary)' }}>
                View Full Profile →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold w-40" style={{ color: 'var(--text-secondary)' }}>
                  Metric
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  {collegeA.name}
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  {collegeB.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} style={{ backgroundColor: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {row.label}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-center"
                    style={{
                      color: row.winner === 'A' ? '#15803d' : 'var(--text-primary)',
                      fontWeight: row.winner === 'A' ? 600 : 400,
                      backgroundColor: row.winner === 'A' ? 'rgba(34, 197, 94, 0.08)' : undefined,
                    }}
                  >
                    {row.valueA}
                    {row.winner === 'A' && <span className="ml-1 text-green-600">✓</span>}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-center"
                    style={{
                      color: row.winner === 'B' ? '#15803d' : 'var(--text-primary)',
                      fontWeight: row.winner === 'B' ? 600 : 400,
                      backgroundColor: row.winner === 'B' ? 'rgba(34, 197, 94, 0.08)' : undefined,
                    }}
                  >
                    {row.valueB}
                    {row.winner === 'B' && <span className="ml-1 text-green-600">✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculator */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Calculate Your Chances at Both Schools
        </h2>
        <AdmissionCalculator mode="top-matches" />
      </div>

      {/* Links back to profiles */}
      <div className="grid grid-cols-2 gap-4">
        {[collegeA, collegeB].map(c => c.slug ? (
          <Link
            key={c.id}
            href={`/college/${c.slug}`}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all hover:border-[var(--gold-primary)]"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            Full {c.name} Profile →
          </Link>
        ) : null)}
      </div>

      {/* In-memory compare link */}
      <div className="p-4 rounded-xl border text-sm text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
        Want to compare up to 4 colleges at once?{' '}
        <Link href="/compare" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>
          Use the interactive Compare tool →
        </Link>
      </div>

    </main>
  )
}
