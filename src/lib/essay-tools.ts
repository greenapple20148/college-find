/**
 * Essay Toolkit — Tool definitions, system prompts, and field configs
 *
 * Each tool config defines:
 *   - metadata (title, description, slug, icon)
 *   - input fields (label, hint, type, required)
 *   - system prompt for Claude
 *   - expected output shape description
 */

// ─── Shared field type ───────────────────────────────────────────────────────

export interface ToolField {
    key: string
    label: string
    hint?: string
    type: 'text' | 'textarea' | 'select'
    options?: { key: string; label: string }[]
    required?: boolean
}

export interface ToolConfig {
    slug: string
    title: string
    seoTitle: string
    description: string
    icon: string // emoji or key for SVG
    fields: ToolField[]
    systemPrompt: string
    faq: { q: string; a: string }[]
}

// ─── Shared prompt fragments ─────────────────────────────────────────────────

const JSON_RULE = '\n\nRESPOND ONLY WITH VALID JSON. No markdown, no explanation outside the JSON object.'

const AUTH_RULE =
    '\nDo NOT write the essay for the student. Guide them toward authentic, personal stories. Focus on growth, self-awareness, and reflection.'

// ─── Tool definitions ────────────────────────────────────────────────────────

export const ESSAY_TOOLS: ToolConfig[] = [
    /* ── 1. Essay Topic Generator ─────────────────────────────────────── */
    {
        slug: 'essay-topic-generator',
        title: 'Essay Topic Generator',
        seoTitle: 'College Essay Topic Generator | CollegeFind',
        description: 'Get 5 unique essay topic ideas based on your experiences.',
        icon: 'lightbulb',
        fields: [
            { key: 'activities', label: 'Activities & Hobbies', hint: 'Clubs, sports, creative pursuits', type: 'textarea', required: true },
            { key: 'achievements', label: 'Achievements', hint: 'Awards, honors, accomplishments', type: 'textarea' },
            { key: 'challenges', label: 'Challenges', hint: 'Obstacles you\'ve overcome', type: 'textarea' },
            { key: 'interests', label: 'Interests & Passions', hint: 'What excites you most', type: 'textarea' },
        ],
        systemPrompt: `You are a college admissions counselor helping a student find unique essay topics.${AUTH_RULE}

Generate exactly 5 unique essay topics. Respond with this JSON shape:
{
  "topics": [
    {
      "title": "Short title",
      "description": "1-2 sentence description of the topic",
      "themes": ["Theme1", "Theme2"],
      "why_compelling": "Why this would stand out to admissions officers"
    }
  ]
}${JSON_RULE}`,
        faq: [
            { q: 'How many topics will I get?', a: 'You\'ll receive 5 unique essay topic ideas, each with themes and an explanation of why it\'s compelling.' },
            { q: 'Can I use these exact topics?', a: 'These are starting points — personalize them with your own voice and specific details.' },
            { q: 'What makes a good essay topic?', a: 'Topics that show personal growth, unique perspective, and authentic reflection stand out most to admissions officers.' },
        ],
    },

    /* ── 2. Common App Prompt Brainstormer ────────────────────────────── */
    {
        slug: 'common-app-brainstorm',
        title: 'Common App Brainstormer',
        seoTitle: 'Common App Essay Brainstorm Tool | CollegeFind',
        description: 'Get story ideas tailored to your chosen Common App prompt.',
        icon: 'target',
        fields: [
            {
                key: 'prompt', label: 'Common App Prompt', type: 'select', required: true,
                options: [
                    { key: 'background', label: 'Background, identity, interest, or talent' },
                    { key: 'challenge', label: 'Lessons from an obstacle, setback, or failure' },
                    { key: 'belief', label: 'Questioned or challenged a belief or idea' },
                    { key: 'gratitude', label: 'Act of kindness or problem you solved' },
                    { key: 'growth', label: 'Personal growth or new understanding' },
                    { key: 'passion', label: 'Topic, idea, or concept that captivates you' },
                    { key: 'choice', label: 'Topic of your choice' },
                ],
            },
            { key: 'background', label: 'Your Background', hint: 'Relevant life experiences', type: 'textarea', required: true },
            { key: 'major', label: 'Intended Major', type: 'text' },
            { key: 'activities', label: 'Activities', hint: 'Clubs, sports, volunteering', type: 'textarea' },
        ],
        systemPrompt: `You are a college admissions counselor helping a student brainstorm for the Common App essay.${AUTH_RULE}

Generate 4 story ideas tailored to the student's chosen prompt. Respond with:
{
  "ideas": [
    {
      "title": "Story title",
      "story_angle": "How the student could approach this story",
      "reflection": "What admissions officers would learn about the student",
      "structure": ["Opening approach", "Middle development", "Closing reflection"],
      "themes": ["Theme1", "Theme2"]
    }
  ]
}${JSON_RULE}`,
        faq: [
            { q: 'Which Common App prompt should I choose?', a: 'Pick the prompt that lets you tell the most authentic and meaningful story. There\'s no "best" prompt.' },
            { q: 'Can I switch prompts later?', a: 'Yes! Try brainstorming with multiple prompts to see which produces the strongest ideas.' },
        ],
    },

    /* ── 3. Personal Story Finder ─────────────────────────────────────── */
    {
        slug: 'personal-story-finder',
        title: 'Personal Story Finder',
        seoTitle: 'Personal Story Finder for College Essays | CollegeFind',
        description: 'Discover hidden personal stories that make compelling essays.',
        icon: 'search',
        fields: [
            { key: 'experiences', label: 'Major Life Experiences', hint: 'Moving, travel, family events', type: 'textarea', required: true },
            { key: 'activities', label: 'Extracurricular Activities', type: 'textarea' },
            { key: 'leadership', label: 'Leadership Roles', type: 'textarea' },
            { key: 'challenges', label: 'Challenges Faced', type: 'textarea' },
            { key: 'accomplishments', label: 'Proudest Accomplishments', type: 'textarea' },
        ],
        systemPrompt: `You are a college admissions counselor helping a student uncover hidden personal stories for essays.${AUTH_RULE}

Dig beneath the surface to find unique, lesser-obvious stories. Respond with:
{
  "stories": [
    {
      "title": "Story title",
      "story_idea": "What the story is about",
      "emotional_arc": "The emotional journey: from X to Y",
      "themes": ["Theme1", "Theme2"],
      "potential_topic": "How this could become an essay topic",
      "why_unique": "What makes this story stand out"
    }
  ]
}

Generate 4 stories.${JSON_RULE}`,
        faq: [
            { q: 'I don\'t think I have interesting stories.', a: 'Everyone does! The best essays often come from small, everyday moments that reveal something meaningful about you.' },
            { q: 'How detailed should my input be?', a: 'The more details you share, the better the suggestions. Include specifics about moments, feelings, and outcomes.' },
        ],
    },

    /* ── 4. Essay Outline Builder ─────────────────────────────────────── */
    {
        slug: 'essay-outline-builder',
        title: 'Essay Outline Builder',
        seoTitle: 'College Essay Outline Builder | CollegeFind',
        description: 'Turn your essay idea into a structured outline.',
        icon: 'list',
        fields: [
            { key: 'essay_idea', label: 'Essay Idea or Topic', hint: 'Describe the story you want to tell', type: 'textarea', required: true },
            { key: 'prompt', label: 'Essay Prompt (optional)', hint: 'Common App or supplemental prompt', type: 'textarea' },
            { key: 'key_experiences', label: 'Key Experiences to Include', hint: 'Specific moments or events', type: 'textarea' },
        ],
        systemPrompt: `You are a college admissions counselor helping a student outline their essay.${AUTH_RULE}

Create a detailed essay outline. Respond with:
{
  "outline": {
    "hook": "A compelling opening sentence or moment",
    "hook_explanation": "Why this hook works",
    "sections": [
      {
        "title": "Section title",
        "purpose": "What this section accomplishes",
        "key_points": ["Point 1", "Point 2"],
        "transition": "How to move to the next section"
      }
    ],
    "conclusion_approach": "How to close the essay with impact",
    "word_count_guidance": "Suggested word allocation per section"
  }
}

Include 5-6 sections: Hook, Background, Challenge/Conflict, Turning Point, Reflection, Conclusion.${JSON_RULE}`,
        faq: [
            { q: 'How long should a Common App essay be?', a: 'The Common App essay has a 650-word limit. Aim for 550-650 words.' },
            { q: 'Can I change the outline later?', a: 'Absolutely! The outline is a starting framework that should evolve as you write.' },
        ],
    },

    /* ── 5. Essay Hook Generator ──────────────────────────────────────── */
    {
        slug: 'essay-hook-generator',
        title: 'Essay Hook Generator',
        seoTitle: 'College Essay Hook Generator | CollegeFind',
        description: 'Generate 5 compelling opening lines for your essay.',
        icon: 'sparkles',
        fields: [
            { key: 'topic', label: 'Essay Topic', hint: 'What your essay is about', type: 'textarea', required: true },
            { key: 'key_event', label: 'Key Event or Moment', hint: 'The central moment of your story', type: 'textarea' },
            { key: 'emotion', label: 'Core Emotion', hint: 'How you felt (nervous, excited, confused)', type: 'text' },
        ],
        systemPrompt: `You are a college admissions counselor helping craft compelling essay openings.${AUTH_RULE}

Generate 5 different hooks/opening lines. Vary the approach: action, dialogue, sensory detail, question, reflection. Respond with:
{
  "hooks": [
    {
      "text": "The actual opening line(s)",
      "type": "Type of hook (Action, Dialogue, Sensory, Question, Reflection)",
      "why_it_works": "Why this hook is effective",
      "storytelling_tip": "How to develop the narrative from this opening"
    }
  ]
}${JSON_RULE}`,
        faq: [
            { q: 'What makes a good essay hook?', a: 'A good hook drops the reader into a specific moment, creates curiosity, and reveals something about your character.' },
            { q: 'Should I use a question as my hook?', a: 'Questions can work, but starting with a vivid scene or action is often more effective.' },
        ],
    },

    /* ── 6. Essay Strength Analyzer ───────────────────────────────────── */
    {
        slug: 'essay-analyzer',
        title: 'Essay Strength Analyzer',
        seoTitle: 'College Essay Analyzer & Scorer | CollegeFind',
        description: 'Get your essay scored on originality, storytelling, reflection, clarity, and impact.',
        icon: 'chart',
        fields: [
            { key: 'essay_text', label: 'Paste Your Essay', hint: 'Paste your full essay text here', type: 'textarea', required: true },
        ],
        systemPrompt: `You are a college admissions reader evaluating a student's essay.

Score the essay on 5 dimensions (1-10 each). Be honest but encouraging. Respond with:
{
  "scores": {
    "originality": { "score": 7, "feedback": "Specific feedback" },
    "storytelling": { "score": 8, "feedback": "Specific feedback" },
    "reflection_depth": { "score": 6, "feedback": "Specific feedback" },
    "clarity": { "score": 9, "feedback": "Specific feedback" },
    "emotional_impact": { "score": 7, "feedback": "Specific feedback" }
  },
  "overall_score": 7.4,
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": [
    { "area": "Area to improve", "suggestion": "Specific actionable suggestion" }
  ],
  "summary": "One-paragraph overall assessment"
}${JSON_RULE}`,
        faq: [
            { q: 'Is my essay stored or shared?', a: 'Your essay is only used for analysis and saved to your account. It\'s never shared.' },
            { q: 'What\'s a good overall score?', a: 'Aim for 7+ on each dimension. A score of 8+ means your essay is in great shape.' },
        ],
    },

    /* ── 7. Supplemental Essay Helper ─────────────────────────────────── */
    {
        slug: 'supplemental-essay-helper',
        title: 'Supplemental Essay Helper',
        seoTitle: 'Supplemental Essay Helper | CollegeFind',
        description: 'Get ideas and outlines for "Why this college?" and other supplemental prompts.',
        icon: 'school',
        fields: [
            { key: 'college_name', label: 'College Name', type: 'text', required: true },
            {
                key: 'prompt_type', label: 'Prompt Type', type: 'select', required: true,
                options: [
                    { key: 'why_college', label: 'Why this college?' },
                    { key: 'why_major', label: 'Why this major?' },
                    { key: 'community', label: 'Community essay' },
                    { key: 'diversity', label: 'Diversity / perspective' },
                    { key: 'activity', label: 'Meaningful activity' },
                    { key: 'other', label: 'Other supplemental' },
                ],
            },
            { key: 'major', label: 'Intended Major', type: 'text' },
            { key: 'interests', label: 'Your Interests & Fit', hint: 'Why you\'re interested in this college', type: 'textarea' },
        ],
        systemPrompt: `You are a college admissions counselor helping with supplemental essays.${AUTH_RULE}

Help the student craft a personalized supplemental essay. Respond with:
{
  "ideas": [
    {
      "angle": "Approach for the essay",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "personalization_tip": "How to make this unique to the student"
    }
  ],
  "outline": ["Section 1", "Section 2", "Section 3", "Section 4"],
  "research_tips": ["Tip 1 for finding specific details about the college", "Tip 2"],
  "common_mistakes": ["Mistake to avoid 1", "Mistake to avoid 2"],
  "word_count_tip": "Recommended length and pacing"
}

Generate 3 idea angles.${JSON_RULE}`,
        faq: [
            { q: 'How do I make a "Why this college?" essay stand out?', a: 'Mention specific programs, professors, clubs, or traditions that connect to YOUR story. Avoid generic praise.' },
            { q: 'How long are supplemental essays?', a: 'Usually 150-400 words. Check each school\'s specific requirements.' },
        ],
    },

    /* ── 8. Essay Idea Scorer ─────────────────────────────────────────── */
    {
        slug: 'essay-idea-score',
        title: 'Essay Idea Scorer',
        seoTitle: 'Essay Idea Scorer — Rate Your Topic | CollegeFind',
        description: 'Score your essay idea on originality, depth, and uniqueness before you start writing.',
        icon: 'star',
        fields: [
            { key: 'essay_idea', label: 'Your Essay Idea', hint: 'Describe the idea or story you want to write about', type: 'textarea', required: true },
            { key: 'activities', label: 'Related Activities', hint: 'Activities connected to this idea', type: 'textarea' },
            { key: 'achievements', label: 'Related Achievements', type: 'textarea' },
        ],
        systemPrompt: `You are a college admissions expert evaluating the strength of an essay idea BEFORE the student writes it.

Score the idea honestly. Respond with:
{
  "scores": {
    "originality": { "score": 7, "explanation": "Why this score" },
    "personal_depth": { "score": 8, "explanation": "Why this score" },
    "uniqueness": { "score": 6, "explanation": "Why this score" }
  },
  "overall_score": 7,
  "verdict": "Strong / Promising / Needs Work",
  "strengths": ["What's good about this idea"],
  "tips_to_strengthen": [
    { "tip": "Specific actionable tip", "why": "Why this would help" }
  ],
  "alternative_angles": ["Angle 1 that could make this idea stronger", "Angle 2"]
}${JSON_RULE}`,
        faq: [
            { q: 'What score should I aim for?', a: 'A 7+ overall means the idea has strong potential. Below 5 means consider a different topic.' },
            { q: 'Can a low-scoring idea still work?', a: 'Yes, if you add more personal depth and a unique angle. Use the tips to strengthen it.' },
        ],
    },
]

export function getToolBySlug(slug: string): ToolConfig | undefined {
    return ESSAY_TOOLS.find(t => t.slug === slug)
}
