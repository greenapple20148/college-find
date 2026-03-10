import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        default: 'SAT Ace — Free SAT Prep & Practice',
        template: '%s | SAT Ace',
    },
    description: 'Free SAT prep tools: score calculator, practice questions, mock tests, AI explanations, and personalized study plans.',
    keywords: [
        'SAT prep',
        'SAT practice',
        'SAT score calculator',
        'SAT practice questions',
        'Digital SAT prep',
        'SAT mock test',
        'SAT study plan',
        'free SAT practice',
        'SAT score estimator',
        'SAT percentile calculator',
    ],
}

export default function SATLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
