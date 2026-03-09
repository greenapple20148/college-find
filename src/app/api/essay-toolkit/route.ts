import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getToolBySlug } from '@/lib/essay-tools'
import { checkRateLimit, AI_ESSAY_TOOLKIT_LIMIT } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rl = checkRateLimit(`essay-toolkit:${user.id}`, AI_ESSAY_TOOLKIT_LIMIT)
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait a few minutes before generating again.', retryAfterMs: rl.retryAfterMs },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.retryAfterMs || 60000) / 1000)) } }
        )
    }

    let body: { tool: string; inputs: Record<string, string> }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { tool: toolSlug, inputs } = body
    const toolConfig = getToolBySlug(toolSlug)

    if (!toolConfig) {
        return NextResponse.json({ error: `Unknown tool: ${toolSlug}` }, { status: 400 })
    }

    // Check required fields
    for (const field of toolConfig.fields) {
        if (field.required && !inputs[field.key]?.trim()) {
            return NextResponse.json({ error: `${field.label} is required` }, { status: 400 })
        }
    }

    // Build user message from inputs
    const inputLines = toolConfig.fields
        .filter(f => inputs[f.key]?.trim())
        .map(f => `${f.label}: ${inputs[f.key]}`)
        .join('\n')

    const userMessage = `Student information:\n${inputLines}\n\nPlease generate your analysis based on this information.`

    const client = new Anthropic({ apiKey })

    try {
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: toolConfig.systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
        })

        const text = response.content
            .filter(block => block.type === 'text')
            .map(block => (block.type === 'text' ? block.text : ''))
            .join('')

        // Parse JSON
        let parsed: Record<string, unknown>
        try {
            parsed = JSON.parse(text)
        } catch {
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1].trim())
            } else {
                // Try to find JSON object in text
                const braceMatch = text.match(/\{[\s\S]*\}/)
                if (braceMatch) {
                    parsed = JSON.parse(braceMatch[0])
                } else {
                    return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
                }
            }
        }

        // Save session
        const service = createServiceClient()
        await service.from('essay_toolkit_sessions').insert({
            user_id: user.id,
            tool_type: toolSlug,
            inputs_json: inputs,
            ai_output: parsed,
        })

        return NextResponse.json(parsed)
    } catch (err) {
        console.error('Essay toolkit error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'AI generation failed' },
            { status: 500 }
        )
    }
}
