import Link from 'next/link'

const footerLinks = [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimer', href: '/disclaimer' },
]

const productLinks = [
    { label: 'Search', href: '/search' },
    { label: 'My Matches', href: '/match' },
    { label: 'Compare', href: '/compare' },
    { label: 'Cost Calculator', href: '/cost-calculator' },
    { label: 'Scholarships', href: '/scholarships' },
]

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer
            className="mt-16"
            style={{ borderTop: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
        >
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                College<span className="heading-serif-italic" style={{ color: 'var(--gold-primary)' }}>Match</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                            Free college search &amp; admissions tool for high school students.
                            Powered by U.S. Department of Education data.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                            Product
                        </h4>
                        <ul className="space-y-2">
                            {productLinks.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors hover:underline"
                                        style={{ color: 'var(--text-faint)' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                            Legal
                        </h4>
                        <ul className="space-y-2">
                            {footerLinks.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors hover:underline"
                                        style={{ color: 'var(--text-faint)' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Data source */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                            Data Source
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                            College data sourced from the{' '}
                            <a
                                href="https://collegescorecard.ed.gov/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                style={{ color: 'var(--gold-primary)' }}
                            >
                                U.S. Department of Education College Scorecard
                            </a>
                            . Admission estimates are statistical approximations and are not guarantees.
                        </p>
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                    <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                        &copy; {currentYear} CollegeMatch. All rights reserved.
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                        Not affiliated with the U.S. Department of Education.
                    </p>
                </div>
            </div>
        </footer>
    )
}
