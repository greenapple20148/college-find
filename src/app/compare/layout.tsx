import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Colleges',
  description:
    'Compare up to 4 U.S. colleges side by side on tuition, acceptance rate, graduation rate, median earnings, net price, and more.',
  keywords: [
    'compare colleges',
    'college comparison',
    'side by side colleges',
    'college tuition comparison',
    'acceptance rate comparison',
  ],
  openGraph: {
    title: 'Compare Colleges | CollegeFind',
    description:
      'Compare up to 4 colleges side by side on tuition, acceptance rate, graduation rate, and more.',
    url: '/compare',
  },
  alternates: { canonical: '/compare' },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
