'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════════════════════════ */

function LinkIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    )
}

function MailIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    )
}

function CopyIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    )
}

function CheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    )
}

function SendIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    )
}

function UsersIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Invite Page
   ═══════════════════════════════════════════════════════════════ */

export default function InvitePage() {
    const { user } = useAuth()
    const [emails, setEmails] = useState<string[]>([''])
    const [sending, setSending] = useState(false)
    const [result, setResult] = useState<{ success: boolean; sent?: number; error?: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const inviteLink = typeof window !== 'undefined'
        ? `${window.location.origin}/signup${user ? `?ref=${user.id.slice(0, 8)}` : ''}`
        : ''

    function handleCopyLink() {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function addEmailField() {
        if (emails.length >= 5) return
        setEmails(prev => [...prev, ''])
        setTimeout(() => inputRefs.current[emails.length]?.focus(), 50)
    }

    function removeEmailField(index: number) {
        if (emails.length <= 1) return
        setEmails(prev => prev.filter((_, i) => i !== index))
    }

    function updateEmail(index: number, value: string) {
        setEmails(prev => prev.map((e, i) => i === index ? value : e))
    }

    async function handleSendInvites() {
        const validEmails = emails.filter(e => e.trim().length > 0)
        if (validEmails.length === 0) return

        setSending(true)
        setResult(null)

        try {
            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails: validEmails }),
            })
            const data = await res.json()

            if (res.ok) {
                setResult({ success: true, sent: data.sent })
                setEmails(['']) // Reset form
            } else {
                setResult({ success: false, error: data.error })
            }
        } catch {
            setResult({ success: false, error: 'Failed to send invites. Please try again.' })
        } finally {
            setSending(false)
        }
    }

    if (!user) {
        return (
            <div className="max-w-lg mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Invite Friends
                </h1>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                    Log in to invite your friends to CollegeFind.
                </p>
                <Link
                    href="/login?redirect=/invite"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}
                >
                    Log in to continue
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--gold-gradient)', boxShadow: 'var(--shadow-glow)' }}
                >
                    <UsersIcon />
                </div>
                <div>
                    <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>
                        Invite Friends
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        Share CollegeFind with your classmates
                    </p>
                </div>
            </div>

            <p className="text-sm mb-8 ml-[60px]" style={{ color: 'var(--text-ghost)' }}>
                Help your friends find their perfect college fit — all features are free!
            </p>

            {/* Share Link Card */}
            <div
                className="rounded-2xl border p-6 mb-6"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: 'var(--gold-primary)' }}><LinkIcon /></span>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Share Your Invite Link
                    </h2>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
                    Copy this link and share it anywhere — social media, group chats, or directly with friends.
                </p>
                <div className="flex items-center gap-2">
                    <div
                        className="flex-1 px-4 py-3 rounded-xl text-sm truncate select-all"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                        }}
                    >
                        {inviteLink}
                    </div>
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex-shrink-0"
                        style={{
                            background: copied ? 'rgba(34,197,94,0.15)' : 'var(--gold-gradient)',
                            color: copied ? '#22c55e' : '#000',
                            minWidth: '110px',
                            justifyContent: 'center',
                        }}
                    >
                        {copied ? (
                            <><CheckIcon /> Copied!</>
                        ) : (
                            <><CopyIcon /> Copy Link</>
                        )}
                    </button>
                </div>
            </div>

            {/* Email Invites Card */}
            <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: 'var(--gold-primary)' }}><MailIcon /></span>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Invite by Email
                    </h2>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
                    Enter up to 5 email addresses. We&apos;ll record the invite on your behalf.
                </p>

                <div className="space-y-2 mb-4">
                    {emails.map((email, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input
                                ref={el => { inputRefs.current[i] = el }}
                                type="email"
                                placeholder="friend@school.edu"
                                value={email}
                                onChange={e => updateEmail(i, e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        if (i === emails.length - 1 && emails.length < 5) {
                                            addEmailField()
                                        } else {
                                            handleSendInvites()
                                        }
                                    }
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-primary)',
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'var(--gold-primary)')}
                                onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
                            />
                            {emails.length > 1 && (
                                <button
                                    onClick={() => removeEmailField(i)}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
                                    style={{ color: 'var(--text-ghost)' }}
                                    title="Remove"
                                >
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    {emails.length < 5 ? (
                        <button
                            onClick={addEmailField}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                            style={{ color: 'var(--gold-primary)' }}
                        >
                            <PlusIcon /> Add another
                        </button>
                    ) : (
                        <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                            Maximum 5 invites at a time
                        </span>
                    )}

                    <button
                        onClick={handleSendInvites}
                        disabled={sending || emails.every(e => !e.trim())}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'var(--gold-gradient)', color: '#000' }}
                    >
                        {sending ? (
                            <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                        ) : (
                            <><SendIcon /> Send Invites</>
                        )}
                    </button>
                </div>

                {/* Result Message */}
                {result && (
                    <div
                        className="mt-4 p-4 rounded-xl text-sm flex items-center gap-3"
                        style={{
                            backgroundColor: result.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${result.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            color: result.success ? '#22c55e' : '#ef4444',
                        }}
                    >
                        {result.success ? (
                            <>
                                <CheckIcon />
                                <span>
                                    {result.sent === 1
                                        ? 'Invite sent successfully!'
                                        : `${result.sent} invites sent successfully!`
                                    }
                                </span>
                            </>
                        ) : (
                            <span>{result.error}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom note */}
            <p className="text-xs text-center mt-6" style={{ color: 'var(--text-ghost)' }}>
                We respect your friends&apos; privacy — we only use emails to record invites and never spam.
            </p>
        </div>
    )
}
