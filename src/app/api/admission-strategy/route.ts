import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/lib/feature-gate'

/**
 * AI Admission Strategy — generates personalized application strategy
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const access = await checkFeatureAccess(user.id, 'ai_admission_strategy')
        if (!access.allowed) {
            return NextResponse.json({
                error: 'upgrade_required', message: access.message, upgrade_required: true
            }, { status: 403 })
        }

        const { gpa, sat, extracurriculars, targetSchools, interests, budget } = await req.json()

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })

        const prompt = `You are a top college admissions consultant. Generate a personalized college application strategy.

**Student Profile:**
- GPA: ${gpa || 'Not provided'}
- SAT Score: ${sat || 'Not provided'}
- Extracurriculars: ${extracurriculars || 'Not provided'}
- Target Schools: ${targetSchools || 'Not provided'}
- Academic Interests: ${interests || 'Not provided'}
- Budget Range: ${budget || 'Not provided'}

Generate a comprehensive strategy with these sections:

1. **Profile Assessment** — Honest evaluation of where they stand
2. **School List Strategy** — Recommended safety/match/reach distribution (suggest specific types of schools)
3. **Application Timeline** — Month-by-month action plan for the next 6-12 months
4. **Essay Strategy** — What themes to highlight, what to avoid, how to stand out
5. **Extracurricular Positioning** — How to frame their activities for maximum impact
6. **Testing Strategy** — Whether to retake SAT, target score, prep recommendations
7. **Financial Strategy** — Scholarship opportunities and financial aid approach
8. **Red Flags to Address** — Any weaknesses to proactively address in applications

Be specific, actionable, and encouraging. Use markdown formatting.
Keep the response under 1000 words.`

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
                messages: [{ role: 'user', content: prompt }],
            }),
        })
        const data = await res.json()
        const strategy = data?.content?.[0]?.text ?? 'Unable to generate strategy.'

        return NextResponse.json({ strategy })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
    }
}
