import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import dynamic from 'next/dynamic'
import { ProfileProvider } from '@/context/ProfileContext'
import { CompareProvider } from '@/context/CompareContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { Analytics } from '@vercel/analytics/next'

// Lazy-load interactive overlays — they don't need to be in the initial bundle
const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget').then(m => m.ChatWidget), { ssr: false })
const FeedbackWidget = dynamic(() => import('@/components/feedback/FeedbackWidget').then(m => m.FeedbackWidget), { ssr: false })

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const SITE_URL = 'https://collegefindtool.com'
const SITE_NAME = 'CollegeFind'
const DEFAULT_DESCRIPTION =
  'Free college search and admission match tool for 12th-grade students. Search 6,000+ U.S. colleges, estimate admission chances, compare schools, and track application deadlines — all in one place.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'CollegeFind — Find Your Perfect College',
    template: '%s | CollegeFind',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'college search',
    'college admissions',
    'admission calculator',
    'college match',
    'safety match reach',
    'college comparison',
    'college scholarships',
    'FAFSA',
    'net price calculator',
    'college application tracker',
    '12th grade',
    'high school senior',
    'U.S. colleges',
    'College Scorecard',
  ],
  authors: [{ name: 'CollegeFind' }],
  creator: 'CollegeFind',
  publisher: 'CollegeFind',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'CollegeFind — Find Your Perfect College',
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CollegeFind — Free College Search & Admissions Tool',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'CollegeFind — Find Your Perfect College',
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },

  manifest: '/manifest.webmanifest',

  alternates: {
    canonical: SITE_URL,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Inline script to set theme before React hydrates — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cm-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <CompareProvider>
              <ProfileProvider>
                <Header />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <ChatWidget />
                <FeedbackWidget />
                <Analytics />
              </ProfileProvider>
            </CompareProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
