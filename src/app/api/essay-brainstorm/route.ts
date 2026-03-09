import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, AI_ESSAY_BRAINSTORM_LIMIT } from '@/lib/rate-limit'

const SYSTEM_PROMPT = `You are a college admissions counselor helping a student brainstorm essay ideas.

IMPORTANT RULES:
- Do NOT write the essay for the student
- Guide them toward authentic, personal stories
- Focus on growth, reflection, and self-awareness
- Each idea should be unique and distinct
- Keep hooks compelling but realistic

You MUST respond in valid JSON with this exact shape:
{
  "ideas": [
    {
      "title": "Short descriptive title",
      "hook": "A compelling opening sentence or two for the essay",
      "themes": ["Theme 1", "Theme 2", "Theme 3"],
      "outline": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
      "reflection": "What admissions officers should learn about the student from this essay"
    }
  ]
}

Generate exactly 3 essay ideas. Each idea should have:
- A unique angle on the student's background
- 2-4 themes
- A 4-step outline
- A clear reflection angle

Do NOT include any text outside the JSON object.`

export async function POST(req: NextRequest) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rl = checkRateLimit(`essay-brainstorm:${user.id}`, AI_ESSAY_BRAINSTORM_LIMIT)
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait a few minutes before generating again.', retryAfterMs: rl.retryAfterMs },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.retryAfterMs || 60000) / 1000)) } }
        )
    }

    let body: {
        major?: string
        activities?: string
        leadership?: string
        challenges?: string
        achievements?: string
        goals?: string
        values?: string
        essay_prompt: string
        save?: boolean
    }

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body.essay_prompt) {
        return NextResponse.json({ error: 'essay_prompt is required' }, { status: 400 })
    }

    // Build the user message
    const userMessage = [
        'Student information:',
        body.major ? `Major: ${body.major}` : null,
        body.activities ? `Activities: ${body.activities}` : null,
        body.leadership ? `Leadership: ${body.leadership}` : null,
        body.challenges ? `Challenges: ${body.challenges}` : null,
        body.achievements ? `Achievements: ${body.achievements}` : null,
        body.goals ? `Goals: ${body.goals}` : null,
        body.values ? `Values: ${body.values}` : null,
        '',
        `Essay prompt: ${body.essay_prompt}`,
        '',
        'Generate 3 unique essay story ideas based on this information. Focus on authenticity, growth, and reflection.',
    ]
        .filter(Boolean)
        .join('\n')

    const client = new Anthropic({ apiKey })

    try {
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
        })

        // Extract text content
        const text = response.content
            .filter(block => block.type === 'text')
            .map(block => {
                if (block.type === 'text') return block.text
                return ''
            })
            .join('')

        // Parse JSON
        let parsed: {
            ideas: Array<{
                title: string
                hook: string
                themes: string[]
                outline: string[]
                reflection: string
            }>
        }
        try {
            parsed = JSON.parse(text)
        } catch {
            // Try to extract JSON from markdown code block
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1].trim())
            } else {
                return NextResponse.json({
                    error: 'Failed to parse AI response',
                    raw: text,
                }, { status: 500 })
            }
        }

        // Save to database if requested
        if (body.save !== false) {
            const service = createServiceClient()
            await service.from('essay_sessions').insert({
                user_id: user.id,
                major: body.major ?? null,
                activities: body.activities ?? null,
                leadership: body.leadership ?? null,
                challenges: body.challenges ?? null,
                achievements: body.achievements ?? null,
                goals: body.goals ?? null,
                values: body.values ?? null,
                essay_prompt: body.essay_prompt,
                generated_output: parsed,
            })
        }

        return NextResponse.json(parsed)
    } catch (err) {
        console.error('Essay brainstorm error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'AI generation failed' },
            { status: 500 }
        )
    }
}
