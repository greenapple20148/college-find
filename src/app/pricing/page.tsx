import type { Metadata } from 'next'
import { PricingPage } from './PricingClient'

export const metadata: Metadata = {
    title: 'Pricing — Plans for Every Student',
    description:
        'Choose the CollegeFind plan that fits your college application journey. Free tools, Student Pro, College Prep Pro+, or one-time bundles.',
}

export default function Page() {
    return <PricingPage />
}
