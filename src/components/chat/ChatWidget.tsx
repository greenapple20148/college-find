'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

/* ─── SVG Icons ─── */
const IconTarget = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
)
const IconGem = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3l3 6-2 13" /><path d="M2 9h20" /></svg>
)
const IconPen = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
)
const IconClipboard = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
)
const IconGradCap = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" /></svg>
)
const IconWarning = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
)

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

interface StudentProfile {
    gpa?: number
    sat_total?: number | null
    act?: number | null
    intended_major?: string | null
    preferred_states?: string[]
    budget_max?: number | null
    campus_size?: string
}

const QUICK_PROMPTS = [
    { label: 'My Chances', icon: IconTarget, prompt: 'Based on my profile, what are my chances at top schools? Give me a realistic assessment.' },
    { label: 'Hidden Gems', icon: IconGem, prompt: 'Suggest some hidden gem colleges I might not have considered that would be a great fit for my profile.' },
    { label: 'Essay Help', icon: IconPen, prompt: 'Help me brainstorm ideas for my college application essay. What makes a compelling personal statement?' },
    { label: 'App Strategy', icon: IconClipboard, prompt: 'Create an application strategy for me — how many Safety, Match, and Reach schools should I target?' },
]

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Load student profile from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('cm-profile')
            if (saved) {
                const parsed = JSON.parse(saved)
                setProfile(parsed)
            }
        } catch { }
    }, [])

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isStreaming) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
        }

        const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
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
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMsg.id
                            ? { ...m, content: `[!] ${err.error || 'Something went wrong. Please try again.'}` }
                            : m
                    )
                )
                setIsStreaming(false)
                return
            }

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                setIsStreaming(false)
                return
            }

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
                            if (parsed.error) {
                                accumulated += `\n\n[!] ${parsed.error}`
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
                        ? { ...m, content: '[!] Network error. Please check your connection and try again.' }
                        : m
                )
            )
        } finally {
            setIsStreaming(false)
        }
    }, [isStreaming, messages, profile])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    const clearChat = () => {
        setMessages([])
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                    background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark, #8A6D30))',
                    color: '#fff',
                    border: 'none',
                }}
                aria-label={isOpen ? 'Close AI Advisor' : 'Open AI Advisor'}
                id="chat-toggle-btn"
            >
                {isOpen ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                )}
            </button>

            {/* Chat Panel */}
            <div
                className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
                style={{
                    width: isOpen ? '420px' : '0px',
                    height: isOpen ? 'min(600px, calc(100vh - 120px))' : '0px',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    backgroundColor: 'var(--bg-primary)',
                    border: isOpen ? '1px solid var(--border-primary)' : 'none',
                    transform: isOpen ? 'scale(1)' : 'scale(0.9)',
                    transformOrigin: 'bottom right',
                }}
                id="chat-panel"
            >
                {/* Header */}
                <div
                    className="px-5 py-4 flex items-center justify-between shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark, #8A6D30))',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <IconGradCap size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white leading-tight">AI College Advisor</h3>
                            <p className="text-[11px] text-white/70">Powered by Claude</p>
                        </div>
                    </div>
                    <button
                        onClick={clearChat}
                        className="text-[11px] text-white/60 hover:text-white/90 transition-colors px-2 py-1 rounded"
                        title="Clear conversation"
                    >
                        Clear
                    </button>
                </div>

                {/* Messages */}
                <div
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                    style={{ minHeight: 0 }}
                >
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-full mx-auto" style={{ backgroundColor: 'rgba(201, 146, 60, 0.12)', color: 'var(--gold-primary)' }}>
                                <IconGradCap size={24} />
                            </div>
                            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                Hi! I&apos;m your AI College Advisor
                            </h4>
                            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                                Ask me anything about colleges, admissions, essays, or application strategy.
                                {profile?.gpa && (
                                    <span className="block mt-1" style={{ color: 'var(--gold-primary)' }}>
                                        I can see your profile — I&apos;ll personalize my advice!
                                    </span>
                                )}
                            </p>
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {QUICK_PROMPTS.map(qp => (
                                    <button
                                        key={qp.label}
                                        onClick={() => sendMessage(qp.prompt)}
                                        className="flex items-center gap-2 text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                                        style={{
                                            backgroundColor: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-subtle)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        <span style={{ color: 'var(--gold-primary)', flexShrink: 0 }}><qp.icon /></span>
                                        {qp.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                                    style={
                                        msg.role === 'user'
                                            ? {
                                                background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark, #8A6D30))',
                                                color: '#fff',
                                                borderBottomRightRadius: '6px',
                                            }
                                            : {
                                                backgroundColor: 'var(--bg-secondary)',
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
                    className="px-4 py-3 shrink-0"
                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                    <div
                        className="flex items-end gap-2 rounded-xl px-3 py-2"
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
                            placeholder="Ask about colleges, essays, strategy..."
                            rows={1}
                            className="flex-1 bg-transparent text-sm resize-none outline-none"
                            style={{ color: 'var(--text-primary)', maxHeight: '80px' }}
                            disabled={isStreaming}
                            id="chat-input"
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isStreaming}
                            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                            style={{
                                backgroundColor: input.trim() && !isStreaming ? 'var(--gold-primary)' : 'var(--bg-tertiary)',
                                color: input.trim() && !isStreaming ? '#fff' : 'var(--text-ghost)',
                                cursor: input.trim() && !isStreaming ? 'pointer' : 'default',
                            }}
                            aria-label="Send message"
                            id="chat-send-btn"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                    <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--text-ghost)' }}>
                        AI estimates only — not professional advice. Verify with colleges.
                    </p>
                </div>
            </div>
        </>
    )
}

/* ─── Markdown-lite renderer for assistant messages ─── */

function AssistantMessage({ content, isStreaming }: { content: string; isStreaming: boolean }) {
    if (!content && isStreaming) {
        return (
            <span className="inline-flex items-center gap-1">
                <span className="animate-pulse" style={{ color: 'var(--gold-primary)' }}>●</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Thinking...</span>
            </span>
        )
    }

    // Simple markdown rendering: bold, bullets, headers
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]

        // Headers
        if (line.startsWith('### ')) {
            elements.push(
                <p key={i} className="font-semibold text-[13px] mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {renderInline(line.slice(4))}
                </p>
            )
            continue
        }
        if (line.startsWith('## ')) {
            elements.push(
                <p key={i} className="font-semibold text-sm mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {renderInline(line.slice(3))}
                </p>
            )
            continue
        }

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
            elements.push(
                <p key={i} className="pl-3 relative" style={{ color: 'var(--text-secondary)' }}>
                    <span className="absolute left-0" style={{ color: 'var(--gold-primary)' }}>•</span>
                    {renderInline(line.slice(2))}
                </p>
            )
            continue
        }

        // Numbered lists
        const numMatch = line.match(/^(\d+)\.\s(.*)/)
        if (numMatch) {
            elements.push(
                <p key={i} className="pl-4 relative" style={{ color: 'var(--text-secondary)' }}>
                    <span className="absolute left-0 font-semibold" style={{ color: 'var(--gold-primary)' }}>{numMatch[1]}.</span>
                    {renderInline(numMatch[2])}
                </p>
            )
            continue
        }

        // Empty lines
        if (line.trim() === '') {
            elements.push(<div key={i} className="h-2" />)
            continue
        }

        // Regular text
        elements.push(
            <p key={i} style={{ color: 'var(--text-secondary)' }}>
                {renderInline(line)}
            </p>
        )
    }

    if (isStreaming) {
        elements.push(
            <span key="cursor" className="inline-block w-1.5 h-3.5 animate-pulse ml-0.5" style={{ backgroundColor: 'var(--gold-primary)', borderRadius: '1px' }} />
        )
    }

    return <div className="space-y-0.5">{elements}</div>
}

function renderInline(text: string): React.ReactNode {
    // Handle **bold** and *italic*
    const parts: React.ReactNode[] = []
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index))
        }
        if (match[1]) {
            parts.push(<strong key={match.index} className="font-semibold" style={{ color: 'var(--text-primary)' }}>{match[1]}</strong>)
        } else if (match[2]) {
            parts.push(<em key={match.index}>{match[2]}</em>)
        } else if (match[3]) {
            parts.push(<code key={match.index} className="px-1 py-0.5 rounded text-[12px]" style={{ backgroundColor: 'var(--bg-tertiary)' }}>{match[3]}</code>)
        }
        lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
    }

    return parts.length === 0 ? text : <>{parts}</>
}
