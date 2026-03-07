import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scholarships',
  description:
    'Find national and state scholarships for high school seniors. Filter by GPA, home state, and intended major. Free scholarship search tool for college-bound students.',
  keywords: [
    'college scholarships',
    'high school scholarships',
    'merit scholarships',
    'state scholarships',
    'scholarship search',
    'free college money',
    'scholarship by major',
    'scholarship by GPA',
  ],
  openGraph: {
    title: 'Scholarships | CollegeMatch',
    description:
      'Discover national and state scholarships matched to your GPA, home state, and intended major.',
    url: '/scholarships',
  },
  alternates: { canonical: '/scholarships' },
}

export default function ScholarshipsLayout({ children }: { children: React.ReactNode }) {
  return children
}
