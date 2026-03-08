import { Metadata } from 'next'
import { SuccessPageClient } from './SuccessPageClient'

export const metadata: Metadata = {
    title: 'Welcome to Pro | CollegeFind',
    description: 'Your upgrade was successful. Start using your new features.',
}

export default function SuccessPage() {
    return <SuccessPageClient />
}
