/**
 * GET /api/usage?feature=sat_questions
 *   → Returns current usage status for the feature
 *
 * POST /api/usage  { feature: "sat_questions" }
 *   → Records a usage event and returns updated status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkFeatureAccess, gateAndRecord } from '@/lib/feature-gate'
import { FEATURES, type FeatureKey } from '@/lib/feature-config'

async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
}

// ─── GET: Check usage status ─────────────────────────────────

export async function GET(req: NextRequest) {
    const userId = await getAuthUserId()
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feature = req.nextUrl.searchParams.get('feature') as FeatureKey
    if (!feature || !FEATURES[feature]) {
        return NextResponse.json({ error: 'Invalid feature key' }, { status: 400 })
    }

    const result = await checkFeatureAccess(userId, feature)

    return NextResponse.json(result)
}

// ─── POST: Record usage ──────────────────────────────────────

export async function POST(req: NextRequest) {
    const userId = await getAuthUserId()
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const feature = body.feature as FeatureKey
    if (!feature || !FEATURES[feature]) {
        return NextResponse.json({ error: 'Invalid feature key' }, { status: 400 })
    }

    const result = await gateAndRecord(userId, feature)

    if (!result.allowed) {
        return NextResponse.json(result, { status: 403 })
    }

    return NextResponse.json(result)
}
