import { Metadata } from 'next'
import RecommendationsClient from './RecommendationsClient'

export const metadata: Metadata = {
    title: 'Personalized Recommendations | CollegeFind',
    description: 'Get personalized college recommendations based on your GPA, test scores, major, budget, and location preferences.',
}

export default function RecommendationsPage() {
    return <RecommendationsClient />
}
