import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Profile',
  description:
    'Set up your student profile — enter your GPA, SAT or ACT scores, intended major, preferred states, and budget to get a personalized college match list.',
  openGraph: {
    title: 'My Profile | CollegeFind',
    description:
      'Enter your academic profile to get a personalized Safety, Match, and Reach college list tailored to you.',
    url: '/profile',
  },
  alternates: { canonical: '/profile' },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
