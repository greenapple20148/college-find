'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)
    const supabase = createClient()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSent(true)
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="text-center py-4">
                <div
                    className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(201,146,60,0.12)' }}
                >
                    <svg
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                </div>
                <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Check your email
                </h2>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    We sent a password reset link to
                </p>
                <p
                    className="text-sm font-semibold mb-6"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {email}
                </p>
                <p className="text-xs mb-6" style={{ color: 'var(--text-faint)' }}>
                    Didn&apos;t receive the email? Check your spam folder or{' '}
                    <button
                        onClick={() => setSent(false)}
                        className="hover:underline"
                        style={{ color: 'var(--gold-primary)' }}
                    >
                        try again
                    </button>
                </p>
                <Link
                    href="/login"
                    className="inline-block text-sm hover:underline"
                    style={{ color: 'var(--gold-primary)' }}
                >
                    ← Back to sign in
                </Link>
            </div>
        )
    }

    return (
        <div>
            <h1
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
            >
                Reset your password
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Enter the email address associated with your account and we&apos;ll send
                you a link to reset your password.
            </p>

            {error && (
                <div
                    className="mb-4 p-3 rounded-lg text-sm border"
                    style={{
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        borderColor: 'rgba(239,68,68,0.3)',
                        color: '#f87171',
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Email address
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--gold-primary)] transition-colors"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}
                >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>

            <p
                className="text-sm text-center mt-6"
                style={{ color: 'var(--text-faint)' }}
            >
                Remember your password?{' '}
                <Link
                    href="/login"
                    className="hover:underline"
                    style={{ color: 'var(--gold-primary)' }}
                >
                    Sign in
                </Link>
            </p>
        </div>
    )
}
