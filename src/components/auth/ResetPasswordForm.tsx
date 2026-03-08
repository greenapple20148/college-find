'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [sessionReady, setSessionReady] = useState(false)
    const [sessionError, setSessionError] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Verify user has a valid recovery session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionReady(true)
            } else {
                setSessionError(true)
            }
        })

        // Also listen for PASSWORD_RECOVERY event from the auth callback
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setSessionReady(true)
                    setSessionError(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            // Redirect to dashboard after 2s
            setTimeout(() => router.push('/dashboard'), 2000)
        }
    }

    if (sessionError) {
        return (
            <div className="text-center py-4">
                <div
                    className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
                >
                    <svg
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: '#f87171' }}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </div>
                <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Invalid or expired link
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}
                >
                    Request new link
                </Link>
            </div>
        )
    }

    if (!sessionReady) {
        return (
            <div className="text-center py-8">
                <div
                    className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
                    style={{
                        borderColor: 'var(--border-subtle)',
                        borderTopColor: 'var(--gold-primary)',
                    }}
                />
                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                    Verifying reset link…
                </p>
            </div>
        )
    }

    if (success) {
        return (
            <div className="text-center py-4">
                <div
                    className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(22,163,74,0.12)' }}
                >
                    <svg
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: '#16a34a' }}
                    >
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                </div>
                <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Password updated
                </h2>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Your password has been changed successfully. Redirecting to your dashboard…
                </p>
                <Link
                    href="/dashboard"
                    className="inline-block text-sm hover:underline mt-2"
                    style={{ color: 'var(--gold-primary)' }}
                >
                    Go to dashboard →
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
                Choose a new password
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Enter your new password below. Must be at least 8 characters.
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
                        New password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        autoFocus
                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--gold-primary)] transition-colors"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>
                <div>
                    <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Confirm new password
                    </label>
                    <input
                        type="password"
                        required
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--gold-primary)] transition-colors"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>

                {/* Password strength indicator */}
                <div className="space-y-1.5">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                className="h-1 flex-1 rounded-full transition-colors"
                                style={{
                                    backgroundColor:
                                        password.length === 0
                                            ? 'var(--border-subtle)'
                                            : password.length < 8
                                                ? i === 1
                                                    ? '#dc2626'
                                                    : 'var(--border-subtle)'
                                                : password.length < 12
                                                    ? i <= 2
                                                        ? '#ca8a04'
                                                        : 'var(--border-subtle)'
                                                    : password.length < 16
                                                        ? i <= 3
                                                            ? '#16a34a'
                                                            : 'var(--border-subtle)'
                                                        : '#16a34a',
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                        {password.length === 0
                            ? ''
                            : password.length < 8
                                ? 'Too short'
                                : password.length < 12
                                    ? 'Fair'
                                    : password.length < 16
                                        ? 'Good'
                                        : 'Strong'}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--gold-gradient)', color: '#000' }}
                >
                    {loading ? 'Updating…' : 'Update Password'}
                </button>
            </form>
        </div>
    )
}
