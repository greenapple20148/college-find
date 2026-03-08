import type { Metadata } from 'next'
import { ROICalculatorPage } from './ROICalculatorClient'

export const metadata: Metadata = {
    title: 'College ROI Calculator — Estimate Your Return on Investment',
    description:
        'Calculate the financial return of attending any college. Estimate tuition costs, expected salary by major, loan repayment timeline, and ROI score.',
}

export default function Page() {
    return <ROICalculatorPage />
}
