import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId } = body as { userId: string }

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        const { data: profile } = await getSupabaseAdmin()
            .from('user_profiles')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single()

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${baseUrl}/pricing`,
        })

        return NextResponse.json({ url: session.url })
    } catch (err) {
        console.error('Portal error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal error' },
            { status: 500 }
        )
    }
}
