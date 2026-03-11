import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/lib/feature-gate'

/**
 * Major & Career Match — AI-powered matching based on student interests
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const access = await checkFeatureAccess(user.id, 'major_career_match')
        if (!access.allowed) {
            return NextResponse.json({
                error: 'upgrade_required', message: access.message, upgrade_required: true
            }, { status: 403 })
        }

        const { interests, strengths, values, preferredWorkStyle, satSection } = await req.json()

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })

        const prompt = `You are a career counselor for high school students. Help match them to college majors and career paths.

**Student Profile:**
- Academic interests: ${interests || 'Not specified'}
- Strengths/skills: ${strengths || 'Not specified'}
- Values (e.g., income, creativity, helping others): ${values || 'Not specified'}
- Preferred work style: ${preferredWorkStyle || 'Not specified'}
- Stronger SAT section: ${satSection || 'Not specified'}

Generate a personalized recommendation with:

1. **Top 5 Major Matches** — Each with:
   - Major name
   - Match score (1-100)
   - Why it fits them
   - Typical courses they'd enjoy
   
2. **Top 5 Career Paths** — Each with:
   - Career title
   - Median salary range
   - Day-in-the-life summary (1 sentence)
   - Required education level
   - Growth outlook (growing/stable/declining)

3. **Hidden Gem Major** — An unexpected major they might not have considered

4. **Interdisciplinary Options** — 2-3 combined major/minor combinations

5. **Schools Known For These Majors** — 5 colleges strong in their top matches

Return as valid JSON with this structure:
{
  "topMajors": [{"name":"","matchScore":0,"reason":"","courses":[]}],
  "topCareers": [{"title":"","salary":"","dayInLife":"","education":"","growth":""}],
  "hiddenGem": {"name":"","reason":""},
  "interdisciplinary": [{"combo":"","reason":""}],
  "recommendedSchools": [{"name":"","strength":""}]
}`

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
        const text = data?.content?.[0]?.text ?? '{}'

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        let matches
        try {
            matches = jsonMatch ? JSON.parse(jsonMatch[0]) : null
        } catch {
            matches = null
        }

        return NextResponse.json({ matches, raw: matches ? undefined : text })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
    }
}
