'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCompare } from '@/context/CompareContext'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { GraduationCapIcon } from '@/components/ui/Icon'

import { useState, useRef, useEffect } from 'react'

const navLinks = [
  { href: '/search', label: 'Search' },
  { href: '/recommendations', label: 'For You' },
  { href: '/sat-prep', label: 'SAT Ace' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/advisor', label: 'AI Advisor' },
  { href: '/college-essays', label: 'Essays' },
  { href: '/pricing', label: 'Pricing' },
]

const toolsDropdownLinks = [
  { href: '/match', label: 'My Matches' },
  { href: '/compare', label: 'Compare' },
  { href: '/cost-calculator', label: 'Cost Calculator' },
  { href: '/college-roi-calculator', label: 'ROI Calculator' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/score-predictor', label: 'Score Predictor' },
  { href: '/admission-strategy', label: 'Admission Strategy' },
  { href: '/major-match', label: 'Major & Career Match' },
  { href: '/financial-aid', label: 'Financial Aid Estimator' },
  { href: '/essay-feedback', label: 'Essay Feedback' },
]

const allNavLinks = [...navLinks, ...toolsDropdownLinks]

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[var(--bg-surface-hover)] group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon */}
      <svg
        className={`w-[18px] h-[18px] absolute transition-all duration-300 ${theme === 'dark'
          ? 'opacity-100 rotate-0 scale-100'
          : 'opacity-0 rotate-90 scale-0'
          }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--text-muted)' }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      {/* Moon icon */}
      <svg
        className={`w-[18px] h-[18px] absolute transition-all duration-300 ${theme === 'light'
          ? 'opacity-100 rotate-0 scale-100'
          : 'opacity-0 -rotate-90 scale-0'
          }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--text-muted)' }}
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) {
    return (
      <div className="flex items-center gap-2 ml-2">
        <Link
          href="/login"
          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-surface-hover)]"
          style={{ color: 'var(--text-muted)' }}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{ background: 'var(--gold-gradient)', color: '#fff' }}
        >
          Sign up
        </Link>
      </div>
    )
  }

  const initial = (user.email ?? 'U')[0].toUpperCase()

  return (
    <div className="relative ml-2" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-80"
        style={{ background: 'var(--gold-gradient)', color: '#fff' }}
        aria-label="Account menu"
      >
        {initial}
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 w-48 rounded-xl border py-1 shadow-xl z-50"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="px-3 py-2 text-xs truncate" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
          <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-surface-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Dashboard
          </Link>
          <Link
            href="/invite"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-surface-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Invite Friends
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-surface-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            My Profile
          </Link>
          <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
          <button
            onClick={() => { setOpen(false); signOut() }}
            className="block w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-surface-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const { compareList } = useCompare()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isToolsActive = toolsDropdownLinks.some(l => pathname === l.href)

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300"
      style={{
        backgroundColor: 'var(--header-bg)',
        borderBottomColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <GraduationCapIcon className="w-6 h-6 transition-colors" style={{ color: 'var(--gold-primary)' }} />
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              College<span className="heading-serif-italic" style={{ color: 'var(--gold-primary)' }}>Find</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.slice(0, 3).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-[var(--gold-primary)]'
                    : 'hover:bg-[var(--bg-surface-hover)]',
                ].join(' ')}
                style={{
                  color: pathname === link.href ? 'var(--gold-primary)' : 'var(--text-muted)',
                  backgroundColor: pathname === link.href ? 'rgba(201,146,60,0.1)' : undefined,
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Tools dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen(v => !v)}
                className={[
                  'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isToolsActive
                    ? 'text-[var(--gold-primary)]'
                    : 'hover:bg-[var(--bg-surface-hover)]',
                ].join(' ')}
                style={{
                  color: isToolsActive ? 'var(--gold-primary)' : 'var(--text-muted)',
                  backgroundColor: isToolsActive ? 'rgba(201,146,60,0.1)' : undefined,
                }}
              >
                Tools
                <svg className={`w-3 h-3 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {toolsOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-48 rounded-xl border py-1 shadow-xl z-50"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                >
                  {toolsDropdownLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-surface-hover)]"
                      style={{
                        color: pathname === link.href ? 'var(--gold-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {link.label}
                      {link.href === '/compare' && compareList.length > 0 && (
                        <span
                          className="text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                          style={{ backgroundColor: 'var(--gold-primary)', color: 'var(--bg-primary)' }}
                        >
                          {compareList.length}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(3).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-[var(--gold-primary)]'
                    : 'hover:bg-[var(--bg-surface-hover)]',
                ].join(' ')}
                style={{
                  color: pathname === link.href ? 'var(--gold-primary)' : 'var(--text-muted)',
                  backgroundColor: pathname === link.href ? 'rgba(201,146,60,0.1)' : undefined,
                }}
              >
                {link.label}
              </Link>
            ))}

            <ThemeToggle />
            <UserMenu />
          </nav>

          {/* Mobile right cluster */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav
            className="md:hidden pb-4 flex flex-col gap-1 border-t pt-3 transition-colors"
            style={{ borderTopColor: 'var(--border-subtle)' }}
          >
            {allNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: pathname === link.href ? 'var(--gold-primary)' : 'var(--text-muted)',
                  backgroundColor: pathname === link.href ? 'rgba(201,146,60,0.1)' : undefined,
                }}
              >
                {link.label}
                {link.href === '/compare' && compareList.length > 0 && (
                  <span
                    className="text-xs rounded-full px-2 py-0.5 font-bold"
                    style={{ backgroundColor: 'var(--gold-primary)', color: 'var(--bg-primary)' }}
                  >
                    {compareList.length}
                  </span>
                )}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 px-3 py-2 rounded-lg text-sm font-medium text-center"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut() }}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2 mt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center border"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-center"
                  style={{ background: 'var(--gold-gradient)', color: '#fff' }}
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
