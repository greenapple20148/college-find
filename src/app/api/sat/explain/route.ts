import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { question_text, section, options, correct_answer, selected_answer, passage_text } = body

        if (!question_text || !correct_answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
        }

        const isAnthropic = !!process.env.ANTHROPIC_API_KEY
        const prompt = buildPrompt({ question_text, section, options, correct_answer, selected_answer, passage_text })

        let explanationText: string

        if (isAnthropic) {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY!,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 800,
                    messages: [{ role: 'user', content: prompt }],
                }),
            })
            const data = await res.json()
            explanationText = data?.content?.[0]?.text ?? 'Unable to generate explanation.'
        } else {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a friendly SAT tutor. Explain clearly and concisely.' },
                        { role: 'user', content: prompt },
                    ],
                    max_tokens: 800,
                    temperature: 0.3,
                }),
            })
            const data = await res.json()
            explanationText = data?.choices?.[0]?.message?.content ?? 'Unable to generate explanation.'
        }

        return NextResponse.json({ explanation: explanationText })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

function buildPrompt(params: {
    question_text: string
    section: string
    options: Record<string, string>
    correct_answer: string
    selected_answer: string
    passage_text?: string
}): string {
    const { question_text, section, options, correct_answer, selected_answer, passage_text } = params

    let prompt = `Explain this SAT ${section} question in simple, student-friendly language.\n\n`

    if (passage_text) {
        prompt += `**Passage:**\n${passage_text}\n\n`
    }

    prompt += `**Question:**\n${question_text}\n\n`
    prompt += `**Options:**\n`
    prompt += `A) ${options.A}\nB) ${options.B}\nC) ${options.C}\nD) ${options.D}\n\n`
    prompt += `**Correct Answer:** ${correct_answer}\n`
    prompt += `**Student's Answer:** ${selected_answer}\n\n`
    prompt += `Please provide:\n`
    prompt += `1. **Why the correct answer is right** — explain the concept being tested\n`
    prompt += `2. **Why the student's answer was wrong** — explain the specific mistake\n`
    prompt += `3. **Step-by-step reasoning** to solve this type of problem\n`
    prompt += `4. **Quick concept refresher** — the key rule or formula to remember\n`
    prompt += `5. **Test-taking tip** — a shortcut or strategy for similar questions\n\n`
    prompt += `Keep your explanation under 200 words. Use simple language suitable for a high school student.`

    return prompt
}
