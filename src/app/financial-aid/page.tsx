'use client'

import { useState } from 'react'
import Link from 'next/link'

interface AidResult {
    efc: number
    financialNeed: number
    breakdown: { parentIncomeContribution: number; parentAssetContribution: number; studentIncomeContribution: number; studentAssetContribution: number }
    aidEstimate: { pellGrant: number; pellEligible: boolean; subsidizedLoan: number; unsubsidizedLoan: number; institutionalAid: number; workStudy: number; totalEstimatedAid: number }
    summary: { targetTuition: number; estimatedOutOfPocket: number; coveragePercent: number }
    disclaimer: string
}

function formatUSD(n: number) { return '$' + n.toLocaleString() }

export default function FinancialAidPage() {
    const [form, setForm] = useState({
        householdIncome: '', householdSize: '4', numberInCollege: '1',
        parentAssets: '', studentIncome: '', studentAssets: '',
        filingStatus: 'married', stateResidence: '', targetTuition: '',
    })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AidResult | null>(null)
    const [error, setError] = useState('')
    const [upgradeRequired, setUpgradeRequired] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/financial-aid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    householdIncome: Number(form.householdIncome) || 0,
                    householdSize: Number(form.householdSize) || 4,
                    numberInCollege: Number(form.numberInCollege) || 1,
                    parentAssets: Number(form.parentAssets) || 0,
                    studentIncome: Number(form.studentIncome) || 0,
                    studentAssets: Number(form.studentAssets) || 0,
                    filingStatus: form.filingStatus,
                    stateResidence: form.stateResidence,
                    targetTuition: Number(form.targetTuition) || 0,
                }),
            })
            const data = await res.json()
            if (data.upgrade_required) { setUpgradeRequired(true); setError(data.message); return }
            if (data.error) { setError(data.error); return }
            setResult(data)
        } catch {
            setError('Failed to calculate estimate')
        } finally {
            setLoading(false)
        }
    }

    if (upgradeRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))' }}>
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                    </div>
                    <h1 className="heading-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Premium Feature</h1>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
                    <Link href="/pricing" className="btn-gold px-8 py-3 inline-block">Upgrade to Premium</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen px-4 py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>Premium</span>
                    </div>
                    <h1 className="heading-serif text-3xl sm:text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
                        Financial Aid <span className="heading-serif-italic text-gradient-gold">Estimator</span>
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Estimate your Expected Family Contribution and potential aid eligibility
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="card-dark p-6 space-y-4">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Family Information</h3>
                        <div>
                            <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>Annual Household Income</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-faint)' }}>$</span>
                                <input type="number" placeholder="75,000" value={form.householdIncome} onChange={e => setForm(p => ({ ...p, householdIncome: e.target.value }))}
                                    className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>Household Size</label>
                                <select value={form.householdSize} onChange={e => setForm(p => ({ ...p, householdSize: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>In College</label>
                                <select value={form.numberInCollege} onChange={e => setForm(p => ({ ...p, numberInCollege: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                                    {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>Filing Status</label>
                            <select value={form.filingStatus} onChange={e => setForm(p => ({ ...p, filingStatus: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                                <option value="married">Married / Filing Jointly</option>
                                <option value="single">Single Parent</option>
                                <option value="separated">Separated</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>Parent Assets (savings, investments excl. home)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-faint)' }}>$</span>
                                <input type="number" placeholder="50,000" value={form.parentAssets} onChange={e => setForm(p => ({ ...p, parentAssets: e.target.value }))}
                                    className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                            </div>
                        </div>

                        <h3 className="font-semibold text-sm pt-2" style={{ color: 'var(--text-primary)' }}>Student Information</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>Student Income</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-faint)' }}>$</span>
                                    <input type="number" placeholder="0" value={form.studentIncome} onChange={e => setForm(p => ({ ...p, studentIncome: e.target.value }))}
                                        className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>Student Assets</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-faint)' }}>$</span>
                                    <input type="number" placeholder="0" value={form.studentAssets} onChange={e => setForm(p => ({ ...p, studentAssets: e.target.value }))}
                                        className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                                </div>
                            </div>
                        </div>

                        <h3 className="font-semibold text-sm pt-2" style={{ color: 'var(--text-primary)' }}>Target School</h3>
                        <div>
                            <label className="text-xs block mb-1" style={{ color: 'var(--text-faint)' }}>Annual Tuition & Fees (Cost of Attendance)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-faint)' }}>$</span>
                                <input type="number" placeholder="40,000" value={form.targetTuition} onChange={e => setForm(p => ({ ...p, targetTuition: e.target.value }))}
                                    className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                            </div>
                        </div>

                        {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

                        <button onClick={handleSubmit} disabled={loading || !form.householdIncome}
                            className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50">
                            {loading ? 'Calculating...' : 'Estimate My Aid →'}
                        </button>
                    </div>

                    {/* Results */}
                    {result ? (
                        <div className="space-y-4">
                            {/* EFC Card */}
                            <div className="card-dark p-6 text-center">
                                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>Estimated Family Contribution</p>
                                <p className="text-4xl font-bold font-mono" style={{ color: 'var(--gold-primary)' }}>{formatUSD(result.efc)}</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>per year</p>
                            </div>

                            {/* EFC Breakdown */}
                            <div className="card-dark p-6">
                                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>EFC Breakdown</h3>
                                {[
                                    ['Parent Income Contribution', result.breakdown.parentIncomeContribution],
                                    ['Parent Asset Contribution', result.breakdown.parentAssetContribution],
                                    ['Student Income Contribution', result.breakdown.studentIncomeContribution],
                                    ['Student Asset Contribution', result.breakdown.studentAssetContribution],
                                ].map(([label, val]) => (
                                    <div key={label as string} className="flex justify-between py-1.5 text-sm" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{label as string}</span>
                                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatUSD(val as number)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Aid Estimate */}
                            <div className="card-dark p-6">
                                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Estimated Aid Package</h3>
                                {[
                                    ['Pell Grant', result.aidEstimate.pellGrant, result.aidEstimate.pellEligible],
                                    ['Subsidized Loan', result.aidEstimate.subsidizedLoan, result.aidEstimate.subsidizedLoan > 0],
                                    ['Unsubsidized Loan', result.aidEstimate.unsubsidizedLoan, true],
                                    ['Institutional Aid (est.)', result.aidEstimate.institutionalAid, result.aidEstimate.institutionalAid > 0],
                                    ['Work-Study', result.aidEstimate.workStudy, result.aidEstimate.workStudy > 0],
                                ].map(([label, val, eligible]) => (
                                    <div key={label as string} className="flex justify-between py-1.5 text-sm" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{label as string}</span>
                                        <span className="font-mono" style={{ color: eligible ? '#22c55e' : 'var(--text-ghost)' }}>
                                            {eligible ? formatUSD(val as number) : '—'}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between py-2 mt-2 font-semibold text-sm" style={{ borderTop: '2px solid var(--border-subtle)' }}>
                                    <span style={{ color: 'var(--text-primary)' }}>Total Estimated Aid</span>
                                    <span className="font-mono" style={{ color: 'var(--gold-primary)' }}>{formatUSD(result.aidEstimate.totalEstimatedAid)}</span>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="card-dark p-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Tuition</p>
                                        <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{formatUSD(result.summary.targetTuition)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Aid Coverage</p>
                                        <p className="text-lg font-bold font-mono" style={{ color: 'var(--gold-primary)' }}>{result.summary.coveragePercent}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Out of Pocket</p>
                                        <p className="text-lg font-bold font-mono" style={{ color: '#ef4444' }}>{formatUSD(result.summary.estimatedOutOfPocket)}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-center" style={{ color: 'var(--text-ghost)' }}>{result.disclaimer}</p>
                        </div>
                    ) : (
                        <div className="card-dark p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: 300 }}>
                            <svg className="w-12 h-12 mb-4" style={{ color: 'var(--text-ghost)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Fill in your financial details to see your estimated aid package</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
