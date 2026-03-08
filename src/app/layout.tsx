import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { ProfileProvider } from '@/context/ProfileContext'
import { CompareProvider } from '@/context/CompareContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { Analytics } from '@vercel/analytics/next'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
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
                <Analytics />
              </ProfileProvider>
            </CompareProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
