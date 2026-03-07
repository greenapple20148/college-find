import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My College Matches',
  description:
    'Get your personalized Safety, Match, and Reach college list based on your GPA, SAT/ACT scores, and preferences. Admission probability estimates powered by U.S. Department of Education data.',
  keywords: [
    'college match',
    'safety schools',
    'match schools',
    'reach schools',
    'admission probability',
    'college chances',
    'personalized college list',
  ],
  openGraph: {
    title: 'My College Matches | CollegeMatch',
    description:
      'See your personalized Safety, Match, and Reach colleges with estimated admission probabilities.',
    url: '/match',
  },
  alternates: { canonical: '/match' },
  robots: {
    index: false, // personalized results — no SEO value
    follow: true,
  },
}

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children
}
