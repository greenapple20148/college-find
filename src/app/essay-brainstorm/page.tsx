import { Metadata } from 'next'
import EssayBrainstormClient from './EssayBrainstormClient'

export const metadata: Metadata = {
    title: 'AI Essay Brainstorming | CollegeFind',
    description: 'Get personalized essay ideas, compelling hooks, and structured outlines for your college application essays.',
}

export default function EssayBrainstormPage() {
    return <EssayBrainstormClient />
}
