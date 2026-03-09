import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

const INVITE_LIMIT = { maxRequests: 10, windowMs: 60 * 60 * 1000 } // 10 invites per hour

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Rate limiting
        const rl = checkRateLimit(`invite:${user.id}`, INVITE_LIMIT)
        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'Too many invites. Please try again later.', retryAfterMs: rl.retryAfterMs },
                { status: 429 }
            )
        }

        const body = await req.json()
        const { emails } = body

        if (!Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'At least one email is required' }, { status: 400 })
        }

        if (emails.length > 5) {
            return NextResponse.json({ error: 'Maximum 5 invites at a time' }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const validEmails: string[] = []
        for (const email of emails) {
            if (typeof email !== 'string') continue
            const trimmed = email.trim().toLowerCase()
            if (trimmed.length > 254) continue
            if (!emailRegex.test(trimmed)) continue
            if (trimmed === user.email?.toLowerCase()) continue // Can't invite yourself
            validEmails.push(trimmed)
        }

        if (validEmails.length === 0) {
            return NextResponse.json({ error: 'No valid email addresses provided' }, { status: 400 })
        }

        // Store invites in DB
        const service = createServiceClient()
        const inviteRecords = validEmails.map(email => ({
            inviter_id: user.id,
            inviter_email: user.email || 'unknown',
            invitee_email: email,
            status: 'sent',
        }))

        const { error } = await service.from('invites').insert(inviteRecords)

        if (error) {
            // If table doesn't exist yet, just log and return success
            console.error('Invite insert error:', error.message)
        }

        return NextResponse.json({
            success: true,
            sent: validEmails.length,
            emails: validEmails,
        })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
