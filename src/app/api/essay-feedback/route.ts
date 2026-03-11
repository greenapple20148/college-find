import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/lib/feature-gate'

/**
 * Essay Feedback — AI-powered essay review and improvement suggestions
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const access = await checkFeatureAccess(user.id, 'essay_feedback')
        if (!access.allowed) {
            return NextResponse.json({
                error: 'upgrade_required', message: access.message, upgrade_required: true
            }, { status: 403 })
        }

        const { essayText, essayType, prompt: essayPrompt, wordLimit } = await req.json()

        if (!essayText || essayText.trim().length < 50) {
            return NextResponse.json({ error: 'Essay must be at least 50 characters.' }, { status: 400 })
        }

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })

        const wordCount = essayText.trim().split(/\s+/).length

        const aiPrompt = `You are an expert college admissions essay reviewer. Review this student's essay and provide detailed, constructive feedback.

**Essay Type:** ${essayType || 'Personal statement'}
**Essay Prompt:** ${essayPrompt || 'Not specified'}
**Word Limit:** ${wordLimit || 'Not specified'}
**Current Word Count:** ${wordCount}

**Student's Essay:**
"""
${essayText.slice(0, 4000)}
"""

Provide feedback as valid JSON with this structure:
{
  "overallScore": <1-10>,
  "scores": {
    "hook": <1-10>,
    "storytelling": <1-10>,
    "authenticity": <1-10>,
    "specificity": <1-10>,
    "reflection": <1-10>,
    "writing": <1-10>,
    "structure": <1-10>
  },
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<specific strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    {"area": "<area>", "issue": "<specific issue>", "suggestion": "<actionable fix>"},
    {"area": "<area>", "issue": "<specific issue>", "suggestion": "<actionable fix>"},
    {"area": "<area>", "issue": "<specific issue>", "suggestion": "<actionable fix>"}
  ],
  "lineEdits": [
    {"original": "<quote from essay>", "revised": "<improved version>", "reason": "<why>"}
  ],
  "admissionsInsight": "<1-2 sentences on how an admissions officer would perceive this essay>",
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"]
}

Be honest but encouraging. Focus on substance over surface-level grammar.`

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                messages: [{ role: 'user', content: aiPrompt }],
            }),
        })
        const data = await res.json()
        const text = data?.content?.[0]?.text ?? '{}'

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        let feedback
        try {
            feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : null
        } catch {
            feedback = null
        }

        return NextResponse.json({
            feedback,
            wordCount,
            raw: feedback ? undefined : text,
        })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
    }
}
