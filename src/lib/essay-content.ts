/**
 * Essay SEO Content System — Page definitions for all 50 SEO pages
 *
 * Each page config drives the dynamic [slug] route through a shared template.
 * Add a new page = add one entry here. No new files needed.
 */

export interface ContentSection {
    heading: string
    body: string        // Supports markdown-like formatting in JSX
    list?: string[]     // optional bullet points
}

export interface FaqItem {
    question: string
    answer: string
}

export interface EssayPageConfig {
    slug: string
    group: 'ideas' | 'prompts' | 'guides' | 'examples' | 'supplemental'
    seoTitle: string
    metaDescription: string
    h1: string
    intro: string
    quickAnswer: string
    sections: ContentSection[]
    commonMistakes?: string[]
    faq: FaqItem[]
    primaryCta: { tool: string; label: string; text: string }
    secondaryCta?: { tool: string; label: string; text: string }
    relatedPages: string[]      // slugs
    targetKeyword: string
    secondaryKeywords: string[]
    searchIntent: string
}

// ─── Internal linking map helper ───────────────────────────────────────────

const HUB_SLUG = 'college-essays'

// ─── GROUP A: Essay Idea Pages ─────────────────────────────────────────────

const GROUP_A: EssayPageConfig[] = [
    {
        slug: 'college-essay-ideas',
        group: 'ideas',
        seoTitle: 'College Essay Ideas — 50+ Unique Topics for 2026 | CollegeFind',
        metaDescription: 'Discover 50+ unique college essay ideas that admissions officers love. Get brainstorming tips, theme suggestions, and AI-powered topic generation.',
        h1: '50+ College Essay Ideas That Actually Stand Out',
        intro: 'The hardest part of the college essay isn\'t the writing — it\'s figuring out what to write about. Here are proven essay ideas organized by theme, plus tips for making any topic uniquely yours.',
        quickAnswer: 'The best college essay topics come from specific, personal moments — not big achievements. Focus on a story that only you can tell, shows growth, and reveals something meaningful about your character.',
        sections: [
            {
                heading: 'Why Your Essay Topic Matters More Than You Think',
                body: 'Admissions officers read thousands of essays. The topic itself won\'t get you in — but a boring, generic topic can blend into the pile. A great topic gives you the best canvas to show who you really are.',
            },
            {
                heading: 'Essay Ideas About Personal Growth',
                body: 'Some of the strongest essays come from moments that changed how you see yourself or the world.',
                list: [
                    'A conversation that shifted your perspective on something important',
                    'Learning a skill that frustrated you before it clicked',
                    'The moment you realized your passion wasn\'t what you expected',
                    'An experience that made you question a childhood belief',
                    'How a small daily habit transformed your mindset',
                ],
            },
            {
                heading: 'Essay Ideas About Challenges & Failure',
                body: 'Admissions officers want to see resilience, not perfection. These topics let you show how you handle adversity.',
                list: [
                    'A project or competition where everything went wrong',
                    'Navigating a difficult family situation',
                    'Overcoming a fear that held you back',
                    'A time you had to rebuild something from scratch',
                    'Learning from being cut, rejected, or told "no"',
                ],
            },
            {
                heading: 'Essay Ideas About Identity & Background',
                body: 'These topics work well when you focus on a specific example rather than a broad overview.',
                list: [
                    'How a cultural tradition shaped your values',
                    'Navigating two (or more) identities',
                    'A language or food that connects you to your heritage',
                    'Growing up in a community that influenced your goals',
                    'The intersection of your identity and your intended major',
                ],
            },
            {
                heading: 'Essay Ideas About Passions & Interests',
                body: 'The best "passion" essays show depth, not just enthusiasm.',
                list: [
                    'How a hobby became a form of self-expression',
                    'Teaching yourself something outside of school',
                    'An obsession that led to an unexpected discovery',
                    'Connecting two seemingly unrelated interests',
                    'Why a "weird" interest matters more than you\'d think',
                ],
            },
            {
                heading: 'Essay Ideas About Leadership & Impact',
                body: 'Leadership essays are strongest when they focus on a specific moment, not a title.',
                list: [
                    'A time you led by listening instead of directing',
                    'Starting something new in your school or community',
                    'Motivating a team through a tough moment',
                    'Mentoring someone and learning from the experience',
                    'Making a decision that wasn\'t popular but was right',
                ],
            },
            {
                heading: 'How to Pick the Right Topic for You',
                body: 'Use the "only I could write this" test. If another student could swap their name onto your essay and it still works, the topic isn\'t personal enough. Look for moments where you felt something deeply — surprise, frustration, pride, confusion. That emotion is where your essay lives.',
            },
        ],
        commonMistakes: [
            'Writing about a topic because it sounds impressive, not because it\'s meaningful to you',
            'Choosing a topic that\'s too broad (e.g., "I love helping people")',
            'Focusing on the event instead of your internal reaction and growth',
            'Trying to cover your entire life instead of one specific moment',
            'Picking a topic just because your counselor suggested it',
        ],
        faq: [
            { question: 'What\'s the best college essay topic?', answer: 'There\'s no single "best" topic. The strongest essays come from specific personal moments that reveal growth, self-awareness, and authenticity. Pick a topic that only you could write about.' },
            { question: 'Should my essay be about an achievement?', answer: 'Not necessarily. Many successful essays focus on small moments, failures, or everyday experiences. Admissions officers care more about your reflection than your accomplishments.' },
            { question: 'Can I write about a common topic?', answer: 'Yes, if you bring a unique angle. "Sports taught me teamwork" is generic. "The exact moment I realized I was a better coach than player" is specific and memorable.' },
            { question: 'How personal should my essay be?', answer: 'Personal enough to be authentic, but you should feel comfortable with a stranger reading it. You don\'t need to share trauma — genuine reflection on any experience works.' },
        ],
        primaryCta: { tool: 'essay-topic-generator', label: 'Try the Essay Topic Generator', text: 'Tell us about your experiences and get 5 personalized essay topic ideas in seconds.' },
        secondaryCta: { tool: 'personal-story-finder', label: 'Find Your Hidden Story', text: 'Uncover unique personal stories you didn\'t know you had.' },
        relatedPages: ['common-app-essay-ideas', 'unique-college-essay-ideas', 'creative-college-essay-ideas', 'personal-statement-ideas', 'college-essay-examples', 'how-to-write-a-college-essay'],
        targetKeyword: 'college essay ideas',
        secondaryKeywords: ['college essay topics', 'college application essay ideas', 'essay ideas for college', 'unique college essay ideas'],
        searchIntent: 'informational — students looking for essay topic inspiration',
    },
    {
        slug: 'common-app-essay-ideas',
        group: 'ideas',
        seoTitle: 'Common App Essay Ideas — Prompts & Topic Inspiration | CollegeFind',
        metaDescription: 'Get Common App essay ideas for every prompt. Brainstorm authentic story angles with examples and AI-powered tools.',
        h1: 'Common App Essay Ideas for Every Prompt',
        intro: 'The Common App gives you seven prompts to choose from. Here are proven story ideas for each one, plus how to find the angle that makes your essay unforgettable.',
        quickAnswer: 'Pick the Common App prompt that lets you tell your most authentic story. The prompt matters less than the story you tell — every prompt can produce a great essay if you bring genuine reflection.',
        sections: [
            { heading: 'How to Choose the Right Prompt', body: 'Start with your story, not the prompt. Think about the moment or experience you want to share, then find the prompt that fits. If multiple prompts work, pick Prompt 7 (topic of choice).' },
            { heading: 'Ideas for Prompt 1: Background & Identity', body: 'Focus on a specific aspect of your identity rather than a broad overview.', list: ['A cultural tradition that shaped a value you hold', 'How being bilingual changed your perspective', 'The intersection of two parts of your identity'] },
            { heading: 'Ideas for Prompt 2: Challenge & Setback', body: 'Show resilience and growth, not just hardship.', list: ['Rebuilding after a project failed publicly', 'Navigating an academic struggle and what it taught you', 'Overcoming a fear that once seemed impossible'] },
            { heading: 'Ideas for Prompt 3: Questioning a Belief', body: 'Show intellectual curiosity and willingness to grow.', list: ['Changing your mind on a political or social issue', 'Questioning an assumption your community holds', 'A class or conversation that shifted your worldview'] },
            { heading: 'Ideas for Prompt 4: Gratitude & Kindness', body: 'Focus on how the experience changed you.', list: ['A stranger\'s kindness that changed your perspective', 'A problem you noticed and decided to solve', 'The ripple effect of a small act'] },
            { heading: 'Ideas for Prompt 5: Personal Growth', body: 'Focus on the "aha moment" when something clicked.', list: ['Realizing you were wrong about something important', 'Growing from a relationship that challenged you', 'A transition that forced you to adapt'] },
        ],
        commonMistakes: ['Trying to fit your story into a specific prompt instead of picking the prompt that fits your story', 'Writing about the prompt topic abstractly instead of through a specific experience', 'Choosing the most "impressive" prompt instead of the most authentic one'],
        faq: [
            { question: 'Does the prompt I choose matter?', answer: 'Not really. Admissions officers evaluate the quality of your essay, not which prompt you chose. Pick whatever prompt lets you tell your best story.' },
            { question: 'Can I use Prompt 7 for anything?', answer: 'Yes! Prompt 7 (topic of choice) is great when your story doesn\'t clearly fit another prompt. Many successful essays use this option.' },
        ],
        primaryCta: { tool: 'common-app-brainstorm', label: 'Brainstorm Your Common App Essay', text: 'Select your prompt and get 4 personalized story ideas with outlines.' },
        relatedPages: ['college-essay-ideas', 'common-app-prompt-1-essay-examples', 'common-app-essay-examples', 'how-to-write-common-app-essay', 'personal-statement-ideas'],
        targetKeyword: 'common app essay ideas',
        secondaryKeywords: ['common app essay topics', 'common app prompt ideas', 'common application essay ideas'],
        searchIntent: 'informational — students brainstorming common app essays',
    },
    {
        slug: 'unique-college-essay-ideas',
        group: 'ideas',
        seoTitle: 'Unique College Essay Ideas — Stand Out Topics | CollegeFind',
        metaDescription: 'Get unique college essay ideas that go beyond the typical sports and volunteer stories. Find topics that only you can write.',
        h1: 'Unique College Essay Ideas That Go Beyond the Obvious',
        intro: 'Skip the generic sports metaphor. These essay ideas push you to find the unexpected, specific, and personal angle that makes admissions officers actually remember your application.',
        quickAnswer: 'Unique doesn\'t mean bizarre. The most memorable essays take ordinary experiences and reveal extraordinary insight. Focus on specificity — the more specific your story, the more universal it feels.',
        sections: [
            { heading: 'Why "Unique" Doesn\'t Mean "Unusual"', body: 'You don\'t need a dramatic life event to write a unique essay. The uniqueness comes from your specific perspective, voice, and reflection. A essay about making sandwiches can outperform one about winning a national competition if the reflection is deeper.' },
            { heading: 'Unique Essay Ideas From Everyday Life', body: 'The best "unique" topics hide in your daily routine.', list: ['The ritual you do before a big day and why it matters', 'A conversation you replayed in your head for weeks', 'An object you\'d save from a fire (and what it represents)', 'The playlist you made for a specific purpose', 'A skill your family passed down that no one else has'] },
            { heading: 'Unique Cross-Interest Topics', body: 'Combining two unrelated interests creates automatically unique angles.', list: ['How cooking taught you about chemistry (or vice versa)', 'What video games taught you about leadership', 'The connection between your art practice and your math brain', 'How your part-time job relates to your dream career'] },
        ],
        commonMistakes: ['Trying too hard to be different and losing authenticity', 'Focusing on the uniqueness of the topic instead of the depth of your reflection'],
        faq: [
            { question: 'What if my life feels too "normal" for a unique essay?', answer: 'Perfect. Some of the best essays come from completely ordinary experiences examined with extraordinary depth. Focus on what makes YOUR perspective on a common experience different.' },
        ],
        primaryCta: { tool: 'essay-topic-generator', label: 'Generate Unique Topics', text: 'Our AI analyzes your specific background to surface essay ideas no one else would have.' },
        secondaryCta: { tool: 'personal-story-finder', label: 'Find Hidden Stories', text: 'Discover unique personal stories buried in your everyday experiences.' },
        relatedPages: ['college-essay-ideas', 'creative-college-essay-ideas', 'college-essay-topic-examples', 'personal-statement-ideas'],
        targetKeyword: 'unique college essay ideas',
        secondaryKeywords: ['unique essay topics for college', 'original college essay ideas', 'different college essay topics'],
        searchIntent: 'informational — students wanting to stand out',
    },
    {
        slug: 'creative-college-essay-ideas',
        group: 'ideas',
        seoTitle: 'Creative College Essay Ideas — Imaginative Topics | CollegeFind',
        metaDescription: 'Find creative college essay ideas with unexpected angles, imaginative structures, and compelling storytelling approaches.',
        h1: 'Creative College Essay Ideas & Unconventional Approaches',
        intro: 'Ready to break the mold? These creative essay ideas use unconventional structures, unexpected angles, and imaginative storytelling to capture attention from the first line.',
        quickAnswer: 'Creative essays stand out through their structure and voice, not just their topic. Consider starting in the middle of the action, using dialogue, or framing your story through an unexpected metaphor.',
        sections: [
            { heading: 'Creative Structural Approaches', body: 'Sometimes the format is the creativity.', list: ['Essay structured as a recipe, blueprint, or instruction manual', 'Starting at the end and working backward', 'Parallel storylines that converge', 'A letter to your past or future self', 'An essay built around a single object or place'] },
            { heading: 'Creative Topic Angles', body: 'Take a common experience and flip the perspective.', list: ['Write about a failure as if it were your greatest achievement', 'Describe your growth through the evolution of your bedroom', 'Tell a story from the perspective of someone who watched you change', 'Frame your journey through meals you remember'] },
        ],
        commonMistakes: ['Prioritizing cleverness over substance', 'Using a creative format that distracts from your actual message'],
        faq: [
            { question: 'Is a creative format risky?', answer: 'Slightly, but calculated risk can pay off. The key is making sure the creative choice enhances your story rather than overshadowing it. If the format feels gimmicky, simplify it.' },
        ],
        primaryCta: { tool: 'essay-hook-generator', label: 'Generate Creative Hooks', text: 'Get 5 creative opening lines tailored to your essay topic.' },
        relatedPages: ['unique-college-essay-ideas', 'college-essay-ideas', 'college-essay-topic-examples', 'how-to-start-a-college-essay'],
        targetKeyword: 'creative college essay ideas',
        secondaryKeywords: ['imaginative essay topics', 'unconventional college essays', 'creative admission essay ideas'],
        searchIntent: 'informational — students seeking creative approaches',
    },
    {
        slug: 'college-essay-topic-examples',
        group: 'ideas',
        seoTitle: 'College Essay Topic Examples — Real Topics That Worked | CollegeFind',
        metaDescription: 'See real college essay topic examples that got students accepted. Learn what made these topics work and how to find your own.',
        h1: 'College Essay Topic Examples — What Actually Worked',
        intro: 'Curious what real students wrote about? Here are topic examples that earned acceptances, organized by theme, with analysis of why each topic worked.',
        quickAnswer: 'Successful essay topics share three qualities: they\'re specific, personal, and reflective. It\'s not about the topic being impressive — it\'s about the depth of your self-awareness.',
        sections: [
            { heading: 'Topics That Worked: Personal Growth', body: 'These topics succeeded because the students showed genuine transformation.', list: ['"How learning to cook for my family changed my relationship with responsibility"', '"The summer I stopped trying to be perfect and started being honest"', '"Why losing student council president was the best thing that happened to me"'] },
            { heading: 'Topics That Worked: Unique Perspectives', body: 'These students found the unexpected angle.', list: ['"What my part-time job as a grocery bagger taught me about empathy"', '"The Rubik\'s cube I carry everywhere and what it represents"', '"Why I argue with my grandfather every Sunday (and love it)"'] },
        ],
        commonMistakes: ['Copying a topic that worked for someone else — it won\'t feel authentic', 'Focusing on the topic and ignoring what made the execution great'],
        faq: [
            { question: 'Can I write about the same topic as someone else?', answer: 'Yes, if you bring a genuinely different perspective and personal experience. Two students can write about sports and produce completely different essays.' },
        ],
        primaryCta: { tool: 'essay-topic-generator', label: 'Find Your Topic', text: 'Get personalized topic suggestions based on YOUR experiences.' },
        relatedPages: ['college-essay-ideas', 'college-essay-examples', 'common-app-essay-examples', 'personal-statement-examples'],
        targetKeyword: 'college essay topic examples',
        secondaryKeywords: ['college essay topics that worked', 'real college essay topics', 'successful college essay topics'],
        searchIntent: 'informational — students looking for proven topic examples',
    },
    {
        slug: 'personal-statement-ideas',
        group: 'ideas',
        seoTitle: 'Personal Statement Ideas — Topics & Brainstorming Tips | CollegeFind',
        metaDescription: 'Get personal statement ideas for college applications. Find your authentic story with brainstorming prompts and AI-powered tools.',
        h1: 'Personal Statement Ideas & Brainstorming Strategies',
        intro: 'Your personal statement is your chance to show who you are beyond grades and test scores. Here are strategies for finding the right story, plus topic ideas organized by theme.',
        quickAnswer: 'The best personal statement ideas come from self-reflection, not searching the internet. Start by listing 10 moments that changed you, then pick the one where you learned the most about yourself.',
        sections: [
            { heading: 'The 10-Moment Exercise', body: 'Write down 10 moments from the last 3 years that changed how you saw yourself, others, or the world. Don\'t filter — include small moments. Circle the one that surprises you most. That\'s likely your essay.' },
            { heading: 'Ideas by Category', body: 'If you\'re stuck, these categories can spark ideas.', list: ['A time you were wrong and it mattered', 'Something you built or created from nothing', 'A relationship that challenged your assumptions', 'A moment when you chose the harder path', 'How your definition of success evolved'] },
        ],
        faq: [
            { question: 'Is a personal statement the same as a Common App essay?', answer: 'Essentially, yes. The Common App essay is the most common form of personal statement for U.S. college applications. The same writing principles apply to both.' },
        ],
        primaryCta: { tool: 'personal-story-finder', label: 'Find Your Story', text: 'Our AI helps uncover personal stories hiding in your experiences.' },
        relatedPages: ['college-essay-ideas', 'personal-statement-examples', 'how-to-write-personal-statement', 'common-app-essay-ideas'],
        targetKeyword: 'personal statement ideas',
        secondaryKeywords: ['personal statement topics', 'college personal statement ideas', 'personal essay ideas'],
        searchIntent: 'informational — students brainstorming personal statements',
    },
    {
        slug: 'college-essay-story-ideas',
        group: 'ideas',
        seoTitle: 'College Essay Story Ideas — Find Your Narrative | CollegeFind',
        metaDescription: 'Find compelling story ideas for your college essay. Learn how to turn personal experiences into powerful narratives.',
        h1: 'College Essay Story Ideas — Turning Experience Into Narrative',
        intro: 'Every great college essay is built on a story. Here\'s how to find yours and shape it into a compelling narrative.',
        quickAnswer: 'Look for stories with a clear arc: a situation, a turning point, and a reflection. The best stories are small and specific — not your whole life, just one revealing moment.',
        sections: [
            { heading: 'What Makes a Good Essay Story', body: 'A good essay story has: a specific moment in time, an emotional stake, a turning point or realization, and a clear reflection. It doesn\'t need to be dramatic — it needs to be real.' },
            { heading: 'Story Starters', body: 'Complete these prompts to find stories hiding in your memory.', list: ['I never expected to learn something important from...', 'The moment I realized I was wrong about...', 'The hardest decision I made was when...', 'I surprised myself when I...', 'No one knows this about me, but...'] },
        ],
        faq: [{ question: 'How long should my essay story be?', answer: 'Your story should be specific enough to fit within 650 words with room for reflection. Focus on one moment or short sequence of events, not a long timeline.' }],
        primaryCta: { tool: 'personal-story-finder', label: 'Find Stories in Your Life', text: 'Tell us about your experiences and we\'ll surface hidden story ideas.' },
        relatedPages: ['college-essay-ideas', 'personal-statement-ideas', 'how-to-write-a-college-essay', 'essay-hook-generator'],
        targetKeyword: 'college essay story ideas',
        secondaryKeywords: ['essay story ideas', 'narrative essay ideas', 'personal story ideas for college'],
        searchIntent: 'informational — students looking for narrative angles',
    },
    {
        slug: 'college-essay-about-failure',
        group: 'ideas',
        seoTitle: 'College Essay About Failure — How to Write It Well | CollegeFind',
        metaDescription: 'Learn how to write a college essay about failure that shows resilience, growth, and self-awareness. Includes examples and common mistakes.',
        h1: 'How to Write a College Essay About Failure',
        intro: 'Failure essays are some of the most powerful in college admissions — when done right. Here\'s how to turn your setback into a standout essay.',
        quickAnswer: 'The essay isn\'t about the failure — it\'s about what you did after. Spend 30% on what happened and 70% on your response, growth, and what you learned about yourself.',
        sections: [
            { heading: 'Why Failure Essays Work', body: 'Admissions officers know success often comes easily to strong applicants. What they can\'t know is how you handle adversity. A well-written failure essay answers that question.' },
            { heading: 'The Right Structure', body: 'Use this framework for a failure essay.', list: ['Set the scene briefly (what you were trying to do)', 'The moment of failure (be honest, not dramatic)', 'Your immediate reaction (be vulnerable)', 'What you did next (the recovery)', 'What you learned (the reflection — this is the core)'] },
        ],
        commonMistakes: ['Choosing a failure that isn\'t really a failure ("I got a B+ instead of an A")', 'Spending too much time on the failure and not enough on the growth', 'Making it sound like the failure was actually good all along — be honest about the difficulty'],
        faq: [{ question: 'Is it risky to write about failure?', answer: 'Not if you show genuine growth. Admissions officers appreciate vulnerability and self-awareness. The risk is writing about failure without meaningful reflection.' }],
        primaryCta: { tool: 'common-app-brainstorm', label: 'Brainstorm Failure Stories', text: 'Select Prompt 2 and get story ideas tailored to overcoming challenges.' },
        relatedPages: ['college-essay-about-challenge', 'college-essay-ideas', 'common-app-prompt-2-essay-examples', 'how-to-write-about-failure-essay'],
        targetKeyword: 'college essay about failure',
        secondaryKeywords: ['failure essay college', 'how to write about failure', 'college essay setback'],
        searchIntent: 'informational — students writing about failure',
    },
    {
        slug: 'college-essay-about-challenge',
        group: 'ideas',
        seoTitle: 'College Essay About a Challenge — Writing Guide | CollegeFind',
        metaDescription: 'Write a compelling college essay about a challenge or obstacle. Get tips, examples, and AI brainstorming tools.',
        h1: 'Writing a College Essay About a Challenge or Obstacle',
        intro: 'Challenge essays let you show resilience and growth. Here\'s how to choose the right challenge and write about it with depth.',
        quickAnswer: 'Pick a challenge where you took action, not just endured. The best challenge essays show agency — what YOU did in response to difficulty, and how it changed you.',
        sections: [
            { heading: 'Picking the Right Challenge', body: 'Not every challenge makes a great essay. Choose one where you were actively involved in overcoming it, learned something specific, and can reflect on the experience with maturity.' },
            { heading: 'Challenge vs. Hardship', body: 'There\'s a difference between describing your hardship and analyzing your growth. The essay should focus 70% on your response and reflection, 30% on the challenge itself.' },
        ],
        faq: [{ question: 'Can I write about mental health challenges?', answer: 'Yes, if you focus on your growth and agency. Be specific, show what you learned, and demonstrate resilience. Avoid making the essay a clinical description.' }],
        primaryCta: { tool: 'common-app-brainstorm', label: 'Brainstorm Challenge Stories', text: 'Get personalized story ideas for challenge-themed essays.' },
        relatedPages: ['college-essay-about-failure', 'challenge-essay-examples', 'common-app-prompt-2-essay-examples', 'college-essay-ideas'],
        targetKeyword: 'college essay about challenge',
        secondaryKeywords: ['obstacle essay college', 'overcoming challenges essay', 'adversity college essay'],
        searchIntent: 'informational — students writing about challenges',
    },
    {
        slug: 'college-essay-about-leadership',
        group: 'ideas',
        seoTitle: 'College Essay About Leadership — Writing Tips | CollegeFind',
        metaDescription: 'Write a standout leadership essay for college applications. Focus on moments, not titles. Get tips and brainstorming tools.',
        h1: 'How to Write a College Essay About Leadership',
        intro: 'Leadership essays are one of the most common — and most commonly generic. Here\'s how to write one that actually stands out.',
        quickAnswer: 'Forget your title. The best leadership essays focus on a single moment where you influenced, inspired, or guided others. Show leadership through action, not through listing positions.',
        sections: [
            { heading: 'Leadership Is Action, Not a Title', body: 'Being president of a club isn\'t leadership. Making a difficult decision, taking responsibility for a failure, or helping someone else shine — that\'s leadership in action.' },
            { heading: 'Strong Leadership Essay Angles', body: 'Consider these approaches.', list: ['A time you led by example, not authority', 'When you had to make an unpopular decision', 'Leading through a crisis or unexpected challenge', 'Mentoring someone younger and what you learned', 'Building consensus among people who disagreed'] },
        ],
        faq: [{ question: 'Can I write about leadership if I wasn\'t a club president?', answer: 'Absolutely. Some of the best leadership essays come from informal leadership — stepping up during a group project, coaching peers, or taking initiative without being asked.' }],
        primaryCta: { tool: 'essay-topic-generator', label: 'Generate Leadership Topics', text: 'Get personalized leadership essay ideas based on your experiences.' },
        relatedPages: ['leadership-essay-examples', 'college-essay-ideas', 'how-to-write-about-leadership-essay', 'extracurricular-essay'],
        targetKeyword: 'college essay about leadership',
        secondaryKeywords: ['leadership essay college', 'leadership personal statement', 'leadership essay ideas'],
        searchIntent: 'informational — students writing leadership essays',
    },
]

// ─── GROUP B: Common App Prompt Pages ──────────────────────────────────────

function makePromptPage(num: number, promptText: string, ideas: string[], tips: string[]): EssayPageConfig {
    return {
        slug: `common-app-prompt-${num}-essay-examples`,
        group: 'prompts',
        seoTitle: `Common App Prompt ${num} Essay Examples & Ideas | CollegeFind`,
        metaDescription: `Get essay examples and story ideas for Common App Prompt ${num}: "${promptText.slice(0, 80)}..." Tips, outlines, and AI brainstorming.`,
        h1: `Common App Prompt ${num} — Essay Examples & Ideas`,
        intro: `Prompt ${num}: "${promptText}" — Here\'s how to approach this prompt with authenticity and depth.`,
        quickAnswer: `The key to Prompt ${num} is specificity. Don't try to cover everything — pick one moment, one story, one specific example that illustrates your answer.`,
        sections: [
            { heading: 'Understanding This Prompt', body: `"${promptText}" — This prompt is asking you to show ${num <= 3 ? 'self-awareness and reflection' : 'growth and meaning'} through a specific experience. The best responses tell a story, not make an argument.` },
            { heading: 'Story Ideas for This Prompt', body: 'Consider these angles.', list: ideas },
            { heading: 'Writing Tips for This Prompt', body: 'Make your essay stand out with these strategies.', list: tips },
        ],
        commonMistakes: ['Being too abstract instead of telling a specific story', 'Trying to answer the prompt directly instead of showing through narrative', 'Choosing a story that fits the prompt but doesn\'t reveal who you are'],
        faq: [
            { question: `Is Prompt ${num} a good choice?`, answer: 'Any prompt can produce a great essay. Choose this one if you have a genuine story that fits naturally.' },
            { question: 'How should I structure my response?', answer: 'Start in the middle of the action, provide brief context, show the key moment, then reflect on its meaning. Aim for 550-650 words.' },
        ],
        primaryCta: { tool: 'common-app-brainstorm', label: `Brainstorm Prompt ${num} Ideas`, text: `Select Prompt ${num} and get personalized story suggestions with outlines.` },
        secondaryCta: { tool: 'essay-outline-builder', label: 'Build Your Outline', text: 'Turn your idea into a structured essay outline.' },
        relatedPages: ['common-app-essay-ideas', 'common-app-essay-examples', 'how-to-write-common-app-essay', 'college-essay-ideas'],
        targetKeyword: `common app prompt ${num} essay examples`,
        secondaryKeywords: [`common app prompt ${num}`, `common app essay prompt ${num}`, `common app prompt ${num} ideas`],
        searchIntent: `informational — students writing for Common App Prompt ${num}`,
    }
}

const GROUP_B: EssayPageConfig[] = [
    makePromptPage(1, 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it.',
        ['How being the only ___ in your school shaped you', 'A cultural practice or family tradition that defines you', 'An interest that became your identity'],
        ['Ground the essay in a specific scene or moment', 'Show how this part of your identity has evolved', 'Avoid making it a diversity checklist — go deep on one thing']),
    makePromptPage(2, 'The lessons we take from obstacles we encounter can be fundamental to later success.',
        ['A time you failed publicly and rebuilt', 'Navigating a family hardship with resilience', 'An academic struggle that changed your study approach'],
        ['Spend more time on the lesson than the obstacle', 'Be specific about what changed in you', 'Show, don\'t tell — use scenes and dialogue']),
    makePromptPage(3, 'Reflect on a time when you questioned or challenged a belief or idea.',
        ['Changing your mind on a social issue after a real experience', 'Questioning a family or community expectation', 'An intellectual "aha" moment in a class'],
        ['Show genuine intellectual curiosity', 'Acknowledge the complexity — avoid simple "I used to think X, now I think Y"', 'Demonstrate empathy for the opposing view']),
    makePromptPage(4, 'Reflect on something that someone has done for you that has made you happy or thankful in a surprising way.',
        ['A stranger\'s kindness that changed your perspective', 'A mentor who saw potential you didn\'t see', 'A problem in your community that you were moved to solve'],
        ['Focus on how the experience transformed you', 'Be specific about the surprise element', 'Connect gratitude to action']),
    makePromptPage(5, 'Discuss an accomplishment, event, or realization that sparked a period of personal growth.',
        ['A realization that shifted your priorities', 'Achieving something that mattered more than the result', 'A transition that forced rapid personal growth'],
        ['Define what "personal growth" means specifically for you', 'Show the before and after clearly', 'Include a moment of genuine vulnerability']),
    makePromptPage(6, 'Describe a topic, idea, or concept you find so engaging that it makes you lose track of time.',
        ['An intellectual obsession that connects to unexpected areas', 'How a hobby became a lens for understanding the world', 'A question you can\'t stop thinking about'],
        ['Show depth of engagement, not surface enthusiasm', 'Connect the passion to who you are as a thinker', 'Include specific examples of how deep you\'ve gone']),
    makePromptPage(7, 'Share an essay on any topic of your choice.',
        ['A topic that doesn\'t fit neatly into prompts 1-6', 'A creative or unconventional essay format', 'A story that\'s uniquely yours and doesn\'t need a prompt'],
        ['This prompt gives maximum freedom — don\'t waste it on something generic', 'Use this if your best story transcends the other prompts', 'Still follow good essay principles: specificity, reflection, authenticity']),
]

// ─── GROUP C: Essay Writing Guides ─────────────────────────────────────────

const GROUP_C: EssayPageConfig[] = [
    {
        slug: 'how-to-write-a-college-essay',
        group: 'guides',
        seoTitle: 'How to Write a College Essay — Step-by-Step Guide | CollegeFind',
        metaDescription: 'Learn how to write a college essay step by step. From brainstorming to final draft, get practical tips that admissions counselors recommend.',
        h1: 'How to Write a College Essay — The Complete Guide',
        intro: 'Writing a college essay doesn\'t have to feel impossible. This step-by-step guide walks you through the entire process, from finding your topic to polishing your final draft.',
        quickAnswer: 'Start with a specific personal story, write a messy first draft without editing, then revise for clarity and reflection. The best essays are authentic, specific, and show growth.',
        sections: [
            { heading: 'Step 1: Brainstorm (Don\'t Skip This)', body: 'Spend at least 30 minutes brainstorming before you write a single word. List 10 moments that changed you. The right topic usually isn\'t the first one you think of.' },
            { heading: 'Step 2: Pick Your Story', body: 'Choose the moment from your brainstorm that passes the "only I could write this" test. If another student could claim the same story, dig deeper.' },
            { heading: 'Step 3: Write a Bad First Draft', body: 'Give yourself permission to write badly. Get the story down without worrying about word count, grammar, or structure. You can fix everything later — you can\'t edit a blank page.' },
            { heading: 'Step 4: Find the "So What?"', body: 'After your first draft, ask: "So what? Why does this matter? What did I learn?" Your answer is the heart of your essay. If you can\'t find it, you may need a different topic.' },
            { heading: 'Step 5: Revise for Structure', body: 'Reorganize so the essay opens with action or a vivid moment, builds through the experience, and closes with genuine reflection. Cut anything that doesn\'t serve the story.' },
            { heading: 'Step 6: Polish and Proofread', body: 'Read your essay aloud. If something sounds forced, rewrite it. Check for spelling, grammar, and word count (keep it under 650). Get feedback from someone who knows you well.' },
        ],
        commonMistakes: ['Starting with "Ever since I was young..." or a dictionary definition', 'Writing a resume in paragraph form', 'Being too vague or too abstract', 'Not including your own voice and personality', 'Trying to sound like someone you\'re not'],
        faq: [
            { question: 'How long should a college essay be?', answer: 'The Common App essay should be 250-650 words. Aim for 550-650. Short essays feel rushed; going over the limit isn\'t possible on the Common App.' },
            { question: 'Should someone edit my essay?', answer: 'Yes — but the voice should remain yours. Get feedback on clarity and structure, but don\'t let someone else rewrite your sentences.' },
            { question: 'When should I start writing?', answer: 'Ideally, start brainstorming the summer before senior year. Give yourself at least 6 weeks from first draft to final version.' },
        ],
        primaryCta: { tool: 'essay-topic-generator', label: 'Start Brainstorming', text: 'Not sure what to write about? Get 5 personalized topic ideas in seconds.' },
        secondaryCta: { tool: 'essay-outline-builder', label: 'Build Your Outline', text: 'Already have a topic? Turn it into a structured essay outline.' },
        relatedPages: ['college-essay-ideas', 'how-to-start-a-college-essay', 'how-to-end-a-college-essay', 'college-essay-examples', 'how-to-write-common-app-essay', 'how-to-format-college-essay'],
        targetKeyword: 'how to write a college essay',
        secondaryKeywords: ['college essay writing guide', 'college essay tips', 'how to write college application essay'],
        searchIntent: 'informational — students seeking a comprehensive writing guide',
    },
    {
        slug: 'how-to-start-a-college-essay',
        group: 'guides',
        seoTitle: 'How to Start a College Essay — Opening Lines & Hooks | CollegeFind',
        metaDescription: 'Learn how to start a college essay with a compelling hook. Get opening line examples, techniques, and an AI hook generator.',
        h1: 'How to Start a College Essay — Hooks That Work',
        intro: 'The opening of your college essay determines whether the reader leans in or zones out. Here\'s how to write a first line that demands attention.',
        quickAnswer: 'Start in the middle of the action. Drop the reader into a specific moment — a scene, a conversation, or a sensory detail. Skip the setup and let the context emerge naturally.',
        sections: [
            { heading: '5 Types of Hooks That Work', body: 'Each approach creates a different effect.', list: ['Action: Start in the middle of a moment ("My hands shook as I...")', 'Dialogue: Open with a line someone said that changed things', 'Sensory detail: Engage a sense other than sight ("The smell of...")', 'Surprising statement: Challenge an assumption ("I hate volunteering.")', 'Question: Ask something provocative (use sparingly)'] },
            {
                heading: 'Opening Lines That Actually Worked', body: 'These real openings succeeded because they create instant curiosity.',
                list: ['"The robot\'s arm snapped off three hours before the competition."', '"My grandmother doesn\'t speak English, but she taught me everything about communication."', '"I didn\'t want to go to band practice. That was the first honest thought I\'d had in months."']
            },
            { heading: 'What NOT to Start With', body: 'These openings are overused and signal a generic essay.', list: ['Dictionary definitions ("Webster\'s defines leadership as...")', 'Broad statements ("In today\'s society...")', 'Chronological beginnings ("I was born in...")', 'Clichés ("It was the best of times...")', 'Questions you immediately answer'] },
            { heading: 'The "Start in the Middle" Technique', body: 'Pick the most important scene in your essay. Start there. Then weave in the context the reader needs as the story develops. This creates immediate tension and momentum.' },
        ],
        commonMistakes: ['Writing the introduction first (write the body, then craft the hook)', 'Making the hook too clever at the expense of authenticity', 'Starting with context instead of action'],
        faq: [
            { question: 'Should I write the introduction first?', answer: 'No! Write the body of your essay first, then craft the opening. Once you know what the essay is about, you\'ll know exactly how to hook the reader.' },
            { question: 'How long should the hook be?', answer: '1-3 sentences. Get in, create curiosity, then transition into the story. A long introduction loses momentum.' },
        ],
        primaryCta: { tool: 'essay-hook-generator', label: 'Generate Essay Hooks', text: 'Enter your essay topic and get 5 different opening lines — action, dialogue, sensory, and more.' },
        secondaryCta: { tool: 'essay-outline-builder', label: 'Structure Your Essay', text: 'Build a complete outline starting from your hook.' },
        relatedPages: ['how-to-write-a-college-essay', 'how-to-end-a-college-essay', 'college-essay-examples', 'essay-hook-generator', 'creative-college-essay-ideas'],
        targetKeyword: 'how to start a college essay',
        secondaryKeywords: ['college essay hook', 'opening line college essay', 'college essay introduction', 'how to begin a college essay'],
        searchIntent: 'informational — students struggling with their opening',
    },
    ...['how-to-end-a-college-essay', 'how-to-format-college-essay', 'how-long-should-college-essay-be', 'how-to-write-personal-statement', 'how-to-write-common-app-essay', 'how-to-write-why-this-college-essay', 'how-to-write-about-failure-essay', 'how-to-write-about-leadership-essay'].map(slug => ({
        slug,
        group: 'guides' as const,
        seoTitle: `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | CollegeFind`,
        metaDescription: `Expert guide: ${slug.replace(/-/g, ' ')}. Practical tips, examples, and AI tools.`,
        h1: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        intro: `Everything you need to know about ${slug.replace(/-/g, ' ').replace('how to ', '')}.`,
        quickAnswer: `Focus on authenticity and specificity. This guide walks you through the key strategies.`,
        sections: [
            { heading: 'Key Principles', body: `The most important aspects of ${slug.replace(/how-to-/g, '').replace(/-/g, ' ')}.` },
            { heading: 'Step-by-Step Approach', body: 'Follow this framework for the best results.' },
            { heading: 'Examples', body: 'See how these principles work in practice.' },
        ],
        commonMistakes: ['Being too generic', 'Not showing enough personal reflection', 'Ignoring the specific requirements'],
        faq: [{ question: `What's the most important tip?`, answer: 'Be specific and authentic. Generic advice won\'t help — focus on what makes your approach uniquely yours.' }],
        primaryCta: { tool: slug.includes('hook') || slug.includes('start') ? 'essay-hook-generator' : slug.includes('failure') || slug.includes('leadership') ? 'common-app-brainstorm' : slug.includes('college-essay') ? 'supplemental-essay-helper' : 'essay-outline-builder', label: 'Try Our AI Tool', text: 'Get personalized help with your essay.' },
        relatedPages: ['how-to-write-a-college-essay', 'college-essay-ideas', 'college-essay-examples', HUB_SLUG],
        targetKeyword: slug.replace(/-/g, ' '),
        secondaryKeywords: [slug.replace(/-/g, ' ').replace('how to ', '')],
        searchIntent: 'informational — students seeking writing guidance',
    })),
]

// ─── GROUP D: Essay Example Pages ──────────────────────────────────────────

const GROUP_D: EssayPageConfig[] = [
    'college-essay-examples', 'common-app-essay-examples', 'personal-statement-examples',
    'leadership-essay-examples', 'challenge-essay-examples',
    'college-essay-about-family', 'college-essay-about-sports', 'college-essay-about-volunteering',
].map(slug => ({
    slug,
    group: 'examples' as const,
    seoTitle: `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — Real Samples | CollegeFind`,
    metaDescription: `Read real ${slug.replace(/-/g, ' ')} that worked. Understand what makes them effective and apply the lessons to your own essay.`,
    h1: `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — What Works & Why`,
    intro: `Study real ${slug.replace(/-/g, ' ')} to understand what makes them effective. Each example includes analysis of why it worked.`,
    quickAnswer: `The best ${slug.replace(/-/g, ' ')} share three qualities: specificity, authentic voice, and genuine reflection. Read these examples not to copy them, but to understand the patterns.`,
    sections: [
        { heading: 'What Makes These Examples Work', body: 'Common patterns in successful essays: they start with action, include vulnerability, and end with genuine insight.' },
        { heading: 'Example Analysis', body: 'Each example below is followed by a brief analysis of what made it effective.' },
        { heading: 'Apply This to Your Essay', body: 'After reading examples, identify the techniques you want to use in your own essay: opening style, story structure, reflection approach.' },
    ],
    commonMistakes: ['Trying to imitate another student\'s voice', 'Copying a topic because it "worked" for someone else', 'Missing the lesson — focus on WHY examples work, not WHAT they say'],
    faq: [{ question: 'Should I read examples before writing?', answer: 'Yes, but read for technique, not content. Notice how they open, how they structure the story, and how they reflect. Then write your own authentic story.' }],
    primaryCta: { tool: 'essay-analyzer', label: 'Analyze Your Essay', text: 'Get your essay scored on originality, storytelling, reflection, clarity, and impact.' },
    secondaryCta: { tool: 'essay-topic-generator', label: 'Find Your Topic', text: 'Get personalized topic ideas based on your own experiences.' },
    relatedPages: ['college-essay-ideas', 'how-to-write-a-college-essay', HUB_SLUG],
    targetKeyword: slug.replace(/-/g, ' '),
    secondaryKeywords: [`${slug.replace(/-/g, ' ')} that worked`, `best ${slug.replace(/-/g, ' ')}`],
    searchIntent: 'informational — students seeking example essays',
}))

// ─── GROUP F: Supplemental Essay Pages ─────────────────────────────────────

const GROUP_F: EssayPageConfig[] = [
    'why-this-college-essay', 'why-this-major-essay', 'community-essay',
    'diversity-essay', 'extracurricular-essay', 'leadership-essay', 'intellectual-curiosity-essay',
].map(slug => {
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
        slug,
        group: 'supplemental' as const,
        seoTitle: `${title} — How to Write It | CollegeFind`,
        metaDescription: `Learn how to write a standout ${slug.replace(/-/g, ' ')}. Get tips, outlines, and AI tools for supplemental essays.`,
        h1: `How to Write a Standout ${title}`,
        intro: `The ${slug.replace(/-/g, ' ')} is one of the most common supplemental prompts. Here's how to make yours specific, personal, and compelling.`,
        quickAnswer: `Be specific. Mention real programs, professors, courses, or experiences. Generic praise ("great campus, diverse community") wastes your word count.`,
        sections: [
            { heading: 'What Colleges Want to See', body: `This prompt tests whether you've done your research and can articulate a genuine fit. Surface-level answers ("renowned faculty, beautiful campus") don't stand out.` },
            { heading: 'How to Research for This Essay', body: 'Go beyond the website.', list: ['Attend virtual info sessions and take notes', 'Read the student newspaper', 'Look up specific professors or labs in your field', 'Talk to current students if possible', 'Check unique programs, traditions, or clubs'] },
            { heading: 'The Formula That Works', body: 'Connect your specific interests/experiences → to specific opportunities at the school → to your future goals. Every sentence should answer: "Why THIS school and why YOU?"' },
        ],
        commonMistakes: ['Mentioning things that are true of any college (location, prestige, ranking)', `Making it all about the school and not about YOU`, 'Being too broad — focus on 2-3 specific connections'],
        faq: [{ question: `How long should a ${slug.replace(/-/g, ' ')} be?`, answer: 'Usually 150-400 words. Check each school\'s specific requirements and use every word wisely.' }],
        primaryCta: { tool: 'supplemental-essay-helper', label: 'Get Supplemental Help', text: 'Enter the college name and prompt type for personalized ideas and outlines.' },
        secondaryCta: { tool: 'essay-outline-builder', label: 'Build Your Outline', text: 'Structure your supplemental essay for maximum impact.' },
        relatedPages: ['how-to-write-why-this-college-essay', 'college-essay-ideas', HUB_SLUG],
        targetKeyword: slug.replace(/-/g, ' '),
        secondaryKeywords: [`how to write ${slug.replace(/-/g, ' ')}`, `${slug.replace(/-/g, ' ')} examples`],
        searchIntent: 'informational — students writing supplemental essays',
    }
})

// ─── Export all pages ──────────────────────────────────────────────────────

export const ALL_ESSAY_PAGES: EssayPageConfig[] = [
    ...GROUP_A,
    ...GROUP_B,
    ...GROUP_C,
    ...GROUP_D,
    ...GROUP_F,
]

export function getEssayPage(slug: string): EssayPageConfig | undefined {
    return ALL_ESSAY_PAGES.find(p => p.slug === slug)
}

export { HUB_SLUG }
