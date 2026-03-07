import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Colleges',
  description:
    'Search and filter 6,000+ U.S. colleges by state, control (public/private), campus size, tuition, acceptance rate, and more. Data from the U.S. College Scorecard.',
  keywords: [
    'college search',
    'search colleges',
    'college filter',
    'find colleges by state',
    'public universities',
    'private colleges',
    'college tuition',
    'acceptance rate',
  ],
  openGraph: {
    title: 'Search Colleges | CollegeMatch',
    description:
      'Search 6,000+ U.S. colleges with filters for state, size, tuition, acceptance rate, and more.',
    url: '/search',
  },
  alternates: { canonical: '/search' },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
