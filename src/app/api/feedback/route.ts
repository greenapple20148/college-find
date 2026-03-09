import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * Strip HTML tags and dangerous characters to prevent stored XSS.
 * Keeps the plain-text content intact.
 */
function sanitizeText(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
}

/**
 * Validate page_url is a safe relative path (no protocol injection).
 */
function sanitizePageUrl(url: unknown): string | null {
    if (typeof url !== 'string') return null
    const trimmed = url.trim()
    // Only allow relative paths starting with /
    if (!trimmed.startsWith('/')) return null
    // Block any protocol-like patterns (javascript:, data:, etc.)
    if (/^\/\/|[a-z]+:/i.test(trimmed)) return null
    // Limit length
    if (trimmed.length > 500) return null
    return trimmed
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { category, rating, message, page_url } = body

        // ── Validate message ──────────────────────────────────
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        if (message.trim().length > 2000) {
            return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 })
        }

        // ── Sanitize inputs ───────────────────────────────────
        const sanitizedMessage = sanitizeText(message.trim())

        const validCategories = ['general', 'bug', 'feature', 'content', 'other']
        const safeCategory = validCategories.includes(category) ? category : 'general'

        const safeRating = typeof rating === 'number' && rating >= 1 && rating <= 5
            ? Math.round(rating)
            : null

        const safePageUrl = sanitizePageUrl(page_url)

        // ── Derive user_id from session (never trust client) ──
        let userId: string | null = null
        try {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()
            userId = user?.id ?? null
        } catch { /* anonymous feedback is allowed */ }

        // ── Insert ────────────────────────────────────────────
        const service = createServiceClient()

        const { error } = await service.from('feedback').insert({
            user_id: userId,
            category: safeCategory,
            rating: safeRating,
            message: sanitizedMessage,
            page_url: safePageUrl,
        })

        if (error) {
            console.error('Feedback insert error:', error.message)
            return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

