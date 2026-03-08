'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SearchIcon, XIcon } from '@/components/ui/Icon'
import type { College, ROIResult } from '@/lib/types'
import { MAJOR_OPTIONS } from '@/lib/types'

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

function fmt(n: number): string {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fmtDollar(n: number): string {
    return '$' + fmt(n)
}

/* ═══════════════════════════════════════════════════════════════════
   SingleCollegePicker — inline search, single selection
   ═══════════════════════════════════════════════════════════════════ */

function SingleCollegePicker({
    selected,
    onSelect,
    onClear,
}: {
    selected: College | null
    onSelect: (c: College) => void
    onClear: () => void
}) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<College[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
                setOpen(false)
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [])

    function handleChange(q: string) {
        setQuery(q)
        if (!q.trim()) { setResults([]); setOpen(false); return }
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/colleges?q=${encodeURIComponent(q)}&limit=6`)
                const json = await res.json()
                setResults(json.data ?? [])
                setOpen(true)
            } catch { setResults([]) }
            finally { setLoading(false) }
        }, 300)
    }

    if (selected) {
        return (
            <div
                className="flex items-center justify-between rounded-lg border px-4 py-3"
                style={{
                    backgroundColor: 'rgba(201,146,60,0.06)',
                    borderColor: 'rgba(201,146,60,0.2)',
                }}
            >
                <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {selected.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                        {selected.city && selected.state
                            ? `${selected.city}, ${selected.state}`
                            : selected.state ?? ''}
                        {' · '}
                        {selected.control === 'public' ? 'Public' : 'Private'}
                    </p>
                </div>
                <button
                    onClick={onClear}
                    className="p-1 rounded hover:bg-[var(--bg-surface-hover)] transition-colors"
                    style={{ color: 'var(--text-faint)' }}
                    aria-label="Change college"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={e => handleChange(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder="Search for a college…"
                    className="w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--text-primary)',
                        '--tw-ring-color': 'var(--input-focus-ring)',
                    } as React.CSSProperties}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-ghost)' }}>
                    <SearchIcon className="w-4 h-4" />
                </span>
                {loading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs animate-pulse" style={{ color: 'var(--text-ghost)' }}>
                        …
                    </span>
                )}
            </div>
            {open && results.length > 0 && (
                <ul
                    className="absolute z-20 mt-1 w-full border rounded-xl shadow-lg max-h-64 overflow-y-auto"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    {results.map(college => (
                        <li key={college.id}>
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect(college)
                                    setQuery('')
                                    setResults([])
                                    setOpen(false)
                                }}
                                className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[rgba(201,146,60,0.08)]"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <p className="font-medium">{college.name}</p>
                                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                                    {college.city && college.state
                                        ? `${college.city}, ${college.state}`
                                        : college.state ?? ''}{' '}
                                    · {college.control === 'public' ? 'Public' : 'Private'}
                                    {college.tuition_in_state && ` · In-state: $${fmt(college.tuition_in_state)}`}
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   ROI Gauge — SVG semi-circle gauge
   ═══════════════════════════════════════════════════════════════════ */

function ROIGauge({ score, category }: { score: number; category: string }) {
    const clampedScore = Math.min(2, Math.max(0, score))
    const pct = clampedScore / 2
    const angle = pct * 180

    const r = 80
    const cx = 100
    const cy = 95
    const startAngle = 180
    const endAngle = 180 - angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy - r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy - r * Math.sin(endRad)
    const largeArc = angle > 180 ? 1 : 0

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 200 120" className="w-48 h-auto">
                <path
                    d={`M 20,95 A 80,80 0 0,1 180,95`}
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {angle > 0 && (
                    <path
                        d={`M ${x1},${y1} A ${r},${r} 0 ${largeArc},0 ${x2},${y2}`}
                        fill="none"
                        stroke="var(--gold-primary)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(201,146,60,0.4))' }}
                    />
                )}
                <text x="100" y="88" textAnchor="middle" className="text-3xl font-bold" style={{ fill: 'var(--gold-primary)' }}>
                    {score >= 99 ? '99+' : score.toFixed(2)}
                </text>
                <text x="100" y="108" textAnchor="middle" className="text-xs font-medium" style={{ fill: 'var(--text-faint)' }}>
                    ROI Score
                </text>
            </svg>
            <span
                className="text-sm font-bold px-4 py-1 rounded-full -mt-2"
                style={{
                    backgroundColor: 'rgba(201,146,60,0.1)',
                    color: 'var(--gold-primary)',
                    border: '1px solid rgba(201,146,60,0.15)',
                }}
            >
                {category.charAt(0).toUpperCase() + category.slice(1)} ROI
            </span>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════════════════════════════ */

function StatCard({
    label,
    value,
    sublabel,
    icon,
}: {
    label: string
    value: string
    sublabel?: string
    icon: React.ReactNode
}) {
    return (
        <div
            className="rounded-xl border p-4 transition-all hover:translate-y-[-1px]"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            <div className="flex items-center gap-2 mb-2">
                <span style={{ color: 'var(--gold-primary)' }}>{icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
                    {label}
                </span>
            </div>
            <p
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary)' }}
            >
                {value}
            </p>
            {sublabel && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-ghost)' }}>
                    {sublabel}
                </p>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Cost Breakdown Bar (Horizontal stacked bar)
   ═══════════════════════════════════════════════════════════════════ */

function CostBreakdownBar({ result }: { result: ROIResult }) {
    const total = result.total_cost
    if (total <= 0) return null

    const tuitionPct = (result.total_tuition / total) * 100
    const livingPct = ((result.inputs.living_cost_per_year * result.inputs.years_of_study) / total) * 100
    const scholarshipPct = Math.min(100, (result.inputs.scholarship_amount / total) * 100)

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
                <span>Cost Breakdown</span>
                <span>Total: {fmtDollar(total)}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--border-subtle)' }}>
                <div
                    className="h-full transition-all"
                    style={{ width: `${tuitionPct}%`, backgroundColor: 'var(--gold-primary)' }}
                    title={`Tuition: ${fmtDollar(result.total_tuition)}`}
                />
                <div
                    className="h-full transition-all"
                    style={{ width: `${livingPct}%`, backgroundColor: 'rgba(201,146,60,0.4)' }}
                    title={`Living: ${fmtDollar(result.inputs.living_cost_per_year * result.inputs.years_of_study)}`}
                />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: 'var(--gold-primary)' }} />
                    Tuition: {fmtDollar(result.total_tuition)}
                </span>
                <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: 'rgba(201,146,60,0.4)' }} />
                    Living: {fmtDollar(result.inputs.living_cost_per_year * result.inputs.years_of_study)}
                </span>
                {result.inputs.scholarship_amount > 0 && (
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-2.5 h-2.5 rounded-full inline-block border-2" style={{ borderColor: 'var(--gold-primary)', backgroundColor: 'transparent' }} />
                        Scholarships: -{fmtDollar(result.inputs.scholarship_amount)} ({scholarshipPct.toFixed(0)}%)
                    </span>
                )}
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Salary Growth Chart — SVG line chart
   ═══════════════════════════════════════════════════════════════════ */

function SalaryGrowthChart({ salaryByYear }: { salaryByYear: number[] }) {
    if (!salaryByYear.length) return null

    const W = 500, H = 200, pad = { t: 20, r: 20, b: 35, l: 55 }
    const plotW = W - pad.l - pad.r
    const plotH = H - pad.t - pad.b

    const minY = Math.min(...salaryByYear) * 0.9
    const maxY = Math.max(...salaryByYear) * 1.05

    const pts = salaryByYear.map((s, i) => ({
        x: pad.l + (i / (salaryByYear.length - 1)) * plotW,
        y: pad.t + plotH - ((s - minY) / (maxY - minY)) * plotH,
    }))

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const area = `${line} L${pts[pts.length - 1].x},${pad.t + plotH} L${pts[0].x},${pad.t + plotH} Z`

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({
        val: Math.round(minY + p * (maxY - minY)),
        y: pad.t + plotH - p * plotH,
    }))

    return (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUpIcon /> Salary Growth (10 Years)
            </h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                {/* Grid lines */}
                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="4 3" />
                        <text x={pad.l - 8} y={t.y + 4} textAnchor="end" className="text-[10px]" fill="var(--text-ghost)">${(t.val / 1000).toFixed(0)}k</text>
                    </g>
                ))}
                {/* X axis labels */}
                {salaryByYear.map((_, i) => i % 2 === 0 && (
                    <text key={i} x={pts[i].x} y={H - 8} textAnchor="middle" className="text-[10px]" fill="var(--text-ghost)">Yr {i}</text>
                ))}
                {/* Area fill */}
                <path d={area} fill="url(#salaryGrad)" opacity="0.15" />
                {/* Line */}
                <path d={line} fill="none" stroke="var(--gold-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Dots */}
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--gold-primary)" stroke="var(--bg-secondary)" strokeWidth="1.5" />
                ))}
                <defs>
                    <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold-primary)" />
                        <stop offset="100%" stopColor="var(--gold-primary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Earnings vs Loan Balance — dual-line SVG chart
   ═══════════════════════════════════════════════════════════════════ */

function EarningsVsLoanChart({ projections }: { projections: { year: number; cumulative_earnings: number; loan_balance: number; hs_cumulative_earnings: number }[] }) {
    if (!projections.length) return null

    const W = 500, H = 220, pad = { t: 20, r: 20, b: 35, l: 55 }
    const plotW = W - pad.l - pad.r
    const plotH = H - pad.t - pad.b

    const allVals = projections.flatMap(p => [p.cumulative_earnings, p.loan_balance, p.hs_cumulative_earnings])
    const maxY = Math.max(...allVals) * 1.05
    const toX = (i: number) => pad.l + (i / (projections.length - 1)) * plotW
    const toY = (v: number) => pad.t + plotH - (v / maxY) * plotH

    const earningsLine = projections.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(p.cumulative_earnings)}`).join(' ')
    const loanLine = projections.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(p.loan_balance)}`).join(' ')
    const hsLine = projections.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(p.hs_cumulative_earnings)}`).join(' ')

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({ val: Math.round(p * maxY), y: pad.t + plotH - p * plotH }))

    return (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <DollarIcon /> Cumulative Earnings vs. Loan Balance
            </h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="4 3" />
                        <text x={pad.l - 8} y={t.y + 4} textAnchor="end" className="text-[10px]" fill="var(--text-ghost)">${(t.val / 1000).toFixed(0)}k</text>
                    </g>
                ))}
                {projections.map((p, i) => (
                    <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" className="text-[10px]" fill="var(--text-ghost)">Yr {p.year}</text>
                ))}
                {/* HS baseline (dashed) */}
                <path d={hsLine} fill="none" stroke="var(--text-ghost)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.5" />
                <path d={loanLine} fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 4" opacity="0.5" />
                <path d={earningsLine} fill="none" stroke="var(--gold-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {projections.map((_, i) => (
                    <g key={i}>
                        <circle cx={toX(i)} cy={toY(projections[i].cumulative_earnings)} r="2.5" fill="var(--gold-primary)" />
                        <rect x={toX(i) - 2} y={toY(projections[i].loan_balance) - 2} width="4" height="4" fill="var(--gold-primary)" opacity="0.5" rx="0.5" />
                    </g>
                ))}
            </svg>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: 'var(--gold-primary)' }} /> Cumulative Earnings</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block border-t border-dashed" style={{ borderColor: 'var(--gold-primary)', width: 12, opacity: 0.5 }} /> Loan Balance</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block border-t border-dashed" style={{ borderColor: 'var(--text-ghost)', width: 12 }} /> HS Grad Earnings</span>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Risk Factors Badge Strip
   ═══════════════════════════════════════════════════════════════════ */

function RiskFactors({ graduationRate, employmentRate, adjustedSalary }: { graduationRate: number; employmentRate: number; adjustedSalary: number }) {
    const items = [
        { label: 'Graduation Rate', value: `${(graduationRate * 100).toFixed(0)}%` },
        { label: 'Employment Rate', value: `${(employmentRate * 100).toFixed(0)}%` },
        { label: 'Risk-Adjusted Salary', value: fmtDollar(adjustedSalary) },
    ]

    return (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Risk-Adjusted Factors
            </h4>
            <div className="grid grid-cols-3 gap-3">
                {items.map((item, i) => (
                    <div key={i} className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>{item.label}</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--gold-primary)' }}>{item.value}</p>
                    </div>
                ))}
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-ghost)' }}>
                Risk-adjusted salary = Starting salary × Graduation rate × Employment rate. This reflects your probability-weighted expected outcome.
            </p>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Inline SVG icons
   ═══════════════════════════════════════════════════════════════════ */
function DollarIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

function TrendingUpIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}

function ClockIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function CreditCardIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}

function WalletIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
    )
}

function StarIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}

function SaveIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════════════ */

export function ROICalculatorPage() {
    const { user } = useAuth()

    // Form state
    const [college, setCollege] = useState<College | null>(null)
    const [major, setMajor] = useState('Computer Science & IT')
    const [yearsOfStudy, setYearsOfStudy] = useState(4)
    const [scholarshipAmount, setScholarshipAmount] = useState(0)
    const [livingCostPerYear, setLivingCostPerYear] = useState(12000)
    const [loanInterestRate, setLoanInterestRate] = useState(5)
    const [isInState, setIsInState] = useState(false)

    // Results
    const [result, setResult] = useState<ROIResult | null>(null)
    const [calculating, setCalculating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Comparison
    const [comparisonResults, setComparisonResults] = useState<ROIResult[]>([])

    // Save
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleCalculate = useCallback(async () => {
        if (!college) {
            setError('Please select a college')
            return
        }
        setCalculating(true)
        setError(null)
        setSaved(false)

        try {
            const res = await fetch('/api/roi/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    college_id: college.id,
                    major,
                    years_of_study: yearsOfStudy,
                    scholarship_amount: scholarshipAmount,
                    living_cost_per_year: livingCostPerYear,
                    loan_interest_rate: loanInterestRate / 100,
                    is_in_state: isInState,
                }),
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Calculation failed')

            setResult(json.data)

            // Add to comparison if not already there
            setComparisonResults(prev => {
                const exists = prev.some(r =>
                    r.inputs.college_id === json.data.inputs.college_id &&
                    r.inputs.major === json.data.inputs.major
                )
                if (exists) {
                    return prev.map(r =>
                        r.inputs.college_id === json.data.inputs.college_id &&
                            r.inputs.major === json.data.inputs.major
                            ? json.data
                            : r
                    )
                }
                return [...prev, json.data].slice(-4)
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Calculation failed')
        } finally {
            setCalculating(false)
        }
    }, [college, major, yearsOfStudy, scholarshipAmount, livingCostPerYear, loanInterestRate, isInState])

    const handleSave = async () => {
        if (!result || !user) return
        setSaving(true)

        try {
            const res = await fetch('/api/roi/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    college_id: result.inputs.college_id,
                    major: result.inputs.major,
                    years_of_study: result.inputs.years_of_study,
                    tuition_per_year: result.inputs.tuition_per_year,
                    scholarship_amount: result.inputs.scholarship_amount,
                    living_cost_per_year: result.inputs.living_cost_per_year,
                    loan_interest_rate: result.inputs.loan_interest_rate,
                    is_in_state: result.inputs.is_in_state,
                    total_cost: result.total_cost,
                    net_cost: result.net_cost,
                    loan_amount: result.loan_amount,
                    expected_salary: result.expected_salary,
                    monthly_payment: result.monthly_payment,
                    repayment_years: result.repayment_years,
                    roi_score: result.roi_score,
                    roi_category: result.roi_category,
                }),
            })

            if (!res.ok) throw new Error('Failed to save')
            setSaved(true)
        } catch {
            // silent
        } finally {
            setSaving(false)
        }
    }

    // Auto-fill tuition when college changes
    useEffect(() => {
        if (college) {
            const tuition = isInState
                ? college.tuition_in_state ?? college.tuition_out_state
                : college.tuition_out_state ?? college.tuition_in_state
            if (tuition) {
                // no need for state update here — API handles this
            }
        }
    }, [college, isInState])

    const inputStyle: React.CSSProperties = {
        backgroundColor: 'var(--input-bg)',
        borderColor: 'var(--input-border)',
        color: 'var(--text-primary)',
    }

    return (
        <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="max-w-6xl mx-auto">

                {/* ━━━ Header ━━━ */}
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-4"
                        style={{
                            backgroundColor: 'rgba(99,102,241,0.08)',
                            color: '#818cf8',
                            border: '1px solid rgba(99,102,241,0.15)',
                        }}
                    >
                        <TrendingUpIcon />
                        Financial Planning Tool
                    </div>
                    <h1
                        className="text-3xl md:text-4xl font-bold heading-serif mb-3"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        College<span style={{ color: 'var(--gold-primary)' }}> ROI</span> Calculator
                    </h1>
                    <p
                        className="text-base max-w-xl mx-auto"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Estimate the financial return of your college education — from tuition costs
                        to expected salary and loan repayment.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* ━━━ Input Form (Left 2 cols) ━━━ */}
                    <div
                        className="lg:col-span-2 rounded-2xl border p-6 h-fit sticky top-20"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <h2
                            className="text-lg font-bold mb-5 flex items-center gap-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <DollarIcon />
                            Calculator Inputs
                        </h2>

                        <div className="space-y-4">
                            {/* College */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    College
                                </label>
                                <SingleCollegePicker
                                    selected={college}
                                    onSelect={c => { setCollege(c); setSaved(false); setResult(null) }}
                                    onClear={() => { setCollege(null); setResult(null) }}
                                />
                            </div>

                            {/* Major */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    Intended Major
                                </label>
                                <select
                                    value={major}
                                    onChange={e => { setMajor(e.target.value); setSaved(false) }}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors appearance-none"
                                    style={inputStyle}
                                >
                                    {MAJOR_OPTIONS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* In-state toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsInState(!isInState)}
                                    className="relative w-10 h-5 rounded-full transition-colors"
                                    style={{
                                        backgroundColor: isInState ? 'var(--gold-primary)' : 'var(--border-subtle)',
                                    }}
                                >
                                    <span
                                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                                        style={{
                                            left: isInState ? '22px' : '2px',
                                        }}
                                    />
                                </button>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    In-state student
                                </span>
                            </div>

                            {/* Years of study */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    Years of Study
                                </label>
                                <select
                                    value={yearsOfStudy}
                                    onChange={e => setYearsOfStudy(Number(e.target.value))}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors appearance-none"
                                    style={inputStyle}
                                >
                                    {[2, 3, 4, 5, 6].map(n => (
                                        <option key={n} value={n}>{n} years</option>
                                    ))}
                                </select>
                            </div>

                            {/* Scholarships */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    Total Scholarships / Grants
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-ghost)' }}>$</span>
                                    <input
                                        type="number"
                                        value={scholarshipAmount || ''}
                                        onChange={e => setScholarshipAmount(Number(e.target.value) || 0)}
                                        placeholder="0"
                                        min={0}
                                        className="w-full rounded-lg border pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Living expenses */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    Living Cost Per Year
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-ghost)' }}>$</span>
                                    <input
                                        type="number"
                                        value={livingCostPerYear}
                                        onChange={e => setLivingCostPerYear(Number(e.target.value) || 0)}
                                        min={0}
                                        className="w-full rounded-lg border pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Interest rate */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    Loan Interest Rate
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={loanInterestRate}
                                        onChange={e => setLoanInterestRate(Number(e.target.value) || 0)}
                                        min={0}
                                        max={20}
                                        step={0.1}
                                        className="w-full rounded-lg border px-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors"
                                        style={inputStyle}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-ghost)' }}>%</span>
                                </div>
                            </div>

                            {/* Calculate button */}
                            <button
                                onClick={handleCalculate}
                                disabled={calculating || !college}
                                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
                                    color: '#000',
                                    boxShadow: '0 4px 20px rgba(201,146,60,0.2)',
                                }}
                            >
                                {calculating ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Calculating…
                                    </>
                                ) : (
                                    <>
                                        <TrendingUpIcon />
                                        Calculate ROI
                                    </>
                                )}
                            </button>

                            {error && (
                                <div
                                    className="p-3 rounded-lg text-sm border"
                                    style={{
                                        backgroundColor: 'rgba(239,68,68,0.1)',
                                        borderColor: 'rgba(239,68,68,0.3)',
                                        color: '#f87171',
                                    }}
                                >
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ━━━ Results (Right 3 cols) ━━━ */}
                    <div className="lg:col-span-3 space-y-6">
                        {!result && !calculating && (
                            <div
                                className="rounded-2xl border p-12 text-center"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-subtle)',
                                }}
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(99,102,241,0.08)' }}
                                >
                                    <TrendingUpIcon />
                                </div>
                                <h3
                                    className="text-lg font-semibold mb-2"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Ready to calculate
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                                    Select a college and major, then click &quot;Calculate ROI&quot; to see your estimated return on investment.
                                </p>
                            </div>
                        )}

                        {calculating && (
                            <div
                                className="rounded-2xl border p-12 text-center"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-subtle)',
                                }}
                            >
                                <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4" style={{
                                    borderColor: 'var(--border-subtle)',
                                    borderTopColor: 'var(--gold-primary)',
                                }} />
                                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Crunching the numbers…</p>
                            </div>
                        )}

                        {result && !calculating && (
                            <>
                                {/* ROI Gauge + Header */}
                                <div
                                    className="rounded-2xl border p-6"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderColor: 'var(--border-subtle)',
                                    }}
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                {result.college_name}
                                            </h3>
                                            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                                                {result.inputs.major} · {result.inputs.years_of_study}-year program
                                                {result.inputs.is_in_state ? ' · In-state' : ' · Out-of-state'}
                                            </p>
                                        </div>
                                        <ROIGauge
                                            score={result.roi_score === Infinity ? 2 : result.roi_score}
                                            category={result.roi_category}
                                        />
                                    </div>
                                </div>

                                {/* Stat Grid — enhanced */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <StatCard
                                        label="Total Cost"
                                        value={fmtDollar(result.total_cost)}
                                        sublabel={`Net after aid: ${fmtDollar(result.net_cost)}`}
                                        icon={<DollarIcon />}
                                    />
                                    <StatCard
                                        label="Expected Salary"
                                        value={fmtDollar(result.expected_salary)}
                                        sublabel={result.salary_10yr ? `10yr: ${fmtDollar(result.salary_10yr)}` : undefined}
                                        icon={<TrendingUpIcon />}
                                    />
                                    <StatCard
                                        label="Monthly Payment"
                                        value={fmtDollar(result.monthly_payment)}
                                        sublabel="10-year repayment plan"
                                        icon={<CreditCardIcon />}
                                    />
                                    <StatCard
                                        label="Years to Repay"
                                        value={result.repayment_years >= 99 ? '30+ yrs' : `${result.repayment_years} yrs`}
                                        sublabel="at 15% of salary (w/ growth)"
                                        icon={<ClockIcon />}
                                    />
                                    <StatCard
                                        label="Estimated Loan"
                                        value={fmtDollar(result.loan_amount)}
                                        sublabel={`at ${(result.inputs.loan_interest_rate * 100).toFixed(1)}% APR`}
                                        icon={<WalletIcon />}
                                    />
                                    <StatCard
                                        label="10yr Net Earnings"
                                        value={result.net_earnings_10yr > 0 ? `+${fmtDollar(result.net_earnings_10yr)}` : fmtDollar(result.net_earnings_10yr)}
                                        sublabel="Earnings minus loan payments"
                                        icon={<StarIcon />}
                                    />
                                    <StatCard
                                        label="Salary Growth"
                                        value={`${(result.salary_growth_rate * 100).toFixed(1)}%/yr`}
                                        sublabel={`${fmtDollar(result.salary_by_year[0])} → ${fmtDollar(result.salary_by_year[10] ?? 0)}`}
                                        icon={<TrendingUpIcon />}
                                    />
                                    <StatCard
                                        label="Lifetime Premium"
                                        value={result.lifetime_earnings_premium > 0 ? `+${fmtDollar(result.lifetime_earnings_premium)}` : fmtDollar(result.lifetime_earnings_premium)}
                                        sublabel="vs. HS diploma (30yr, w/ growth)"
                                        icon={<StarIcon />}
                                    />
                                </div>

                                {/* Risk Factors */}
                                <RiskFactors
                                    graduationRate={result.graduation_rate}
                                    employmentRate={result.employment_rate}
                                    adjustedSalary={result.adjusted_salary}
                                />

                                {/* Cost breakdown bar */}
                                <div
                                    className="rounded-2xl border p-5"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderColor: 'var(--border-subtle)',
                                    }}
                                >
                                    <CostBreakdownBar result={result} />
                                </div>

                                {/* Salary Growth Chart */}
                                <SalaryGrowthChart salaryByYear={result.salary_by_year} />

                                {/* Cumulative Earnings vs Loan Balance */}
                                <EarningsVsLoanChart projections={result.projections} />

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3">
                                    {user && (
                                        <button
                                            onClick={handleSave}
                                            disabled={saving || saved}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border"
                                            style={{
                                                backgroundColor: saved ? 'rgba(201,146,60,0.08)' : 'var(--bg-secondary)',
                                                borderColor: saved ? 'rgba(201,146,60,0.2)' : 'var(--border-subtle)',
                                                color: saved ? 'var(--gold-primary)' : 'var(--text-secondary)',
                                            }}
                                        >
                                            {saved ? (
                                                <>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 6 9 17l-5-5" />
                                                    </svg>
                                                    Saved
                                                </>
                                            ) : (
                                                <>
                                                    <SaveIcon />
                                                    {saving ? 'Saving…' : 'Save Result'}
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            const text = `College ROI: ${result.college_name}\nMajor: ${result.inputs.major}\nTotal Cost: ${fmtDollar(result.net_cost)}\nExpected Salary: ${fmtDollar(result.expected_salary)}\nRepayment: ${result.repayment_years} years\nROI: ${result.roi_category.charAt(0).toUpperCase() + result.roi_category.slice(1)}\n\nCalculated on collegefindtool.com`
                                            navigator.clipboard.writeText(text)
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border hover:bg-[var(--bg-surface-hover)]"
                                        style={{
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderColor: 'var(--border-subtle)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                        </svg>
                                        Share Results
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ━━━ Comparison Table ━━━ */}
                        {comparisonResults.length > 1 && (
                            <div
                                className="rounded-2xl border overflow-hidden"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-subtle)',
                                }}
                            >
                                <div className="p-5 pb-3">
                                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" x2="18" y1="20" y2="10" />
                                            <line x1="12" x2="12" y1="20" y2="4" />
                                            <line x1="6" x2="6" y1="20" y2="14" />
                                        </svg>
                                        Compare Calculations
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <th className="px-5 py-3 text-left font-medium" style={{ color: 'var(--text-faint)' }}>College</th>
                                                <th className="px-5 py-3 text-left font-medium" style={{ color: 'var(--text-faint)' }}>Major</th>
                                                <th className="px-5 py-3 text-right font-medium" style={{ color: 'var(--text-faint)' }}>Net Cost</th>
                                                <th className="px-5 py-3 text-right font-medium" style={{ color: 'var(--text-faint)' }}>Salary</th>
                                                <th className="px-5 py-3 text-right font-medium" style={{ color: 'var(--text-faint)' }}>Repay</th>
                                                <th className="px-5 py-3 text-center font-medium" style={{ color: 'var(--text-faint)' }}>ROI</th>
                                                <th className="px-5 py-3 w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonResults.map((r, idx) => {
                                                const roiColor = 'var(--gold-primary)'
                                                return (
                                                    <tr
                                                        key={`${r.inputs.college_id}-${r.inputs.major}-${idx}`}
                                                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                                    >
                                                        <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {r.college_name}
                                                        </td>
                                                        <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>
                                                            {r.inputs.major}
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {fmtDollar(r.net_cost)}
                                                        </td>
                                                        <td className="px-5 py-3 text-right" style={{ color: 'var(--text-primary)' }}>
                                                            {fmtDollar(r.expected_salary)}
                                                        </td>
                                                        <td className="px-5 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>
                                                            {r.repayment_years === Infinity ? '∞' : `${r.repayment_years}yr`}
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span
                                                                className="px-2.5 py-1 rounded-full text-xs font-bold"
                                                                style={{
                                                                    backgroundColor: `${roiColor}18`,
                                                                    color: roiColor,
                                                                }}
                                                            >
                                                                {r.roi_category.charAt(0).toUpperCase() + r.roi_category.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <button
                                                                onClick={() => setComparisonResults(prev => prev.filter((_, i) => i !== idx))}
                                                                className="p-1 rounded hover:bg-[var(--bg-surface-hover)] transition-colors"
                                                                style={{ color: 'var(--text-ghost)' }}
                                                                aria-label="Remove"
                                                            >
                                                                <XIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div
                            className="rounded-xl border p-4 flex items-start gap-3"
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                borderColor: 'var(--border-subtle)',
                            }}
                        >
                            <svg
                                className="w-4 h-4 flex-shrink-0 mt-0.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ color: 'var(--text-ghost)' }}
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-ghost)' }}>
                                This calculator provides estimates based on published tuition data and median salary statistics by major.
                                Actual costs, financial aid, and salaries vary significantly. This is not financial advice — consult a
                                financial advisor for personalized guidance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
