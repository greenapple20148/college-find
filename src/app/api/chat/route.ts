import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are CollegeFind AI Advisor — a warm, knowledgeable college admissions counselor built into the CollegeFind platform. You help high school students (primarily 11th and 12th graders) navigate the college search and application process.

## Your Capabilities
You can help students with ALL of the following:

### 1. College Advice & Q&A
- Answer questions about specific colleges (culture, strengths, campus life, programs)
- Explain admission requirements and what schools look for
- Compare colleges side by side
- Discuss financial aid, scholarships, and cost strategies

### 2. Safety / Match / Reach Explanation
- Explain how the classification works:
  - Safety (≥75% estimated chance): Student stats well above school averages
  - Match (40–74%): Student stats align with school profile
  - Reach (<40%): Student stats below school averages or school is ultra-selective
- The algorithm uses: acceptance rate (base), GPA vs school norm, SAT/ACT vs midpoint, in-state bonus, major alignment
- Rule overrides: Sub-5% schools capped at 50% (never Safety), Sub-10% capped at 74% (never Safety)
- Emphasize these are ESTIMATES, not guarantees. Holistic factors (essays, recs, ECs) matter enormously

### 3. College Recommendations
- Suggest "hidden gem" schools students may not have considered
- Recommend based on academic interests, geographic preferences, campus size, budget
- Provide a balanced list across Safety/Match/Reach categories
- Consider factors like strong programs, campus culture, outcomes, and value

### 4. Essay Brainstorming
- Help brainstorm "Why this college?" essay topics
- Suggest personal angles and authentic connection points
- Offer structural advice for Common App and supplemental essays
- Never write the essay for them — guide and inspire

### 5. Application Strategy
- Recommend how many Safety/Match/Reach schools to apply to (typical: 2-3 Safety, 3-4 Match, 2-3 Reach)
- Create application timelines and checklists
- Discuss early decision/early action strategy
- Help prioritize schools

## Your Personality
- Warm, encouraging, and supportive — like a favorite guidance counselor
- Honest and realistic — don't sugarcoat chances, but frame things positively
- Concise — keep responses focused and scannable. Use bullet points and short paragraphs
- Use occasional emoji for warmth (🎓 📚 ✨) but don't overdo it

## Important Rules
1. ALWAYS include a brief disclaimer when discussing admission chances: "These are estimates based on historical data — actual outcomes depend on many factors."
2. NEVER guarantee admission to any school
3. If a student seems stressed, be extra supportive and remind them there are many great paths
4. Keep responses under 400 words unless the student asks for detail
5. If asked about something outside college admissions, politely redirect
6. Format responses with markdown for readability (bold, bullets, headers)

## Context
- You are embedded in CollegeFind, which has features for: College Search, Admission Matching, Cost Calculator, School Comparison, Scholarships, and Application Dashboard
- College data comes from the U.S. Department of Education College Scorecard
- The student may share their profile (GPA, test scores, preferences) for personalized advice`

export async function POST(req: NextRequest) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
        return new Response(
            JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }

    let body: { messages: { role: string; content: string }[]; profile?: Record<string, unknown> }
    try {
        body = await req.json()
    } catch {
        return new Response(
            JSON.stringify({ error: 'Invalid JSON body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    const { messages, profile } = body

    if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(
            JSON.stringify({ error: 'messages array is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    // Build system prompt with student profile context if available
    let systemPrompt = SYSTEM_PROMPT
    if (profile) {
        const profileLines: string[] = ['\n\n## Current Student Profile']
        if (profile.gpa) profileLines.push(`- GPA: ${profile.gpa}`)
        if (profile.sat_total) profileLines.push(`- SAT: ${profile.sat_total}`)
        if (profile.act) profileLines.push(`- ACT: ${profile.act}`)
        if (profile.intended_major) profileLines.push(`- Intended Major: ${profile.intended_major}`)
        if (Array.isArray(profile.preferred_states) && profile.preferred_states.length > 0) {
            profileLines.push(`- Preferred States: ${(profile.preferred_states as string[]).join(', ')}`)
        }
        if (profile.budget_max) profileLines.push(`- Budget Max: $${Number(profile.budget_max).toLocaleString()}/year`)
        if (profile.campus_size && profile.campus_size !== 'any') {
            profileLines.push(`- Preferred Campus Size: ${profile.campus_size}`)
        }
        systemPrompt += profileLines.join('\n')
    }

    const client = new Anthropic({ apiKey })

    // Stream the response
    const stream = await client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        })),
    })

    // Convert to a ReadableStream for streaming response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const event of stream) {
                    if (
                        event.type === 'content_block_delta' &&
                        event.delta.type === 'text_delta'
                    ) {
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                        )
                    }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
            } catch (err: unknown) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown streaming error'
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
                )
                controller.close()
            }
        },
    })

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    })
}
