'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

/* ═══════════════════════════════════════════════════════════════
   Interactive Product Tour — tooltip-based guided walkthrough
   that highlights key features when a user first visits the dashboard.
   Uses localStorage to track completion so it only shows once.
   ═══════════════════════════════════════════════════════════════ */

interface TourStep {
    /** CSS selector for the target element */
    target: string
    title: string
    description: string
    position: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="college-list"]',
        title: '📋 Your College List',
        description: 'All your saved colleges appear here. Track status, set deadlines, and add notes for each school.',
        position: 'bottom',
    },
    {
        target: '[data-tour="deadlines"]',
        title: '📅 Deadline Tracker',
        description: 'Never miss a deadline. Upcoming due dates are highlighted with urgency indicators.',
        position: 'left',
    },
    {
        target: '[data-tour="checklist"]',
        title: '✅ Application Checklist',
        description: 'Track every step — from Common App to transcripts. Check off tasks as you complete them.',
        position: 'left',
    },
    {
        target: '[data-tour="export"]',
        title: '📥 Export Your List',
        description: 'Download your college list as a CSV spreadsheet to share with parents or counselors.',
        position: 'bottom',
    },
]

const STORAGE_KEY = 'collegefind_tour_completed'

interface TourOverlayProps {
    step: TourStep
    stepIndex: number
    totalSteps: number
    targetRect: DOMRect
    onNext: () => void
    onPrev: () => void
    onSkip: () => void
}

function TourOverlay({ step, stepIndex, totalSteps, targetRect, onNext, onPrev, onSkip }: TourOverlayProps) {
    const tooltipRef = useRef<HTMLDivElement>(null)
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (!tooltipRef.current) return
        const tt = tooltipRef.current.getBoundingClientRect()
        const pad = 16

        let top = 0, left = 0
        switch (step.position) {
            case 'bottom':
                top = targetRect.bottom + pad
                left = targetRect.left + targetRect.width / 2 - tt.width / 2
                break
            case 'top':
                top = targetRect.top - tt.height - pad
                left = targetRect.left + targetRect.width / 2 - tt.width / 2
                break
            case 'left':
                top = targetRect.top + targetRect.height / 2 - tt.height / 2
                left = targetRect.left - tt.width - pad
                break
            case 'right':
                top = targetRect.top + targetRect.height / 2 - tt.height / 2
                left = targetRect.right + pad
                break
        }
        // Keep in viewport
        left = Math.max(12, Math.min(left, window.innerWidth - tt.width - 12))
        top = Math.max(12, Math.min(top, window.innerHeight - tt.height - 12))
        setTooltipPos({ top, left })
    }, [targetRect, step.position])

    return (
        <>
            {/* Spotlight overlay */}
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    pointerEvents: 'none',
                }}
            >
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                    <defs>
                        <mask id="tour-spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            <rect
                                x={targetRect.left - 6}
                                y={targetRect.top - 6}
                                width={targetRect.width + 12}
                                height={targetRect.height + 12}
                                rx="12"
                                fill="black"
                            />
                        </mask>
                    </defs>
                    <rect
                        width="100%" height="100%"
                        fill="rgba(0,0,0,0.55)"
                        mask="url(#tour-spotlight-mask)"
                    />
                </svg>
            </div>

            {/* Spotlight ring */}
            <div
                style={{
                    position: 'fixed', zIndex: 9998, pointerEvents: 'none',
                    top: targetRect.top - 6, left: targetRect.left - 6,
                    width: targetRect.width + 12, height: targetRect.height + 12,
                    borderRadius: '12px',
                    border: '2px solid rgba(201,146,60,0.6)',
                    boxShadow: '0 0 30px rgba(201,146,60,0.2), 0 0 60px rgba(201,146,60,0.1)',
                    transition: 'all 0.4s ease',
                }}
            />

            {/* Click catcher */}
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    cursor: 'pointer',
                }}
                onClick={onSkip}
            />

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                style={{
                    position: 'fixed', zIndex: 9999,
                    top: tooltipPos.top, left: tooltipPos.left,
                    width: '320px', maxWidth: 'calc(100vw - 24px)',
                    borderRadius: '16px', overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(201,146,60,0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(201,146,60,0.1)',
                    transition: 'top 0.4s ease, left 0.4s ease',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Progress bar */}
                <div style={{ height: '3px', background: 'var(--bg-tertiary)' }}>
                    <div style={{
                        height: '100%', width: `${((stepIndex + 1) / totalSteps) * 100}%`,
                        background: 'linear-gradient(90deg, #C9923C, #D4A84B)',
                        transition: 'width 0.3s ease',
                    }} />
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                        {step.title}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                        {step.description}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div key={i} style={{
                                    width: i === stepIndex ? '16px' : '6px', height: '6px',
                                    borderRadius: '3px',
                                    background: i === stepIndex ? '#C9923C' : 'var(--border-subtle)',
                                    transition: 'all 0.3s',
                                }} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {stepIndex > 0 && (
                                <button
                                    onClick={onPrev}
                                    style={{
                                        padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
                                        background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={onNext}
                                style={{
                                    padding: '7px 18px', borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #C9923C, #A67B2E)', color: '#fff',
                                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(201,146,60,0.3)',
                                }}
                            >
                                {stepIndex === totalSteps - 1 ? 'Done!' : 'Next →'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onSkip}
                        style={{
                            marginTop: '10px', background: 'none', border: 'none',
                            fontSize: '11px', color: 'var(--text-ghost)', cursor: 'pointer',
                            width: '100%', textAlign: 'center',
                        }}
                    >
                        Skip tour
                    </button>
                </div>
            </div>
        </>
    )
}

export function ProductTour() {
    const [active, setActive] = useState(false)
    const [stepIndex, setStepIndex] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Auto-start tour for first-time users after a delay
    useEffect(() => {
        if (!mounted) return
        const completed = localStorage.getItem(STORAGE_KEY)
        if (completed) return

        // Wait for dashboard to render
        const timer = setTimeout(() => {
            const firstTarget = document.querySelector(TOUR_STEPS[0].target)
            if (firstTarget) {
                setActive(true)
                updateTargetRect(0)
            }
        }, 1500)

        return () => clearTimeout(timer)
    }, [mounted])

    const updateTargetRect = useCallback((index: number) => {
        const step = TOUR_STEPS[index]
        const el = document.querySelector(step.target)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Wait for scroll to complete
            setTimeout(() => {
                setTargetRect(el.getBoundingClientRect())
            }, 400)
        }
    }, [])

    const handleNext = useCallback(() => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            const nextIndex = stepIndex + 1
            setStepIndex(nextIndex)
            updateTargetRect(nextIndex)
        } else {
            // Complete
            localStorage.setItem(STORAGE_KEY, 'true')
            setActive(false)
        }
    }, [stepIndex, updateTargetRect])

    const handlePrev = useCallback(() => {
        if (stepIndex > 0) {
            const prevIndex = stepIndex - 1
            setStepIndex(prevIndex)
            updateTargetRect(prevIndex)
        }
    }, [stepIndex, updateTargetRect])

    const handleSkip = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setActive(false)
    }, [])

    if (!mounted || !active || !targetRect) return null

    return createPortal(
        <TourOverlay
            step={TOUR_STEPS[stepIndex]}
            stepIndex={stepIndex}
            totalSteps={TOUR_STEPS.length}
            targetRect={targetRect}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
        />,
        document.body
    )
}

/** Button to manually restart the tour */
export function RestartTourButton() {
    return (
        <button
            onClick={() => {
                localStorage.removeItem(STORAGE_KEY)
                window.location.reload()
            }}
            className="text-xs hover:underline transition-colors"
            style={{ color: 'var(--gold-primary)' }}
        >
            Take a tour →
        </button>
    )
}
