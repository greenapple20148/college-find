import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Dashboard',
  description:
    'Track your saved colleges, application deadlines, and application status — from Not Started to Accepted.',
  openGraph: {
    title: 'My Dashboard | CollegeMatch',
    description: 'Track your college applications, deadlines, and status updates in one place.',
    url: '/dashboard',
  },
  alternates: { canonical: '/dashboard' },
  robots: {
    index: false, // personal dashboard — no SEO value
    follow: true,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
