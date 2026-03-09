'use client'

import { useState, useRef, useEffect } from 'react'

/* ─── SVG Icon Components ─── */

function IconFaceSad({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15s1.5-2 4-2 4 2 4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
        </svg>
    )
}

function IconFaceUnhappy({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
        </svg>
    )
}

function IconFaceNeutral({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
        </svg>
    )
}

function IconFaceHappy({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
        </svg>
    )
}

function IconFaceAmazed({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <path d="M9 9v.5" strokeWidth="2.5" />
            <path d="M15 9v.5" strokeWidth="2.5" />
            <path d="M7 8.5c.5-.5 1.2-.8 2-.8s1.5.3 2 .8" />
            <path d="M13 8.5c.5-.5 1.2-.8 2-.8s1.5.3 2 .8" />
        </svg>
    )
}

function IconChat({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}

function IconSparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
    )
}

function IconBug({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 2 1.88 1.88M14.12 3.88 16 2" />
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
            <path d="M12 20v-9" />
            <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
            <path d="M6 13H2" />
            <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
            <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
            <path d="M22 13h-4" />
            <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
        </svg>
    )
}

function IconPencilLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
    )
}

function IconPin({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
        </svg>
    )
}

function IconCheckCircle({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

/* ─── Data ─── */

const CATEGORIES = [
    { value: 'general', label: 'General', icon: IconChat },
    { value: 'feature', label: 'Feature Request', icon: IconSparkle },
    { value: 'bug', label: 'Bug Report', icon: IconBug },
    { value: 'content', label: 'Content', icon: IconPencilLine },
    { value: 'other', label: 'Other', icon: IconPin },
]

const RATINGS = [
    { value: 1, icon: IconFaceSad, label: 'Poor' },
    { value: 2, icon: IconFaceUnhappy, label: 'Fair' },
    { value: 3, icon: IconFaceNeutral, label: 'Okay' },
    { value: 4, icon: IconFaceHappy, label: 'Good' },
    { value: 5, icon: IconFaceAmazed, label: 'Amazing' },
]

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [category, setCategory] = useState('general')
    const [rating, setRating] = useState<number | null>(null)
    const [message, setMessage] = useState('')
    const [submitState, setSubmitState] = useState<SubmitState>('idle')
    const [hoverRating, setHoverRating] = useState<number | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Close on outside clicks
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                if (isOpen && submitState !== 'submitting') {
                    setIsOpen(false)
                }
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen, submitState])

    // Focus textarea when opened
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 200)
        }
    }, [isOpen])

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && isOpen) setIsOpen(false)
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen])

    function reset() {
        setCategory('general')
        setRating(null)
        setMessage('')
        setSubmitState('idle')
    }

    async function handleSubmit() {
        if (!message.trim()) return
        setSubmitState('submitting')

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    rating,
                    message: message.trim(),
                    page_url: window.location.pathname,
                }),
            })

            if (res.ok) {
                setSubmitState('success')
                setTimeout(() => {
                    setIsOpen(false)
                    setTimeout(reset, 300)
                }, 1800)
            } else {
                setSubmitState('error')
            }
        } catch {
            setSubmitState('error')
        }
    }

    const charCount = message.length
    const canSubmit = message.trim().length > 0 && message.length <= 2000 && submitState === 'idle'

    return (
        <div ref={panelRef} className="fixed bottom-6 left-6 z-50">
            {/* Feedback panel */}
            <div
                className="absolute bottom-16 left-0 rounded-2xl border overflow-hidden transition-all duration-300"
                style={{
                    width: 380,
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(201,146,60,0.08)',
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
            >
                {submitState === 'success' ? (
                    /* ── Success State ── */
                    <div className="px-6 py-10 text-center">
                        <div className="mb-3 animate-bounce inline-block">
                            <IconCheckCircle className="w-12 h-12" style={{ color: 'var(--gold-primary)' }} />
                        </div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Thank you!
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                            Your feedback helps us improve CollegeFind.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div
                            className="px-5 py-4 flex items-center justify-between"
                            style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        >
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Send Feedback
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                                    Help us improve your experience
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
                                style={{ color: 'var(--text-ghost)' }}
                                aria-label="Close feedback"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-4 space-y-4">
                            {/* Rating */}
                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-faint)' }}>
                                    How&apos;s your experience?
                                </label>
                                <div className="flex gap-1.5">
                                    {RATINGS.map(r => {
                                        const isActive = rating === r.value
                                        const isHovered = hoverRating === r.value
                                        const RatingIcon = r.icon
                                        return (
                                            <button
                                                key={r.value}
                                                onClick={() => setRating(prev => prev === r.value ? null : r.value)}
                                                onMouseEnter={() => setHoverRating(r.value)}
                                                onMouseLeave={() => setHoverRating(null)}
                                                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border transition-all duration-150"
                                                style={{
                                                    backgroundColor: isActive
                                                        ? 'rgba(201,146,60,0.12)'
                                                        : isHovered ? 'var(--bg-tertiary)' : 'transparent',
                                                    borderColor: isActive ? 'var(--gold-primary)' : 'var(--border-subtle)',
                                                    transform: isActive || isHovered ? 'scale(1.08)' : 'scale(1)',
                                                }}
                                                title={r.label}
                                            >
                                                <RatingIcon
                                                    className="w-6 h-6"
                                                    style={{
                                                        color: isActive ? 'var(--gold-primary)' : isHovered ? 'var(--text-secondary)' : 'var(--text-muted)',
                                                    }}
                                                />
                                                <span className="text-[9px] font-medium" style={{
                                                    color: isActive ? 'var(--gold-primary)' : 'var(--text-ghost)',
                                                }}>
                                                    {r.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-faint)' }}>
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {CATEGORIES.map(c => {
                                        const isActive = category === c.value
                                        const CatIcon = c.icon
                                        return (
                                            <button
                                                key={c.value}
                                                onClick={() => setCategory(c.value)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150"
                                                style={{
                                                    backgroundColor: isActive ? 'rgba(201,146,60,0.12)' : 'transparent',
                                                    borderColor: isActive ? 'var(--gold-primary)' : 'var(--border-subtle)',
                                                    color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)',
                                                }}
                                            >
                                                <CatIcon
                                                    className="w-3.5 h-3.5"
                                                    style={{ color: isActive ? 'var(--gold-primary)' : 'var(--text-ghost)' }}
                                                />
                                                {c.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-faint)' }}>
                                    Your feedback
                                </label>
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Tell us what's on your mind…"
                                    rows={3}
                                    maxLength={2000}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--input-border)',
                                        color: 'var(--text-primary)',
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        '--tw-ring-color': 'var(--input-focus-ring)',
                                    } as React.CSSProperties}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px]" style={{
                                        color: charCount > 1900 ? '#dc2626' : 'var(--text-ghost)',
                                    }}>
                                        {charCount}/2000
                                    </span>
                                    {submitState === 'error' && (
                                        <span className="text-[11px] font-medium" style={{ color: '#dc2626' }}>
                                            Something went wrong. Try again.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className="px-5 py-3 flex items-center justify-end gap-2"
                            style={{ borderTop: '1px solid var(--border-subtle)' }}
                        >
                            <button
                                onClick={() => { setIsOpen(false); reset() }}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
                                style={{ color: 'var(--text-secondary)' }}
                                disabled={submitState === 'submitting'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: canSubmit ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))' : 'var(--bg-tertiary)',
                                    color: canSubmit ? '#000' : 'var(--text-ghost)',
                                    boxShadow: canSubmit ? '0 2px 8px rgba(201,146,60,0.3)' : 'none',
                                }}
                            >
                                {submitState === 'submitting' ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07-2.83 2.83M9.76 14.24l-2.83 2.83m12.14 0-2.83-2.83M9.76 9.76 6.93 6.93" />
                                        </svg>
                                        Sending…
                                    </span>
                                ) : 'Send Feedback'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Toggle button */}
            <button
                onClick={() => {
                    if (submitState === 'success') reset()
                    setIsOpen(prev => !prev)
                }}
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 border"
                style={{
                    background: isOpen
                        ? 'var(--bg-tertiary)'
                        : 'linear-gradient(135deg, rgba(201,146,60,0.15), rgba(201,146,60,0.05))',
                    borderColor: isOpen ? 'var(--border-subtle)' : 'rgba(201,146,60,0.2)',
                    color: isOpen ? 'var(--text-secondary)' : 'var(--gold-primary)',
                    boxShadow: isOpen
                        ? 'var(--shadow-soft)'
                        : '0 4px 20px rgba(201,146,60,0.15)',
                }}
                aria-label="Send feedback"
                title="Send feedback"
            >
                {isOpen ? (
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round" />
                    </svg>
                )}
            </button>
        </div>
    )
}
