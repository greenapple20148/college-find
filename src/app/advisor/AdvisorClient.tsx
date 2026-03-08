'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradeGate } from '@/components/ui/UpgradeGate'
import { createClient } from '@/lib/supabase/client'
import type { StudentProfile, College } from '@/lib/types'
import { generateRecommendations } from '@/lib/recommendations'

/* ═══════════════════════════════════════════════════════════════
   SVG Icons for Quick Prompts
   ═══════════════════════════════════════════════════════════════ */

const IconTarget = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
)
const IconSchool = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
    </svg>
)
const IconGem = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3l3 6-2 13" /><path d="M2 9h20" />
    </svg>
)
const IconPen = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
)
const IconClipboard = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
)
const IconTrendUp = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
)

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

interface RecommendationCard {
    name: string
    category: string
    fit_score: number
    admission_probability: number
    tuition_estimate: number
    reasons: string[]
}

/* ═══════════════════════════════════════════════════════════════
   Quick Prompts
   ═══════════════════════════════════════════════════════════════ */

const QUICK_PROMPTS = [
    { label: 'My Chances', icon: IconTarget, prompt: 'Based on my profile, what are my admission chances at top schools? Give me a realistic Safety / Match / Reach breakdown.' },
    { label: 'Recommend Colleges', icon: IconSchool, prompt: 'Recommend a balanced list of colleges for me — include Safety, Match, and Reach schools with explanations of why each fits.' },
    { label: 'Hidden Gems', icon: IconGem, prompt: 'Suggest hidden gem colleges I might not have considered. Focus on schools with great outcomes, strong programs, and good value.' },
    { label: 'Essay Strategy', icon: IconPen, prompt: 'Help me brainstorm ideas for my college application essay. What makes a compelling personal statement for my profile?' },
    { label: 'App Strategy', icon: IconClipboard, prompt: 'Create an application strategy — how many schools, EA/ED timing, and how to prioritize my list.' },
    { label: 'Improve My Profile', icon: IconTrendUp, prompt: 'What can I do in the next few months to strengthen my college application and improve my chances?' },
]

/* ═══════════════════════════════════════════════════════════════
   Advisor Client Component
   ═══════════════════════════════════════════════════════════════ */

export default function AdvisorClient() {
    const { user } = useAuth()
    const { limits, loading: subLoading } = useSubscription()
    const supabase = createClient()

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [recommendations, setRecommendations] = useState<RecommendationCard[]>([])
    const [profileLoaded, setProfileLoaded] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Load student profile & run recommendations
    useEffect(() => {
        async function loadProfile() {
            try {
                const saved = localStorage.getItem('cm-profile')
                if (saved) {
                    const parsed = JSON.parse(saved) as StudentProfile
                    setProfile(parsed)

                    // Fetch colleges to run recommendation engine
                    const { data: colleges } = await supabase
                        .from('colleges')
                        .select('*')
                        .limit(500)

                    if (colleges && colleges.length > 0) {
                        const recs = generateRecommendations(parsed, colleges as College[], 10)
                        setRecommendations(recs.map(r => ({
                            name: r.college.name,
                            category: r.admission_probability >= 0.75 ? 'Safety' : r.admission_probability >= 0.40 ? 'Match' : 'Reach',
                            fit_score: r.fit_score,
                            admission_probability: r.admission_probability,
                            tuition_estimate: r.tuition_estimate,
                            reasons: r.reasons,
                        })))
                    }
                }
            } catch { }
            setProfileLoaded(true)
        }
        loadProfile()
    }, [supabase])

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus()
    }, [])

    /* ── Send message ──────────────────────────────────────────── */

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isStreaming) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
        }

        const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        }

        setMessages(prev => [...prev, userMsg, assistantMsg])
        setInput('')
        setIsStreaming(true)

        try {
            const allMessages = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content,
            }))

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: allMessages,
                    profile: profile || undefined,
                    recommendations: recommendations.length > 0 ? recommendations : undefined,
                    saveSession: !!user,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMsg.id
                            ? { ...m, content: `Something went wrong: ${err.error || 'Please try again.'}` }
                            : m
                    )
                )
                setIsStreaming(false)
                return
            }

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            if (!reader) { setIsStreaming(false); return }

            let accumulated = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') continue

                        try {
                            const parsed = JSON.parse(data)
                            if (parsed.text) {
                                accumulated += parsed.text
                                const currentText = accumulated
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantMsg.id ? { ...m, content: currentText } : m
                                    )
                                )
                            }
                        } catch { }
                    }
                }
            }
        } catch {
            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantMsg.id
                        ? { ...m, content: 'Network error. Please check your connection and try again.' }
                        : m
                )
            )
        } finally {
            setIsStreaming(false)
        }
    }, [isStreaming, messages, profile, recommendations, user])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    /* ── Render ─────────────────────────────────────────────────── */

    if (!profileLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-sm" style={{ color: 'var(--text-faint)' }}>Loading advisor...</div>
            </div>
        )
    }

    if (!subLoading && !limits.canUseAIAdvisor) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold heading-serif mb-1" style={{ color: 'var(--text-primary)' }}>
                    AI College Advisor
                </h1>
                <p className="text-sm mb-6" style={{ color: 'var(--text-faint)' }}>
                    Personalized recommendations and strategic advice powered by your profile
                </p>
                <UpgradeGate planName="College Prep Pro+" feature="AI College Advisor">
                    <p className="text-xs mb-4" style={{ color: 'var(--text-ghost)' }}>
                        Get personalized college recommendations, admission chance breakdowns, essay strategy, and more.
                    </p>
                </UpgradeGate>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>
                        AI College Advisor
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        Personalized recommendations and strategic advice powered by your profile
                    </p>
                </div>
                {recommendations.length > 0 && (
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-xs font-medium px-3 py-2 rounded-lg border transition-all md:hidden"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--gold-primary)' }}
                    >
                        {sidebarOpen ? 'Hide' : 'Show'} Recommendations
                    </button>
                )}
            </div>

            {/* Profile banner */}
            {!profile && (
                <div
                    className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    style={{
                        backgroundColor: 'rgba(201,146,60,0.05)',
                        border: '1px solid rgba(201,146,60,0.15)',
                    }}
                >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Complete your profile for personalized advice</p>
                        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Add your GPA, test scores, and preferences to get tailored recommendations.</p>
                    </div>
                    <Link
                        href="/profile"
                        className="text-xs font-semibold px-4 py-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: 'var(--gold-primary)', color: '#000' }}
                    >
                        Set Up Profile
                    </Link>
                </div>
            )}

            <div className="flex gap-6">
                {/* Main chat area */}
                <div className="flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 240px)' }}>
                    {/* Messages */}
                    <div
                        className="flex-1 overflow-y-auto rounded-xl border p-4 space-y-4 mb-4"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: 'rgba(201,146,60,0.1)' }}
                                >
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    How can I help you today?
                                </h2>
                                <p className="text-sm mb-6 max-w-md" style={{ color: 'var(--text-faint)' }}>
                                    Ask me about colleges, admissions strategy, essay ideas, or anything related to your college applications.
                                    {profile?.gpa && (
                                        <span className="block mt-1" style={{ color: 'var(--gold-primary)' }}>
                                            Your profile is loaded — I&apos;ll personalize my advice!
                                        </span>
                                    )}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-lg">
                                    {QUICK_PROMPTS.map(qp => (
                                        <button
                                            key={qp.label}
                                            onClick={() => sendMessage(qp.prompt)}
                                            className="flex items-center gap-2 text-left text-xs px-3 py-3 rounded-xl transition-all hover:scale-[1.02]"
                                            style={{
                                                backgroundColor: 'var(--bg-primary)',
                                                border: '1px solid var(--border-subtle)',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            <span className="flex-shrink-0" style={{ color: 'var(--gold-primary)' }}><qp.icon /></span>
                                            <span className="font-medium">{qp.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                                        style={
                                            msg.role === 'user'
                                                ? {
                                                    background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark, #8A6D30))',
                                                    color: '#fff',
                                                    borderBottomRightRadius: '6px',
                                                }
                                                : {
                                                    backgroundColor: 'var(--bg-primary)',
                                                    color: 'var(--text-primary)',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderBottomLeftRadius: '6px',
                                                }
                                        }
                                    >
                                        {msg.role === 'assistant' ? (
                                            <AssistantMessage content={msg.content} isStreaming={isStreaming && msg === messages[messages.length - 1]} />
                                        ) : (
                                            <span>{msg.content}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        className="flex items-end gap-2 rounded-xl px-4 py-3"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                        }}
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about colleges, admissions, essays, strategy..."
                            rows={1}
                            className="flex-1 bg-transparent text-sm resize-none outline-none"
                            style={{ color: 'var(--text-primary)', maxHeight: '120px' }}
                            disabled={isStreaming}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isStreaming}
                            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                            style={{
                                backgroundColor: input.trim() && !isStreaming ? 'var(--gold-primary)' : 'var(--bg-tertiary)',
                                color: input.trim() && !isStreaming ? '#fff' : 'var(--text-ghost)',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--text-ghost)' }}>
                        AI estimates only — not professional admissions advice. Always verify with colleges directly.
                    </p>
                </div>

                {/* Sidebar — recommendation cards */}
                {recommendations.length > 0 && (
                    <aside
                        className={`w-72 flex-shrink-0 space-y-3 ${sidebarOpen ? 'block' : 'hidden'} md:block`}
                    >
                        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                            Top Matches for You
                        </h3>
                        {recommendations.slice(0, 6).map((rec, i) => (
                            <div
                                key={i}
                                className="rounded-xl border p-3 transition-all hover:border-[rgba(201,146,60,0.3)]"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                            >
                                <div className="flex items-start justify-between mb-1.5">
                                    <p className="text-sm font-semibold leading-tight pr-2" style={{ color: 'var(--text-primary)' }}>
                                        {rec.name}
                                    </p>
                                    <span
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: rec.category === 'Safety' ? 'rgba(34,197,94,0.1)' : rec.category === 'Match' ? 'rgba(201,146,60,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: rec.category === 'Safety' ? '#22c55e' : rec.category === 'Match' ? 'var(--gold-primary)' : '#ef4444',
                                        }}
                                    >
                                        {rec.category}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] mb-2" style={{ color: 'var(--text-faint)' }}>
                                    <span>Fit: {rec.fit_score}/100</span>
                                    <span>•</span>
                                    <span>{Math.round(rec.admission_probability * 100)}% chance</span>
                                </div>
                                {rec.reasons[0] && (
                                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                                        {rec.reasons[0]}
                                    </p>
                                )}
                                <button
                                    onClick={() => sendMessage(`Tell me more about ${rec.name}. Why is it a good fit for me? What are its strengths and weaknesses?`)}
                                    className="text-[11px] font-medium mt-2 transition-colors hover:underline"
                                    style={{ color: 'var(--gold-primary)' }}
                                >
                                    Ask about this school →
                                </button>
                            </div>
                        ))}
                        <Link
                            href="/recommendations"
                            className="block text-center text-xs font-medium py-2 rounded-lg border transition-all hover:border-[rgba(201,146,60,0.3)]"
                            style={{ borderColor: 'var(--border-subtle)', color: 'var(--gold-primary)' }}
                        >
                            View All Recommendations
                        </Link>
                    </aside>
                )}
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   Markdown-lite renderer
   ═══════════════════════════════════════════════════════════════ */

function AssistantMessage({ content, isStreaming }: { content: string; isStreaming: boolean }) {
    if (!content && isStreaming) {
        return (
            <span className="inline-flex items-center gap-1">
                <span className="animate-pulse" style={{ color: 'var(--gold-primary)' }}>●</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Thinking...</span>
            </span>
        )
    }

    const lines = content.split('\n')
    const elements: React.ReactNode[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (line.startsWith('### ')) {
            elements.push(<p key={i} className="font-semibold text-[13px] mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>{renderInline(line.slice(4))}</p>)
            continue
        }
        if (line.startsWith('## ')) {
            elements.push(<p key={i} className="font-semibold text-sm mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>{renderInline(line.slice(3))}</p>)
            continue
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
            elements.push(
                <p key={i} className="pl-3 relative" style={{ color: 'var(--text-secondary)' }}>
                    <span className="absolute left-0" style={{ color: 'var(--gold-primary)' }}>•</span>
                    {renderInline(line.slice(2))}
                </p>
            )
            continue
        }
        const numMatch = line.match(/^(\d+)\.\s(.*)/)
        if (numMatch) {
            elements.push(
                <p key={i} className="pl-5 relative" style={{ color: 'var(--text-secondary)' }}>
                    <span className="absolute left-0 font-semibold" style={{ color: 'var(--gold-primary)' }}>{numMatch[1]}.</span>
                    {renderInline(numMatch[2])}
                </p>
            )
            continue
        }
        if (line.trim() === '') {
            elements.push(<div key={i} className="h-2" />)
            continue
        }
        elements.push(<p key={i} style={{ color: 'var(--text-secondary)' }}>{renderInline(line)}</p>)
    }

    if (isStreaming) {
        elements.push(<span key="cursor" className="inline-block w-1.5 h-4 animate-pulse ml-0.5" style={{ backgroundColor: 'var(--gold-primary)', borderRadius: '1px' }} />)
    }

    return <div className="space-y-0.5">{elements}</div>
}

function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = []
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
        if (match[1]) parts.push(<strong key={match.index} className="font-semibold" style={{ color: 'var(--text-primary)' }}>{match[1]}</strong>)
        else if (match[2]) parts.push(<em key={match.index}>{match[2]}</em>)
        else if (match[3]) parts.push(<code key={match.index} className="px-1 py-0.5 rounded text-[12px]" style={{ backgroundColor: 'var(--bg-tertiary)' }}>{match[3]}</code>)
        lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts.length === 0 ? text : <>{parts}</>
}
