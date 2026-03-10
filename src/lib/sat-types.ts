// ─── SAT Ace — TypeScript Types ───────────────────────────────────────────────

// ─── Score Conversion ─────────────────────────────────────────────────────────

export interface ScoreConversion {
    raw: number
    scaledLow: number
    scaledHigh: number
}

export interface SATScoreResult {
    mathRaw: number
    rwRaw: number
    mathScaledLow: number
    mathScaledHigh: number
    rwScaledLow: number
    rwScaledHigh: number
    totalLow: number
    totalHigh: number
    totalMid: number
    percentile: number
    percentileRange: string
    message: string
}

// ─── Questions ────────────────────────────────────────────────────────────────

export type SATSection = 'math' | 'reading' | 'writing'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type AnswerChoice = 'A' | 'B' | 'C' | 'D'
export type QuestionStatus = 'draft' | 'review' | 'published' | 'archived'

export interface SATQuestion {
    id: string
    section: SATSection
    topic: string
    subtopic: string | null
    difficulty: Difficulty
    question_text: string
    passage_text: string | null
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: AnswerChoice
    explanation: string
    source_type: string
    status: QuestionStatus
    active_status: boolean
    created_at?: string
}

// ─── Practice Sessions ────────────────────────────────────────────────────────

export interface PracticeSession {
    id: string
    user_id: string
    section: SATSection | 'mixed'
    difficulty: Difficulty | 'mixed'
    total_questions: number
    correct_count: number
    accuracy: number
    time_spent: number // seconds
    started_at: string
    completed_at: string | null
}

export interface QuestionAttempt {
    id: string
    user_id: string
    question_id: string
    session_id: string | null
    selected_answer: AnswerChoice
    is_correct: boolean
    time_spent: number // seconds
    section: SATSection
    topic: string
    difficulty: Difficulty
    created_at: string
}

// ─── Mock Tests ───────────────────────────────────────────────────────────────

export interface MockTest {
    id: string
    title: string
    description: string
    math_question_ids: string[]
    rw_question_ids: string[]
    math_time_minutes: number
    rw_time_minutes: number
    total_questions: number
    active_status: boolean
    created_at: string
}

export interface MockTestAttempt {
    id: string
    user_id: string
    mock_test_id: string
    status: 'in_progress' | 'paused' | 'completed'
    current_section: 'math' | 'rw'
    current_question_index: number
    answers: Record<string, AnswerChoice>
    math_score: number | null
    rw_score: number | null
    total_score: number | null
    time_spent: number
    started_at: string
    completed_at: string | null
}

// ─── Study Planner ────────────────────────────────────────────────────────────

export interface StudyPlanInput {
    current_score: number
    target_score: number
    exam_date: string
    hours_per_week: number
    strongest_section: SATSection
    weakest_section: SATSection
}

export interface StudyTask {
    id: string
    plan_id: string
    week: number
    day: number
    task_type: 'practice' | 'review' | 'mock_test' | 'reading'
    section: SATSection
    topic: string
    quantity: number
    description: string
    completed: boolean
}

export interface StudyPlan {
    id: string
    user_id: string
    inputs: StudyPlanInput
    weeks: StudyWeek[]
    created_at: string
    updated_at: string
}

export interface StudyWeek {
    week: number
    focus: string
    tasks: StudyTask[]
}

// ─── Score History ────────────────────────────────────────────────────────────

export interface ScoreHistory {
    id: string
    user_id: string
    source: 'calculator' | 'mock_test' | 'practice'
    math_score: number
    rw_score: number
    total_score: number
    created_at: string
}

// ─── AI Explanations ──────────────────────────────────────────────────────────

export interface AIExplanation {
    id: string
    question_id: string
    user_id: string
    explanation_text: string
    created_at: string
}

// ─── Topic Mapping ────────────────────────────────────────────────────────────

export const SAT_MATH_TOPICS = [
    'Algebra',
    'Linear Equations',
    'Systems of Equations',
    'Quadratic Equations',
    'Polynomials',
    'Ratios & Proportions',
    'Percentages',
    'Statistics & Probability',
    'Geometry',
    'Trigonometry',
    'Advanced Math',
    'Data Analysis',
] as const

export const SAT_RW_TOPICS = [
    'Reading Comprehension',
    'Vocabulary in Context',
    'Evidence-Based Reading',
    'Inference',
    'Main Idea',
    'Author Purpose',
    'Grammar & Punctuation',
    'Sentence Structure',
    'Verb Tense',
    'Subject-Verb Agreement',
    'Transitions',
    'Rhetorical Synthesis',
] as const

export const SAT_ALL_TOPICS = [...SAT_MATH_TOPICS, ...SAT_RW_TOPICS] as const

// ─── Pricing Tiers ────────────────────────────────────────────────────────────

export const SAT_PLANS = {
    free: {
        name: 'Free',
        price: 0,
        features: [
            'SAT Score Calculator',
            '10 practice questions/day',
            'Basic score tracking',
            'Limited score history',
        ],
        limits: {
            dailyQuestions: 10,
            mockTests: 0,
            aiExplanations: 0,
            studyPlanner: false,
            analytics: false,
        },
    },
    basic: {
        name: 'Premium Basic',
        price: 9,
        priceId: 'price_sat_basic_monthly',
        features: [
            'Unlimited practice questions',
            'Saved mistakes review',
            'Performance dashboard',
            'Study planner',
            'Topic-level analytics',
        ],
        limits: {
            dailyQuestions: Infinity,
            mockTests: 0,
            aiExplanations: 0,
            studyPlanner: true,
            analytics: true,
        },
    },
    plus: {
        name: 'Premium Plus',
        price: 29,
        priceId: 'price_sat_plus_monthly',
        features: [
            'Everything in Basic',
            'Unlimited mock tests',
            'AI explanations',
            'Advanced analytics',
            'Adaptive study recommendations',
            'Weak area detection',
        ],
        limits: {
            dailyQuestions: Infinity,
            mockTests: Infinity,
            aiExplanations: Infinity,
            studyPlanner: true,
            analytics: true,
        },
    },
} as const

export type SATPlan = keyof typeof SAT_PLANS
