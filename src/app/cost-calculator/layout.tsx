import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'College Cost Calculator',
  description:
    'Estimate your net price at any U.S. college based on your family income — no FAFSA required. Uses a simplified federal methodology to estimate your Student Aid Index (SAI), Pell Grant eligibility, and institutional aid.',
  keywords: [
    'college cost calculator',
    'net price calculator',
    'FAFSA calculator',
    'student aid index',
    'SAI calculator',
    'Pell Grant estimator',
    'college affordability',
    'college tuition calculator',
    'financial aid estimator',
  ],
  openGraph: {
    title: 'College Cost Calculator | CollegeFind',
    description:
      'Estimate your net price at any U.S. college based on your family income. No FAFSA required.',
    url: '/cost-calculator',
  },
  alternates: { canonical: '/cost-calculator' },
}

export default function CostCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
