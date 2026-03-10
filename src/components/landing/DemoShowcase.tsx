'use client'

import { useState, useEffect, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
   Animated "See CollegeFind in Action" showcase for the landing page.
   Cycles through feature screenshots with a smooth crossfade
   and interactive navigation dots.
   ═══════════════════════════════════════════════════════════════ */

interface Slide {
    title: string
    description: string
    gradient: string
    icon: React.ReactNode
    mockup: React.ReactNode
}

/* ── Mini mockup components ───────────────────────────────────── */

function SearchMockup() {
    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search bar */}
            <div style={{
                display: 'flex', gap: '10px', marginBottom: '20px',
            }}>
                <div style={{
                    flex: 1, height: '40px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px',
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(201,146,60,0.7)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Search colleges...</span>
                </div>
                <div style={{
                    height: '40px', padding: '0 16px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #C9923C, #A67B2E)',
                    color: '#fff', fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center',
                }}>Search</div>
            </div>
            {/* Filter chips */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {['California', 'Private', '$30k–$50k'].map(f => (
                    <span key={f} style={{
                        padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                        background: 'rgba(201,146,60,0.15)', color: '#C9923C', border: '1px solid rgba(201,146,60,0.3)',
                    }}>{f}</span>
                ))}
            </div>
            {/* College cards */}
            {[
                { name: 'Stanford University', rate: '4%', type: 'Reach', color: '#f87171' },
                { name: 'UC Berkeley', rate: '11%', type: 'Reach', color: '#f87171' },
                { name: 'Cal Poly SLO', rate: '30%', type: 'Match', color: '#C9923C' },
            ].map((c, i) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', marginBottom: '8px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{c.rate} acceptance</div>
                    </div>
                    <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 700,
                        background: `${c.color}20`, color: c.color,
                    }}>{c.type}</span>
                </div>
            ))}
        </div>
    )
}

function DashboardMockup() {
    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #C9923C, #A67B2E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                </div>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>My Dashboard</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>3 colleges saved</div>
                </div>
            </div>
            {/* Progress */}
            <div style={{
                padding: '14px', borderRadius: '12px', marginBottom: '12px',
                background: 'rgba(201,146,60,0.08)', border: '1px solid rgba(201,146,60,0.2)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#C9923C' }}>Application Progress</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#C9923C' }}>65%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(201,146,60,0.15)' }}>
                    <div style={{ width: '65%', height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #C9923C, #D4A84B)' }} />
                </div>
            </div>
            {/* Deadline */}
            <div style={{
                padding: '12px 14px', borderRadius: '10px', marginBottom: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Stanford — Regular Decision</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Jan 5, 2026</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>3 days</span>
            </div>
            {/* Checklist items */}
            {['Write personal essay', 'Send transcripts', 'Submit SAT scores'].map((t, i) => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    marginBottom: '4px', borderRadius: '8px',
                }}>
                    <div style={{
                        width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                        ...(i === 0 ? { background: '#C9923C', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '1.5px solid rgba(255,255,255,0.2)' }),
                    }}>
                        {i === 0 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
                    </div>
                    <span style={{
                        fontSize: '12px', color: i === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)',
                        textDecoration: i === 0 ? 'line-through' : 'none',
                    }}>{t}</span>
                </div>
            ))}
        </div>
    )
}

function EssayMockup() {
    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>
                    ✨ Essay Toolkit
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>8 AI-powered writing tools</div>
            </div>
            {/* Tool grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                    { icon: '💡', name: 'Topic Generator' },
                    { icon: '🎯', name: 'Common App Brainstormer' },
                    { icon: '🔍', name: 'Story Finder' },
                    { icon: '📝', name: 'Outline Builder' },
                    { icon: '✏️', name: 'Hook Generator' },
                    { icon: '📊', name: 'Strength Analyzer' },
                ].map((t, i) => (
                    <div key={i} style={{
                        padding: '12px 10px', borderRadius: '10px', textAlign: 'center',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.2s',
                    }}>
                        <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{t.name}</div>
                    </div>
                ))}
            </div>
            {/* AI response preview */}
            <div style={{
                marginTop: '12px', padding: '12px', borderRadius: '10px',
                background: 'rgba(201,146,60,0.06)', border: '1px solid rgba(201,146,60,0.15)',
            }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#C9923C', marginBottom: '6px' }}>AI SUGGESTION</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                    &quot;Consider writing about the time you organized a community garden — it shows leadership and environmental passion...&quot;
                </div>
            </div>
        </div>
    )
}

function RecommendationsMockup() {
    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>
                    🎯 Personalized For You
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Based on your GPA: 3.8, SAT: 1420</div>
            </div>
            {/* Recommendation cards */}
            {[
                { name: 'Boston University', score: 92, match: 'Strong Match', color: '#4ade80' },
                { name: 'Northeastern University', score: 88, match: 'Strong Match', color: '#4ade80' },
                { name: 'University of Michigan', score: 79, match: 'Good Match', color: '#C9923C' },
            ].map((c, i) => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', marginBottom: '8px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: `${c.color}15`, border: `1px solid ${c.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800, color: c.color,
                    }}>
                        {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{c.name}</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                            <span style={{ fontSize: '11px', color: c.color, fontWeight: 600 }}>{c.score}% fit</span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>•</span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{c.match}</span>
                        </div>
                    </div>
                </div>
            ))}
            {/* Compare */}
            <div style={{
                marginTop: 'auto', padding: '10px', borderRadius: '10px', textAlign: 'center',
                background: 'rgba(201,146,60,0.08)', border: '1px solid rgba(201,146,60,0.2)',
                fontSize: '12px', fontWeight: 600, color: '#C9923C', cursor: 'pointer',
            }}>
                Compare Top Matches →
            </div>
        </div>
    )
}

const slides: Slide[] = [
    {
        title: 'Search & Filter',
        description: 'Search 6,000+ U.S. colleges by name, state, size, tuition, and selectivity.',
        gradient: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
        mockup: <SearchMockup />,
    },
    {
        title: 'Track Applications',
        description: 'Save colleges, set deadlines, and track every step of your application.',
        gradient: 'linear-gradient(145deg, #1a1a2e 0%, #1e293b 100%)',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
        mockup: <DashboardMockup />,
    },
    {
        title: 'AI Essay Toolkit',
        description: '8 AI-powered tools to brainstorm, outline, and strengthen your essays.',
        gradient: 'linear-gradient(145deg, #1a1a2e 0%, #2d1b4e 100%)',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
        mockup: <EssayMockup />,
    },
    {
        title: 'Personalized Picks',
        description: 'Get AI-powered college recommendations tailored to your profile.',
        gradient: 'linear-gradient(145deg, #1a1a2e 0%, #1b3a2e 100%)',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
        mockup: <RecommendationsMockup />,
    },
]

export default function DemoShowcase() {
    const [current, setCurrent] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const next = useCallback(() => {
        setCurrent(c => (c + 1) % slides.length)
    }, [])

    useEffect(() => {
        if (isPaused) return
        const timer = setInterval(next, 4000)
        return () => clearInterval(timer)
    }, [isPaused, next])

    const slide = slides[current]

    return (
        <section className="py-20 px-4" aria-label="Product demo">
            <div className="max-w-5xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-14">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold-primary)' }} />
                        <span
                            className="text-xs font-medium tracking-[0.2em] uppercase"
                            style={{ color: 'var(--gold-primary)' }}
                        >
                            See It In Action
                        </span>
                    </div>
                    <h2 className="heading-serif text-3xl sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                        Everything at your{' '}
                        <span className="heading-serif-italic text-gradient-gold">fingertips</span>
                    </h2>
                </div>

                {/* Showcase container */}
                <div
                    className="relative rounded-2xl overflow-hidden border"
                    style={{
                        borderColor: 'rgba(201,146,60,0.2)',
                        boxShadow: '0 0 80px rgba(201,146,60,0.08), 0 25px 50px rgba(0,0,0,0.15)',
                    }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Browser chrome */}
                    <div
                        style={{
                            height: '42px', display: 'flex', alignItems: 'center', padding: '0 16px',
                            background: 'rgba(20,20,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '7px' }}>
                            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57' }} />
                            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#febc2e' }} />
                            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28c840' }} />
                        </div>
                        <div style={{
                            margin: '0 auto', padding: '5px 24px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                        }}>
                            college-find.com
                        </div>
                    </div>

                    {/* Content area */}
                    <div style={{ background: slide.gradient, transition: 'background 0.8s ease', minHeight: '380px', position: 'relative' }}>
                        {slides.map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    position: i === current ? 'relative' : 'absolute',
                                    top: 0, left: 0, width: '100%', height: i === current ? 'auto' : '100%',
                                    opacity: i === current ? 1 : 0,
                                    transform: i === current ? 'scale(1)' : 'scale(0.98)',
                                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                                    pointerEvents: i === current ? 'auto' : 'none',
                                }}
                            >
                                {s.mockup}
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div style={{
                        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(20,20,30,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(201,146,60,0.15)', color: '#C9923C',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {slide.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                                    {slide.title}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', maxWidth: '300px' }}>
                                    {slide.description}
                                </div>
                            </div>
                        </div>

                        {/* Navigation dots */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    style={{
                                        width: i === current ? '24px' : '8px', height: '8px',
                                        borderRadius: '4px', border: 'none', cursor: 'pointer',
                                        background: i === current ? '#C9923C' : 'rgba(255,255,255,0.2)',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
