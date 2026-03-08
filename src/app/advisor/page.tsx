import { Metadata } from 'next'
import AdvisorClient from './AdvisorClient'

export const metadata: Metadata = {
    title: 'AI College Advisor — Personalized Guidance | CollegeFind',
    description: 'Get personalized college recommendations, admission chance estimates, and strategic application advice from our AI advisor powered by your academic profile.',
}

export default function AdvisorPage() {
    return <AdvisorClient />
}
