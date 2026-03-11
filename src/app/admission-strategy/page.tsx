'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdmissionStrategyPage() {
    const [form, setForm] = useState({ gpa: '', sat: '', extracurriculars: '', targetSchools: '', interests: '', budget: '' })
    const [loading, setLoading] = useState(false)
    const [strategy, setStrategy] = useState('')
    const [error, setError] = useState('')
    const [upgradeRequired, setUpgradeRequired] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        setStrategy('')
        try {
            const res = await fetch('/api/admission-strategy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const text = await res.text()
            let data
            try { data = JSON.parse(text) } catch { setError(`Server error: ${text.slice(0, 200)}`); return }
            if (data.upgrade_required) {
                setUpgradeRequired(true)
                setError(data.message)
            } else if (data.error) {
                setError(data.error)
            } else if (data.strategy) {
                setStrategy(data.strategy)
            } else {
                setError('No strategy returned. Please try again.')
            }
        } catch (e) {
            setError(`Failed to generate strategy: ${e instanceof Error ? e.message : 'unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    if (upgradeRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))' }}>
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
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
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--gold-primary)' }}>Premium</span>
                    </div>
                    <h1 className="heading-serif text-3xl sm:text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
                        AI Admission <span className="heading-serif-italic text-gradient-gold">Strategy</span>
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Get a personalized application strategy tailored to your profile
                    </p>
                </div>

                {!strategy ? (
                    <div className="card-dark p-6 sm:p-8 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>GPA</label>
                                <input type="text" placeholder="e.g., 3.8 unweighted" value={form.gpa} onChange={e => setForm(p => ({ ...p, gpa: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                            </div>
                            <div>
                                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>SAT Score</label>
                                <input type="text" placeholder="e.g., 1350" value={form.sat} onChange={e => setForm(p => ({ ...p, sat: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Schools</label>
                            <input type="text" placeholder="e.g., UCLA, NYU, University of Michigan" value={form.targetSchools} onChange={e => setForm(p => ({ ...p, targetSchools: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Extracurricular Activities</label>
                            <textarea rows={3} placeholder="List your main activities, leadership roles, awards..." value={form.extracurriculars} onChange={e => setForm(p => ({ ...p, extracurriculars: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm resize-none" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Academic Interests</label>
                            <input type="text" placeholder="e.g., Computer Science, Biology, Business" value={form.interests} onChange={e => setForm(p => ({ ...p, interests: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Budget Range</label>
                            <select value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                                <option value="">Select...</option>
                                <option value="Under $20,000/yr">Under $20,000/yr</option>
                                <option value="$20,000 - $40,000/yr">$20,000 - $40,000/yr</option>
                                <option value="$40,000 - $60,000/yr">$40,000 - $60,000/yr</option>
                                <option value="$60,000+/yr">$60,000+/yr</option>
                                <option value="Need full scholarship">Need full scholarship</option>
                            </select>
                        </div>

                        {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

                        <button onClick={handleSubmit} disabled={loading || (!form.gpa && !form.sat)}
                            className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50">
                            {loading ? 'Generating Strategy...' : 'Generate My Strategy →'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="card-dark p-6 sm:p-8">
                            <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}>
                                {strategy.split('\n').map((line, i) => {
                                    if (line.startsWith('# ')) return <h2 key={i} className="heading-serif text-xl mt-6 mb-2" style={{ color: 'var(--text-primary)' }}>{line.slice(2)}</h2>
                                    if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-5 mb-2" style={{ color: 'var(--text-primary)' }}>{line.slice(3)}</h3>
                                    if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-4 mb-1" style={{ color: 'var(--gold-primary)' }}>{line.slice(4)}</h4>
                                    if (line.startsWith('**') && line.endsWith('**')) return <h4 key={i} className="font-semibold text-sm mt-4 mb-1" style={{ color: 'var(--gold-primary)' }}>{line.slice(2, -2)}</h4>
                                    if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-sm ml-4 mb-1" style={{ color: 'var(--text-muted)' }}>{line.slice(2)}</li>
                                    if (line.trim() === '') return <br key={i} />
                                    return <p key={i} className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{line}</p>
                                })}
                            </div>
                        </div>
                        <button onClick={() => { setStrategy(''); setForm({ gpa: '', sat: '', extracurriculars: '', targetSchools: '', interests: '', budget: '' }) }}
                            className="btn-outline px-6 py-2.5 text-sm">
                            ← Generate New Strategy
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
