import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { gateAndRecord } from '@/lib/feature-gate'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { user_id, question_id, session_id, selected_answer, is_correct, time_spent, section, topic, difficulty } = body

        if (!user_id || !question_id || !selected_answer || section === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // ── Feature gate: check & record SAT question usage ───
        const access = await gateAndRecord(user_id, 'sat_questions')
        if (!access.allowed) {
            return NextResponse.json({
                error: 'limit_reached',
                message: access.message,
                remaining: access.remaining,
                upgrade_required: access.upgrade_required,
            }, { status: 403 })
        }

        const supabase = createServiceClient()

        const { data, error } = await supabase
            .from('sat_question_attempts')
            .insert({
                user_id,
                question_id,
                session_id: session_id || null,
                selected_answer,
                is_correct: !!is_correct,
                time_spent: time_spent || 0,
                section,
                topic: topic || '',
                difficulty: difficulty || 'medium',
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data, remaining: access.remaining })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
