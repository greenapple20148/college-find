'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MajorMatch { name: string; matchScore: number; reason: string; courses: string[] }
interface CareerMatch { title: string; salary: string; dayInLife: string; education: string; growth: string }
interface MatchResult {
    topMajors: MajorMatch[]
    topCareers: CareerMatch[]
    hiddenGem: { name: string; reason: string }
    interdisciplinary: { combo: string; reason: string }[]
    recommendedSchools: { name: string; strength: string }[]
}

export default function MajorMatchPage() {
    const [form, setForm] = useState({ interests: '', strengths: '', values: '', preferredWorkStyle: '', satSection: '' })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<MatchResult | null>(null)
    const [error, setError] = useState('')
    const [upgradeRequired, setUpgradeRequired] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/major-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (data.upgrade_required) { setUpgradeRequired(true); setError(data.message); return }
            if (data.error) { setError(data.error); return }
            setResult(data.matches)
        } catch {
            setError('Failed to generate matches')
        } finally {
            setLoading(false)
        }
    }

    if (upgradeRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))' }}>
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
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
                        Major & Career <span className="heading-serif-italic text-gradient-gold">Match</span>
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Discover the best majors and careers based on your unique profile
                    </p>
                </div>

                {!result ? (
                    <div className="card-dark p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>What subjects do you enjoy most?</label>
                            <textarea rows={2} placeholder="e.g., math, writing creative stories, biology labs, debate..." value={form.interests} onChange={e => setForm(p => ({ ...p, interests: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm resize-none" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>What are you naturally good at?</label>
                            <textarea rows={2} placeholder="e.g., problem solving, public speaking, coding, art, writing..." value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm resize-none" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>What do you value in a career?</label>
                            <div className="flex flex-wrap gap-2">
                                {['High income', 'Creativity', 'Helping others', 'Work-life balance', 'Innovation', 'Leadership', 'Travel', 'Stability', 'Independence'].map(v => (
                                    <button key={v} onClick={() => setForm(p => ({
                                        ...p,
                                        values: p.values.includes(v) ? p.values.replace(v + ', ', '').replace(v, '') : (p.values ? p.values + ', ' + v : v)
                                    }))}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                        style={{
                                            backgroundColor: form.values.includes(v) ? 'var(--gold-primary)' : 'var(--bg-tertiary)',
                                            color: form.values.includes(v) ? '#fff' : 'var(--text-muted)',
                                            border: `1px solid ${form.values.includes(v) ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                                        }}>
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Preferred work style</label>
                            <select value={form.preferredWorkStyle} onChange={e => setForm(p => ({ ...p, preferredWorkStyle: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                                <option value="">Select...</option>
                                <option value="office">Office / Corporate</option>
                                <option value="remote">Remote / Flexible</option>
                                <option value="hands-on">Hands-on / Field work</option>
                                <option value="lab">Lab / Research</option>
                                <option value="people">People-focused</option>
                                <option value="creative">Creative / Studio</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stronger SAT section</label>
                            <select value={form.satSection} onChange={e => setForm(p => ({ ...p, satSection: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                                <option value="">Select...</option>
                                <option value="Math">Math</option>
                                <option value="Reading & Writing">Reading & Writing</option>
                                <option value="Both equal">Both equal</option>
                            </select>
                        </div>

                        {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

                        <button onClick={handleSubmit} disabled={loading || !form.interests}
                            className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50">
                            {loading ? 'Finding Your Matches...' : 'Find My Matches →'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Top Majors */}
                        <div className="card-dark p-6 sm:p-8">
                            <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>🎓 Top Major Matches</h2>
                            <div className="space-y-4">
                                {result.topMajors?.map((m, i) => (
                                    <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                                                backgroundColor: m.matchScore >= 85 ? 'rgba(34,197,94,0.15)' : 'rgba(201,146,60,0.15)',
                                                color: m.matchScore >= 85 ? '#22c55e' : 'var(--gold-primary)',
                                            }}>
                                                {m.matchScore}% match
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{m.reason}</p>
                                        {m.courses?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {m.courses.map((c, j) => (
                                                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full" style={{
                                                        backgroundColor: 'var(--bg-secondary)', color: 'var(--text-faint)',
                                                        border: '1px solid var(--border-subtle)',
                                                    }}>{c}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Careers */}
                        <div className="card-dark p-6 sm:p-8">
                            <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>💼 Career Paths</h2>
                            <div className="space-y-3">
                                {result.topCareers?.map((c, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.title}</h3>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.dayInLife}</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{c.education}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold" style={{ color: 'var(--gold-primary)' }}>{c.salary}</p>
                                            <p className="text-[10px]" style={{
                                                color: c.growth === 'growing' ? '#22c55e' : c.growth === 'declining' ? '#ef4444' : 'var(--text-faint)'
                                            }}>{c.growth}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hidden Gem + Interdisciplinary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {result.hiddenGem && (
                                <div className="card-dark p-6">
                                    <h3 className="font-semibold mb-2" style={{ color: 'var(--gold-primary)' }}>💎 Hidden Gem</h3>
                                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{result.hiddenGem.name}</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{result.hiddenGem.reason}</p>
                                </div>
                            )}
                            {result.interdisciplinary?.length > 0 && (
                                <div className="card-dark p-6">
                                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🔗 Combo Options</h3>
                                    {result.interdisciplinary.map((x, i) => (
                                        <div key={i} className="mb-2">
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{x.combo}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{x.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recommended Schools */}
                        {result.recommendedSchools?.length > 0 && (
                            <div className="card-dark p-6 sm:p-8">
                                <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>🏛 Recommended Schools</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {result.recommendedSchools.map((s, i) => (
                                        <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{s.strength}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={() => { setResult(null); setForm({ interests: '', strengths: '', values: '', preferredWorkStyle: '', satSection: '' }) }}
                            className="btn-outline px-6 py-2.5 text-sm">
                            ← Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
