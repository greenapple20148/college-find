/**
 * SAT Ace — Question Bank Seeder
 *
 * Seeds the sat_questions table with a starter question bank.
 * Run: npx tsx scripts/seed-sat-questions.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const questions = [
    // ─── MATH: Algebra (Easy) ────────────────────────────────────────
    {
        section: 'math', topic: 'Algebra', difficulty: 'easy',
        question_text: 'If 3x + 7 = 22, what is the value of x?',
        passage_text: null,
        option_a: '3', option_b: '5', option_c: '7', option_d: '15',
        correct_answer: 'B',
        explanation: 'Subtract 7 from both sides: 3x = 15. Divide both by 3: x = 5.',
        source_type: 'seed',
    },
    {
        section: 'math', topic: 'Algebra', difficulty: 'easy',
        question_text: 'What is the value of 2(x + 3) when x = 4?',
        passage_text: null,
        option_a: '10', option_b: '14', option_c: '11', option_d: '16',
        correct_answer: 'B',
        explanation: '2(4 + 3) = 2(7) = 14.',
        source_type: 'seed',
    },
    // ─── MATH: Linear Equations (Medium) ─────────────────────────────
    {
        section: 'math', topic: 'Linear Equations', difficulty: 'medium',
        question_text: 'A line passes through (2, 5) and (6, 13). What is the slope?',
        passage_text: null,
        option_a: '1', option_b: '2', option_c: '3', option_d: '4',
        correct_answer: 'B',
        explanation: 'Slope = (13 - 5)/(6 - 2) = 8/4 = 2.',
        source_type: 'seed',
    },
    {
        section: 'math', topic: 'Linear Equations', difficulty: 'medium',
        question_text: 'The equation y = 3x - 7 crosses the y-axis at which point?',
        passage_text: null,
        option_a: '(0, 3)', option_b: '(0, -7)', option_c: '(7, 0)', option_d: '(-7, 0)',
        correct_answer: 'B',
        explanation: 'The y-intercept is where x = 0: y = 3(0) - 7 = -7. Point: (0, -7).',
        source_type: 'seed',
    },
    // ─── MATH: Quadratics (Hard) ─────────────────────────────────────
    {
        section: 'math', topic: 'Quadratic Equations', difficulty: 'hard',
        question_text: 'If x² - 5x + 6 = 0, what is the sum of all possible values of 2x?',
        passage_text: null,
        option_a: '5', option_b: '6', option_c: '10', option_d: '12',
        correct_answer: 'C',
        explanation: 'Factor: (x-2)(x-3) = 0 → x = 2, 3. Sum of 2x: 4 + 6 = 10.',
        source_type: 'seed',
    },
    // ─── MATH: Percentages (Easy) ────────────────────────────────────
    {
        section: 'math', topic: 'Percentages', difficulty: 'easy',
        question_text: 'A shirt costs $40 and is 25% off. What is the sale price?',
        passage_text: null,
        option_a: '$10', option_b: '$25', option_c: '$30', option_d: '$35',
        correct_answer: 'C',
        explanation: '25% of $40 = $10. Sale price = $40 - $10 = $30.',
        source_type: 'seed',
    },
    // ─── MATH: Statistics (Medium) ───────────────────────────────────
    {
        section: 'math', topic: 'Statistics & Probability', difficulty: 'medium',
        question_text: 'The mean of 5 numbers is 12. If one is removed and the mean becomes 10, what was removed?',
        passage_text: null,
        option_a: '16', option_b: '18', option_c: '20', option_d: '22',
        correct_answer: 'C',
        explanation: 'Sum of 5 = 60. Sum of 4 = 40. Removed = 60 - 40 = 20.',
        source_type: 'seed',
    },
    // ─── MATH: Geometry (Hard) ───────────────────────────────────────
    {
        section: 'math', topic: 'Geometry', difficulty: 'hard',
        question_text: 'A circle of radius 5 has a sector with central angle 72°. What is the sector area?',
        passage_text: null,
        option_a: '5π', option_b: '10π', option_c: '15π', option_d: '25π',
        correct_answer: 'A',
        explanation: 'Sector area = (72/360) × π(25) = (1/5)(25π) = 5π.',
        source_type: 'seed',
    },
    {
        section: 'math', topic: 'Geometry', difficulty: 'medium',
        question_text: 'A rectangle has length 12 and width 5. What is the length of its diagonal?',
        passage_text: null,
        option_a: '11', option_b: '13', option_c: '15', option_d: '17',
        correct_answer: 'B',
        explanation: 'Diagonal = √(12² + 5²) = √(144 + 25) = √169 = 13.',
        source_type: 'seed',
    },
    // ─── MATH: Systems (Medium) ──────────────────────────────────────
    {
        section: 'math', topic: 'Systems of Equations', difficulty: 'medium',
        question_text: 'If 2x + y = 10 and x - y = 2, what is x?',
        passage_text: null,
        option_a: '2', option_b: '3', option_c: '4', option_d: '5',
        correct_answer: 'C',
        explanation: 'Add equations: 3x = 12, so x = 4.',
        source_type: 'seed',
    },
    // ─── READING: Vocabulary (Easy) ──────────────────────────────────
    {
        section: 'reading', topic: 'Vocabulary in Context', difficulty: 'easy',
        question_text: 'In "The scientist\'s findings were corroborated by subsequent experiments," "corroborated" means:',
        passage_text: null,
        option_a: 'Disproved', option_b: 'Confirmed', option_c: 'Questioned', option_d: 'Ignored',
        correct_answer: 'B',
        explanation: '"Corroborated" means confirmed or supported with additional evidence.',
        source_type: 'seed',
    },
    {
        section: 'reading', topic: 'Vocabulary in Context', difficulty: 'medium',
        question_text: 'In "The author\'s tone was deliberately sardonic throughout the essay," "sardonic" most nearly means:',
        passage_text: null,
        option_a: 'Enthusiastic', option_b: 'Mocking', option_c: 'Neutral', option_d: 'Melancholic',
        correct_answer: 'B',
        explanation: 'Sardonic means mocking or cynical in a scornful way.',
        source_type: 'seed',
    },
    // ─── READING: Main Idea (Medium) ─────────────────────────────────
    {
        section: 'reading', topic: 'Main Idea', difficulty: 'medium',
        question_text: 'Based on the passage, the primary purpose of the author is to:',
        passage_text: 'Recent studies have shown that regular physical exercise improves not only cardiovascular health but also cognitive function. Researchers at Harvard found that adults who exercised for 30 minutes daily showed improved memory recall and faster problem-solving abilities compared to sedentary peers.',
        option_a: 'Argue that exercise is dangerous',
        option_b: 'Describe the cognitive benefits of exercise',
        option_c: 'Compare different types of exercise',
        option_d: 'Explain why people avoid exercise',
        correct_answer: 'B',
        explanation: 'The passage focuses on how exercise improves cognitive function. Option B captures this main idea.',
        source_type: 'seed',
    },
    // ─── READING: Inference (Hard) ───────────────────────────────────
    {
        section: 'reading', topic: 'Inference', difficulty: 'hard',
        question_text: 'It can be inferred from the passage that the Harlem Renaissance:',
        passage_text: 'During the 1920s, African American artists, writers, and musicians in Harlem created works that challenged prevailing stereotypes and celebrated Black culture. Writers like Langston Hughes and Zora Neale Hurston drew from folk traditions while pioneering new literary forms. This artistic explosion occurred alongside—and partly because of—the Great Migration, which brought millions of African Americans from the rural South to northern cities.',
        option_a: 'Had no connection to larger demographic shifts',
        option_b: 'Was fueled in part by population changes in America',
        option_c: 'Was primarily a musical movement',
        option_d: 'Declined after the 1920s due to lack of interest',
        correct_answer: 'B',
        explanation: 'The passage says the artistic explosion "occurred alongside—and partly because of—the Great Migration." This supports inference B.',
        source_type: 'seed',
    },
    // ─── WRITING: Grammar (Easy) ─────────────────────────────────────
    {
        section: 'writing', topic: 'Grammar & Punctuation', difficulty: 'easy',
        question_text: 'Which correctly completes the sentence? "The students _____ their homework before the deadline."',
        passage_text: null,
        option_a: 'submits', option_b: 'submitted', option_c: 'submitting', option_d: 'have submit',
        correct_answer: 'B',
        explanation: 'Past tense "submitted" is correct for a completed action.',
        source_type: 'seed',
    },
    // ─── WRITING: Transitions (Medium) ───────────────────────────────
    {
        section: 'writing', topic: 'Transitions', difficulty: 'medium',
        question_text: 'Which transition fits? "The project seemed impossible. _____, the team finished on time."',
        passage_text: null,
        option_a: 'Therefore', option_b: 'Meanwhile', option_c: 'Nevertheless', option_d: 'Similarly',
        correct_answer: 'C',
        explanation: '"Nevertheless" shows contrast—it seemed impossible, but they did it anyway.',
        source_type: 'seed',
    },
    // ─── WRITING: Subject-Verb (Medium) ──────────────────────────────
    {
        section: 'writing', topic: 'Subject-Verb Agreement', difficulty: 'medium',
        question_text: 'Which is correct? "Each of the students _____ required to submit a portfolio."',
        passage_text: null,
        option_a: 'are', option_b: 'is', option_c: 'were', option_d: 'have been',
        correct_answer: 'B',
        explanation: '"Each" is singular, so the verb must be singular: "is."',
        source_type: 'seed',
    },
    // ─── WRITING: Sentence Structure (Hard) ──────────────────────────
    {
        section: 'writing', topic: 'Sentence Structure', difficulty: 'hard',
        question_text: 'Which revision eliminates the dangling modifier?',
        passage_text: 'Walking through the park, the flowers were beautiful.',
        option_a: 'Walking through the park, the flowers were seen as beautiful.',
        option_b: 'The flowers were beautiful, walking through the park.',
        option_c: 'Walking through the park, I thought the flowers were beautiful.',
        option_d: 'The park, walking through it, had beautiful flowers.',
        correct_answer: 'C',
        explanation: 'A dangling modifier needs a subject performing the action. Only C provides a proper subject "I" for "walking."',
        source_type: 'seed',
    },
    // ─── MATH: Ratios (Easy) ─────────────────────────────────────────
    {
        section: 'math', topic: 'Ratios & Proportions', difficulty: 'easy',
        question_text: 'If the ratio of boys to girls in a class is 3:5 and there are 24 students total, how many are girls?',
        passage_text: null,
        option_a: '9', option_b: '12', option_c: '15', option_d: '18',
        correct_answer: 'C',
        explanation: 'Ratio 3:5 means 8 parts total. Girls = (5/8) × 24 = 15.',
        source_type: 'seed',
    },
    // ─── MATH: Data Analysis (Medium) ────────────────────────────────
    {
        section: 'math', topic: 'Data Analysis', difficulty: 'medium',
        question_text: 'A scatter plot shows a negative linear association. Which best describes the relationship?',
        passage_text: null,
        option_a: 'As x increases, y increases',
        option_b: 'As x increases, y decreases',
        option_c: 'There is no relationship between x and y',
        option_d: 'The relationship is exponential',
        correct_answer: 'B',
        explanation: 'A negative linear association means as one variable increases, the other decreases.',
        source_type: 'seed',
    },
]

async function main() {
    console.log('📝 SAT Ace — Seeding question bank')
    console.log('===================================')

    const { data, error } = await supabase
        .from('sat_questions')
        .upsert(
            questions.map(q => ({ ...q, active_status: true })),
            { onConflict: 'id' }
        )
        .select('id')

    if (error) {
        console.error('❌ Error seeding questions:', error.message)
        process.exit(1)
    }

    console.log(`✅ ${questions.length} questions seeded successfully!`)
    console.log(`   Math: ${questions.filter(q => q.section === 'math').length}`)
    console.log(`   Reading: ${questions.filter(q => q.section === 'reading').length}`)
    console.log(`   Writing: ${questions.filter(q => q.section === 'writing').length}`)
}

main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
