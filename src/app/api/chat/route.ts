import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, AI_CHAT_LIMIT } from '@/lib/rate-limit'
import { gateAndRecord } from '@/lib/feature-gate'

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

    // Auth + feature gate — identify user by auth token or fall back to IP
    let rateLimitKey = `chat:${req.headers.get('x-forwarded-for') || 'unknown'}`
    let authUserId: string | null = null
    const authHeader = req.headers.get('authorization')
    if (authHeader && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
            const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
            const { data: { user: authUser } } = await sb.auth.getUser(authHeader.replace('Bearer ', ''))
            if (authUser) {
                rateLimitKey = `chat:${authUser.id}`
                authUserId = authUser.id
            }
        } catch { /* use IP-based key */ }
    }

    // Plan-based usage gate (daily/monthly limits)
    if (authUserId) {
        const access = await gateAndRecord(authUserId, 'ai_advisor')
        if (!access.allowed) {
            return new Response(
                JSON.stringify({
                    error: 'limit_reached',
                    message: access.message,
                    remaining: access.remaining,
                    upgrade_required: access.upgrade_required,
                }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
        }
    }

    // Burst rate limiting (in-memory, per-process)
    const rl = checkRateLimit(rateLimitKey, AI_CHAT_LIMIT)
    if (!rl.allowed) {
        return new Response(
            JSON.stringify({
                error: 'Rate limit exceeded. Please wait a few minutes before sending more messages.',
                retryAfterMs: rl.retryAfterMs,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(Math.ceil((rl.retryAfterMs || 60000) / 1000)),
                },
            }
        )
    }

    let body: {
        messages: { role: string; content: string }[]
        profile?: Record<string, unknown>
        recommendations?: { name: string; category: string; fit_score: number; admission_probability: number; tuition_estimate: number; reasons: string[] }[]
        saveSession?: boolean
        sessionId?: string
    }
    try {
        body = await req.json()
    } catch {
        return new Response(
            JSON.stringify({ error: 'Invalid JSON body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    const { messages, profile, recommendations, saveSession, sessionId } = body

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

    // Inject recommendation engine results if provided
    if (recommendations && recommendations.length > 0) {
        const recsLines: string[] = ['\n\n## Algorithm-Generated College Recommendations']
        recsLines.push('The following colleges were ranked by our scoring algorithm. Reference these when the student asks for recommendations:\n')
        for (const rec of recommendations) {
            recsLines.push(`### ${rec.name} (${rec.category})`)
            recsLines.push(`- Fit Score: ${rec.fit_score}/100`)
            recsLines.push(`- Admission Probability: ${Math.round(rec.admission_probability * 100)}%`)
            recsLines.push(`- Estimated Tuition: $${rec.tuition_estimate.toLocaleString()}/yr`)
            if (rec.reasons.length > 0) {
                recsLines.push(`- Why: ${rec.reasons.join('; ')}`)
            }
            recsLines.push('')
        }
        recsLines.push('Use these data points to explain WHY each college is a good fit. You may also suggest additional schools not in this list.')
        systemPrompt += recsLines.join('\n')
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

                // Save session to DB if requested
                if (saveSession && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
                    try {
                        const supabaseAdmin = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL,
                            process.env.SUPABASE_SERVICE_ROLE_KEY
                        )
                        // Extract user from auth header
                        const authHeader = req.headers.get('authorization')
                        if (authHeader) {
                            const supabaseUser = createClient(
                                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                            )
                            const { data: { user } } = await supabaseUser.auth.getUser(authHeader.replace('Bearer ', ''))
                            if (user) {
                                const title = messages[0]?.content.slice(0, 60) || 'Advisor Session'
                                const sessionData = {
                                    user_id: user.id,
                                    title,
                                    messages: JSON.stringify(messages),
                                    recommended_colleges_json: recommendations ? JSON.stringify(recommendations) : null,
                                    updated_at: new Date().toISOString(),
                                }
                                if (sessionId) {
                                    await supabaseAdmin.from('advisor_sessions').update(sessionData).eq('id', sessionId)
                                } else {
                                    await supabaseAdmin.from('advisor_sessions').insert(sessionData)
                                }
                            }
                        }
                    } catch { /* session save is best-effort */ }
                }

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
